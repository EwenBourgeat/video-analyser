import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS, W_BOLD} from '../theme';
import {useStage} from '../format';
import {Ink} from '../components/Grounds';
import {Glyph, GlyphName} from '../components/Glyphs';
import {prog} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beat 5 — the three services, 11.4 -> 16.1 s.
 *
 * Rebuilt from nothing. The sinusoid is gone.
 *
 * That curve was the last thing in the film inherited from the TikTok reference
 * it was first modelled on. It had already been shortened twice and re-anchored
 * once, and each of those passes made the same point louder: it was decoration
 * carrying no meaning. The film has its own grammar now — Didot for the
 * sentences, Futura for the labels, flat charter fields, cuts matched on
 * measured luminance — and a decorative wave was not part of it.
 *
 * What replaces it is the thing the wave was standing in for: a SEQUENCE. Three
 * full-frame panels laid edge to edge on one continuous ground, and a camera
 * that settles on each one before moving to the next.
 *
 * Three decisions carry the beat.
 *
 * 1. PANELS, NOT STATIONS. The world is a ribbon of vertical bands exactly one
 *    frame wide: panel i owns [i*W, (i+1)*W]. There is no gutter, so the seam
 *    between two bands IS the colour change, and that seam sweeping the picture
 *    is the transition. Colour blocking that costs no drawn element.
 *
 * 2. STEP AND SETTLE, NOT A CONSTANT PAN. A constant pan never leaves a panel
 *    still, so nothing composed can be read. The camera rests on each panel,
 *    then whips to the next in 36 frames. It is still one camera crossing one
 *    ground — which is what makes the hand-over to the reviews work — but it
 *    stops where there is something to look at.
 *
 * 3. EVERY ENTRANCE IS A MASK REVEAL. Not a fade. Three separate defects in this
 *    film came from fading something in over a ground that was not its own: the
 *    review cards, their entry, and a whole scene's exit all went through grey
 *    doing it. A mask fades nothing — it uncovers opaque content over opaque
 *    ground — and it happens to be the After Effects idiom being asked for.
 */

const FROM = 684;
const TO = 964;

/**
 * The schedule, in frames. Every camera position below is derived from it, so
 * the beat cannot drift out of its 280-frame slot: the entries sum to exactly
 * TO - FROM, which the numeric check asserts before anything is rendered.
 *
 * Panel 01 dwells longest because it is also where the ground comes up from the
 * dark of the previous beat; panel 03 hands over to the run-out.
 */
const DWELL: [number, number][] = [
  [684, 746],
  [782, 824],
  [860, 902],
];
const MOVE: [number, number][] = [
  [746, 782],
  [824, 860],
];

/**
 * The run-out. It ACCELERATES to 44 px/frame and hands over at that speed —
 * `Reviews` reads its own starting position from `camXAt` and begins decelerating
 * from exactly 44, so the two beats are one move rather than two scenes. That
 * link is the whole reason the travelling exists; it survived the rebuild
 * untouched.
 */
const RUSH_FROM = 902;
const RUSH_N = TO - RUSH_FROM;
const V_END = 44;

/**
 * How far apart two panels stand — and it is NOT always the frame width.
 *
 * In 4:5 it is exactly the frame: one panel fills the picture, which is the
 * whole design. In 16:9 it cannot be. The run-out has to clear the last panel
 * before the cut, and it is bounded by the speed it must hand over at: it covers
 * RUSH_N * 44 / 2 = 1364 px, which clears a 1080 panel with room to spare and
 * does not clear a 1920 one at all. Checked by calculation, the wide frame was
 * cutting to the reviews with 556 px of white panel still on screen — a
 * luminance step at a cut every other seam in this film is tuned to avoid.
 *
 * At 0.62 of the width the wide frame simply shows more than one band at a time,
 * which is what a wide frame is for. The 4:5 that is being shipped is untouched.
 */
const pitchOf = (w: number, tall: boolean) => (tall ? w : Math.round(w * 0.62));

/** Smoothstep velocity, integrated in closed form and normalised to 1 at u = 1. */
const ramped = (u: number) => (u * u * u - (u * u * u * u) / 2) / 0.5;

/**
 * Camera x, in world pixels, as the left edge of the viewport.
 *
 * The panel pitch IS the frame width, so this function needs the viewport and
 * nothing else: in 16:9 the panels are 1920 apart and in 4:5 they are 1080, and
 * a panel fills its frame exactly in both. That is why the old `frontOf`
 * arrival-column machinery could go — there is no column to arrive at any more,
 * the panel simply fills the picture.
 */
export const camXAt = (f: number, w: number, tall: boolean) => {
  const p = pitchOf(w, tall);
  if (f <= DWELL[0][1]) return 0;
  for (let i = 0; i < MOVE.length; i++) {
    const [a, b] = MOVE[i];
    if (f < a) return i * p;
    if (f < b) return i * p + p * ramped((f - a) / (b - a));
    if (f <= DWELL[i + 1][1]) return (i + 1) * p;
  }
  const u = Math.min(1, (f - RUSH_FROM) / RUSH_N);
  return (
    MOVE.length * p + RUSH_N * V_END * (u * u * u - (u * u * u * u) / 2)
  );
};

/**
 * The ground: white, cream, white — then nothing, which is the dark the camera
 * escapes into.
 *
 * The run-out is SPATIAL where the entrance is temporal, and each is chosen for
 * its moment. At the start the camera is parked on panel 01, so only time can
 * change what is under it; at the end it is travelling, so the dark simply has
 * to be somewhere for it to arrive at. Both cuts therefore land on dark ground
 * and measure to zero, which is the discipline every other cut in the film
 * already follows.
 */
const BANDS = [C.paper, C.cream, C.paper];
const WHITE_IN: [number, number] = [FROM + 2, FROM + 22];

type Step = {n: string; glyph: GlyphName; label: [string, string]};

const STEPS: Step[] = [
  {n: '01', glyph: 'camera', label: ['Annonce', 'et photos']},
  {n: '02', glyph: 'key', label: ['Accueil', '7 j / 7']},
  {n: '03', glyph: 'sparkle', label: ['Ménage', 'hôtelier']},
];

/**
 * The mask reveal, as After Effects builds it: a fixed window, and content that
 * rises into it from below.
 *
 * The two nested elements matter. Clipping the SAME element that moves carries
 * the window along with the content, which gives a wipe rather than a reveal —
 * the content appears to slide out of itself instead of out from behind an edge.
 * The outer box holds still and clips; the inner one travels.
 *
 * The travel is expressed in percent so it is relative to the element's own
 * height, which is what lets one component reveal a 220 px numeral and a 64 px
 * line of type without being told the size of either.
 */
const Reveal: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => (
  /*
   * The window clips VERTICALLY only. `overflow: hidden` clips on both axes, and
   * on the first render that sliced the right-hand edge off every numeral: at
   * -0.04em tracking a glyph paints slightly wider than the advance width the
   * box is sized to, so "01" lost the stem of its 1. The padding opens the
   * window sideways and the matching negative margin puts the box back where the
   * layout had it, so nothing moves and nothing is cut.
   */
  <div
    style={{
      overflow: 'hidden',
      paddingLeft: 24,
      paddingRight: 24,
      marginLeft: -24,
      marginRight: -24,
    }}
  >
    <div style={{transform: `translateY(${(1 - p) * 104}%)`}}>{children}</div>
  </div>
);

/**
 * When each element of panel i starts, relative to the panel's own dwell.
 *
 * The whole cascade fits in 34 frames, and that is a constraint rather than a
 * taste: a dwell is 42 frames, and a first draft spread the reveal over 51 — the
 * label was still arriving as the camera left. Checked by calculation before
 * anything was rendered, which is the only reason it was caught.
 */
const LEAD = 14;
/** Panel 01 waits less, because the light is still coming up under it. */
const LEAD_0 = 8;
const beatsOf = (i: number) => {
  /*
   * Panels 02 and 03 start revealing BEFORE the camera has finished arriving —
   * they are already partly in the picture, and beginning there buys back the
   * time the dwell does not have: roughly 0.9 s of fully settled panel instead
   * of 0.4. Panel 01 is the exception and goes the other way: the ground under
   * it is still coming up from the dark of the previous beat, so its content
   * waits for the light rather than appearing into it.
   */
  const start = i === 0 ? DWELL[0][0] + LEAD_0 : DWELL[i][0] - LEAD;
  return {
    numeral: [start, start + 16] as [number, number],
    tile: [start + 5, start + 23] as [number, number],
    line: (li: number) => [start + 11 + li * 5, start + 29 + li * 5] as [number, number],
  };
};

export const Journey: React.FC<{frame: number}> = ({frame}) => {
  const {w: W, h: H, tall} = useStage();
  const P = pitchOf(W, tall);
  const camX = camXAt(frame, W, tall);
  const whiteness = EASE.entrance(prog(frame, WHITE_IN[0], WHITE_IN[1]));

  const S = tall
    ? {numTop: 0.185, numSize: 220, tile: 280, radius: 72, tileTop: 0.465, labelTop: 0.685, label: 64}
    : {numTop: 0.115, numSize: 180, tile: 240, radius: 62, tileTop: 0.44, labelTop: 0.70, label: 56};

  /**
   * How far through the three panels the camera stands.
   *
   * One THIRD on panel 01, not zero. `camX / (2 * W)` measures distance
   * travelled, which is empty on the first panel — so the rail said "nothing
   * done" while the viewer was looking at step one. What it has to count is
   * panels reached, and the first one is reached the moment the beat opens.
   */
  const through = Math.max(0, Math.min(1, (camX / P + 1) / 3));
  /*
   * The rail belongs to the panels, so it leaves with them. Tied to `whiteness`
   * alone it stayed lit over the dark run-out — a red bar floating on the ground
   * the reviews are about to arrive on, and the one element still on screen when
   * the frame was supposed to be empty for the hand-over.
   */
  const rail = whiteness * (1 - EASE.entrance(prog(frame, RUSH_FROM + 16, RUSH_FROM + 40)));

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Ink glow={0.5} />

      {/* the ribbon of coloured bands, in world space */}
      <AbsoluteFill style={{opacity: whiteness}}>
        {BANDS.map((bg, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i * P - camX,
              top: 0,
              width: P + 1, // a hairline of overlap: no seam can fall between two bands
              height: H,
              background: bg,
            }}
          />
        ))}
      </AbsoluteFill>

      {STEPS.map((s, i) => {
        const x = i * P - camX;
        if (x < -P || x > W) return null;
        const b = beatsOf(i);
        const pNum = EASE.entrance(prog(frame, b.numeral[0], b.numeral[1]));
        const pTile = EASE.entrance(prog(frame, b.tile[0], b.tile[1]));
        return (
          <div
            key={s.n}
            style={{position: 'absolute', left: x, top: 0, width: P, height: H}}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: S.numTop * H,
                width: P,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Reveal p={pNum}>
                <div
                  style={{
                    fontFamily: SANS,
                    fontWeight: W_BOLD,
                    fontSize: S.numSize,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    color: C.blue600,
                    opacity: 0.13,
                  }}
                >
                  {s.n}
                </div>
              </Reveal>
            </div>

            <div
              style={{
                position: 'absolute',
                left: P / 2 - S.tile / 2,
                top: S.tileTop * H - S.tile / 2,
              }}
            >
              <Reveal p={pTile}>
                <div
                  style={{
                    width: S.tile,
                    height: S.tile,
                    borderRadius: S.radius,
                    background: C.deep,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* cream on burgundy: 11.4:1, far past the 3:1 a UI element needs */}
                  <Glyph name={s.glyph} size={S.tile * 0.46} color={C.cream} />
                </div>
              </Reveal>
            </div>

            <div
              style={{
                position: 'absolute',
                left: 0,
                top: S.labelTop * H,
                width: P,
                fontFamily: SANS,
                fontWeight: W_BOLD,
                fontSize: S.label,
                lineHeight: 1.18,
                letterSpacing: '-0.028em',
                color: C.deep,
                textAlign: 'center',
              }}
            >
              {s.label.map((line, li) => {
                const [a, z] = b.line(li);
                return (
                  <Reveal key={li} p={EASE.entrance(prog(frame, a, z))}>
                    <div>{line}</div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        );
      })}

      {/*
        The progress rail — fixed in the FRAME, not in the world, because it is
        the one thing here that is not part of the ground: it says where you are
        in a sequence of three, which is the only job the sinusoid was actually
        doing. Saying it as a rail says it in one glance and costs no drawing.
      */}
      <div
        style={{
          position: 'absolute',
          left: W / 2 - (W * 0.16) / 2,
          top: H * (tall ? 0.085 : 0.075),
          width: W * 0.16,
          height: 4,
          borderRadius: 2,
          background: C.deep,
          opacity: 0.14 * rail,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: W / 2 - (W * 0.16) / 2,
          top: H * (tall ? 0.085 : 0.075),
          width: W * 0.16 * through,
          height: 4,
          borderRadius: 2,
          background: C.blue600,
          opacity: rail,
        }}
      />
    </AbsoluteFill>
  );
};
