import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H} from '../theme';
import {P} from '../tunables';
import {ScaleadMark} from '../components/ScaleadLogo';
import {outCubic, prog} from '../ease';

/**
 * Beat 10 — envelopes streaming past the mark, 21.0 -> 22.1 s.
 *
 * Iteration 2: the envelopes are ~680 px wide in the source (round 1 used 340)
 * and they overlap heavily in a tight diagonal cluster on the right, rather
 * than being scattered across the frame.
 */

const FROM = 630;
const TO = 663;
const MARK = 270;

// [x, y, scale, parallax speed]
const ENV: [number, number, number, number][] = [
  [1330, 500, 0.82, 0.95],
  [1560, 800, 1.15, 1.25],
  [1810, 1090, 0.95, 0.8],
  [1250, 1210, 0.7, 1.1],
];

const Envelope: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-340} y={-210} width={680} height={420} rx={34} fill="#EDF3FC" />
    <rect x={-340} y={-210} width={680} height={150} rx={34} fill="#F7FAFE" />
    <path d="M-340 -196 L0 78 L340 -196 L340 -152 L0 122 L-340 -152 Z" fill="#DCE8F7" />
    <path
      d="M-340 -196 L0 78 L340 -196"
      fill="none"
      stroke="#CCDCF0"
      strokeWidth="5"
    />
  </g>
);

export const Envelopes: React.FC<{frame: number}> = ({frame}) => {
  const t = P();
  const tt = (frame - FROM) / (TO - FROM);
  const flash = prog(frame, TO - 7, TO);
  const hubX = t.envHubX;

  return (
    <AbsoluteFill style={{background: C.white, overflow: 'hidden'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <filter id="envHalo" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id="envShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="16" stdDeviation="22" floodColor="#8FB4DC" floodOpacity="0.32" />
          </filter>
        </defs>
        <g filter="url(#envHalo)">
          <circle cx={hubX} cy={H / 2} r={620} fill="#F1F7FE" />
          <circle cx={hubX} cy={H / 2} r={470} fill="#E4F0FD" />
          <circle cx={hubX} cy={H / 2} r={320} fill="#D6E8FB" />
        </g>
        <rect
          x={hubX - 150}
          y={H / 2 - 150}
          width={300}
          height={300}
          rx={70}
          fill="#FFFFFF"
          opacity={0.85}
        />
        <path
          d={`M ${hubX - 20} ${H / 2 - 165} h ${-40}
              a 72 72 0 0 0 -72 72 v 186 a 72 72 0 0 0 72 72 h 40`}
          fill="none"
          stroke={C.blue500}
          strokeWidth={9}
          strokeLinecap="round"
        />
        <g filter="url(#envShadow)">
          {ENV.map(([x, y, s, sp], i) => (
            <Envelope key={i} x={x * t.envSpread + t.envDX} y={(y + t.envDY) * t.envSpread - tt * 700 * sp} s={s * t.envScale} />
          ))}
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          left: hubX,
          top: H / 2,
          transform: 'translate(-50%,-50%)',
        }}
      >
        <ScaleadMark size={MARK} />
      </div>

      <AbsoluteFill
        style={{background: C.white, opacity: outCubic(flash) * 0.95, pointerEvents: 'none'}}
      />
    </AbsoluteFill>
  );
};
