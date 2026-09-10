import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H} from '../theme';
import {Ink} from '../components/Grounds';
import {Kinetic} from '../components/Type';
import {keyframes} from '../../ease';

/**
 * Beat 7 — you hand over the keys, 18.3 -> 20.5 s.
 *
 * Redrawn after the client called the previous version "slop IA". The tell was
 * the glow: a fat coloured bloom around a chunky silhouette. It is gone, and so
 * are the paper-plane sparks that cluttered the frame.
 *
 * What is left is a single well-proportioned key — slim shaft, true circular
 * bow, two clean wards — in flat brand blue with one soft shadow for depth, and
 * a thin ring drawn around the bow that echoes the mark's geometry. Restraint,
 * not effects.
 */

const FROM = 1425;

const SCALE: [number, number][] = [
  [FROM, 0.94], [1460, 0.96], [1473, 1.02], [1489, 1.10], [1508, 1.15], [1534, 1.17],
];
const TOP: [number, number][] = [
  [FROM, 1250], [1436, 910], [1447, 706], [1459, 600], [1468, 570],
  [1481, 580], [1495, 604], [1511, 622], [1534, 632],
];

export const KeyRise: React.FC<{frame: number}> = ({frame}) => {
  const s = keyframes(frame, SCALE);
  const top = keyframes(frame, TOP);
  const cx = W / 2;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Ink glow={0.5} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="keyGrad" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor={C.blue350} />
            <stop offset="100%" stopColor={C.blue600} />
          </linearGradient>
          <filter id="keyShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="26" stdDeviation="26" floodColor="#050A12" floodOpacity="0.5" />
          </filter>
        </defs>

        <g transform={`translate(${cx} ${top}) scale(${s})`} filter="url(#keyShadow)">
          {/* a thin ring echoing the diamond mark's construction */}
          <circle r={150} fill="none" stroke={C.blue600} strokeOpacity={0.28} strokeWidth={2} />
          {/* bow */}
          <circle r={116} fill="url(#keyGrad)" />
          <circle r={44} fill={C.paperDark} />
          {/* shaft */}
          <rect x={-20} y={104} width={40} height={430} rx={12} fill="url(#keyGrad)" />
          {/* wards */}
          <rect x={14} y={330} width={92} height={38} rx={11} fill="url(#keyGrad)" />
          <rect x={14} y={412} width={64} height={38} rx={11} fill="url(#keyGrad)" />
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: top - 268 * s,
          width: W,
          display: 'flex',
          justifyContent: 'center',
          transform: 'translateY(-50%)',
        }}
      >
        <Kinetic
          frame={frame}
          from={FROM + 13}
          to={FROM + 77}
          fontSize={96}
          tone="dark"
          segments={[{text: 'vous ne gérez '}, {text: 'plus rien', accent: true}]}
        />
      </div>
      {void H}
    </AbsoluteFill>
  );
};
