/**
 * src/components/FloorMap.js
 *
 * Interactive SVG floor-plan renderer.
 * Displays nodes, edges, path highlight, user's estimated & true positions,
 * and beacon pulse rings.  Tap a node to select it as start / end.
 */
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  G, Rect, Circle, Line, Path as SvgPath,
  Text as SvgText, Defs, LinearGradient,
  Stop, RadialGradient, Ellipse,
} from 'react-native-svg';

import { GRAPH, BEACONS, WORLD, worldToSVG } from '../data/graph';

const NODE_R    = 22;
const BEACON_R  = 30;

// Colour palette
const C = {
  floor:      '#0F1729',
  wall:       '#1E2D4A',
  wallStroke: '#2A4A7F',
  corridor:   '#162038',
  gridLine:   'rgba(42,74,127,0.15)',
  edge:       '#1E3A6E',
  edgePath:   '#00D4FF',
  nodeDefault:'#1E3A6E',
  nodeStart:  '#00C896',
  nodeEnd:    '#FF4D6D',
  nodeSelect: '#F59E0B',
  posTrue:    '#00C896',
  posEst:     '#F59E0B',
  beaconPing: 'rgba(0,212,255,0.25)',
  text:       '#E2E8F0',
  textMuted:  '#64748B',
};

export default function FloorMap({
  startNodeId,
  endNodeId,
  onNodePress,
  path,
  truePos,
  estimatedPos,
  beaconReadings,
  svgWidth,
  svgHeight,
}) {
  // Scale world coords to SVG viewport
  const scaleX = svgWidth  / WORLD.width;
  const scaleY = svgHeight / WORLD.height;
  const scale  = Math.min(scaleX, scaleY);
  const offX   = (svgWidth  - WORLD.width  * scale) / 2;
  const offY   = (svgHeight - WORLD.height * scale) / 2;

  const toSVG = useCallback((wx, wy) => {
    const { x, y } = worldToSVG(wx, wy);
    return { x: x * scale + offX, y: y * scale + offY };
  }, [scale, offX, offY]);

  // Build path polyline points
  const pathPoints = path.map(id => {
    const n = GRAPH.nodes.find(n => n.id === id);
    const p = toSVG(n.x, n.y);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <Svg width={svgWidth} height={svgHeight}>
      <Defs>
        <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"   stopColor="#0A1628" />
          <Stop offset="1"   stopColor="#0F1F3D" />
        </LinearGradient>
        <RadialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0"   stopColor="#00D4FF" stopOpacity="0.4" />
          <Stop offset="1"   stopColor="#00D4FF" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* ── Background ── */}
      <Rect x={0} y={0} width={svgWidth} height={svgHeight} fill="url(#bgGrad)" />

      {/* ── Grid ── */}
      {Array.from({ length: Math.ceil(svgWidth / 40) }).map((_, i) => (
        <Line key={`gv${i}`} x1={i*40} y1={0} x2={i*40} y2={svgHeight}
              stroke={C.gridLine} strokeWidth="0.5" />
      ))}
      {Array.from({ length: Math.ceil(svgHeight / 40) }).map((_, i) => (
        <Line key={`gh${i}`} x1={0} y1={i*40} x2={svgWidth} y2={i*40}
              stroke={C.gridLine} strokeWidth="0.5" />
      ))}

      {/* ── Room fills (simple rectangles around each node) ── */}
      {GRAPH.nodes.map(n => {
        const p = toSVG(n.x, n.y);
        return (
          <G key={`room_${n.id}`}>
            <Rect
              x={p.x - 55} y={p.y - 45} width={110} height={90}
              rx={10} ry={10}
              fill={C.wall} fillOpacity={0.6}
              stroke={C.wallStroke} strokeWidth={1.5}
            />
          </G>
        );
      })}

      {/* ── Edges (default) ── */}
      {GRAPH.edges.map((e, i) => {
        const a = GRAPH.nodes.find(n => n.id === e.from);
        const b = GRAPH.nodes.find(n => n.id === e.to);
        const pa = toSVG(a.x, a.y);
        const pb = toSVG(b.x, b.y);
        return (
          <Line key={`edge_${i}`}
            x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
            stroke={C.edge} strokeWidth={4} strokeLinecap="round"
            strokeDasharray="8,5"
          />
        );
      })}

      {/* ── Active Path highlight ── */}
      {path.length > 1 && (
        <>
          {/* Glow outer */}
          <SvgPath
            d={`M ${pathPoints.replace(/,/g, ' ').replace(/ /g, 'L').replace('L', ' ').split('L').map((p,i)=> i===0?`M ${p}` : `L ${p}`).join(' ')}`}
            stroke={C.edgePath} strokeOpacity={0.25}
            strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
          {/* Core line */}
          <SvgPath
            d={['M', ...path.map(id => {
              const n = GRAPH.nodes.find(n => n.id === id);
              const p = toSVG(n.x, n.y);
              return `${p.x} ${p.y}`;
            })].join(' L ').replace('M L ', 'M ')}
            stroke={C.edgePath} strokeWidth={3} fill="none"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </>
      )}

      {/* ── Beacon pulse rings ── */}
      {BEACONS.map(b => {
        const p       = toSVG(b.x, b.y);
        const reading = beaconReadings.find(r => r.beaconId === b.id);
        const rssi    = reading?.rssi ?? -90;
        const alpha   = Math.max(0, Math.min(1, (rssi + 90) / 40));
        return (
          <G key={`beacon_${b.id}`}>
            <Circle cx={p.x} cy={p.y} r={BEACON_R * 1.8}
              fill="none" stroke="#00D4FF" strokeWidth={1}
              strokeOpacity={alpha * 0.3} />
            <Circle cx={p.x} cy={p.y} r={BEACON_R * 2.8}
              fill="none" stroke="#00D4FF" strokeWidth={0.5}
              strokeOpacity={alpha * 0.15} />
          </G>
        );
      })}

      {/* ── Nodes ── */}
      {GRAPH.nodes.map(n => {
        const p       = toSVG(n.x, n.y);
        const isStart = n.id === startNodeId;
        const isEnd   = n.id === endNodeId;
        const inPath  = path.includes(n.id);
        let   fill    = C.nodeDefault;
        if (isStart) fill = C.nodeStart;
        else if (isEnd) fill = C.nodeEnd;
        else if (inPath) fill = '#1A5276';

        return (
          <G key={`node_${n.id}`} onPress={() => onNodePress(n.id)}>
            {/* Selection glow */}
            {(isStart || isEnd) && (
              <Circle cx={p.x} cy={p.y} r={NODE_R + 12}
                fill={fill} fillOpacity={0.2} />
            )}
            {/* Node circle */}
            <Circle cx={p.x} cy={p.y} r={NODE_R}
              fill={fill} stroke={isStart || isEnd ? '#FFFFFF' : C.wallStroke}
              strokeWidth={isStart || isEnd ? 2.5 : 1}
            />
            {/* Node ID */}
            <SvgText x={p.x} y={p.y + 1}
              fill="#FFFFFF" fontSize={11} fontWeight="700"
              textAnchor="middle" alignmentBaseline="middle">
              {n.id}
            </SvgText>
            {/* Label */}
            <SvgText x={p.x} y={p.y + NODE_R + 14}
              fill={isStart || isEnd ? '#FFFFFF' : C.textMuted}
              fontSize={9} fontWeight="600" textAnchor="middle">
              {n.label || `Node ${n.id}`}
            </SvgText>
            {/* START / END badges */}
            {isStart && (
              <G>
                <Rect x={p.x - 16} y={p.y - NODE_R - 22} width={32} height={14}
                  rx={7} fill={C.nodeStart} />
                <SvgText x={p.x} y={p.y - NODE_R - 15}
                  fill="#FFFFFF" fontSize={7} fontWeight="800"
                  textAnchor="middle" alignmentBaseline="middle">
                  START
                </SvgText>
              </G>
            )}
            {isEnd && (
              <G>
                <Rect x={p.x - 12} y={p.y - NODE_R - 22} width={24} height={14}
                  rx={7} fill={C.nodeEnd} />
                <SvgText x={p.x} y={p.y - NODE_R - 15}
                  fill="#FFFFFF" fontSize={7} fontWeight="800"
                  textAnchor="middle" alignmentBaseline="middle">
                  END
                </SvgText>
              </G>
            )}
          </G>
        );
      })}

      {/* ── True position (green dot) ── */}
      {truePos && (() => {
        const p = toSVG(truePos.x, truePos.y);
        return (
          <G key="truePos">
            <Circle cx={p.x} cy={p.y} r={14}
              fill={C.posTrue} fillOpacity={0.25} />
            <Circle cx={p.x} cy={p.y} r={8}
              fill={C.posTrue} stroke="#FFFFFF" strokeWidth={2} />
            <SvgText x={p.x} y={p.y - 20}
              fill={C.posTrue} fontSize={8} fontWeight="700"
              textAnchor="middle">
              YOU
            </SvgText>
          </G>
        );
      })()}

      {/* ── Estimated position (yellow dot) ── */}
      {estimatedPos && (() => {
        const p = toSVG(estimatedPos.x, estimatedPos.y);
        return (
          <G key="estPos">
            <Circle cx={p.x} cy={p.y} r={12}
              fill={C.posEst} fillOpacity={0.2} />
            <Circle cx={p.x} cy={p.y} r={6}
              fill={C.posEst} stroke="#FFFFFF" strokeWidth={1.5} />
          </G>
        );
      })()}

      {/* ── Legend ── */}
      <G>
        <Circle cx={20} cy={svgHeight - 70} r={6} fill={C.posTrue} />
        <SvgText x={32} y={svgHeight - 66} fill={C.text} fontSize={9}>True Pos</SvgText>
        <Circle cx={20} cy={svgHeight - 50} r={6} fill={C.posEst} />
        <SvgText x={32} y={svgHeight - 46} fill={C.text} fontSize={9}>Est. Pos (Trilat.)</SvgText>
        <Line x1={12} y1={svgHeight - 30} x2={28} y2={svgHeight - 30}
          stroke={C.edgePath} strokeWidth={3} />
        <SvgText x={35} y={svgHeight - 26} fill={C.text} fontSize={9}>A* Path</SvgText>
      </G>
    </Svg>
  );
}