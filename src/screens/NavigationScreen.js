// src/screens/NavigationScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, useWindowDimensions, Platform, Animated,
} from 'react-native';
import AirportMap      from '../components/AirportMap';
import ServicesSidebar from '../components/ServicesSidebar';
import BoundaryAlarm   from '../components/BoundaryAlarm';
import { useAirportNav } from '../hooks/useAirportNav';
import { FLIGHT_INFO, NAV_NODES, nearestNavNode } from '../data/airportData';

const TOP_BAR  = 58;
const ETA_BAR  = 66;
const FLT_BAR  = 44;
const STATUS_H = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? 0)
  : Platform.OS === 'ios' ? 44 : 0;

const NAV_ITEMS = [
  { key: 'restroom', label: 'Restrooms', icon: '🚻' },
  { key: 'food',     label: 'Food',      icon: '🍽️' },
  { key: 'shopping', label: 'Shopping',  icon: '🛍️' },
  { key: 'helpdesk', label: 'Helpdesk',  icon: '❓' },
  { key: 'lounge',   label: 'Lounges',   icon: '🛋️' },
];

export default function NavigationScreen({ onBack }) {
  const { width, height } = useWindowDimensions();
  const mapHeight = Math.max(180, height - STATUS_H - TOP_BAR - ETA_BAR - FLT_BAR);

  const nav = useAirportNav();
  const [sidebarCat,     setSidebarCat    ] = useState(null);
  const [selectionMode,  setSelectionMode ] = useState('none');
  const [activeSvc,      setActiveSvc     ] = useState(null);
  const [alarmDismissed, setAlarmDismissed] = useState(false);
  const [showSimPanel,   setShowSimPanel  ] = useState(false);

  // Pulsing animation for the breach button
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Auto-route to Gate 31 on mount
  useEffect(() => {
    nav.setStartNodeId(1);
    nav.setEndNodeId(FLIGHT_INFO.gateNodeId);
    const t = setTimeout(() => nav.startNavigation(1, FLIGHT_INFO.gateNodeId), 700);
    return () => clearTimeout(t);
  }, []);

  // Re-show alarm whenever boundary is breached (after dismiss)
  useEffect(() => {
    if (nav.boundaryAlarm) setAlarmDismissed(false);
  }, [nav.boundaryAlarm]);

  const handleCategoryPress = useCallback((cat) => {
    setSidebarCat(prev => prev === cat ? null : cat);
  }, []);

  const handleServiceNavigate = useCallback((service) => {
    const target = NAV_NODES.find(n => n.id === service.nearNode);
    if (!target) return;
    nav.stopNavigation();
    setActiveSvc(service);
    setSidebarCat(null);
    const from = nav.truePos ? nearestNavNode(nav.truePos.x, nav.truePos.y) : NAV_NODES[0];
    setTimeout(() => nav.startNavigation(from.id, target.id), 150);
  }, [nav]);

  const handleMapPress = useCallback(({ worldX, worldY }) => {
    if (selectionMode === 'none') return;
    const node = nearestNavNode(worldX, worldY);
    if (!node) return;
    if (selectionMode === 'start') { nav.setStartNodeId(node.id); setSelectionMode('none'); }
    else                           { nav.setEndNodeId(node.id);   setSelectionMode('none'); }
  }, [selectionMode, nav]);

  // Trigger breach simulation
  const handleSimulateBreach = useCallback(() => {
    setAlarmDismissed(false);
    setShowSimPanel(false);
    nav.simulateBreach();
  }, [nav]);

  // Reset breach — bring trolley back
  const handleResetBreach = useCallback(() => {
    setAlarmDismissed(true);
    nav.resetBreach();
  }, [nav]);

  const etaMins = nav.eta || Math.max(1, Math.round(nav.totalDistance / 60));

  return (
    <View style={[styles.root, { paddingTop: STATUS_H }]}>
      {Platform.OS !== 'web' && (
        <StatusBar barStyle="light-content" backgroundColor="#1A2544" />
      )}

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.logoBtn}>
          <Text style={styles.logoText}>✈ DXB</Text>
        </TouchableOpacity>

        <View style={styles.navItems}>
          {NAV_ITEMS.map(item => (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, sidebarCat === item.key && styles.navItemActive]}
              onPress={() => handleCategoryPress(item.key)}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navLabel, sidebarCat === item.key && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── SIMULATION TOGGLE BUTTON ── */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.simToggleBtn, showSimPanel && styles.simToggleBtnActive]}
            onPress={() => setShowSimPanel(v => !v)}
          >
            <Text style={styles.simToggleIcon}>🚨</Text>
            <Text style={styles.simToggleLabel}>SIM</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── Simulation Control Panel (drops down from top bar) ── */}
      {showSimPanel && (
        <View style={styles.simPanel}>
          <View style={styles.simPanelHeader}>
            <Text style={styles.simPanelTitle}>⚠️  Trolley Boundary Simulation</Text>
            <TouchableOpacity onPress={() => setShowSimPanel(false)}>
              <Text style={styles.simPanelClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.simPanelDesc}>
            Simulate the trolley moving outside the terminal boundary.
            The alarm will fire automatically when it crosses the red border line.
          </Text>
          <View style={styles.simBtnRow}>
            {/* BREACH button */}
            <TouchableOpacity
              style={[
                styles.simBreachBtn,
                nav.isSimulating && styles.simBreachBtnDisabled,
              ]}
              onPress={handleSimulateBreach}
              disabled={nav.isSimulating}
            >
              <Text style={styles.simBreachBtnIcon}>🚨</Text>
              <Text style={styles.simBreachBtnText}>
                {nav.isSimulating ? 'Moving trolley...' : 'Simulate Breach'}
              </Text>
            </TouchableOpacity>

            {/* RESET button */}
            <TouchableOpacity
              style={styles.simResetBtn}
              onPress={handleResetBreach}
            >
              <Text style={styles.simResetBtnIcon}>🔄</Text>
              <Text style={styles.simResetBtnText}>Reset Position</Text>
            </TouchableOpacity>
          </View>

          {/* Status indicator */}
          <View style={styles.simStatus}>
            <View style={[
              styles.simStatusDot,
              nav.boundaryAlarm ? styles.simStatusDotRed : styles.simStatusDotGreen,
            ]} />
            <Text style={styles.simStatusText}>
              {nav.boundaryAlarm
                ? '🔴 ALARM ACTIVE — Trolley outside boundary!'
                : nav.isSimulating
                  ? '🟡 Trolley moving toward boundary...'
                  : '🟢 Trolley inside terminal boundary'}
            </Text>
          </View>
        </View>
      )}

      {/* ── Map ── */}
      <View style={[styles.mapWrap, { height: showSimPanel ? mapHeight - 130 : mapHeight }]}>
        <AirportMap
          svgWidth={width}
          svgHeight={showSimPanel ? mapHeight - 130 : mapHeight}
          startNodeId={nav.startNodeId}
          endNodeId={nav.endNodeId}
          selectionMode={selectionMode}
          path={nav.path}
          truePos={nav.truePos}
          estimatedPos={nav.estimatedPos}
          beaconReadings={nav.beaconReadings}
          boundaryAlarm={nav.boundaryAlarm && !alarmDismissed}
          onServicePress={(s) => setSidebarCat(s.type)}
          onMapPress={handleMapPress}
          highlightCategory={sidebarCat}
          activeServiceId={activeSvc?.id}
          isSimulating={nav.isSimulating}
        />

        <ServicesSidebar
          visible={!!sidebarCat}
          category={sidebarCat}
          truePos={nav.truePos}
          onNavigate={handleServiceNavigate}
          onClose={() => setSidebarCat(null)}
          activeServiceId={activeSvc?.id}
        />

        <BoundaryAlarm
          visible={nav.boundaryAlarm && !alarmDismissed}
          onDismiss={() => setAlarmDismissed(true)}
        />
      </View>

      {/* ── ETA bar ── */}
      <View style={styles.etaBar}>
        <View style={[
          styles.etaLeft,
          nav.boundaryAlarm && !alarmDismissed && styles.etaLeftAlarm,
        ]}>
          <Text style={styles.walkIcon}>
            {nav.boundaryAlarm && !alarmDismissed ? '⚠️' : '🚶'}
          </Text>
          <View>
            <Text style={styles.etaLabel}>
              {nav.boundaryAlarm && !alarmDismissed ? 'Boundary Alert!' : 'Arriving in'}
            </Text>
            <Text style={styles.etaTime}>
              {nav.boundaryAlarm && !alarmDismissed
                ? 'Trolley outside zone'
                : nav.arrivedAt ? 'Arrived! ✓'
                : `${etaMins} minutes`}
            </Text>
          </View>
          <View style={styles.gateBox}>
            <Text style={styles.gateLabel}>Gate</Text>
            <Text style={styles.gateNum}>{FLIGHT_INFO.gate}</Text>
          </View>
        </View>

        {nav.isSimulating ? (
          <TouchableOpacity style={styles.resetBtn} onPress={handleResetBreach}>
            <Text style={styles.resetBtnText}>🔄 Reset</Text>
          </TouchableOpacity>
        ) : nav.isNavigating ? (
          <TouchableOpacity style={styles.cancelBtn} onPress={nav.stopNavigation}>
            <Text style={styles.cancelText}>✕  CANCEL</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => nav.startNavigation(
              nav.startNodeId || 1,
              nav.endNodeId   || FLIGHT_INFO.gateNodeId
            )}
          >
            <Text style={styles.startText}>▶ START</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Flight bar ── */}
      <View style={styles.fltBar}>
        {[
          ['Flight no.', FLIGHT_INFO.flightNo,  false],
          ['From',       FLIGHT_INFO.from,       false],
          ['To',         FLIGHT_INFO.to,          false],
          ['Status',     FLIGHT_INFO.status,      true ],
          ['Departure',  FLIGHT_INFO.departure,  false],
        ].map(([k, v, g]) => (
          <View key={k} style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 8 }}>{k}</Text>
            <Text style={[
              { color: '#1A2544', fontSize: 10, fontWeight: '800' },
              g && { color: '#16A34A' },
            ]}>
              {v}
            </Text>
          </View>
        ))}
        <TouchableOpacity onPress={onBack} style={{ paddingHorizontal: 8 }}>
          <Text style={{ color: '#6B7280', fontSize: 9 }}>↩ Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#1A2544' },

  // ── Top bar
  topBar: {
    height: TOP_BAR, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A2544', paddingHorizontal: 10, gap: 6,
  },
  logoBtn: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  logoText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  navItems: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  navItem:  {
    alignItems: 'center', paddingHorizontal: 4, paddingVertical: 4, borderRadius: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  navItemActive:  { backgroundColor: 'rgba(255,255,255,0.18)' },
  navIcon:        { fontSize: 15, marginBottom: 1 },
  navLabel:       { color: 'rgba(255,255,255,0.65)', fontSize: 7.5, fontWeight: '600' },
  navLabelActive: { color: '#FFF' },

  // ── Simulation toggle button (top-right of nav bar)
  simToggleBtn: {
    alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.5)',
    backgroundColor: 'rgba(239,68,68,0.12)',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  simToggleBtnActive: {
    backgroundColor: 'rgba(239,68,68,0.3)', borderColor: '#EF4444',
  },
  simToggleIcon:  { fontSize: 14 },
  simToggleLabel: { color: '#FCA5A5', fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },

  // ── Simulation panel (dropdown)
  simPanel: {
    backgroundColor: '#1A0A0A',
    borderBottomWidth: 1, borderBottomColor: '#EF4444',
    paddingHorizontal: 14, paddingVertical: 10,
    gap: 8,
  },
  simPanelHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  simPanelTitle: { color: '#FCA5A5', fontSize: 12, fontWeight: '800' },
  simPanelClose: {
    color: '#9CA3AF', fontSize: 16, fontWeight: '700',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  simPanelDesc: {
    color: 'rgba(252,165,165,0.75)', fontSize: 10, lineHeight: 15,
  },
  simBtnRow: { flexDirection: 'row', gap: 8 },

  // Breach button — red
  simBreachBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#EF4444', borderRadius: 10,
    paddingVertical: 9,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  simBreachBtnDisabled: { backgroundColor: '#7F1D1D', opacity: 0.6 },
  simBreachBtnIcon: { fontSize: 14 },
  simBreachBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },

  // Reset button — dark gray
  simResetBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#374151', borderRadius: 10,
    paddingVertical: 9,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  simResetBtnIcon: { fontSize: 14 },
  simResetBtnText: { color: '#D1D5DB', fontSize: 11, fontWeight: '700' },

  // Status row
  simStatus: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  simStatusDot: { width: 8, height: 8, borderRadius: 4 },
  simStatusDotGreen: { backgroundColor: '#16A34A' },
  simStatusDotRed:   { backgroundColor: '#EF4444' },
  simStatusText: { color: '#E5E7EB', fontSize: 10, fontWeight: '600', flex: 1 },

  // ── Map
  mapWrap: { position: 'relative', overflow: 'hidden' },

  // ── ETA bar
  etaBar: {
    height: ETA_BAR, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', paddingHorizontal: 10, gap: 8,
  },
  etaLeft: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#16A34A', borderRadius: 10, padding: 10,
  },
  etaLeftAlarm: { backgroundColor: '#DC2626' },
  walkIcon:  { fontSize: 20 },
  etaLabel:  { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600' },
  etaTime:   { color: '#FFF', fontSize: 13, fontWeight: '900' },
  gateBox:   {
    marginLeft: 'auto', backgroundColor: '#000',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center',
  },
  gateLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 7, fontWeight: '600' },
  gateNum:   { color: '#FFF', fontSize: 18, fontWeight: '900' },

  cancelBtn: {
    backgroundColor: '#1A2544', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  cancelText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  startBtn: {
    backgroundColor: '#16A34A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  startText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  resetBtn: {
    backgroundColor: '#374151', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  resetBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  // ── Flight bar
  fltBar: {
    height: FLT_BAR, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderTopWidth: 1, borderTopColor: '#E5E7EB',
    paddingHorizontal: 10,
  },
});