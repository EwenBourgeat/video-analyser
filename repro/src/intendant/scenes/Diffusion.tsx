import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, SANS, MONO} from '../theme';
import {Paper} from '../components/Grounds';
import {Mark} from '../components/Brand';
import {keyframes, prog, ramp} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beats 9 + 10 merged — publication then bookings, 22.7 -> 27 s.
 *
 * These were two scenes with a hard cut between them: the pills slid off to the
 * right and the film cut to the mark sitting on the left with the booking rain
 * beside it. The client called that cut useless, and it was — the same mark is
 * on screen either side of it.
 *
 * So it is now ONE continuous move. The mark travels right-to-left on a single
 * keyframed path, the platform rows leave as it passes, and the bookings start
 * dropping in behind them. Nothing cuts.
 *
 * This beat also carries its own accent: the validations are green, as asked,
 * and the halo behind the mark follows them. Green reads as "published, live"
 * here, which is exactly what the beat says.
 */

const FROM = 1954;
const TO = 2274;
/**
 * The rain waits until the mark is well past the middle and heading left — much
 * later than it used to start. It cannot wait for the mark to stop, though: the
 * rows are gone by then, and holding both back left twenty frames of empty page.
 */
const HANDOVER = 2134;

const ROWS = ['Airbnb', 'Booking.com', 'Abritel', 'Expedia'];

/** One continuous path for the mark, across what used to be two scenes. */
/**
 * One continuous path for the mark. It used to be a keyframe table read through
 * the smoothing pass, which made the travel technically continuous but flat in
 * character — "pas assez fluide". It is now a single Bezier move: it leaves
 * slowly, crosses with real speed, and settles long on the left.
 */
const HUB_FROM = 2050;
const HUB_TO = 2162;

const ROWS_X: [number, number][] = [
  [1954, 96], [2046, 96], [2080, -220], [2112, -900], [2140, -1300], [2274, -1400],
];

const Spinner: React.FC<{size: number; frame: number}> = ({size, frame}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <g transform={`rotate(${frame * 6} 20 20)`}>
      <path
        d="M20 3.5 a16.5 16.5 0 1 1 -11.7 4.8"
        fill="none"
        stroke={C.blue450}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

const Tick: React.FC<{size: number; p: number}> = ({size, p}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    style={{transform: `scale(${EASE.pop(p)})`}}
  >
    <circle cx="20" cy="20" r="19" fill={C.green} />
    <path
      d="M11.5 20.5 L17.5 26.5 L28.5 14"
      fill="none"
      stroke={C.paper}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NOTES: [string, string, number, number, number, number][] = [
  // [platform, amount, x, y, scale, speed]
  ['Airbnb', '412 €', 1180, 480, 0.84, 0.95],
  ['Booking.com', '268 €', 1350, 830, 1.0, 1.25],
  ['Abritel', '540 €', 1420, 1180, 0.90, 0.80],
  ['Expedia', '195 €', 1140, 1340, 0.76, 1.12],
  ['Airbnb', '327 €', 1360, 1660, 0.94, 1.05],
  ['Booking.com', '455 €', 1230, 1980, 0.86, 0.9],
];

const Note: React.FC<{p: string; a: string; x: number; y: number; s: number; o: number}> = ({
  p,
  a,
  x,
  y,
  s,
  o,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%,-50%) scale(${s})`,
      width: 600,
      padding: '28px 32px',
      borderRadius: 20,
      background: C.paper,
      border: `1px solid ${C.line}`,
      boxShadow: '0 20px 48px rgba(20,50,90,0.14)',
      fontFamily: SANS,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      opacity: o,
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <span style={{display: 'inline-flex'}}>
        <Tick size={40} p={1} />
      </span>
      <div>
        <div style={{fontWeight: 600, fontSize: 29, color: C.ink}}>Nouvelle réservation</div>
        <div style={{fontWeight: 400, fontSize: 23, color: C.muted, marginTop: 3}}>
          {p} · 3 nuits
        </div>
      </div>
    </div>
    <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 38, color: C.blue600}}>{a}</div>
  </div>
);

/** Blend two hex colours, so the halo can inherit the logo beat's blue. */
const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${c(r1, r2)},${c(g1, g2)},${c(b1, b2)})`;
};

export const Diffusion: React.FC<{frame: number}> = ({frame}) => {
  const hub = EASE.camera(prog(frame, HUB_FROM, HUB_TO));
  const hubX = W * 0.72 + (W * 0.27 - W * 0.72) * hub;
  // the mark carries over from the logo beat at the size it ended on
  // the mark settles into the page on the same curve as its travel
  const markSize = 300 + (222 - 300) * hub;
  // the logo beat leaves the mark 44 px above centre; it settles as it travels,
  // so the two scenes share one position at the cut
  const markY = H / 2 - 44 * (1 - hub);
  const rowsX = keyframes(frame, ROWS_X);
  const rowsOut = 1 - prog(frame, 2116, 2142);
  const rain = prog(frame, HANDOVER, TO);
  const rainIn = EASE.entrance(prog(frame, HANDOVER, HANDOVER + 34));

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper wash={0.35} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <filter id="dHalo" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
      </svg>

      <div
        style={{
          position: 'absolute',
          left: hubX,
          top: markY,
          transform: 'translate(-50%,-50%)',
        }}
      >
        <Mark size={markSize} />
      </div>

      {/* the four platforms */}
      {rowsOut > 0 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: rowsX,
              top: H / 2,
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              opacity: rowsOut,
            }}
          >
            {ROWS.map((d, i) => {
              const inP = EASE.entrance(prog(frame, FROM + 4 + i * 10, FROM + 40 + i * 10));
              const done = prog(frame, FROM + 52 + i * 16, FROM + 74 + i * 16);
              return (
                <div
                  key={d}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: 760,
                    height: 122,
                    paddingLeft: 44,
                    paddingRight: 34,
                    borderRadius: 22,
                    background: C.paper,
                    border: `1px solid ${C.line}`,
                    boxShadow: '0 16px 40px rgba(20,50,90,0.10)',
                    fontFamily: SANS,
                    fontWeight: 500,
                    fontSize: 46,
                    letterSpacing: '-0.02em',
                    color: C.ink,
                    opacity: inP,
                    transform: `translateY(${(1 - inP) * 34}px)`,
                  }}
                >
                  <span>{d}</span>
                  {done > 0 ? (
                    <Tick size={80} p={done} />
                  ) : (
                    <Spinner size={80} frame={frame - FROM} />
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              position: 'absolute',
              left: rowsX,
              top: H / 2 + 330,
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 32,
              color: C.muted,
              opacity: EASE.entrance(prog(frame, FROM + 100, FROM + 136)) * rowsOut,
            }}
          >
            Une annonce, quatre plateformes, un seul interlocuteur.
          </div>
        </>
      ) : null}

      {/* the bookings start dropping as the rows leave — no cut between them */}
      {rain > 0
        ? NOTES.map(([p, a, x, y, s, sp], i) => (
            <Note
              key={i}
              p={p}
              a={a}
              x={x}
              y={y - rain * 1270 * sp}
              s={s}
              o={rainIn}
            />
          ))
        : null}
    </AbsoluteFill>
  );
};
