/**
 * src/components/NavigationPanel.js
 *
 * Bottom control panel:
 *  • Start / End node selectors
 *  • Navigate / Stop button
 *  • Live beacon RSSI readouts
 *  • Path info
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Platform,
} from 'react-native';
import { GRAPH, BEACONS } from '../data/graph';

const C = {
  bg:       '#0A1628',
  card:     '#112240',
  border:   '#1E3A6E',
  accent:   '#00D4FF',
  green:    '#00C896',
  red:      '#FF4D6D',
  amber:    '#F59E0B',
  text:     '#E2E8F0',
  muted:    '#64748B',
  btnGo:    '#0EA5E9',
  btnStop:  '#EF4444',
};

function NodePicker({ label, value, onChange, disabled }) {
  return (
    <View style={styles.pickerWrap}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.pickerRow}>
        {GRAPH.nodes.map(n => {
          const sel = n.id === value;
          return (
            <TouchableOpacity
              key={n.id}
              disabled={disabled}
              onPress={() => onChange(n.id)}
              style={[styles.nodeBtn, sel && styles.nodeBtnSel]}
            >
              <Text style={[styles.nodeBtnText, sel && styles.nodeBtnTextSel]}>
                {n.id}
              </Text>
              <Text style={styles.nodeBtnSub} numberOfLines={1}>
                {n.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function RSSIBar({ value }) {
  // RSSI typically –30 (close) to –100 (far)
  const pct = Math.max(0, Math.min(1, (value + 100) / 70));
  const col  = pct > 0.6 ? C.green : pct > 0.3 ? C.amber : C.red;
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: col }]} />
    </View>
  );
}

export default function NavigationPanel({
  startNodeId, setStartNodeId,
  endNodeId,   setEndNodeId,
  isNavigating,
  arrivedAt,
  path,
  pathProgress,
  totalDistance,
  beaconReadings,
  truePos,
  estimatedPos,
  onStart,
  onStop,
}) {
  const [showDebug, setShowDebug] = useState(false);

  const canStart = startNodeId && endNodeId && startNodeId !== endNodeId && !isNavigating;
  const endNode  = GRAPH.nodes.find(n => n.id === arrivedAt);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.dot} />
          <Text style={styles.title}>INDOOR NAVIGATOR</Text>
          <Text style={styles.subtitle}>Bluetooth Beacon Simulation</Text>
        </View>

        {/* ── Arrival banner ── */}
        {arrivedAt && (
          <View style={styles.arrivalBanner}>
            <Text style={styles.arrivalIcon}>✓</Text>
            <Text style={styles.arrivalText}>
              Arrived at {endNode?.label ?? `Node ${arrivedAt}`}
            </Text>
          </View>
        )}

        {/* ── Node selectors ── */}
        <NodePicker
          label="FROM"
          value={startNodeId}
          onChange={setStartNodeId}
          disabled={isNavigating}
        />
        <NodePicker
          label="TO"
          value={endNodeId}
          onChange={setEndNodeId}
          disabled={isNavigating}
        />

        {/* ── Path info ── */}
        {path.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>PATH  ({path.length} nodes)</Text>
            <Text style={styles.pathText}>
              {path.map(id => GRAPH.nodes.find(n => n.id === id)?.label ?? id).join(' → ')}
            </Text>
            <Text style={styles.distText}>
              Distance: {(totalDistance / 100).toFixed(1)} m (scaled)
            </Text>
            {/* Progress bar */}
            {isNavigating && (
              <View style={styles.progTrack}>
                <View style={[styles.progFill, { width: `${pathProgress * 100}%` }]} />
              </View>
            )}
          </View>
        )}

        {/* ── Navigate button ── */}
        <View style={styles.btnRow}>
          {!isNavigating ? (
            <TouchableOpacity
              style={[styles.btn, canStart ? styles.btnGo : styles.btnDisabled]}
              onPress={onStart}
              disabled={!canStart}
            >
              <Text style={styles.btnText}>▶  NAVIGATE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.btn, styles.btnStop]} onPress={onStop}>
              <Text style={styles.btnText}>■  STOP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Beacon debug toggle ── */}
        <TouchableOpacity
          style={styles.debugToggle}
          onPress={() => setShowDebug(v => !v)}
        >
          <Text style={styles.debugToggleText}>
            {showDebug ? '▲' : '▼'}  BEACON DEBUG
          </Text>
        </TouchableOpacity>

        {showDebug && (
          <View style={styles.debugPanel}>
            {BEACONS.map(b => {
              const r = beaconReadings.find(r => r.beaconId === b.id);
              const node = GRAPH.nodes.find(n => n.id === b.nodeId);
              return (
                <View key={b.id} style={styles.beaconRow}>
                  <View style={styles.beaconDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.beaconName}>
                      {b.label} – {node?.label}
                    </Text>
                    <RSSIBar value={r?.rssi ?? -100} />
                  </View>
                  <Text style={styles.rssiVal}>
                    {r ? r.rssi.toFixed(1) : '---'} dBm
                  </Text>
                </View>
              );
            })}

            {truePos && (
              <View style={styles.posRow}>
                <Text style={[styles.posLabel, { color: C.green }]}>● True Pos</Text>
                <Text style={styles.posVal}>
                  ({truePos.x.toFixed(0)}, {truePos.y.toFixed(0)})
                </Text>
              </View>
            )}
            {estimatedPos && (
              <View style={styles.posRow}>
                <Text style={[styles.posLabel, { color: C.amber }]}>● Est. Pos</Text>
                <Text style={styles.posVal}>
                  ({estimatedPos.x.toFixed(0)}, {estimatedPos.y.toFixed(0)})
                </Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  header: { alignItems: 'center', marginBottom: 10 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.accent, marginBottom: 4,
    shadowColor: C.accent, shadowRadius: 6, shadowOpacity: 1, elevation: 6,
  },
  title: { color: C.accent, fontSize: 13, fontWeight: '900', letterSpacing: 3 },
  subtitle: { color: C.muted, fontSize: 9, letterSpacing: 1, marginTop: 2 },

  arrivalBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0A3A2A', borderRadius: 10,
    borderWidth: 1, borderColor: C.green,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10,
  },
  arrivalIcon: { color: C.green, fontSize: 20, marginRight: 10 },
  arrivalText: { color: C.green, fontSize: 14, fontWeight: '700' },

  pickerWrap: { marginBottom: 10 },
  pickerLabel: { color: C.muted, fontSize: 9, fontWeight: '800',
    letterSpacing: 2, marginBottom: 5 },
  pickerRow: { flexDirection: 'row', gap: 8 },
  nodeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    backgroundColor: C.card, borderRadius: 8,
    borderWidth: 1, borderColor: C.border,
  },
  nodeBtnSel: {
    backgroundColor: '#0E2A4A',
    borderColor: C.accent,
    shadowColor: C.accent, shadowRadius: 4, shadowOpacity: 0.4, elevation: 4,
  },
  nodeBtnText: { color: C.muted, fontSize: 14, fontWeight: '800' },
  nodeBtnTextSel: { color: C.accent },
  nodeBtnSub: { color: C.muted, fontSize: 7, marginTop: 2, textAlign: 'center' },

  card: {
    backgroundColor: C.card, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    padding: 12, marginBottom: 10,
  },
  cardTitle: { color: C.muted, fontSize: 9, fontWeight: '800',
    letterSpacing: 2, marginBottom: 6 },
  pathText: { color: C.text, fontSize: 12, lineHeight: 18 },
  distText: { color: C.muted, fontSize: 10, marginTop: 4 },

  progTrack: {
    height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: 8,
  },
  progFill: {
    height: 4, backgroundColor: C.accent, borderRadius: 2,
  },

  btnRow: { marginBottom: 8 },
  btn: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    shadowRadius: 8, shadowOpacity: 0.4, elevation: 4,
  },
  btnGo:       { backgroundColor: C.btnGo,  shadowColor: C.btnGo  },
  btnStop:     { backgroundColor: C.btnStop, shadowColor: C.btnStop },
  btnDisabled: { backgroundColor: C.border },
  btnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 2 },

  debugToggle: { alignItems: 'center', paddingVertical: 6 },
  debugToggleText: { color: C.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },

  debugPanel: {
    backgroundColor: C.card, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    padding: 12, gap: 8,
  },
  beaconRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  beaconDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.accent,
  },
  beaconName: { color: C.text, fontSize: 10, marginBottom: 3 },
  barTrack: {
    height: 3, backgroundColor: C.border, borderRadius: 2,
  },
  barFill: { height: 3, borderRadius: 2 },
  rssiVal: { color: C.muted, fontSize: 9, width: 60, textAlign: 'right' },

  posRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  posLabel: { fontSize: 10, fontWeight: '700' },
  posVal: { color: C.text, fontSize: 10 },
});