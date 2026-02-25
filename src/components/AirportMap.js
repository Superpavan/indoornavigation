// src/components/AirportMap.js
import React, { useCallback } from 'react';
import { Platform } from 'react-native';
import Svg, {
  G, Rect, Circle, Line, Path as SvgPath, Polygon,
  Text as SvgText, Defs, LinearGradient, Stop,
} from 'react-native-svg';
import { NAV_NODES, NAV_EDGES, SERVICES, BEACONS, BOUNDARY, WORLD, SERVICE_CATEGORIES } from '../data/airportData';

export default function AirportMap({
  svgWidth, svgHeight,
  startNodeId, endNodeId, selectionMode,
  path, truePos, estimatedPos, beaconReadings,
  boundaryAlarm, onServicePress, onMapPress,
  highlightCategory, activeServiceId,
}) {
  const scale = Math.min(svgWidth / WORLD.width, svgHeight / WORLD.height) * 0.96;
  const offX  = (svgWidth  - WORLD.width  * scale) / 2;
  const offY  = (svgHeight - WORLD.height * scale) / 2;

  const toSVG = useCallback((wx, wy) => ({
    x: wx * scale + offX, y: wy * scale + offY,
  }), [scale, offX, offY]);

  const handleBgPress = useCallback((evt) => {
    if (!onMapPress) return;
    let sx, sy;
    if (Platform.OS === 'web') {
      try {
        const rect = evt.target.closest?.('svg')?.getBoundingClientRect?.();
        if (!rect) return;
        sx = evt.nativeEvent.clientX - rect.left;
        sy = evt.nativeEvent.clientY - rect.top;
      } catch { return; }
    } else {
      sx = evt.nativeEvent.locationX;
      sy = evt.nativeEvent.locationY;
    }
    onMapPress({ worldX: (sx - offX) / scale, worldY: (sy - offY) / scale });
  }, [onMapPress, offX, offY, scale]);

  const pathD = path.length > 1
    ? path.map((id, i) => {
        const n = NAV_NODES.find(n => n.id === id);
        if (!n) return '';
        const p = toSVG(n.x, n.y);
        return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
      }).join(' ')
    : null;

  const boundaryPts = BOUNDARY.map(p => { const s = toSVG(p.x, p.y); return `${s.x},${s.y}`; }).join(' ');

  return (
    <Svg width={svgWidth} height={svgHeight}>
      <Defs>
        <LinearGradient id="mapBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E8EBF2" />
          <Stop offset="1" stopColor="#D8DCE8" />
        </LinearGradient>
      </Defs>

      {/* Background - tap target */}
      <Rect x={0} y={0} width={svgWidth} height={svgHeight} fill="url(#mapBg)" onPress={handleBgPress} />

      {/* Terminal boundary */}
      <Polygon points={boundaryPts} fill="#F0F2F8" fillOpacity={0.97}
        stroke={boundaryAlarm ? '#EF4444' : '#BCC3D8'}
        strokeWidth={boundaryAlarm ? 5 : 2} />

      {/* Horizontal corridors */}
      {[80, 220, 380, 540, 700].map(y => {
        const p1 = toSVG(30, y); const p2 = toSVG(900, y);
        return <Line key={`hc${y}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#D0D5E8" strokeWidth={20} strokeLinecap="round" />;
      })}

      {/* Vertical corridors */}
      {[120, 320, 520, 720].map(x => {
        const p1 = toSVG(x, 30); const p2 = toSVG(x, 760);
        return <Line key={`vc${x}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#D0D5E8" strokeWidth={20} strokeLinecap="round" />;
      })}

      {/* Corridor borders */}
      {[80, 220, 380, 540, 700].map(y => {
        const p1 = toSVG(30, y); const p2 = toSVG(900, y);
        return (<G key={`hb${y}`}>
          <Line x1={p1.x} y1={p1.y-10} x2={p2.x} y2={p2.y-10} stroke="#BCC3D8" strokeWidth={1}/>
          <Line x1={p1.x} y1={p1.y+10} x2={p2.x} y2={p2.y+10} stroke="#BCC3D8" strokeWidth={1}/>
        </G>);
      })}
      {[120, 320, 520, 720].map(x => {
        const p1 = toSVG(x, 30); const p2 = toSVG(x, 760);
        return (<G key={`vb${x}`}>
          <Line x1={p1.x-10} y1={p1.y} x2={p2.x-10} y2={p2.y} stroke="#BCC3D8" strokeWidth={1}/>
          <Line x1={p1.x+10} y1={p1.y} x2={p2.x+10} y2={p2.y} stroke="#BCC3D8" strokeWidth={1}/>
        </G>);
      })}

      {/* Gate 31 box */}
      {(() => { const p = toSVG(860, 380); return (
        <G>
          <Rect x={p.x-30} y={p.y-22} width={60} height={44} rx={8} fill="#1E3A8A" fillOpacity={0.15} stroke="#1E3A8A" strokeWidth={2}/>
          <SvgText x={p.x} y={p.y-7} fill="#1E3A8A" fontSize={9} fontWeight="800" textAnchor="middle">GATE</SvgText>
          <SvgText x={p.x} y={p.y+10} fill="#1E3A8A" fontSize={17} fontWeight="900" textAnchor="middle">31</SvgText>
        </G>
      ); })()}

      {/* Outside boundary node with warning */}
      {(() => {
        const out = NAV_NODES.find(n => n.outsideBoundary); if (!out) return null;
        const p = toSVG(out.x, out.y);
        const b = toSVG(900, 30);
        return (<G>
          <Line x1={b.x} y1={b.y} x2={p.x} y2={p.y} stroke="#F59E0B" strokeWidth={2} strokeDasharray="5,4"/>
          <Circle cx={p.x} cy={p.y} r={18} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2}/>
          <SvgText x={p.x} y={p.y+1} fontSize={14} textAnchor="middle" alignmentBaseline="middle">⚠️</SvgText>
          <SvgText x={p.x} y={p.y+24} fill="#92400E" fontSize={7} fontWeight="700" textAnchor="middle">OUTSIDE</SvgText>
        </G>);
      })()}

      {/* Nav edges */}
      {NAV_EDGES.map((e, i) => {
        const a = NAV_NODES.find(n => n.id === e.from);
        const b = NAV_NODES.find(n => n.id === e.to);
        if (!a || !b) return null;
        const pa = toSVG(a.x, a.y); const pb = toSVG(b.x, b.y);
        const inPath = path.includes(e.from) && path.includes(e.to) &&
          Math.abs(path.indexOf(e.from) - path.indexOf(e.to)) === 1;
        return !inPath ? (
          <Line key={`e${i}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
            stroke="rgba(30,58,138,0.1)" strokeWidth={1.5} strokeDasharray="4,5"/>
        ) : null;
      })}

      {/* A* path */}
      {pathD && (<>
        <SvgPath d={pathD} stroke="#1E3A8A" strokeOpacity={0.12} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <SvgPath d={pathD} stroke="#1E3A8A" strokeOpacity={0.45} strokeWidth={8}  fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <SvgPath d={pathD} stroke="#1E3A8A" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {path.slice(0,-1).map((id,i) => {
          const a = NAV_NODES.find(n=>n.id===path[i]);
          const b = NAV_NODES.find(n=>n.id===path[i+1]);
          if (!a||!b) return null;
          const pa = toSVG(a.x,a.y); const pb = toSVG(b.x,b.y);
          const mx=(pa.x+pb.x)/2; const my=(pa.y+pb.y)/2;
          const ang = Math.atan2(pb.y-pa.y,pb.x-pa.x)*180/Math.PI;
          return (<G key={`arr${i}`} rotation={ang} origin={`${mx},${my}`}>
            <Polygon points={`${mx+7},${my} ${mx-5},${my-4} ${mx-5},${my+4}`} fill="#1E3A8A" fillOpacity={0.7}/>
          </G>);
        })}
      </>)}

      {/* Service POIs */}
      {SERVICES.map(svc => {
        const cat = SERVICE_CATEGORIES[svc.type];
        const p   = toSVG(svc.x, svc.y);
        const hi  = highlightCategory === svc.type || activeServiceId === svc.id;
        return (
          <G key={svc.id} onPress={() => onServicePress && onServicePress(svc)}>
            {hi && <Circle cx={p.x} cy={p.y} r={22} fill={cat.color} fillOpacity={0.18}/>}
            <Circle cx={p.x} cy={p.y} r={16} fill={cat.bg} stroke={cat.color} strokeWidth={1.5}/>
            <SvgText x={p.x} y={p.y+1} fill={cat.color} fontSize={11} textAnchor="middle" alignmentBaseline="middle">{cat.icon}</SvgText>
          </G>
        );
      })}

      {/* Start pin */}
      {startNodeId && (() => {
        const n = NAV_NODES.find(n=>n.id===startNodeId); if(!n) return null;
        const p = toSVG(n.x, n.y);
        return (<G>
          <Circle cx={p.x} cy={p.y-28} r={12} fill="#16A34A"/>
          <Polygon points={`${p.x-10},${p.y-20} ${p.x+10},${p.y-20} ${p.x},${p.y-4}`} fill="#16A34A"/>
          <Circle cx={p.x} cy={p.y-29} r={4} fill="rgba(255,255,255,0.85)"/>
          <Rect x={p.x-16} y={p.y-48} width={32} height={13} rx={6} fill="#16A34A"/>
          <SvgText x={p.x} y={p.y-41} fill="#FFF" fontSize={6.5} fontWeight="800" textAnchor="middle" alignmentBaseline="middle">START</SvgText>
        </G>);
      })()}

      {/* End pin */}
      {endNodeId && (() => {
        const n = NAV_NODES.find(n=>n.id===endNodeId); if(!n) return null;
        const p = toSVG(n.x, n.y);
        return (<G>
          <Circle cx={p.x} cy={p.y-28} r={12} fill="#DC2626"/>
          <Polygon points={`${p.x-10},${p.y-20} ${p.x+10},${p.y-20} ${p.x},${p.y-4}`} fill="#DC2626"/>
          <Circle cx={p.x} cy={p.y-29} r={4} fill="rgba(255,255,255,0.85)"/>
          <Rect x={p.x-12} y={p.y-48} width={24} height={13} rx={6} fill="#DC2626"/>
          <SvgText x={p.x} y={p.y-41} fill="#FFF" fontSize={6.5} fontWeight="800" textAnchor="middle" alignmentBaseline="middle">END</SvgText>
        </G>);
      })()}

      {/* True position */}
      {truePos && (() => {
        const p = toSVG(truePos.x, truePos.y);
        return (<G>
          <Circle cx={p.x} cy={p.y} r={22} fill="#1E3A8A" fillOpacity={0.1}/>
          <Circle cx={p.x} cy={p.y} r={11} fill="#1E3A8A" fillOpacity={0.3}/>
          <Circle cx={p.x} cy={p.y} r={6}  fill="#1E3A8A" stroke="#FFF" strokeWidth={2}/>
          <SvgText x={p.x} y={p.y-26} fill="#1E3A8A" fontSize={8} fontWeight="800" textAnchor="middle">YOU</SvgText>
        </G>);
      })()}

      {/* Estimated position */}
      {estimatedPos && (() => {
        const p = toSVG(estimatedPos.x, estimatedPos.y);
        return (<G>
          <Circle cx={p.x} cy={p.y} r={12} fill="#F59E0B" fillOpacity={0.2}/>
          <Circle cx={p.x} cy={p.y} r={5}  fill="#F59E0B" fillOpacity={0.8}/>
        </G>);
      })()}

      {/* Boundary alarm overlay */}
      {boundaryAlarm && (
        <Rect x={0} y={0} width={svgWidth} height={svgHeight} fill="#EF4444" fillOpacity={0.07} stroke="#EF4444" strokeWidth={6}/>
      )}

      {/* Selection hint banner */}
      {selectionMode !== 'none' && (
        <G>
          <Rect x={6} y={6} width={200} height={22} rx={11} fill="rgba(255,255,255,0.93)" stroke="#1E3A8A" strokeWidth={1.5}/>
          <SvgText x={14} y={18} fill="#1E3A8A" fontSize={9} fontWeight="800" alignmentBaseline="middle">
            {selectionMode === 'start' ? '📍 TAP MAP — SET YOUR LOCATION' : '🏁 TAP MAP — SET DESTINATION'}
          </SvgText>
        </G>
      )}
    </Svg>
  );
}