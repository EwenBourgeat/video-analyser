import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, SANS} from '../theme';
import {Ink} from '../components/Grounds';
import {Glyph, GlyphName} from '../components/Glyphs';
import {prog} from '../../ease';
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
const TO = 1185;

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
/**
 * The camera no longer stops at the end of the stations and dives away. It keeps
 * running right, the stations leave frame, and it comes to rest in the empty
 * ground where the reviews then build. The braking is placed late enough that
 * station 05 has finished leaving before it starts.
 */
const RUSH_FROM = 1145;
const RUSH = 40;
/**
 * The camera does not slow at the end of the travelling — it SPEEDS UP, from
 * 12.3 px/frame to 34, and hands over to the reviews at that speed.
 *
 * This is a whip: the camera rushes across the empty ground between the last
 * service and the first review, then decelerates onto the reviews on the far
 * side. It solves a problem that is arithmetic rather than aesthetic. A row of
 * cards entering from the right has to travel a full frame width — 1920 px —
 * before three of them are on screen. At the reviews' own 8 px/frame that takes
 * 240 frames, which is the entire four-second beat: the picture would only fill
 * on its last frame. At 34 the crossing takes 56 frames, and the frame is full
 * 1.1 s in with three seconds of readable drift left.
 *
 * Speed costs nothing here because there is nothing on screen to look at, and
 * 34 px/frame moves a 560 px card by 6 % of its own width per frame, so it
 * neither strobes nor smears.
 */
const RUSH_TO = 34;

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
  if (f <= RUSH_FROM) return cruise(f);
  /**
   * Smoothstep from RATE to RUSH_TO:
   *   v(u) = RATE + (RUSH_TO - RATE) * (3u² - 2u³)
   * integrated to  RATE*u + (RUSH_TO - RATE) * (u³ - u⁴/2).
   * A linear ramp covers the same ground but steps the acceleration from zero to
   * its full value on the first frame and back on the last — a jerk at both
   * ends. Here acceleration starts and ends at zero.
   */
  const u = Math.min(1, (f - RUSH_FROM) / RUSH);
  const d = RUSH_TO - RATE;
  return (
    cruise(RUSH_FROM) +
    RUSH * (RATE * u + d * (u * u * u - (u * u * u * u) / 2)) +
    Math.max(0, f - RUSH_FROM - RUSH) * RUSH_TO
  );
};

const sineY = (x: number) => MID - AMP * Math.cos((Math.PI * (x - X0)) / SPACING);

const PATH_X0 = X0 - SPACING * 1.4;
/**
 * The thread now ENDS, a little past the last station, instead of running on to
 * x = 5884. It used to be drawn up to `camX + FRONT`, which is a fixed column of
 * the frame — so the thread was on screen at every camera position and the frame
 * could never empty. The beat's whole hand-over depends on the frame emptying.
 */
const PATH_END = 5040;
const PATH_X1 = PATH_END;
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
  // the dive that used to end this beat is gone: the camera only travels right
  const camY = 0;
  /** World x the thread has been drawn to, and never past its own end. */
  const frontX = Math.min(camX + FRONT, PATH_END);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/*
        The glow settles to 0.5 as the camera comes to rest, because that is what
        the reviews beat uses. The cut lands on an empty frame, so nothing is
        drawn on either side of it — but a mismatched ground would still have
        made the background brightness jump at that exact frame.
      */}
      <Ink glow={0.9 - 0.4 * prog(frame, RUSH_FROM, TO)} />

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
