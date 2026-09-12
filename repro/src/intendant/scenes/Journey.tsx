import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS, W_MED, W_BOLD} from '../theme';
import {useStage, frontOf} from '../format';
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
const TO = 964;

/** Geometry, in master pixels, measured off the reference. */
const X0 = 700;
const SPACING = 960;
const MID = 540;
const AMP = 200;
const TILE = 190;   // measured on the reference: ~180-190 px of a 1920 frame

/**
 * The thread is drawn up to this screen column; the camera does the rest.
 * It is 60 % of the way across the picture, so it follows the frame: 1150 in
 * 16:9, 650 in 4:5. Everything downstream — where the camera has to be for a
 * station to arrive on time, and therefore the review row's world position too —
 * is derived from it rather than restated.
 */
/** Pan rate at cruise, master px per frame at 60 fps. */
const RATE = 12.3;

/**
 * The beat OPENS on station 01 rather than travelling towards it.
 *
 * The thread used to begin 1344 px to the left of the first station and the
 * camera started further left again, so the picture opened on empty ground with
 * station 01 hard against the right edge. Now the thread is born AT station 01
 * (see PATH_X0) and the camera simply holds there while it reveals, then leaves.
 *
 * Because the thread starts at station 01 there is no "thread arriving" for it —
 * only stations 02 and 03 are gated by the front column, and their times are
 * SOLVED from the camera rather than assumed, so they cannot drift apart.
 */
const HOLD = 40;
const RAMP_IN = 20;
const RAMP_DIST = 0.5 * RATE * RAMP_IN;

const arriveOf = (i: number, w: number, tall: boolean) => {
  if (i === 0) return FROM + 20 + ICON_LEAD;
  const need = X0 + i * SPACING - frontOf(w, tall);
  return FROM + HOLD + RAMP_IN + (need - RAMP_DIST) / RATE;
};

/** Measured leads and lags, in frames at 60 fps. */
const ICON_LEAD = 18;
const GHOST_LEAD = 26;
const LABEL_LAG = 4;

/**
 * The label's reveal, per frame shape.
 *
 * In 16:9 it starts once the thread reaches the tile and takes 36 frames to
 * finish, which is affordable because the station then stays on screen for
 * another hundred. The 4:5 frame gives a station 87 frames in total, so those
 * 36 would eat 40 % of its life: the label is instead started as the tile
 * ENTERS the picture — it follows the icon rather than the thread — and reveals
 * faster, finishing 6 frames after the thread lands. Fully legible for 1.36 s
 * rather than 0.80.
 */
const labelTiming = (tall: boolean) =>
  tall ? {lag: -16, dur: 18, step: 4} : {lag: LABEL_LAG, dur: 26, step: 6};

/**
 * The camera no longer stops at the end of the stations and dives away. It keeps
 * running right, the stations leave frame, and it comes to rest in the empty
 * ground where the reviews then build. The braking is placed late enough that
 * station 05 has finished leaving before it starts.
 */
const RUSH_FROM = 895;
const RUSH = 40;
/**
 * The camera does not slow at the end of the travelling — it SPEEDS UP, from
 * 12.3 px/frame to 44, and hands over to the reviews at that speed.
 *
 * This is a whip: the camera rushes across the empty ground between the last
 * service and the first review, then decelerates onto the reviews on the far
 * side. It solves a problem that is arithmetic rather than aesthetic. A row of
 * cards entering from the right has to travel a full frame width — 1920 px —
 * before three of them are on screen. At the reviews' own 8 px/frame that takes
 * 240 frames, the entire four-second beat: the picture would only fill on its
 * last frame.
 *
 * The rush also starts EARLY — 14 frames after the fifth service's label has
 * finished arriving, rather than ninety. The brief is an advertisement: the
 * stretch between the last service and the first review was dead screen time,
 * and dead screen time is where attention is lost.
 *
 * Speed costs nothing here because there is nothing on screen to look at, and
 * 44 px/frame moves a 560 px card by 8 % of its own width per frame, so it
 * neither strobes nor smears.
 */
const RUSH_TO = 44;

/**
 * When the ground starts going back to dark. Solved, not chosen: station 03
 * stands at world x 2620 and its label reaches 190 px to its left, so the last
 * ink leaves the frame when camX passes 2810, which the rush reaches at f = 928.
 */
const WHITE_OUT = 930;

/**
 * Camera x. Constant through the stations, with velocity ramped from and back
 * to zero outside them — so the pan never starts or stops on a step, and the
 * arrival frames stay exactly where the station timings expect them.
 */
export const camXAt = (f: number, w: number, tall: boolean) => {
  // the camera is still while station 01 reveals, then eases away
  if (f <= FROM + HOLD) return 0;
  if (f < FROM + HOLD + RAMP_IN) {
    const u = (f - FROM - HOLD) / RAMP_IN;
    return RAMP_DIST * u * u;
  }
  const cruise = (g: number) => RAMP_DIST + (g - FROM - HOLD - RAMP_IN) * RATE;
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

/** The thread is born at station 01: nothing is drawn to its left. */
const PATH_X0 = X0;
/**
 * 500 px past the last station, not 2420.
 *
 * With five stations the thread ran to 5040 and the last one stood at 4540. Cut
 * to three, the last station moved to 2620 but the thread kept its old end, so
 * it trailed off for nearly half the beat — the tail that was called too long.
 */
const PATH_END = X0 + 2 * SPACING + 500;
const PATH_X1 = PATH_END;
const PATH_D = (() => {
  let d = '';
  for (let x = PATH_X0; x <= PATH_X1; x += 8) {
    d += (d ? ' L ' : 'M ') + x.toFixed(0) + ' ' + sineY(x).toFixed(1);
  }
  return d;
})();

type Step = {n: string; glyph: GlyphName; label: string[]; below: boolean};

/**
 * Three services, not five.
 *
 * The three kept are the ones that describe the WORK: the listing goes up, the
 * guests are handled, the property is kept. Tarification dynamique and Reporting
 * mensuel were dropped not because they matter less but because the film already
 * makes the money argument twice over — the calendar shows the payouts and the
 * payoff line is "Nous gérons, vous percevez". Repeating it here spent two
 * stations on something already said.
 */
const STEPS: Step[] = [
  {n: '01', glyph: 'camera', label: ['Annonce et', 'photos'], below: false},
  {n: '02', glyph: 'key', label: ['Accueil', '7 j / 7'], below: true},
  {n: '03', glyph: 'sparkle', label: ['Ménage', 'hôtelier'], below: false},
];

export const Journey: React.FC<{frame: number}> = ({frame}) => {
  const {w: W, h: H, tall} = useStage();
  const FRONT = frontOf(W, tall);
  const camX = camXAt(frame, W, tall);
  // the dive that used to end this beat is gone: the camera only travels right
  const camY = 0;
  /** World x the thread has been drawn to, and never past its own end. */
  const frontX = Math.min(camX + FRONT, PATH_END);
  const whiteness =
    EASE.entrance(prog(frame, FROM + 2, FROM + 34)) *
    (1 - EASE.entrance(prog(frame, WHITE_OUT, WHITE_OUT + 32)));

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/*
        The glow settles to 0.5 as the camera comes to rest, because that is what
        the reviews beat uses. The cut lands on an empty frame, so nothing is
        drawn on either side of it — but a mismatched ground would still have
        made the background brightness jump at that exact frame.
      */}
      <Ink glow={0.9 - 0.4 * prog(frame, RUSH_FROM, TO)} />

      {/*
        The beat plays on WHITE, but it does not CUT to white.

        Both of its edges are match cuts onto dark ground — that was measured and
        fixed in earlier passes, and a scene that simply painted itself white
        would put a 60-point luminance step at each one. So the white is raised
        and lowered inside the scene: the dark `Ink` above is left running
        underneath, and this sheet fades up over half a second once the cut has
        landed, then back down once the last station has left the frame.

        WHITE_OUT starts at 930 rather than at the rush, because station 03's
        label is still in frame until 928 and it is burgundy on white — darkening
        under it would have pushed it through its own background.
      */}
      <AbsoluteFill
        style={{background: '#FFFFFF', opacity: whiteness, pointerEvents: 'none'}}
      />

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
            <stop offset="0%" stopColor={C.blue600} stopOpacity="0" />
            <stop offset="7%" stopColor={C.blue600} stopOpacity="0.85" />
            <stop offset="50%" stopColor={C.blue600} stopOpacity="1" />
            <stop offset="93%" stopColor={C.blue600} stopOpacity="0.85" />
            <stop offset="100%" stopColor={C.blue600} stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform={`translate(${-camX} ${-camY})`}>
          {STEPS.map((s, i) => {
            const x = X0 + i * SPACING;
            const a = arriveOf(i, W, tall);
            const g = EASE.entrance(prog(frame, a - GHOST_LEAD, a + 10));
            return (
              <text
                key={s.n}
                /*
                  The numeral must never sit where the label sits. In 16:9 it is
                  pushed to the side opposite the label, which alternates above
                  and below the wave. In 4:5 the label is ALWAYS under the tile,
                  so the numeral always goes above it — centring both under the
                  tile, as a first pass did, put the label straight on top of the
                  figure.
                */
                x={tall ? x : x - 250}
                y={tall ? sineY(x) - 150 : sineY(x) + (s.below ? -210 : 300)}
                fontFamily={SANS}
                fontWeight={700}
                fontSize={tall ? 200 : 300}
                fill={C.blue600}
                fillOpacity={0.14 * g}
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
        const arrive = arriveOf(i, W, tall);
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
                background: C.deep,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                /*
                  A shadow, not a halo. The glow made sense on dark ground and
                  makes none on white — and it was the surbrillance the brief
                  asked to remove. What is left reads as the tile sitting on the
                  page rather than emitting from it.
                */
                boxShadow: `0 ${14 * e}px ${34 * e}px rgba(64,1,6,0.16)`,
                opacity: e,
                transform: `scale(${0.5 + 0.5 * e})`,
              }}
            >
              {/*
                Cream on burgundy: 11.4:1, far past the 3:1 a UI element needs.
                The symbol used to be dark ink on a pale tile, which inverted
                once the ground turned white — the tile then had less contrast
                against the page than the symbol had against the tile.
              */}
              <Glyph name={s.glyph} size={TILE * 0.52} color={C.cream} />
            </div>
            <div
              style={{
                position: 'absolute',
                /*
                  Beside the tile in 16:9; centred UNDER it in 4:5, so a station
                  occupies a narrow column instead of a wide one and nothing
                  reaches past the arrival point into the right edge.
                */
                left: tall ? sx - 190 : sx + (s.below ? TILE * 0.18 : TILE * 0.62),
                width: tall ? 380 : undefined,
                textAlign: tall ? 'center' : undefined,
                top: tall
                  ? sy + TILE * 0.66
                  : s.below ? sy + TILE * 0.72 : sy - TILE * 0.30 - 68 * s.label.length,
                fontFamily: SANS,
                fontWeight: W_BOLD,
                fontSize: 54,
                lineHeight: 1.16,
                letterSpacing: '-0.028em',
                color: C.deep,
                whiteSpace: 'pre',
              }}
            >
              {s.label.map((line, li) => {
                // the label follows the thread, it does not precede it
                const lt = labelTiming(tall);
                const lp = EASE.entrance(
                  prog(frame, arrive + lt.lag + li * lt.step, arrive + lt.lag + lt.dur + li * lt.step)
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
