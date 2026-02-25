// src/components/BoundaryAlarm.js
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

export default function BoundaryAlarm({ visible, onDismiss }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 380, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 380, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [visible, pulse]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.border} pointerEvents="none" />
      <Animated.View style={[styles.card, { opacity: pulse }]}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>BOUNDARY ALERT</Text>
        <Text style={styles.desc}>
          Device has moved outside{'\n'}the terminal boundary!
        </Text>
        <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
          <Text style={styles.dismissText}>DISMISS</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:     { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  border:      { ...StyleSheet.absoluteFillObject, borderWidth: 6, borderColor: '#EF4444' },
  card:        { backgroundColor: '#1A0000', borderRadius: 16, borderWidth: 2, borderColor: '#EF4444', paddingHorizontal: 28, paddingVertical: 20, alignItems: 'center', minWidth: 240 },
  icon:        { fontSize: 40, marginBottom: 8 },
  title:       { color: '#EF4444', fontSize: 16, fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  desc:        { color: '#FCA5A5', fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  dismissBtn:  { backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 8 },
  dismissText: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
});