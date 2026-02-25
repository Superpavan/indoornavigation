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

  const kalmanFilters = useRef(
    Object.fromEntries(BEACONS.map(b => [b.id, new KalmanFilter()]))
  );

  const tickRef    = useRef(null);
  const posRef     = useRef(null);
  const pathRef    = useRef([]);
  const pathIdxRef = useRef(0);
  const endIdRef   = useRef(null);

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
    setArrivedAt(null);
    setPathProgress(0);
    setBoundaryAlarm(false);
    setStartNodeId(sId);
    setEndNodeId(eId);
  }, [startNodeId, endNodeId]);

  const stopNavigation = useCallback(() => {
    clearInterval(tickRef.current);
    setIsNavigating(false);
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

      // Beacon simulation → Kalman → Trilateration
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
    startNavigation, stopNavigation,
  };
}