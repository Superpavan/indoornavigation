// src/data/graph.js
// Raw graph from user – coordinates in SVG/world space
export const GRAPH = {
  nodes: [
    { id: 1, x: 521.22,  y: -604.12,  label: "Entrance"     },
    { id: 2, x: 324.871, y: 915.806,  label: "Lobby"        },
    { id: 3, x: 953.241, y: 256.941,  label: "Corridor"     },
    { id: 4, x: 2227.682,y: -609.754, label: "Conference Rm" },
  ],
  edges: [
    { from: 1, to: 3 },
    { from: 3, to: 4 },
    { from: 1, to: 2 },
  ],
};

// One beacon per node – same world coordinates
export const BEACONS = GRAPH.nodes.map((n, i) => ({
  id:      `beacon_${n.id}`,
  nodeId:  n.id,
  x:       n.x,
  y:       n.y,
  txPower: -59,          // dBm at 1 m (typical iBeacon default)
  label:   `B${i + 1}`,
}));

// ---------- Viewport helpers ----------
const PAD = 60;
export const WORLD = {
  minX: Math.min(...GRAPH.nodes.map(n => n.x)) - PAD,
  maxX: Math.max(...GRAPH.nodes.map(n => n.x)) + PAD,
  minY: Math.min(...GRAPH.nodes.map(n => n.y)) - PAD,
  maxY: Math.max(...GRAPH.nodes.map(n => n.y)) + PAD,
};
WORLD.width  = WORLD.maxX - WORLD.minX;
WORLD.height = WORLD.maxY - WORLD.minY;

/** Convert world coords → SVG viewBox coords */
export function worldToSVG(wx, wy) {
  return {
    x: wx - WORLD.minX,
    y: wy - WORLD.minY,
  };
}

/** Euclidean distance between two world-space nodes */
export function worldDist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}