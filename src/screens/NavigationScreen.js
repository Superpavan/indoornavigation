// src/screens/NavigationScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, useWindowDimensions, Platform } from 'react-native';
import AirportMap      from '../components/AirportMap';
import ServicesSidebar from '../components/ServicesSidebar';
import BoundaryAlarm   from '../components/BoundaryAlarm';
import { useAirportNav } from '../hooks/useAirportNav';
import { FLIGHT_INFO, NAV_NODES, nearestNavNode } from '../data/airportData';

const TOP_BAR  = 58;
const ETA_BAR  = 66;
const FLT_BAR  = 44;
const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : Platform.OS === 'ios' ? 44 : 0;

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
  const [sidebarCat,    setSidebarCat   ] = useState(null);
  const [selectionMode, setSelectionMode] = useState('none');
  const [activeSvc,     setActiveSvc    ] = useState(null);
  const [alarmDismissed,setAlarmDismissed] = useState(false);

  // Auto-route to Gate 31 on mount
  useEffect(() => {
    nav.setStartNodeId(1);
    nav.setEndNodeId(FLIGHT_INFO.gateNodeId);
    const t = setTimeout(() => nav.startNavigation(1, FLIGHT_INFO.gateNodeId), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { if (nav.boundaryAlarm) setAlarmDismissed(false); }, [nav.boundaryAlarm]);

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

  const etaMins = nav.eta || Math.max(1, Math.round(nav.totalDistance / 60));

  return (
    <View style={[styles.root, { paddingTop: STATUS_H }]}>
      {Platform.OS !== 'web' && <StatusBar barStyle="light-content" backgroundColor="#1A2544" />}

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.logoBtn}>
          <Text style={styles.logoText}>✈ DXB</Text>
        </TouchableOpacity>
        <View style={styles.navItems}>
          {NAV_ITEMS.map(item => (
            <TouchableOpacity key={item.key}
              style={[styles.navItem, sidebarCat === item.key && styles.navItemActive]}
              onPress={() => handleCategoryPress(item.key)}>
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navLabel, sidebarCat === item.key && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Map */}
      <View style={[styles.mapWrap, { height: mapHeight }]}>
        <AirportMap
          svgWidth={width} svgHeight={mapHeight}
          startNodeId={nav.startNodeId} endNodeId={nav.endNodeId}
          selectionMode={selectionMode}
          path={nav.path} truePos={nav.truePos} estimatedPos={nav.estimatedPos}
          beaconReadings={nav.beaconReadings}
          boundaryAlarm={nav.boundaryAlarm && !alarmDismissed}
          onServicePress={(s) => setSidebarCat(s.type)}
          onMapPress={handleMapPress}
          highlightCategory={sidebarCat}
          activeServiceId={activeSvc?.id}
        />
        <ServicesSidebar
          visible={!!sidebarCat} category={sidebarCat} truePos={nav.truePos}
          onNavigate={handleServiceNavigate} onClose={() => setSidebarCat(null)}
          activeServiceId={activeSvc?.id}
        />
        <BoundaryAlarm visible={nav.boundaryAlarm && !alarmDismissed} onDismiss={() => setAlarmDismissed(true)} />
      </View>

      {/* ETA bar */}
      <View style={styles.etaBar}>
        <View style={styles.etaLeft}>
          <Text style={styles.walkIcon}>🚶</Text>
          <View>
            <Text style={styles.etaLabel}>Arriving in</Text>
            <Text style={styles.etaTime}>{nav.arrivedAt ? 'Arrived! ✓' : `${etaMins} minutes`}</Text>
          </View>
          <View style={styles.gateBox}>
            <Text style={styles.gateLabel}>Gate</Text>
            <Text style={styles.gateNum}>{FLIGHT_INFO.gate}</Text>
          </View>
        </View>
        {nav.isNavigating
          ? <TouchableOpacity style={styles.cancelBtn} onPress={nav.stopNavigation}>
              <Text style={styles.cancelText}>✕  CANCEL ROUTE</Text>
            </TouchableOpacity>
          : <TouchableOpacity style={styles.startBtn}
              onPress={() => nav.startNavigation(nav.startNodeId || 1, nav.endNodeId || FLIGHT_INFO.gateNodeId)}>
              <Text style={styles.startText}>▶ START</Text>
            </TouchableOpacity>
        }
      </View>

      {/* Flight bar */}
      <View style={styles.fltBar}>
        {[['Flight no.', FLIGHT_INFO.flightNo, false], ['From', FLIGHT_INFO.from, false], ['To', FLIGHT_INFO.to, false], ['Status', FLIGHT_INFO.status, true], ['Departure', FLIGHT_INFO.departure, false]].map(([k,v,g]) => (
          <View key={k} style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 8 }}>{k}</Text>
            <Text style={[{ color: '#1A2544', fontSize: 10, fontWeight: '800' }, g && { color: '#16A34A' }]}>{v}</Text>
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
  topBar:  { height: TOP_BAR, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2544', paddingHorizontal: 10, gap: 6 },
  logoBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)',
    ...Platform.select({ web: { cursor: 'pointer' } }) },
  logoText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  navItems: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  navItem:  { alignItems: 'center', paddingHorizontal: 4, paddingVertical: 4, borderRadius: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }) },
  navItemActive:  { backgroundColor: 'rgba(255,255,255,0.18)' },
  navIcon:        { fontSize: 16, marginBottom: 1 },
  navLabel:       { color: 'rgba(255,255,255,0.65)', fontSize: 8, fontWeight: '600' },
  navLabelActive: { color: '#FFF' },
  mapWrap: { position: 'relative', overflow: 'hidden' },
  etaBar:  { height: ETA_BAR, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 10, gap: 8 },
  etaLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#16A34A', borderRadius: 10, padding: 10 },
  walkIcon: { fontSize: 20 },
  etaLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600' },
  etaTime:  { color: '#FFF', fontSize: 14, fontWeight: '900' },
  gateBox:  { marginLeft: 'auto', backgroundColor: '#000', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center' },
  gateLabel:{ color: 'rgba(255,255,255,0.7)', fontSize: 7, fontWeight: '600' },
  gateNum:  { color: '#FFF', fontSize: 18, fontWeight: '900' },
  cancelBtn:{ backgroundColor: '#1A2544', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }) },
  cancelText:{ color: '#FFF', fontSize: 10, fontWeight: '700' },
  startBtn: { backgroundColor: '#16A34A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }) },
  startText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  fltBar:   { height: FLT_BAR, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingHorizontal: 10 },
});