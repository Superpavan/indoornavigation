/**
 * src/hooks/useNavigation.js
 *
 * Central hook that wires together:
 *   BeaconSimulator → KalmanFilter (per beacon) → Trilateration → estimated position
 *   A*              → optimal path
 *   Animation tick  → moves simulated device along the path
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { GRAPH, BEACONS, worldDist } from '../data/graph';
import { BeaconSimulation } from '../algorithms/BeaconSimulation';
import { KalmanFilter }    from '../algorithms/KalmanFilter';
import { Trilateration }   from '../algorithms/Trilateration';
import { AStar }           from '../algorithms/AStar';

const TICK_MS       = 300;   // simulation update interval
const STEP_SIZE     = 40;    // world-units moved per tick along path

const simulator    = new BeaconSimulation(BEACONS, 3, 4);
const trilaterate  = new Trilateration(0.4, 400, 0.05);
const astar        = new AStar(GRAPH.nodes, GRAPH.edges);

export function useNavigation() {
  const [startNodeId,   setStartNodeId  ] = useState(null);
  const [endNodeId,     setEndNodeId    ] = useState(null);
  const [path,          setPath         ] = useState([]);       // [nodeId, ...]
  const [estimatedPos,  setEstimatedPos ] = useState(null);     // { x, y }
  const [truePos,       setTruePos      ] = useState(null);     // { x, y }
  const [beaconReadings,setBeaconReadings] = useState([]);      // latest raw RSSI
  const [isNavigating,  setIsNavigating ] = useState(false);
  const [arrivedAt,     setArrivedAt    ] = useState(null);
  const [pathProgress,  setPathProgress ] = useState(0);        // 0-1

  // Per-beacon Kalman filters (persist across renders)
  const kalmanFilters = useRef(
    Object.fromEntries(BEACONS.map(b => [b.id, new KalmanFilter({ Q: 0.008, R: 2 })]))
  );

  const tickRef      = useRef(null);
  const posRef       = useRef(null);   // mutable true position for tick
  const pathRef      = useRef([]);
  const pathIdxRef   = useRef(0);

  // ─── Start navigation ────────────────────────────────────────────────────
  const startNavigation = useCallback(() => {
    if (!startNodeId || !endNodeId) return;

    const foundPath = astar.findPath(startNodeId, endNodeId);
    if (!foundPath) {
      alert('No path found between selected nodes!');
      return;
    }

    const startNode = GRAPH.nodes.find(n => n.id === startNodeId);
    pathRef.current    = foundPath;
    pathIdxRef.current = 0;
    posRef.current     = { x: startNode.x, y: startNode.y };

    // Reset Kalman filters
    BEACONS.forEach(b => kalmanFilters.current[b.id].reset());

    setPath(foundPath);
    setTruePos({ ...posRef.current });
    setIsNavigating(true);
    setArrivedAt(null);
    setPathProgress(0);
  }, [startNodeId, endNodeId]);

  // ─── Stop / Reset ────────────────────────────────────────────────────────
  const stopNavigation = useCallback(() => {
    clearInterval(tickRef.current);
    setIsNavigating(false);
    setPath([]);
    setEstimatedPos(null);
    setTruePos(null);
    setPathProgress(0);
    setArrivedAt(null);
    pathRef.current    = [];
    pathIdxRef.current = 0;
    posRef.current     = null;
  }, []);

  // ─── Simulation tick ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isNavigating) {
      clearInterval(tickRef.current);
      return;
    }

    tickRef.current = setInterval(() => {
      const currentPath  = pathRef.current;
      const currentIdx   = pathIdxRef.current;

      if (!currentPath.length || currentIdx >= currentPath.length - 1) {
        // Arrived
        clearInterval(tickRef.current);
        setIsNavigating(false);
        setArrivedAt(endNodeId);
        setPathProgress(1);
        return;
      }

      // Move true position along path
      const targetNode = GRAPH.nodes.find(n => n.id === currentPath[currentIdx + 1]);
      const pos        = posRef.current;

      const dx   = targetNode.x - pos.x;
      const dy   = targetNode.y - pos.y;
      const dist = Math.hypot(dx, dy);

      let newPos;
      if (dist <= STEP_SIZE) {
        newPos = { x: targetNode.x, y: targetNode.y };
        pathIdxRef.current = currentIdx + 1;
      } else {
        newPos = {
          x: pos.x + (dx / dist) * STEP_SIZE,
          y: pos.y + (dy / dist) * STEP_SIZE,
        };
      }
      posRef.current = newPos;

      // Progress (0–1)
      const progress = pathIdxRef.current / (currentPath.length - 1);
      setPathProgress(progress);
      setTruePos({ ...newPos });

      // ── Beacon simulation ──────────────────────────────────────
      const raw = simulator.simulate(newPos.x, newPos.y);
      setBeaconReadings(raw);

      // ── Kalman filtering ──────────────────────────────────────
      const smoothed = raw.map(r => ({
        ...r,
        smoothedRSSI: kalmanFilters.current[r.beaconId].update(r.rssi),
      }));

      // ── RSSI → distance ───────────────────────────────────────
      const measurements = smoothed.map(r => {
        const beacon = BEACONS.find(b => b.id === r.beaconId);
        const estDist = simulator.rssiToDistance(r.smoothedRSSI, beacon.txPower);
        return { x: beacon.x, y: beacon.y, distance: estDist };
      });

      // ── Trilateration ─────────────────────────────────────────
      const estPos = trilaterate.solve(measurements, posRef.current);
      if (estPos) setEstimatedPos(estPos);

    }, TICK_MS);

    return () => clearInterval(tickRef.current);
  }, [isNavigating, endNodeId]);

  // ─── Derived: next waypoint ───────────────────────────────────────────────
  const nextWaypoint = path.length > 1
    ? GRAPH.nodes.find(n => n.id === path[Math.min(pathIdxRef.current + 1, path.length - 1)])
    : null;

  const totalDistance = path.length > 1 ? astar.pathLength(path) : 0;

  return {
    // State
    startNodeId,   setStartNodeId,
    endNodeId,     setEndNodeId,
    path,
    estimatedPos,
    truePos,
    beaconReadings,
    isNavigating,
    arrivedAt,
    pathProgress,
    nextWaypoint,
    totalDistance,
    // Actions
    startNavigation,
    stopNavigation,
  };
}