/**
 * src/algorithms/BeaconSimulation.js
 *
 * Simulates Bluetooth beacon RSSI for a device at position (px, py).
 *
 * Physical model
 * ──────────────
 *   RSSI = TxPower - 10·n·log10(d)  +  gaussianNoise(0, σ)
 *
 *   n  = path-loss exponent  (2 = free space, 3–4 for indoor)
 *   d  = Euclidean distance from beacon to device  (in world units)
 *   σ  = std-dev of Gaussian noise  (higher → dirtier signal)
 *
 * Distance from RSSI (inverse)
 * ─────────────────────────────
 *   d = 10 ^ ( (TxPower - RSSI) / (10·n) )
 */
export class BeaconSimulation {
  /**
   * @param {Array}  beacons   Array of { id, x, y, txPower }
   * @param {number} [n=3]     Path-loss exponent
   * @param {number} [sigma=4] Gaussian noise std-dev (dB)
   */
  constructor(beacons, n = 3, sigma = 4) {
    this.beacons = beacons;
    this.n       = n;
    this.sigma   = sigma;
  }

  /** Box-Muller transform → standard-normal sample */
  _gaussian() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /**
   * Simulate raw RSSI readings for device at world position (px, py).
   * Returns Array of { beaconId, rssi, trueDistance }
   */
  simulate(px, py) {
    return this.beacons.map(b => {
      const d         = Math.max(0.01, Math.hypot(px - b.x, py - b.y));
      const idealRSSI = b.txPower - 10 * this.n * Math.log10(d / 100); // /100 = scale world units → ~metres
      const rssi      = idealRSSI + this._gaussian() * this.sigma;
      return {
        beaconId:     b.id,
        rssi:         rssi,
        trueDistance: d,
      };
    });
  }

  /**
   * Convert smoothed RSSI → estimated distance (metres equivalent).
   */
  rssiToDistance(rssi, txPower) {
    return Math.pow(10, (txPower - rssi) / (10 * this.n)) * 100; // ×100 back to world units
  }
}