// src/components/ServicesSidebar.js
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { SERVICES, SERVICE_CATEGORIES, NAV_NODES } from '../data/airportData';

export default function ServicesSidebar({ visible, category, truePos, onNavigate, onClose, activeServiceId }) {
  if (!visible || !category) return null;
  const cat = SERVICE_CATEGORIES[category];

  const items = SERVICES
    .filter(s => s.type === category)
    .map(s => {
      const ref  = truePos || NAV_NODES.find(n => n.id === s.nearNode) || { x: 0, y: 0 };
      const dist = Math.round(Math.hypot(s.x - ref.x, s.y - ref.y));
      return { ...s, dist };
    })
    .sort((a, b) => a.dist - b.dist);

  return (
    <View style={styles.sidebar}>
      <View style={[styles.header, { borderBottomColor: cat.color }]}>
        <Text style={styles.headerIcon}>{cat.icon}</Text>
        <Text style={styles.headerTitle}>{cat.label}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {items.map(svc => (
          <TouchableOpacity
            key={svc.id}
            style={[styles.row, activeServiceId === svc.id && styles.rowActive]}
            onPress={() => onNavigate(svc)}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIcon, { backgroundColor: cat.bg }]}>
              <Text style={styles.rowIconText}>{cat.icon}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel} numberOfLines={1}>{svc.label}</Text>
              <Text style={styles.rowDist}>{svc.dist} m away</Text>
            </View>
            <View style={[styles.navBtn, { backgroundColor: cat.color }]}>
              <Text style={styles.navBtnArrow}>▶</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute', top: 0, right: 0, bottom: 0, width: 230,
    backgroundColor: '#FFFFFF', zIndex: 100,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: -3, height: 0 }, shadowRadius: 12, shadowOpacity: 0.15 },
      android: { elevation: 16 },
      web:     { boxShadow: '-4px 0 16px rgba(0,0,0,0.12)' },
    }),
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 2 },
  headerIcon:  { fontSize: 20 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#1A2544' },
  closeBtn:    { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }) },
  closeBtnText:{ color: '#6B7280', fontSize: 14, fontWeight: '700' },
  list:        { flex: 1, paddingTop: 4 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowActive:   { backgroundColor: '#EFF6FF' },
  rowIcon:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowIconText: { fontSize: 16 },
  rowInfo:     { flex: 1 },
  rowLabel:    { fontSize: 11, fontWeight: '700', color: '#1A2544' },
  rowDist:     { fontSize: 10, color: '#6B7280', marginTop: 1 },
  navBtn:      { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }) },
  navBtnArrow: { color: '#FFF', fontSize: 11, fontWeight: '800' },
});