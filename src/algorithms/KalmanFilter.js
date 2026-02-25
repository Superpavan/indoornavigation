/**
 * src/algorithms/KalmanFilter.js
 *
 * 1-D Kalman Filter for noisy RSSI smoothing.
 *
 * State model:  x_k = x_{k-1} + w_k        (process noise w ~ N(0, Q))
 * Measurement:  z_k = x_k       + v_k        (sensor  noise v ~ N(0, R))
 *
 * Usage:
 *   const kf = new KalmanFilter({ Q: 0.008, R: 2 });
 *   const smoothed = kf.update(rawRSSI);
 */
export class KalmanFilter {
  /**
   * @param {object} opts
   * @param {number} [opts.Q=0.008]  Process-noise covariance  (lower → smoother but slower)
   * @param {number} [opts.R=2]      Measurement-noise covariance (higher → smoother)
   * @param {number} [opts.P=1]      Initial estimate error covariance
   * @param {number} [opts.x=null]   Initial state estimate (auto-seeded on first call)
   */
  constructor({ Q = 0.008, R = 2, P = 1, x = null } = {}) {
    this.Q = Q;
    this.R = R;
    this.P = P;
    this.x = x;          // will be seeded with first measurement
  }

  /** Feed one raw RSSI measurement, get back a smoothed estimate */
  update(measurement) {
    // --- Bootstrap ---
    if (this.x === null) {
      this.x = measurement;
      return measurement;
    }

    // --- Predict ---
    const P_pred = this.P + this.Q;

    // --- Update (Kalman Gain) ---
    const K = P_pred / (P_pred + this.R);

    // --- State estimate ---
    this.x = this.x + K * (measurement - this.x);
    this.P = (1 - K) * P_pred;

    return this.x;
  }

  reset() {
    this.x = null;
    this.P = 1;
  }
}