import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, SANS} from '../theme';
import {Ink} from '../components/Grounds';
import {Glyph, GlyphName} from '../components/Glyphs';
import {keyframes, prog} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beat 5 — the five services, 11.4 -> 17.7 s.
 *
 * Rebuilt against the reference film's own travelling, which was read frame by
 * frame (source f250-f370). Three things came out of that reading.
 *
 * 1. THE ICONS LEAD THE LINE. Each tile pops in while the thread is still a long
 *    way short of it, and the thread then draws up to it. Measured on the second
 *    station: the tile appears at source f265, the thread reaches it at f274 —
 *    nine frames at 30 fps, so eighteen here. The label follows the thread by two
 *    frames, and the ghost numeral leads the tile by about four. Everything below
 *    is derived from ONE arrival time per station so that order can never drift.
 *
 * 2. THE VIEW IS MUCH CLOSER than this scene had it. In the source a tile spans
 *    about 190 px of a 1920-wide frame and consecutive stations sit about 1020 px
 *    apart on screen; this scene was drawing them 116 px wide and 370 px apart,
 *    i.e. nearly three times too far away. The stage is now authored at 1:1 and
 *    the geometry carries the real numbers, so there is no scale to fight and no
 *    oversized drawing surface to compensate for it.
 *
 * 3. THE PAN IS CONSTANT. 12.3 px per frame through the whole run of stations —
 *    the source does not accelerate between them. Velocity is ramped from and
 *    back to zero outside that run, so nothing starts or stops abruptly.
 */

const FROM = 684;
const TO = 1064;

/** Geometry, in master pixels, measured off the reference. */
const X0 = 700;
const SPACING = 960;
const MID = 540;
const AMP = 200;
const TILE = 190;   // measured on the reference: ~180-190 px of a 1920 frame

/** The thread is drawn up to this screen column; the camera does the rest. */
const FRONT = 1150;
/** Pan rate at cruise, master px per frame at 60 fps. */
const RATE = 12.3;

/** When the thread reaches station i. Everything else is offset from this. */
const ARRIVE_0 = FROM + 24;
const ARRIVE_STEP = SPACING / RATE;          // 78 frames
const arriveOf = (i: number) => ARRIVE_0 + i * ARRIVE_STEP;

/** Measured leads and lags, in frames at 60 fps. */
const ICON_LEAD = 18;
const GHOST_LEAD = 26;
const LABEL_LAG = 4;

/** Velocity ramps, kept clear of every station so arrivals stay exact. */
const RAMP_IN = ARRIVE_0 - FROM;
const RAMP_OUT_FROM = 1034;
const RAMP_OUT = 30;

/**
 * Camera x. Constant through the stations, with velocity ramped from and back
 * to zero outside them — so the pan never starts or stops on a step, and the
 * arrival frames stay exactly where the station timings expect them.
 */
const camXAt = (f: number) => {
  const cruise = (g: number) => -450 + (g - ARRIVE_0) * RATE;
  if (f < ARRIVE_0) {
    // v(u) = RATE * u, so displacement is quadratic and meets cruise at u = 1
    const u = Math.max(0, (f - FROM) / RAMP_IN);
    return cruise(ARRIVE_0) - (RATE * RAMP_IN * (1 - u * u)) / 2;
  }
  if (f <= RAMP_OUT_FROM) return cruise(f);
  // v(u) = RATE * (1 - u)
  const u = Math.min(1, (f - RAMP_OUT_FROM) / RAMP_OUT);
  return cruise(RAMP_OUT_FROM) + RATE * RAMP_OUT * (u - (u * u) / 2);
};

/** The scene dives away at the end, handing over to the review wall. */
const PAN_Y: [number, number][] = [
  [FROM, 0], [1012, 0], [1024, -30], [1036, -120], [1048, -320], [TO, -680],
];

const sineY = (x: number) => MID - AMP * Math.cos((Math.PI * (x - X0)) / SPACING);

const PATH_X0 = X0 - SPACING * 1.4;
const PATH_X1 = X0 + SPACING * 5.4;
const PATH_D = (() => {
  let d = '';
  for (let x = PATH_X0; x <= PATH_X1; x += 8) {
    d += (d ? ' L ' : 'M ') + x.toFixed(0) + ' ' + sineY(x).toFixed(1);
  }
  return d;
})();

type Step = {n: string; glyph: GlyphName; label: string[]; below: boolean};

const STEPS: Step[] = [
  {n: '01', glyph: 'camera', label: ['Annonce et', 'photos'], below: false},
  {n: '02', glyph: 'chart', label: ['Tarification', 'dynamique'], below: true},
  {n: '03', glyph: 'key', label: ['Accueil', '7 j / 7'], below: false},
  {n: '04', glyph: 'sparkle', label: ['Ménage', 'hôtelier'], below: true},
  {n: '05', glyph: 'report', label: ['Reporting', 'mensuel'], below: false},
];

export const Journey: React.FC<{frame: number}> = ({frame}) => {
  const camX = camXAt(frame);
  const camY = keyframes(frame, PAN_Y);
  /** World x the thread has been drawn to — a fixed column, carried by the pan. */
  const frontX = camX + FRONT;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Ink glow={0.9} />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <clipPath id="jReveal">
            <rect x={-6000} y={-6000} width={frontX + 6000} height={H + 12000} />
          </clipPath>
          {/*
            The thread carries its own fade in USER SPACE across the path's full
            x range, so it dissolves into the ground instead of ending on a cut.
          */}
          <linearGradient
            id="jStroke"
            gradientUnits="userSpaceOnUse"
            x1={PATH_X0}
            y1="0"
            x2={PATH_X1}
            y2="0"
          >
            <stop offset="0%" stopColor={C.blue350} stopOpacity="0" />
            <stop offset="7%" stopColor={C.blue350} stopOpacity="0.85" />
            <stop offset="50%" stopColor={C.blue350} stopOpacity="1" />
            <stop offset="93%" stopColor={C.blue350} stopOpacity="0.85" />
            <stop offset="100%" stopColor={C.blue350} stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform={`translate(${-camX} ${-camY})`}>
          {STEPS.map((s, i) => {
            const x = X0 + i * SPACING;
            const g = EASE.entrance(prog(frame, arriveOf(i) - GHOST_LEAD, arriveOf(i) + 10));
            return (
              <text
                key={s.n}
                x={x - 250}
                y={sineY(x) + (s.below ? -210 : 300)}
                fontFamily={SANS}
                fontWeight={700}
                fontSize={300}
                fill={C.inkDark}
                fillOpacity={0.10 * g}
                textAnchor="middle"
              >
                {s.n}
              </text>
            );
          })}
          {/* clipped to frontX in world space: the thread is drawn, not wiped */}
          <g clipPath="url(#jReveal)">
            <path d={PATH_D} fill="none" stroke="url(#jStroke)" strokeWidth={7} strokeLinecap="round" />
          </g>
        </g>
      </svg>

      {STEPS.map((s, i) => {
        const x = X0 + i * SPACING;
        const sx = x - camX;
        const sy = sineY(x) - camY;
        if (sx < -600 || sx > W + 600) return null;
        const arrive = arriveOf(i);
        // the tile is up and glowing well before the thread gets to it
        const e = EASE.entrance(prog(frame, arrive - ICON_LEAD, arrive - ICON_LEAD + 20));
        return (
          <React.Fragment key={s.n}>
            <div
              style={{
                position: 'absolute',
                left: sx - TILE / 2,
                top: sy - TILE / 2,
                width: TILE,
                height: TILE,
                borderRadius: 48,
                background: C.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 ${64 * e}px ${16 * e}px rgba(92,166,255,0.38), 0 16px 38px rgba(0,0,0,0.45)`,
                opacity: e,
                transform: `scale(${0.5 + 0.5 * e})`,
              }}
            >
              <Glyph name={s.glyph} size={TILE * 0.52} color={C.blue600} />
            </div>
            <div
              style={{
                position: 'absolute',
                left: sx + (s.below ? TILE * 0.18 : TILE * 0.62),
                top: s.below ? sy + TILE * 0.72 : sy - TILE * 0.30 - 68 * s.label.length,
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 54,
                lineHeight: 1.16,
                letterSpacing: '-0.028em',
                color: C.inkDark,
                whiteSpace: 'pre',
              }}
            >
              {s.label.map((line, li) => {
                // the label follows the thread, it does not precede it
                const lp = EASE.entrance(
                  prog(frame, arrive + LABEL_LAG + li * 6, arrive + LABEL_LAG + 26 + li * 6)
                );
                return (
                  <div key={li} style={{opacity: lp, transform: `translateY(${(1 - lp) * 14}px)`}}>
                    {line}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
