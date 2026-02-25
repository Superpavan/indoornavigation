// src/algorithms/KalmanFilter.js
export class KalmanFilter {
  constructor({ Q = 0.008, R = 2 } = {}) {
    this.Q = Q; this.R = R;
    this.P = 1; this.x = null;
  }
  reset() { this.P = 1; this.x = null; }
  update(z) {
    if (this.x === null) { this.x = z; return z; }
    this.P += this.Q;
    const K  = this.P / (this.P + this.R);
    this.x  += K * (z - this.x);
    this.P  *= (1 - K);
    return this.x;
  }
}