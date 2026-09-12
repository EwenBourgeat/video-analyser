import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SERIF} from '../theme';
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

const FROM = 1204;

const SCALE: [number, number][] = [
  [FROM, 0.94], [1239, 0.96], [1252, 1.02], [1268, 1.10], [1287, 1.15], [1313, 1.17],
];
const TOP: [number, number][] = [
  [FROM, 1250], [1215, 910], [1226, 706], [1238, 600], [1247, 570],
  [1260, 580], [1274, 604], [1290, 622], [1313, 632],
];

export const KeyRise: React.FC<{frame: number}> = ({frame}) => {
  const s = keyframes(frame, SCALE);
  const top = keyframes(frame, TOP);
  const {w: W, h: H, tall} = useStage();
  const cx = W / 2;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Ink glow={0.5} />
      {/*
        One flat silhouette and nothing else.
        The key used to carry a gradient, a 26 px drop shadow and a thin ring
        around the bow. Three effects doing the work a single shape should do —
        and the charter is built from flat fields, so none of them belonged.
      */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <g transform={`translate(${cx} ${top}) scale(${s})`} fill={C.blue600}>
          {/* bow, with the hole cut out rather than painted over */}
          <path
            d="M0 -116 A116 116 0 1 1 0 116 A116 116 0 1 1 0 -116 Z
               M0 -44 A44 44 0 1 0 0 44 A44 44 0 1 0 0 -44 Z"
            fillRule="evenodd"
          />
          {/* shaft */}
          <rect x={-20} y={104} width={40} height={430} rx={12} />
          {/* wards */}
          <rect x={14} y={330} width={92} height={38} rx={11} />
          <rect x={14} y={412} width={64} height={38} rx={11} />
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
          fontSize={tall ? 92 : 100}
          font={SERIF}
          weight={400}
          letterSpacing="-0.012em"
          maxWidth={tall ? 900 : undefined}
          tone="dark"
          segments={[{text: 'vous ne gérez '}, {text: 'plus rien', accent: true}]}
        />
      </div>
      {void H}
    </AbsoluteFill>
  );
};
