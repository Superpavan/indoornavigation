// src/algorithms/BeaconSimulator.js
export class BeaconSimulator {
  constructor(beacons, n = 3, sigma = 4) {
    this.beacons = beacons;
    this.n = n;
    this.sigma = sigma;
  }
  _gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  simulate(px, py) {
    return this.beacons.map(b => {
      const d    = Math.max(0.1, Math.hypot(b.x - px, b.y - py));
      const rssi = b.txPower - 10 * this.n * Math.log10(d) + this._gauss() * this.sigma;
      return { beaconId: b.id, rssi };
    });
  }
  rssiToDistance(rssi, txPower) {
    return Math.pow(10, (txPower - rssi) / (10 * this.n));
  }
}