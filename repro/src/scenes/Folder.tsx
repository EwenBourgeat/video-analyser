import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H} from '../theme';
import {P} from '../tunables';
import {Plate} from '../components/Plate';
import {KineticText} from '../components/KineticText';
import {keyframes, prog} from '../ease';

/**
 * Beat 7 — the blue folder, 15.867 -> 18.167 s.
 *
 * Iteration 2, measured (blue bbox + top-edge profile per frame):
 *   f476-500  rises at CONSTANT width 1101 px, top 755 -> 312 (settles ~312)
 *   f500-516  camera pushes in: width 1157 -> 1728, top drops back to 651
 *   f516-544  held at width 1731, drifting up 651 -> 581
 * The tab sits on the left and is 78 px above the body top (top@20% vs top@50%).
 * Text runs f499 -> f535, ~105 px, sitting right on the folder's top edge.
 */

const FROM = 476;

const WIDTH: [number, number][] = [
  [476, 1101], [496, 1112], [500, 1157], [504, 1469], [508, 1659],
  [512, 1707], [516, 1728], [545, 1731],
];
const CENTER_X: [number, number][] = [
  [476, 956], [500, 954], [504, 938], [508, 928], [516, 925], [545, 924],
];
// re-measured with aligned frames (iteration 3); the folder settles at 763 and
// holds — the slow upward drift seen in round 2 was the decode bug
const BODY_TOP: [number, number][] = [
  [476, 755], [480, 533], [484, 440], [488, 389], [492, 365], [496, 365],
  [500, 392], [504, 592], [508, 712], [512, 747], [516, 757], [520, 763],
  [545, 763],
];

const PLANES: [number, number, number, number][] = [
  [0.10, 0.02, -24, 6],
  [0.90, -0.04, 22, 12],
  [0.16, 0.20, -12, 20],
  [0.82, 0.16, 34, 27],
  [0.52, -0.10, -6, 34],
];

const Plane: React.FC<{x: number; y: number; rot: number; p: number; s: number}> = ({
  x,
  y,
  rot,
  p,
  s,
}) => (
  <g
    transform={`translate(${x + p * 150} ${y - p * 300}) rotate(${rot}) scale(${
      s * (0.9 + p * 0.4)
    })`}
    opacity={Math.min(1, p * 4) * (1 - Math.max(0, (p - 0.72) / 0.28))}
  >
    <path d="M0 0 L26 -9 L8 17 L4.5 6 Z" fill="#EEF2F6" />
    <path d="M0 0 L8 17 L4.5 6 Z" fill="#0E1216" />
  </g>
);

export const Folder: React.FC<{frame: number}> = ({frame}) => {
  const t = P();
  const fw = keyframes(frame, WIDTH);
  const cx = keyframes(frame, CENTER_X) + t.foDX;
  const bodyTop = keyframes(frame, BODY_TOP) + t.foDY;

  const x0 = cx - fw / 2;
  const x1 = cx + fw / 2;
  const R = fw * 0.022;
  const tabTop = bodyTop - t.foTab;
  const tabEnd = x0 + fw * 0.36;
  const frontTop = bodyTop + t.foFront;
  const bottom = H + 400;

  const backD = `
    M ${x0 + R} ${tabTop}
    H ${tabEnd}
    L ${tabEnd + fw * 0.045} ${bodyTop}
    H ${x1 - R}
    A ${R} ${R} 0 0 1 ${x1} ${bodyTop + R}
    V ${bottom} H ${x0} V ${tabTop + R}
    A ${R} ${R} 0 0 1 ${x0 + R} ${tabTop} Z`;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Plate name="journey" />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="folderBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3383E6" />
            <stop offset="100%" stopColor="#4E97F2" />
          </linearGradient>
          <linearGradient id="folderFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.blue400} />
            <stop offset="100%" stopColor={C.blue280} />
          </linearGradient>
        </defs>

        {PLANES.map(([fx, fy, rot, off], i) => (
          <Plane
            key={i}
            x={x0 + fw * fx}
            y={bodyTop + fw * fy}
            rot={rot}
            p={prog(frame, FROM + off, FROM + off + 38)}
            s={fw / 1250}
          />
        ))}

        <path d={backD} fill="url(#folderBack)" />
        <rect
          x={x0 - fw * 0.016}
          y={frontTop}
          width={fw + fw * 0.032}
          height={bottom - frontTop}
          rx={fw * 0.026}
          fill="url(#folderFront)"
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: bodyTop - t.foText,
          width: W,
          display: 'flex',
          justifyContent: 'center',
          transform: 'translateY(-50%)',
        }}
      >
        <KineticText
          frame={frame}
          from={499}
          to={536}
          fontSize={132}
          segments={[
            {text: "elles n'en envoient ", color: C.white},
            {text: 'aucun', color: C.blue450},
          ]}
        />
      </div>
    </AbsoluteFill>
  );
};
