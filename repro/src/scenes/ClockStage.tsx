import React from 'react';
import {C, W, H, SPF} from '../theme';
import {P} from '../tunables';
import {ramp, outCubic} from '../ease';
import {KineticText} from '../components/KineticText';


/**
 * The white "page" of beats 2-3: full-bleed from f=52, then the content of the
 * browser window from f=109.
 *
 * Iteration 2 — re-measured with the blue text band masked out, because the
 * round-1 clock measurement was picking up the blue headline and inflating the
 * bounding box. Corrected figures, as a fraction of the page:
 *   cx = 0.501 W   r = 0.2958 W   cy = 0.803 H -> 0.827 H across the browser move
 * (round 1 wrongly had cx = 0.467 W and r = 0.3316 W.)
 */

/**
 * Iteration 3 — re-measured after the 404/405 decode bug was found. Corrected
 * page fractions (the previous vertical figures were corrupted by row drift):
 *   beat 2 full-bleed : cx 0.5016  cy 0.864  r 0.2958
 *   browser settled   : cx 0.467   cy 0.782  r 0.332
 */
const clockCxFraction = (f: number) =>
  f <= 108 ? 0.5016 : ramp(f, [108, 126], [0.5016, 0.467], outCubic);
const clockCyFraction = (f: number) =>
  f <= 84 ? ramp(f, [56, 84], [0.818, 0.864], outCubic)
    : f <= 108 ? 0.864
      : ramp(f, [108, 126], [0.869, 0.782], outCubic);
const clockRFraction = (f: number) =>
  f <= 108 ? 0.2958 : ramp(f, [108, 126], [0.300, 0.332], outCubic);

const Clock: React.FC<{frame: number; cx: number; cy: number; r: number}> = ({
  frame,
  cx,
  cy,
  r,
}) => {
  const ring = r * 0.088;
  const faceR = r - ring;

  /**
   * The hands turn well past 180 deg per source frame, so the measured bearings
   * are ALIASED: replaying them at 60 fps makes the hands jump about instead of
   * spinning. Fidelity and fluidity genuinely conflict here, and this render is
   * for fluidity — so the hands get a smooth accelerating spin, motion-blurred
   * across the shutter the way a real camera would smear them.
   * (The measured table is kept in handAngles.ts for the 30 fps variant.)
   */
  const tp = P();
  const spinAt = (f: number) => {
    const t = Math.max(0, (f - 52) / 30);          // seconds into the beat
    const turns = tp.clkA * t + tp.clkB * t * t;   // accelerating
    return {
      min: turns * 360,
      hour: (turns * 360) / 12 + 96,
      sec: turns * 360 * tp.clkSec + 40,
    };
  };
  // enough slices that even the fastest hand reads as a smear, not a strobe
  const SLICES = Math.max(1, Math.round(tp.clkSlices));
  const subs = Array.from(
    {length: SLICES},
    (_, i) => spinAt(frame - SPF / 2 + (SPF * (i + 0.5)) / SLICES)
  );

  const tick = (i: number) => {
    const cardinal = i % 3 === 0;
    const len = cardinal ? faceR * 0.1 : faceR * 0.068;
    const wdt = cardinal ? faceR * 0.033 : faceR * 0.026;
    return (
      <rect
        key={i}
        x={-wdt / 2}
        y={-faceR * 0.88}
        width={wdt}
        height={len}
        fill="#111111"
        transform={`rotate(${i * 30} 0 0)`}
      />
    );
  };

  const hand = (angle: number, len: number, wdt: number, color: string, back = 0.14) => (
    <rect
      x={-wdt / 2}
      y={-len}
      width={wdt}
      height={len * (1 + back)}
      fill={color}
      transform={`rotate(${angle} 0 0)`}
    />
  );

  return (
    <g transform={`translate(${cx} ${cy})`}>
      <defs>
        <linearGradient id="clockRing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.blue300} />
          <stop offset="100%" stopColor={C.blue450} />
        </linearGradient>
      </defs>
      <circle r={r - ring / 2} fill="none" stroke="url(#clockRing)" strokeWidth={ring} />
      <circle r={faceR} fill={C.offWhite} />
      {Array.from({length: 12}, (_, i) => tick(i))}
      {subs.map((a, i) => (
        // back-to-front alpha 1/(i+1) makes the stack the exact average
        <g key={i} opacity={1 / (i + 1)}>
          {hand(a.hour, faceR * 0.5, faceR * 0.047, '#111111')}
          {hand(a.min, faceR * 0.74, faceR * 0.042, '#111111')}
        </g>
      ))}
      {subs.map((a, i) => (
        <g key={`s${i}`} opacity={1 / (i + 1)}>
          {hand(a.sec, faceR * 0.82, faceR * 0.011, '#5FA8F5', 0.3)}
        </g>
      ))}
      <circle r={faceR * 0.02} fill={C.blue600} />
    </g>
  );
};

export const ClockStage: React.FC<{frame: number}> = ({frame}) => (
  <div
    style={{position: 'absolute', inset: 0, background: C.white, overflow: 'hidden'}}
  >
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{position: 'absolute', inset: 0}}
    >
      <Clock
        frame={frame}
        cx={clockCxFraction(frame) * W}
        cy={clockCyFraction(frame) * H}
        r={clockRFraction(frame) * W}
      />
    </svg>

    {/* measured: left edge pinned at 0.136 W, final width 1392 px, centre y 0.219 H */}
    <div
      style={{
        position: 'absolute',
        left: 0.136 * W,
        top: 0.219 * H,
        transform: 'translateY(-50%)',
      }}
    >
      <KineticText
        frame={frame}
        from={58}
        to={96}
        fontSize={84}
        segments={[
          {text: "tu n'avais pas le temps", color: C.textBlue},
          {text: ' de prospecter ?', color: C.ink},
        ]}
      />
    </div>
  </div>
);
