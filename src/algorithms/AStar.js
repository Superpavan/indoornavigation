/**
 * src/algorithms/AStar.js
 *
 * A* pathfinding on the indoor navigation graph.
 *
 * Heuristic: Euclidean distance in world space  (admissible because
 * actual edge weights are also Euclidean, so h never over-estimates).
 *
 * Usage:
 *   const astar = new AStar(nodes, edges);
 *   const path  = astar.findPath(startId, goalId);
 *   // path = [nodeId, nodeId, ...]  or  null if unreachable
 */
export class AStar {
  /**
   * @param {Array} nodes  [{ id, x, y }, ...]
   * @param {Array} edges  [{ from, to }, ...]   (treated as bidirectional)
   */
  constructor(nodes, edges) {
    this.nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Build adjacency list with weights
    this.adj = new Map(nodes.map(n => [n.id, []]));
    edges.forEach(e => {
      const a = this.nodeMap.get(e.from);
      const b = this.nodeMap.get(e.to);
      if (!a || !b) return;
      const w = Math.hypot(a.x - b.x, a.y - b.y);
      this.adj.get(e.from).push({ id: e.to,   cost: w });
      this.adj.get(e.to).push  ({ id: e.from, cost: w });
    });
  }

  /** Euclidean heuristic between two node ids */
  _h(idA, idB) {
    const a = this.nodeMap.get(idA);
    const b = this.nodeMap.get(idB);
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  /**
   * Find shortest path from startId to goalId.
   * @returns {number[] | null}  Array of node IDs or null if unreachable
   */
  findPath(startId, goalId) {
    if (startId === goalId) return [startId];

    // Min-heap implemented as sorted array (small graph → fine)
    const open     = [{ id: startId, f: 0, g: 0 }];
    const gScore   = new Map([[startId, 0]]);
    const cameFrom = new Map();
    const closed   = new Set();

    while (open.length > 0) {
      // Pop node with lowest f
      open.sort((a, b) => a.f - b.f);
      const current = open.shift();

      if (current.id === goalId) {
        return this._reconstruct(cameFrom, goalId);
      }

      closed.add(current.id);

      for (const neighbour of (this.adj.get(current.id) || [])) {
        if (closed.has(neighbour.id)) continue;

        const tentG = (gScore.get(current.id) ?? Infinity) + neighbour.cost;

        if (tentG < (gScore.get(neighbour.id) ?? Infinity)) {
          cameFrom.set(neighbour.id, current.id);
          gScore.set(neighbour.id, tentG);
          const f = tentG + this._h(neighbour.id, goalId);

          // Remove stale entry if present
          const idx = open.findIndex(o => o.id === neighbour.id);
          if (idx !== -1) open.splice(idx, 1);
          open.push({ id: neighbour.id, f, g: tentG });
        }
      }
    }

    return null; // unreachable
  }

  _reconstruct(cameFrom, current) {
    const path = [current];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current);
      path.unshift(current);
    }
    return path;
  }

  /**
   * Compute total distance of a path (array of node ids).
   */
  pathLength(path) {
    let len = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const a = this.nodeMap.get(path[i]);
      const b = this.nodeMap.get(path[i + 1]);
      len += Math.hypot(a.x - b.x, a.y - b.y);
    }
    return len;
  }
}