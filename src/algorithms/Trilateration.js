// src/algorithms/Trilateration.js
export class Trilateration {
  constructor(lr = 0.4, iters = 300, tol = 0.05) {
    this.lr = lr; this.iters = iters; this.tol = tol;
  }
  solve(measurements, initPos) {
    if (!measurements || measurements.length < 2) return null;
    let { x, y } = initPos || { x: 400, y: 400 };
    for (let i = 0; i < this.iters; i++) {
      let gx = 0, gy = 0;
      for (const m of measurements) {
        const dist = Math.max(0.01, Math.hypot(x - m.x, y - m.y));
        const err  = dist - m.distance;
        gx += err * (x - m.x) / dist;
        gy += err * (y - m.y) / dist;
      }
      gx /= measurements.length;
      gy /= measurements.length;
      x  -= this.lr * gx;
      y  -= this.lr * gy;
      if (Math.hypot(gx, gy) < this.tol) break;
    }
    return { x, y };
  }
}