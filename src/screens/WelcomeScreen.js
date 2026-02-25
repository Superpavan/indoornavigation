// src/screens/WelcomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, StatusBar } from 'react-native';
import { FLIGHT_INFO } from '../data/airportData';

const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : Platform.OS === 'ios' ? 44 : 0;
const BLUE = '#2B4EBF'; const DARK = '#1A2544'; const WHITE = '#FFFFFF';

export default function WelcomeScreen({ onStart }) {
  return (
    <View style={[styles.root, { paddingTop: STATUS_H }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>✈  Airport Navigator</Text>
          <Text style={styles.subtitle}>Terminal Indoor Navigation</Text>
        </View>

        {/* Boarding pass */}
        <View style={styles.passCard}>
          {/* Left blue section */}
          <View style={styles.passLeft}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Text style={{ color: WHITE, fontSize: 18 }}>✈</Text>
              <Text style={{ color: WHITE, fontSize: 11, fontWeight: '700' }}>Terminal Air</Text>
            </View>
            <Text style={{ color: WHITE, fontSize: 13, fontWeight: '900', letterSpacing: 2 }}>BOARDING PASS</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, letterSpacing: 3, marginBottom: 10 }}>FIRST CLASS</Text>

            {/* Route */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <View>
                <Text style={styles.hint}>FROM:</Text>
                <Text style={styles.code}>{FLIGHT_INFO.from}</Text>
                <Text style={styles.city}>Dubai</Text>
              </View>
              <Text style={{ color: WHITE, fontSize: 20, marginHorizontal: 4 }}>→</Text>
              <View>
                <Text style={styles.hint}>TO:</Text>
                <Text style={styles.code}>{FLIGHT_INFO.to}</Text>
                <Text style={styles.city}>London</Text>
              </View>
              {/* Barcode */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginLeft: 'auto', paddingLeft: 10 }}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <View key={i} style={{ height: 28 + (i % 3) * 8, width: i % 4 === 0 ? 4 : 2, backgroundColor: WHITE }} />
                ))}
              </View>
            </View>

            {/* Meta */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {[['Passenger', FLIGHT_INFO.passenger], ['Flight', FLIGHT_INFO.flightNo], ['Terminal', '2 B'], ['Gate', `A ${FLIGHT_INFO.gate}`], ['Seat', FLIGHT_INFO.seat]].map(([k, v]) => (
                <View key={k}>
                  <Text style={styles.hint}>{k}</Text>
                  <Text style={{ color: WHITE, fontSize: 9, fontWeight: '700' }}>{v}</Text>
                </View>
              ))}
            </View>

            {/* Date row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {[['Date', 'JAN 25'], ['Boarding', FLIGHT_INFO.boarding], ['Depart', FLIGHT_INFO.departure]].map(([k, v]) => (
                <View key={k}>
                  <Text style={styles.hint}>{k}</Text>
                  <Text style={{ color: WHITE, fontSize: 11, fontWeight: '800' }}>{v}</Text>
                </View>
              ))}
              <View style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
                <Text style={{ color: BLUE, backgroundColor: WHITE, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 3, fontSize: 10, fontWeight: '900' }}>{FLIGHT_INFO.passenger}</Text>
                <Text style={{ color: WHITE, fontSize: 26, fontWeight: '900', lineHeight: 30 }}>{FLIGHT_INFO.seat}</Text>
              </View>
            </View>
          </View>

          {/* Right dark stub */}
          <View style={styles.passRight}>
            <Text style={{ color: WHITE, fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 8 }}>BOARDING{'\n'}PASS</Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 7, marginBottom: 2 }}>Passenger</Text>
            <Text style={{ color: BLUE, fontSize: 10, fontWeight: '700', marginBottom: 8 }}>{FLIGHT_INFO.passenger}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 7, marginBottom: 2 }}>Class</Text>
            <Text style={{ color: BLUE, fontSize: 10, fontWeight: '700', marginBottom: 8 }}>{FLIGHT_INFO.class}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 7, marginBottom: 2 }}>Depart</Text>
            <Text style={{ color: WHITE, fontSize: 11, fontWeight: '800' }}>{FLIGHT_INFO.departure}</Text>
            {/* Mini barcode */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 1.5, marginTop: 'auto', paddingTop: 12 }}>
              {Array.from({ length: 22 }).map((_, i) => (
                <View key={i} style={{ height: 20 + (i % 3) * 6, width: i % 4 === 0 ? 3 : 1.5, backgroundColor: WHITE }} />
              ))}
            </View>
          </View>
        </View>

        {/* Navigate CTA */}
        <TouchableOpacity style={styles.navBtn} onPress={onStart} activeOpacity={0.85}>
          <Text style={styles.navBtnText}>Navigate to Gate {FLIGHT_INFO.gate}  →</Text>
        </TouchableOpacity>

        <View style={{ height: 70 }} />
      </ScrollView>

      {/* Flight bar */}
      <View style={styles.flightBar}>
        {[['Flight no.', FLIGHT_INFO.flightNo, false], ['From', FLIGHT_INFO.from, false], ['To', FLIGHT_INFO.to, false], ['Status', FLIGHT_INFO.status, true], ['Departure', FLIGHT_INFO.departure, false]].map(([k, v, g]) => (
          <View key={k} style={{ alignItems: 'center' }}>
            <Text style={{ color: '#9CA3AF', fontSize: 9 }}>{k}</Text>
            <Text style={[{ color: DARK, fontSize: 11, fontWeight: '800', marginTop: 2 }, g && { color: '#16A34A' }]}>{v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EAECF5' },
  scroll: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 14, paddingBottom: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '900', color: DARK, letterSpacing: 1 },
  subtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  passCard: {
    flexDirection: 'row', borderRadius: 18, overflow: 'hidden',
    maxWidth: 560, width: '100%',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowRadius: 20, shadowOpacity: 0.2 },
      android: { elevation: 12 },
      web:     { boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
    }),
  },
  passLeft:  { flex: 1.6, backgroundColor: BLUE, padding: 14 },
  passRight: { width: 110, backgroundColor: DARK, padding: 12, justifyContent: 'flex-start' },
  hint: { color: 'rgba(255,255,255,0.6)', fontSize: 7, letterSpacing: 0.5, marginBottom: 1 },
  code: { color: WHITE, fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  city: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '600' },
  navBtn: {
    backgroundColor: DARK, borderRadius: 26, paddingVertical: 14,
    paddingHorizontal: 40, marginTop: 24, alignSelf: 'center',
    ...Platform.select({
      ios:     { shadowColor: DARK, shadowRadius: 10, shadowOpacity: 0.35 },
      android: { elevation: 8 },
      web:     { boxShadow: '0 4px 16px rgba(26,37,68,0.4)', cursor: 'pointer' },
    }),
  },
  navBtnText: { color: WHITE, fontSize: 15, fontWeight: '800' },
  flightBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: WHITE, paddingVertical: 10,
    paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: '#E5E7EB',
    justifyContent: 'space-between', zIndex: 10,
  },
});