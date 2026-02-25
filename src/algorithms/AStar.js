// src/algorithms/AStar.js
export class AStar {
  constructor(nodes, edges) {
    this.nodes = nodes;
    this.adj   = {};
    nodes.forEach(n => { this.adj[n.id] = []; });
    edges.forEach(e => {
      const a = nodes.find(n => n.id === e.from);
      const b = nodes.find(n => n.id === e.to);
      if (!a || !b) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      this.adj[e.from].push({ id: e.to,   cost: d });
      this.adj[e.to  ].push({ id: e.from, cost: d });
    });
  }

  findPath(startId, goalId) {
    const h = (id) => {
      const a = this.nodes.find(n => n.id === id);
      const b = this.nodes.find(n => n.id === goalId);
      if (!a || !b) return 0;
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const open   = new Set([startId]);
    const cameFrom = {};
    const gScore   = { [startId]: 0 };
    const fScore   = { [startId]: h(startId) };

    while (open.size > 0) {
      let current = [...open].reduce((a, b) =>
        (fScore[a] ?? Infinity) < (fScore[b] ?? Infinity) ? a : b
      );
      if (current === goalId) {
        const path = [];
        while (current !== undefined) { path.unshift(current); current = cameFrom[current]; }
        return path;
      }
      open.delete(current);
      for (const nb of (this.adj[current] || [])) {
        const tentG = (gScore[current] ?? Infinity) + nb.cost;
        if (tentG < (gScore[nb.id] ?? Infinity)) {
          cameFrom[nb.id] = current;
          gScore[nb.id]   = tentG;
          fScore[nb.id]   = tentG + h(nb.id);
          open.add(nb.id);
        }
      }
    }
    return null;
  }

  pathLength(path) {
    let len = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const a = this.nodes.find(n => n.id === path[i]);
      const b = this.nodes.find(n => n.id === path[i + 1]);
      if (a && b) len += Math.hypot(a.x - b.x, a.y - b.y);
    }
    return len;
  }
}