import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../../intendant/theme';
import {useStage, clockGeom} from '../format';
import {Paper} from '../components/Grounds';
import {keyframes, prog, softOut} from '../../ease';

/**
 * Beat 1 — Toulouse seen from above, 0 -> 3.2 s.
 *
 * Rebuilt from a frame-by-frame reading of the reference film's opening.
 *
 * Two things were measured there and are reproduced here exactly.
 *
 * 1. The sweep turns at 375 deg/s clockwise — one revolution in 0.96 s. It is a
 *    sector with an ANGULAR tail: bright at the leading edge, fading back over
 *    about a hundred degrees. SVG has no conic gradient, so the tail is built
 *    from stacked sub-sectors, which is what the source's own tail looks like.
 *
 * 2. Every dot goes out at the instant the sweep's leading edge crosses it. That
 *    was established by measuring each dot's bearing relative to the sweep head
 *    on every frame: the largest such bearing shrinks by exactly the sweep rate,
 *    and no dot ever survives the head passing it. One revolution, no survivors.
 *    The dots used to fade on a staggered timer that had nothing to do with the
 *    sweep, which is why the beat read as a fade rather than as a scan.
 */



/**
 * Radius over time, shaped like the reference radar: hold, fast collapse, drift
 * out — and landing on the dial's radius so the morph into beat 2 is exact.
 *
 * That last value now depends on the frame, so the table cannot be a plain
 * module constant any more. It is memoised per radius instead: `keyframes()`
 * caches its smoothed curve in a WeakMap keyed on the ARRAY ITSELF, so handing
 * it a freshly built array every frame would silently recompute the monotone
 * cubic and the Gaussian pass 60 times a second. One stable array per radius
 * keeps that cache doing its job.
 */
const radiusTable = (() => {
  const cache = new Map<number, [number, number][]>();
  return (clockR: number) => {
    let t = cache.get(clockR);
    if (!t) {
      t = [
        [0, 980], [12, 960], [16, 900], [22, 760], [28, 640], [34, 560],
        [40, 505], [46, 472], [52, 458], [64, 452], [90, 462], [120, 486],
        [150, 508], [172, 520], [190, clockR],
      ];
      cache.set(clockR, t);
    }
    return t;
  };
})();

/** Measured off the reference: 375 deg/s, i.e. 6.25 deg per frame at 60 fps. */
const SWEEP_DPS = 375;
const sweepAt = (f: number) => (f / 60) * SWEEP_DPS;

/**
 * The revolution that extinguishes the dots begins here. It is placed so the
 * last dot goes out just before the disc starts migrating onto the clock face:
 * an earlier start left the compass sitting empty for a second and a half.
 */
const SCAN_FROM = 72;
/** How long a dot takes to go out once the head has reached it. */
const SNUFF = 7;

/**
 * The properties under management. Twenty-four now rather than twelve — the
 * brief asked for more, and a denser field is also what makes a scan legible:
 * with too few dots the sweep crosses long stretches of empty ground.
 *
 * Bearings are deliberately irregular but never bunched, so the extinction
 * reads as a steady progression rather than as three clumps going out at once.
 */
/**
 * Twenty-four properties, unnamed.
 *
 * District names were tried here and taken back out. The beat lasts 3.2 s and
 * its subject is the SCAN — dots going out in sequence as the sweep crosses
 * them. Type on the disc competes with that: the eye stops to read instead of
 * following the sweep, and six labels appearing and vanishing on their own
 * timers is a second animation running against the first.
 */
const PINS: [number, number][] = [
  [0.30, -102], [0.27, 26], [0.52, -138], [0.57, -46], [0.60, 70],
  [0.83, -156], [0.86, -22], [0.88, 128], [0.93, 14], [0.70, 168],
  [0.44, 96], [0.75, -78], [0.36, -12], [0.64, 44], [0.22, 152],
  [0.91, 88], [0.48, -172], [0.79, 108], [0.33, 62], [0.68, -118],
  [0.55, 8], [0.86, -58], [0.41, 132], [0.73, -6],
];

/** Frame at which the sweep head first reaches this bearing after SCAN_FROM. */
const deathOf = (bearing: number) => {
  const head = sweepAt(SCAN_FROM);
  const wait = (((bearing - head) % 360) + 360) % 360;
  return SCAN_FROM + (wait / SWEEP_DPS) * 60;
};

/** Dots light up in bearing order early on, so the field fills in as a scan too. */
const litOf = (i: number, n: number) => 8 + (i / n) * 40;

const Pin: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) => (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`} filter="url(#pinGlow)">
    <path
      d="M0 14 C0 14 -13 -1 -13 -9 A13 13 0 0 1 13 -9 C13 -1 0 14 0 14 Z"
      fill={C.blue600}
    />
    <circle cy={-9} r={5} fill={C.paper} />
  </g>
);

/** The sector, as a fan of slices whose opacity falls off behind the head. */
const SLICES = 14;
const TAIL_DEG = 104;

export const MapPins: React.FC<{frame: number}> = ({frame}) => {
  const {w: W, h: H, tall} = useStage();
  const CX = W / 2;
  // the dial of the next beat sits here; the disc migrates onto it
  const dial = clockGeom(W, H, tall);
  const CLOCK_CY = dial.cy;
  const CLOCK_R = dial.r;
  const r = keyframes(frame, radiusTable(CLOCK_R));
  const head = sweepAt(frame);
  // slide the disc onto the dial's centre as it dissolves — a morph, not a cut
  const morph = softOut(prog(frame, 150, 190));
  const CY = (H / 2 + 6) + (CLOCK_CY - (H / 2 + 6)) * morph;
  const out = 1 - prog(frame, 156, 190);

  const ring = (k: number, op: number, sw: number) => (
    <circle
      cx={CX}
      cy={CY}
      r={r * k}
      fill="none"
      stroke={C.lineStrong}
      strokeOpacity={op}
      strokeWidth={sw}
    />
  );

  const slice = (i: number) => {
    const a1 = head - (TAIL_DEG * i) / SLICES;
    const a0 = head - (TAIL_DEG * (i + 1)) / SLICES;
    const p = (x: number) => {
      const t = (x * Math.PI) / 180;
      return `${CX + Math.cos(t) * r * 1.16} ${CY + Math.sin(t) * r * 1.16}`;
    };
    // brightest at the head, gone at the end of the tail
    const op = 0.16 * Math.pow(1 - i / SLICES, 1.7);
    return (
      <path
        key={i}
        d={`M ${CX} ${CY} L ${p(a0)} A ${r * 1.16} ${r * 1.16} 0 0 1 ${p(a1)} Z`}
        fill={C.blue600}
        opacity={op}
      />
    );
  };

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Paper wash={0.7} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="cityFill">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="62%" stopColor="#FEFAF9" />
            <stop offset="100%" stopColor="#FBE7E1" />
          </radialGradient>
          <filter id="sweepBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={r * 0.045} />
          </filter>
          <filter id="pinGlow" x="-160%" y="-160%" width="420%" height="420%">
            <feDropShadow dx="0" dy="4" stdDeviation="7" floodColor="#941101" floodOpacity="0.28" />
          </filter>
          <clipPath id="cityClip">
            <circle cx={CX} cy={CY} r={r} />
          </clipPath>
        </defs>

        <circle cx={CX} cy={CY} r={r} fill="url(#cityFill)" />
        <circle cx={CX} cy={CY} r={r * 0.7} fill="url(#cityFill)" opacity={0.85} />
        <circle cx={CX} cy={CY} r={r * 0.42} fill="url(#cityFill)" opacity={0.85} />
        {ring(1, 0.55, 2.2)}
        {ring(0.7, 0.42, 1.8)}
        {ring(0.42, 0.36, 1.6)}

        {/* the Garonne, and the radials of the old town */}
        <g clipPath="url(#cityClip)" opacity={0.5}>
          <path
            d={`M ${CX - r * 1.1} ${CY + r * 0.62}
                C ${CX - r * 0.4} ${CY + r * 0.30}, ${CX - r * 0.26} ${CY - r * 0.18}, ${CX + r * 0.16} ${CY - r * 0.52}
                L ${CX + r * 0.30} ${CY - r * 1.1}`}
            fill="none"
            stroke="#E2CAC4"
            strokeWidth={r * 0.055}
            strokeLinecap="round"
          />
          {[18, 62, 108, 150, 200, 246, 292, 334].map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <line
                key={a}
                x1={CX}
                y1={CY}
                x2={CX + Math.cos(rad) * r}
                y2={CY + Math.sin(rad) * r}
                stroke={C.line}
                strokeWidth={1.3}
              />
            );
          })}
        </g>

        <g clipPath="url(#cityClip)" filter="url(#sweepBlur)">
          {Array.from({length: SLICES}, (_, i) => slice(i))}
        </g>

        {PINS.map(([rf, ang], i) => {
          // it lights up on the stagger, and the sweep head is what puts it out
          const lit = prog(frame, litOf(i, PINS.length), litOf(i, PINS.length) + 12);
          const o = lit * (1 - prog(frame, deathOf(ang), deathOf(ang) + SNUFF));
          if (o <= 0.01) return null;
          const rad = (ang * Math.PI) / 180;
          const s = (0.8 + 0.2 * o) * Math.pow(r / 470, 0.35) * 1.35;
          const px = CX + Math.cos(rad) * r * rf;
          const py = CY + Math.sin(rad) * r * rf;
          return <Pin key={i} x={px} y={py} s={s} o={o} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
