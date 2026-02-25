/**
 * src/constants/Colors.js
 * Centralised color palette for the entire app.
 */
export const Colors = {
  // ── Brand / Primary ──────────────────────────────
  primary:      '#1A2544',   // DXB dark navy
  primaryLight: '#2B4EBF',   // boarding pass blue
  accent:       '#00D4FF',   // beacon / path cyan

  // ── Status ───────────────────────────────────────
  green:        '#16A34A',   // start pin, ETA bar, on-time
  greenLight:   '#00C896',   // true position dot
  red:          '#DC2626',   // end pin, alarm, cancel
  redLight:     '#EF4444',   // boundary alarm border
  amber:        '#F59E0B',   // outside zone, trilateration dot
  amberLight:   '#FFB800',

  // ── Surfaces ─────────────────────────────────────
  bg:           '#EAECF5',   // welcome screen bg
  bgMap:        '#E8EBF2',   // map background
  bgDark:       '#080F1E',   // dark map bg (old screens)
  card:         '#FFFFFF',
  cardDark:     '#112240',
  border:       '#E5E7EB',
  borderDark:   '#1E3A6E',

  // ── Text ─────────────────────────────────────────
  textPrimary:  '#1A2544',
  textSecond:   '#6B7280',
  textMuted:    '#9CA3AF',
  textWhite:    '#FFFFFF',
  textOnDark:   '#E2E8F0',

  // ── Service category colors ───────────────────────
  restroom: { color: '#1E4D9A', bg: '#E8F0FE' },
  food:     { color: '#B45309', bg: '#FEF3C7' },
  shopping: { color: '#9333EA', bg: '#F5F3FF' },
  lounge:   { color: '#0F766E', bg: '#CCFBF1' },
  helpdesk: { color: '#DC2626', bg: '#FEF2F2' },

  // ── Map elements ─────────────────────────────────
  corridor:     '#D0D5E8',
  corridorBorder:'#BCC3D8',
  wallFill:     '#F0F2F8',
  wallStroke:   '#C5CAD8',
  gridLine:     'rgba(30,58,110,0.18)',
  pathBlue:     '#1E3A8A',
  gateHighlight:'rgba(30,58,138,0.12)',

  // ── Transparency helpers ──────────────────────────
  overlay:      'rgba(0,0,0,0.45)',
  alarmOverlay: 'rgba(239,68,68,0.08)',
};

export default Colors;