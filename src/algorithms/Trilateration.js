/**
 * src/algorithms/Trilateration.js
 *
 * Non-linear Least-Squares Trilateration
 * ───────────────────────────────────────
 * Given N beacons at known positions (bx_i, by_i) and estimated distances
 * d_i, find position (x, y) that minimises:
 *
 *   Σ [ sqrt((x-bx_i)² + (y-by_i)²) - d_i ]²
 *
 * Solved with gradient descent (simple but robust for indoor scale).
 *
 * With only 1 or 2 beacons the solver falls back to simpler heuristics.
 */
export class Trilateration {
  /**
   * @param {number} [lr=0.3]       Learning rate for gradient descent
   * @param {number} [iters=300]    Max iterations
   * @param {number} [tol=0.01]     Convergence tolerance (world units)
   */
  constructor(lr = 0.3, iters = 300, tol = 0.01) {
    this.lr    = lr;
    this.iters = iters;
    this.tol   = tol;
  }

  /**
   * Estimate position from beacon measurements.
   *
   * @param {Array} measurements  [{ x, y, distance }, ...]  (at least 1)
   * @param {object} [seed]       Optional { x, y } starting guess
   * @returns {{ x: number, y: number }}
   */
  solve(measurements, seed = null) {
    if (!measurements || measurements.length === 0) return null;

    // --- 1 beacon: return beacon position itself ---
    if (measurements.length === 1) {
      return { x: measurements[0].x, y: measurements[0].y };
    }

    // --- Seed: weighted centroid of beacon positions ---
    let x, y;
    if (seed) {
      x = seed.x;
      y = seed.y;
    } else {
      let wx = 0, wy = 0, wt = 0;
      measurements.forEach(m => {
        const w = 1 / (m.distance + 1);
        wx += m.x * w;
        wy += m.y * w;
        wt += w;
      });
      x = wx / wt;
      y = wy / wt;
    }

    // --- Gradient descent ---
    for (let iter = 0; iter < this.iters; iter++) {
      let gx = 0, gy = 0;

      measurements.forEach(m => {
        const dx   = x - m.x;
        const dy   = y - m.y;
        const dist = Math.max(0.001, Math.hypot(dx, dy));
        const err  = dist - m.distance;          // residual
        gx += err * (dx / dist);
        gy += err * (dy / dist);
      });

      const step = this.lr / measurements.length;
      const nx   = x - step * gx;
      const ny   = y - step * gy;

      if (Math.hypot(nx - x, ny - y) < this.tol) {
        return { x: nx, y: ny };
      }
      x = nx;
      y = ny;
    }

    return { x, y };
  }
}