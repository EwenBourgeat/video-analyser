import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H} from '../theme';
import {P} from '../tunables';
import {keyframes, prog, outCubic} from '../ease';

/**
 * Beat 1 — sonar radar, 0 -> 1.867 s.
 *
 * Iteration 2: the outer radius is now a MEASURED table rather than an easing
 * fit. No analytic curve matched it — the source holds at ~955 px for the first
 * 6 frames, collapses to 448 px by f=24, then drifts slowly back out to ~500 px.
 * Blue-pixel counting shows the nodes disappearing steadily and gone by f=42.
 */

const CX = W / 2;
const CY = H / 2 + 11;  // residual dy, direct search

// tools/measure2.py, section A — outer radius in master px, every 2 frames
const RADAR_R: [number, number][] = [
  [0, 959], [2, 949], [4, 959], [6, 959], [8, 916], [10, 784], [12, 679],
  [14, 601], [16, 543], [18, 500], [20, 471], [22, 453], [24, 448], [26, 447],
  [28, 448], [30, 449], [32, 451], [34, 452], [36, 453], [38, 456], [40, 459],
  [42, 463], [44, 465], [46, 471], [48, 473], [50, 480], [52, 487], [54, 499],
  [56, 510], [66, 540],
];

// polar placement of the 10 nodes, read off frames 0002-0008
const DOTS: [number, number][] = [
  [0.34, -95],
  [0.30, 18],
  [0.56, -128],
  [0.60, -52],
  [0.62, 62],
  [0.86, -150],
  [0.88, -28],
  [0.90, 120],
  [0.95, 8],
  [0.72, 160],
];

export const Radar: React.FC<{frame: number}> = ({frame}) => {
  const t = P();
  const R = keyframes(frame, RADAR_R);
  const sweepDeg = (frame / 30) * 0.77 * 360;
  const out = 1 - prog(frame, 56, 66);

  const ring = (rf: number, op: number, sw: number) => (
    <circle
      cx={CX}
      cy={CY}
      r={R * rf}
      fill="none"
      stroke={C.blue150}
      strokeOpacity={op}
      strokeWidth={sw}
    />
  );

  return (
    <AbsoluteFill style={{background: C.white, opacity: out}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="discFill">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="55%" stopColor="#F3F8FE" stopOpacity="0.85" />
            <stop offset="88%" stopColor="#E4EFFB" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D6E7F9" stopOpacity="0.9" />
          </radialGradient>
          {/* the sweep in the source is a wide, heavily blurred sector */}
          <radialGradient id="sweepFill">
            <stop offset="0%" stopColor="#A9C4DC" stopOpacity="0.0" />
            <stop offset="55%" stopColor="#A3C0DA" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#9BBBD6" stopOpacity="0.42" />
          </radialGradient>
          <filter id="sweepBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={R * 0.09} />
          </filter>
          <filter id="dotGlow" x="-160%" y="-160%" width="420%" height="420%">
            <feGaussianBlur stdDeviation="11" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={CX} cy={CY} r={R} fill="url(#discFill)" />
        <circle cx={CX} cy={CY} r={R * 0.72} fill="url(#discFill)" opacity={t.radarDiscA} />
        <circle cx={CX} cy={CY} r={R * 0.45} fill="url(#discFill)" opacity={t.radarDiscB} />

        {ring(1, t.radarRingOp, 2.4)}
        {ring(0.72, 0.5, 2)}
        {ring(0.45, 0.45, 1.8)}

        {[60, 120, 90].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={CX - Math.cos(rad) * R}
              y1={CY - Math.sin(rad) * R}
              x2={CX + Math.cos(rad) * R}
              y2={CY + Math.sin(rad) * R}
              stroke={C.blue150}
              strokeOpacity={0.55}
              strokeWidth={1.4}
            />
          );
        })}

        {/* wide, soft rotating sweep — ~110 degrees, heavily blurred */}
        <clipPath id="radarClip">
          <circle cx={CX} cy={CY} r={R} />
        </clipPath>
        <g clipPath="url(#radarClip)">
        <g transform={`rotate(${sweepDeg} ${CX} ${CY})`} filter="url(#sweepBlur)">
          <path
            d={`M ${CX} ${CY}
                L ${CX + R * 0.82} ${CY - R * 0.82}
                A ${R * 1.16} ${R * 1.16} 0 0 1 ${CX + R * 0.82} ${CY + R * 0.82} Z`}
            fill="url(#sweepFill)"
          />
        </g>
        </g>

        {DOTS.map(([rf, ang], i) => {
          const rad = (ang * Math.PI) / 180;
          const x = CX + Math.cos(rad) * R * rf;
          const y = CY + Math.sin(rad) * R * rf;
          // measured: nodes vanish steadily, all gone by f=42
          const o = 1 - outCubic(prog(frame, 8 + i * 3.2, 18 + i * 3.2));
          if (o <= 0.01) return null;
          const s = Math.pow(R / 460, 0.4) * (0.72 + 0.28 * o);
          return (
            <g key={i} opacity={o} filter="url(#dotGlow)">
              <circle cx={x} cy={y} r={t.radarDotWhite * s} fill={C.white} />
              <circle cx={x} cy={y} r={t.radarDotR * s} fill={C.blue600} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
