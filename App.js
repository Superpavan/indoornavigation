/**
 * App.js
 *
 * Indoor Navigation App
 * ─────────────────────
 * • SVG floor map with interactive node selection
 * • Bluetooth beacon simulation (no real hardware needed)
 * • Kalman filter  → smoothed RSSI
 * • Trilateration  → estimated device position
 * • A* algorithm   → shortest path
 */
import React, { useState, useCallback } from 'react';
import {
  SafeAreaView, View, StatusBar, useWindowDimensions,
  StyleSheet, Text, TouchableOpacity, Modal,
} from 'react-native';

import FloorMap        from './src/components/FloorMap';
import NavigationPanel from './src/components/NavigationPanel';
import { useNavigation }  from './src/hooks/useNavigation';

const PANEL_HEIGHT = 360;

export default function App() {
  const { width, height } = useWindowDimensions();
  const mapHeight = height - PANEL_HEIGHT - (StatusBar.currentHeight || 44);

  const {
    startNodeId,   setStartNodeId,
    endNodeId,     setEndNodeId,
    path,
    estimatedPos,
    truePos,
    beaconReadings,
    isNavigating,
    arrivedAt,
    pathProgress,
    totalDistance,
    startNavigation,
    stopNavigation,
  } = useNavigation();

  // ─── Node-tap logic ────────────────────────────────────────────────
  // First tap → set start, second tap (different node) → set end
  const handleNodePress = useCallback((nodeId) => {
    if (isNavigating) return;
    if (startNodeId === null || (startNodeId !== null && endNodeId !== null)) {
      // Fresh selection cycle
      setStartNodeId(nodeId);
      setEndNodeId(null);
    } else if (nodeId !== startNodeId) {
      setEndNodeId(nodeId);
    } else {
      // Tap same node again → deselect start
      setStartNodeId(null);
    }
  }, [isNavigating, startNodeId, endNodeId, setStartNodeId, setEndNodeId]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* ── Map area ── */}
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        <FloorMap
          svgWidth={width}
          svgHeight={mapHeight}
          startNodeId={startNodeId}
          endNodeId={endNodeId}
          onNodePress={handleNodePress}
          path={path}
          truePos={truePos}
          estimatedPos={estimatedPos}
          beaconReadings={beaconReadings}
        />

        {/* Tap-hint overlay (shown until both nodes are selected) */}
        {!isNavigating && (!startNodeId || !endNodeId) && (
          <View style={styles.hintBubble} pointerEvents="none">
            <Text style={styles.hintText}>
              {!startNodeId
                ? '👆 Tap a node to set START'
                : '👆 Tap another node to set END'}
            </Text>
          </View>
        )}
      </View>

      {/* ── Bottom control panel ── */}
      <View style={{ height: PANEL_HEIGHT }}>
        <NavigationPanel
          startNodeId={startNodeId}
          setStartNodeId={setStartNodeId}
          endNodeId={endNodeId}
          setEndNodeId={setEndNodeId}
          isNavigating={isNavigating}
          arrivedAt={arrivedAt}
          path={path}
          pathProgress={pathProgress}
          totalDistance={totalDistance}
          beaconReadings={beaconReadings}
          truePos={truePos}
          estimatedPos={estimatedPos}
          onStart={startNavigation}
          onStop={stopNavigation}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  mapContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  hintBubble: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,212,255,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hintText: {
    color: '#00D4FF',
    fontSize: 12,
    fontWeight: '600',
  },
});