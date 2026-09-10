import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {useStage} from '../format';
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

const FROM = 1360;

const SCALE: [number, number][] = [
  [FROM, 0.94], [1395, 0.96], [1408, 1.02], [1424, 1.10], [1443, 1.15], [1469, 1.17],
];
const TOP: [number, number][] = [
  [FROM, 1250], [1371, 910], [1382, 706], [1394, 600], [1403, 570],
  [1416, 580], [1430, 604], [1446, 622], [1469, 632],
];

export const KeyRise: React.FC<{frame: number}> = ({frame}) => {
  const s = keyframes(frame, SCALE);
  const top = keyframes(frame, TOP);
  const {w: W, h: H, tall} = useStage();
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
          fontSize={tall ? 88 : 96}
          maxWidth={tall ? 900 : undefined}
          tone="dark"
          segments={[{text: 'vous ne gérez '}, {text: 'plus rien', accent: true}]}
        />
      </div>
      {void H}
    </AbsoluteFill>
  );
};
