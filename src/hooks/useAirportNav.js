// src/hooks/useAirportNav.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { NAV_NODES, NAV_EDGES, BEACONS, isInsideBoundary } from '../data/airportData';
import { BeaconSimulator } from '../algorithms/BeaconSimulator';
import { KalmanFilter }    from '../algorithms/KalmanFilter';
import { Trilateration }   from '../algorithms/Trilateration';
import { AStar }           from '../algorithms/AStar';

const TICK_MS   = 300;
const STEP_SIZE = 18;

const simulator   = new BeaconSimulator(BEACONS, 3, 4);
const trilaterate = new Trilateration(0.4, 300, 0.05);
const astar       = new AStar(NAV_NODES, NAV_EDGES);

// The outside-boundary node coordinates (node id:99 in airportData)
const OUTSIDE_POS = { x: 980, y: 100 };

export function useAirportNav() {
  const [startNodeId,    setStartNodeId   ] = useState(null);
  const [endNodeId,      setEndNodeId     ] = useState(null);
  const [path,           setPath          ] = useState([]);
  const [estimatedPos,   setEstimatedPos  ] = useState(null);
  const [truePos,        setTruePos       ] = useState(null);
  const [beaconReadings, setBeaconReadings] = useState([]);
  const [isNavigating,   setIsNavigating  ] = useState(false);
  const [arrivedAt,      setArrivedAt     ] = useState(null);
  const [pathProgress,   setPathProgress  ] = useState(0);
  const [boundaryAlarm,  setBoundaryAlarm ] = useState(false);
  const [isSimulating,   setIsSimulating  ] = useState(false); // breach simulation mode

  const kalmanFilters = useRef(
    Object.fromEntries(BEACONS.map(b => [b.id, new KalmanFilter()]))
  );

  const tickRef       = useRef(null);
  const posRef        = useRef(null);
  const pathRef       = useRef([]);
  const pathIdxRef    = useRef(0);
  const endIdRef      = useRef(null);
  const simTickRef    = useRef(null); // separate tick for breach simulation

  // ─── Start normal navigation ──────────────────────────────────────────────
  const startNavigation = useCallback((fromId, toId) => {
    const sId = fromId ?? startNodeId;
    const eId = toId   ?? endNodeId;
    if (!sId || !eId || sId === eId) return;

    const found = astar.findPath(sId, eId);
    if (!found || found.length < 2) return;

    const startNode = NAV_NODES.find(n => n.id === sId);
    pathRef.current    = found;
    pathIdxRef.current = 0;
    posRef.current     = { x: startNode.x, y: startNode.y };
    endIdRef.current   = eId;

    BEACONS.forEach(b => kalmanFilters.current[b.id]?.reset());

    setPath(found);
    setTruePos({ ...posRef.current });
    setIsNavigating(true);
    setIsSimulating(false);
    setArrivedAt(null);
    setPathProgress(0);
    setBoundaryAlarm(false);
    setStartNodeId(sId);
    setEndNodeId(eId);
  }, [startNodeId, endNodeId]);

  // ─── Stop navigation ──────────────────────────────────────────────────────
  const stopNavigation = useCallback(() => {
    clearInterval(tickRef.current);
    clearInterval(simTickRef.current);
    setIsNavigating(false);
    setIsSimulating(false);
    setPath([]);
    setEstimatedPos(null);
    setTruePos(null);
    setPathProgress(0);
    setArrivedAt(null);
    setBoundaryAlarm(false);
    pathRef.current    = [];
    pathIdxRef.current = 0;
    posRef.current     = null;
  }, []);

  // ─── BOUNDARY BREACH SIMULATION ──────────────────────────────────────────
  // Smoothly animates the trolley from its current position toward the
  // outside-boundary point (980, 100). Once it crosses the boundary line
  // the alarm fires automatically via the existing isInsideBoundary check.
  const simulateBreach = useCallback(() => {
    // Pause any active navigation tick first
    clearInterval(tickRef.current);
    clearInterval(simTickRef.current);

    // Start from current position or Gate 31 if not set
    const startPos = posRef.current
      ? { ...posRef.current }
      : { x: 860, y: 380 };

    posRef.current = startPos;
    setTruePos({ ...startPos });
    setIsNavigating(false);
    setIsSimulating(true);
    setBoundaryAlarm(false);
    setArrivedAt(null);

    // Draw a dotted "breach path" from current pos toward outside node
    setPath([]);  // clear existing A* path

    const target = OUTSIDE_POS;

    simTickRef.current = setInterval(() => {
      const pos = posRef.current;
      if (!pos) { clearInterval(simTickRef.current); return; }

      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const d  = Math.hypot(dx, dy);

      // Stop moving once we've reached the target
      if (d <= STEP_SIZE) {
        posRef.current = { ...target };
        setTruePos({ ...target });
        // Final check — should already be outside
        setBoundaryAlarm(!isInsideBoundary(target.x, target.y));
        clearInterval(simTickRef.current);
        setIsSimulating(false);
        return;
      }

      const newPos = {
        x: pos.x + (dx / d) * STEP_SIZE,
        y: pos.y + (dy / d) * STEP_SIZE,
      };
      posRef.current = newPos;

      // This fires the alarm the moment it crosses the boundary
      setBoundaryAlarm(!isInsideBoundary(newPos.x, newPos.y));
      setTruePos({ ...newPos });

      // Update beacon simulation as trolley moves
      const raw = simulator.simulate(newPos.x, newPos.y);
      setBeaconReadings(raw);
      const smoothed = raw.map(r => ({
        ...r,
        smoothedRSSI: kalmanFilters.current[r.beaconId]?.update(r.rssi) ?? r.rssi,
      }));
      const measurements = smoothed.map(r => {
        const b = BEACONS.find(b => b.id === r.beaconId);
        return { x: b.x, y: b.y, distance: simulator.rssiToDistance(r.smoothedRSSI, b.txPower) };
      });
      const estPos = trilaterate.solve(measurements, posRef.current);
      if (estPos) setEstimatedPos(estPos);

    }, TICK_MS);

  }, []);

  // ─── Reset breach — bring trolley back inside terminal ────────────────────
  const resetBreach = useCallback(() => {
    clearInterval(simTickRef.current);
    setIsSimulating(false);
    setBoundaryAlarm(false);
    // Teleport back to Gate 31
    const safePos = { x: 860, y: 380 };
    posRef.current = safePos;
    setTruePos({ ...safePos });
    setEstimatedPos(null);
  }, []);

  // ─── Normal navigation tick ───────────────────────────────────────────────
  useEffect(() => {
    if (!isNavigating) { clearInterval(tickRef.current); return; }

    tickRef.current = setInterval(() => {
      const currentPath = pathRef.current;
      const idx         = pathIdxRef.current;

      if (!currentPath.length || idx >= currentPath.length - 1) {
        clearInterval(tickRef.current);
        setIsNavigating(false);
        setArrivedAt(endIdRef.current);
        setPathProgress(1);
        return;
      }

      const targetNode = NAV_NODES.find(n => n.id === currentPath[idx + 1]);
      const pos        = posRef.current;
      if (!targetNode || !pos) return;

      const dx = targetNode.x - pos.x;
      const dy = targetNode.y - pos.y;
      const d  = Math.hypot(dx, dy);

      let newPos;
      if (d <= STEP_SIZE) {
        newPos = { x: targetNode.x, y: targetNode.y };
        pathIdxRef.current = idx + 1;
      } else {
        newPos = { x: pos.x + (dx / d) * STEP_SIZE, y: pos.y + (dy / d) * STEP_SIZE };
      }
      posRef.current = newPos;

      setBoundaryAlarm(!isInsideBoundary(newPos.x, newPos.y));
      setPathProgress(pathIdxRef.current / Math.max(1, currentPath.length - 1));
      setTruePos({ ...newPos });

      const raw = simulator.simulate(newPos.x, newPos.y);
      setBeaconReadings(raw);
      const smoothed = raw.map(r => ({
        ...r,
        smoothedRSSI: kalmanFilters.current[r.beaconId]?.update(r.rssi) ?? r.rssi,
      }));
      const measurements = smoothed.map(r => {
        const b = BEACONS.find(b => b.id === r.beaconId);
        return { x: b.x, y: b.y, distance: simulator.rssiToDistance(r.smoothedRSSI, b.txPower) };
      });
      const estPos = trilaterate.solve(measurements, posRef.current);
      if (estPos) setEstimatedPos(estPos);

    }, TICK_MS);

    return () => clearInterval(tickRef.current);
  }, [isNavigating]);

  const totalDistance = path.length > 1 ? astar.pathLength(path) : 0;
  const eta = totalDistance > 0
    ? Math.max(1, Math.round((totalDistance / STEP_SIZE) * (TICK_MS / 1000) / 60))
    : 0;

  return {
    startNodeId, setStartNodeId,
    endNodeId,   setEndNodeId,
    path, estimatedPos, truePos, beaconReadings,
    isNavigating, arrivedAt, pathProgress,
    totalDistance, eta,
    boundaryAlarm,
    isSimulating,
    startNavigation, stopNavigation,
    simulateBreach,  // ← new: moves trolley outside boundary
    resetBreach,     // ← new: brings trolley back inside
  };
}