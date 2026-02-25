/**
 * src/utils/helpers.js
 * Shared utility functions used across the airport navigation app.
 */

// ─── Distance / geometry ─────────────────────────────────────────────────────

/** Euclidean distance between two {x, y} points */
export function dist2D(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Point-in-polygon (ray casting algorithm).
 * @param {number} px  Point X
 * @param {number} py  Point Y
 * @param {Array}  poly  Array of {x, y} vertices
 * @returns {boolean}
 */
export function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Find the nearest item in an array to a world point, using x/y fields */
export function nearestItem(items, wx, wy) {
  return items.reduce(
    (best, item) => {
      const d = Math.hypot(item.x - wx, item.y - wy);
      return d < best.d ? { item, d } : best;
    },
    { item: null, d: Infinity }
  ).item;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

/**
 * Format a distance in world units to a human-readable metres string.
 * Assumes 1 world unit ≈ 1 metre at the scale used.
 */
export function formatDistance(worldUnits) {
  const m = Math.round(worldUnits);
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

/** Format estimated walk time from distance (assumes ~1.2 m/s walking speed) */
export function formatETA(worldUnits, stepSize = 20, tickMs = 300) {
  const steps   = worldUnits / stepSize;
  const seconds = steps * (tickMs / 1000);
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? '< 1 min' : `${minutes} min`;
}

// ─── Math helpers ────────────────────────────────────────────────────────────

/** Clamp a value between min and max */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Linear interpolation */
export function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

/** Convert degrees to radians */
export function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// ─── RSSI helpers ─────────────────────────────────────────────────────────────

/**
 * Convert RSSI to a 0–1 signal strength value for UI bars.
 * RSSI range: –100 (no signal) to –30 (very close).
 */
export function rssiToStrength(rssi) {
  return clamp((rssi + 100) / 70, 0, 1);
}

/** Signal strength colour: green → amber → red */
export function rssiColor(rssi) {
  const s = rssiToStrength(rssi);
  if (s > 0.6) return '#16A34A';
  if (s > 0.3) return '#F59E0B';
  return '#DC2626';
}

// ─── Array helpers ────────────────────────────────────────────────────────────

/** Group an array of objects by a key */
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

/** Remove duplicates from an array of primitives */
export function unique(arr) {
  return [...new Set(arr)];
}