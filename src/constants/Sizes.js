/**
 * src/constants/Sizes.js
 * Layout size constants used across the app.
 */
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const Sizes = {
  // ── Screen ───────────────────────────────────────
  screenWidth:   SCREEN_W,
  screenHeight:  SCREEN_H,

  // ── Layout zones (NavigationScreen) ─────────────
  topBarHeight:    58,
  etaBarHeight:    70,
  flightBarHeight: 46,

  // ── Map derived height ────────────────────────────
  // Use this formula in components:
  // mapHeight = screenHeight - topBarHeight - etaBarHeight - flightBarHeight - statusBar
  statusBarHeight: Platform.OS === 'android' ? 24 : 44,

  // ── Welcome screen ───────────────────────────────
  boardingPassMaxWidth: 560,

  // ── Map nodes ────────────────────────────────────
  nodeRadius:    14,   // navigation node circle radius
  hitRadius:     44,   // invisible tap area radius
  serviceRadius: 16,   // service icon circle radius
  pinSize:       28,   // drop pin height

  // ── Sidebar ──────────────────────────────────────
  sidebarWidth:  230,

  // ── Typography ───────────────────────────────────
  fontXS:   8,
  fontSM:   10,
  fontMD:   12,
  fontLG:   14,
  fontXL:   16,
  font2XL:  20,
  font3XL:  26,

  // ── Spacing ──────────────────────────────────────
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,

  // ── Border radius ────────────────────────────────
  radiusSM:   6,
  radiusMD:   10,
  radiusLG:   14,
  radiusXL:   18,
  radiusFull: 999,

  // ── Shadows ──────────────────────────────────────
  shadowSM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  shadowMD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 8,
  },
  shadowLG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 14,
  },
};

export default Sizes;