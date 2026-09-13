import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS, W_MED, W_BOLD, T} from '../theme';
import {useStage} from '../format';
import {Ink} from '../components/Grounds';
import {Glyph, GlyphName} from '../components/Glyphs';
import {Exposure} from '../components/Exposure';
import {prog} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beat 5 — the three services, 11.9 -> 16.6 s.
 *
 * Third construction of this beat, and the first one where the three steps are
 * on screen TOGETHER.
 *
 * The sinusoid version strung them along a curve; the panel version gave each a
 * full frame of its own. Both had the same flaw underneath, and it only shows up
 * when you measure it: a step stayed legible for well under a second, because
 * the camera had to leave it to reach the next one. Three steps in 4,7 s can
 * either be visited one at a time or laid out at once, and laying them out is
 * the only version where the viewer can still see step 01 as step 03 lands.
 *
 * So the ground is FIXED and the rows come to it: 01 into the top from the left,
 * 02 into the middle from the right, 03 into the bottom from the left. The
 * alternation is what gives the beat its pulse — each arrival comes from the
 * side the last one did not, so three identical moves read as a rhythm rather
 * than as a list being filled in.
 *
 * Measured, a step now stands fully readable for 2,7 s, 2,1 s and 1,5 s, against
 * 0,62 / 0,65 / 0,82 in the version before it.
 *
 * The camera survives, doing one job only: after the hold it runs right and
 * carries the frame into the dark ground the reviews build on, still arriving at
 * the 44 px/frame `Reviews` decelerates from. That hand-over is why this beat
 * and the next read as one move rather than two scenes, and it is the one thing
 * every rebuild of this beat has had to keep.
 */

const FROM = T.journey.from;
const TO = T.journey.to;

/** The ground comes up from the dark of the previous beat, then holds. */
const WHITE_IN: [number, number] = [FROM + 2, FROM + 22];

/**
 * The run-out, and the only movement the camera makes.
 *
 * It has to clear the rows AND the white they stand on before the cut: a row's
 * right edge sits at about 840 px and the white band is one frame wide, so the
 * frame is empty at camX = 840 and fully dark at camX = W. The smoothstep covers
 * RUSH_N * 44 / 2 = 1408 px, which clears both with room to spare.
 */
const RUSH_FROM = TO - 64;
const RUSH_N = TO - RUSH_FROM;
const V_END = 44;

export const camXAt = (f: number, _w: number, _tall: boolean) => {
  if (f <= RUSH_FROM) return 0;
  const u = Math.min(1, (f - RUSH_FROM) / RUSH_N);
  return RUSH_N * V_END * (u * u * u - (u * u * u * u) / 2);
};

/** Where each row arrives, and from which side. -1 is from the left. */
type Step = {n: string; glyph: GlyphName; label: [string, string]; from: -1 | 1};

const STEPS: Step[] = [
  {n: '01', glyph: 'camera', label: ['Annonce', 'et photos'], from: -1},
  {n: '02', glyph: 'key', label: ['Accueil', '7 j / 7'], from: 1},
  {n: '03', glyph: 'spray', label: ['Ménage', 'hôtelier'], from: -1},
];

/**
 * The stagger. 34 frames apart against 40 frames of travel — so a row is still
 * settling as the next one launches, and the three arrivals overlap into one
 * continuous pulse instead of landing as three separate events.
 */
const ROW_IN = FROM + 26;
const ROW_STEP = 26;
const ROW_DUR = 36;

/** How far outside the frame a row starts, in multiples of the frame width. */
const OFFSTAGE = 1.05;

/**
 * The line that closes the beat, under the three rows.
 *
 * It arrives AFTER the last row has landed, so the beat reads as three things
 * being listed and then answered, rather than as a title with a list under it.
 * And it is revealed with `Exposure` — the film's statement gesture — where the
 * rows snap in: the contrast between a hard arrival and a soft resolve is what
 * marks it as the conclusion rather than as a fourth item.
 */
const LINE_FROM = ROW_IN + 2 * ROW_STEP + ROW_DUR + 8;

export const Journey: React.FC<{frame: number}> = ({frame}) => {
  const {w: W, h: H, tall} = useStage();
  const camX = camXAt(frame, W, tall);
  const whiteness = EASE.entrance(prog(frame, WHITE_IN[0], WHITE_IN[1]));

  const S = tall
    ? {tile: 190, radius: 50, gap: 30, label: 58, num: 27, rowY: [0.25, 0.45, 0.65], line: 64}
    : {tile: 170, radius: 46, gap: 28, label: 52, num: 25, rowY: [0.24, 0.46, 0.68], line: 56};
  /*
   * Sized to the longest label rather than generously: at 380 the row measured
   * 600 px but its ink stopped at 500, so centring the BOX left the block
   * visibly off-centre in the frame. The column is now as wide as "et photos"
   * needs and no wider, which centres the ink instead of the padding.
   */
  const labelW = tall ? 300 : 290;
  const rowW = S.tile + S.gap + labelW;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Ink glow={0.5} />

      {/*
        One white band, one frame wide, sitting still. The dark beyond it is not
        drawn — it is the `Ink` above showing through once the camera has run
        past the band's right edge, which is how this beat hands over to a scene
        that begins on dark ground with no fade and no step at the cut.
      */}
      <div
        style={{
          position: 'absolute',
          left: -camX,
          top: 0,
          width: W,
          height: H,
          background: C.paper,
          opacity: whiteness,
        }}
      />

      {STEPS.map((s, i) => {
        const a = ROW_IN + i * ROW_STEP;
        /*
          * An ease-OUT, not the ease-in-out this first used.
          *
          * `EASE.dramatic` is nearly still for its first third, and a row that
          * starts a full frame-width off screen spends that third invisible — so
          * row 02 had not appeared yet when row 01 had already landed, and three
          * arrivals that were meant to overlap into one pulse came out as three
          * separate events with dead air between them. A row is already moving
          * when we meet it: it should decelerate into place, not accelerate from
          * a standstill we never see.
          */
        const p = EASE.entrance(prog(frame, a, a + ROW_DUR));
        // the row travels in from its own side and lands on the centre line
        const x = W / 2 - rowW / 2 + s.from * OFFSTAGE * W * (1 - p) - camX;
        const y = S.rowY[i] * H;
        // the numeral is the last thing to arrive, so the row lands before it reads
        const g = EASE.entrance(prog(frame, a + 22, a + 50));
        return (
          <div
            key={s.n}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: rowW,
              height: S.tile,
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: S.gap,
            }}
          >
            <div
              style={{
                width: S.tile,
                height: S.tile,
                flex: '0 0 auto',
                borderRadius: S.radius,
                background: C.deep,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/*
                White, not the charter's cream — and the reason is measured
                rather than aesthetic.
                Cream on this tile is 13,8:1, so contrast was never the problem.
                What made the symbols read as dull grey is that cream is 21 %
                DARKER than the white page they sit beside: against a surround
                the eye has adapted to as white, anything below it reads as grey.
                At #FFFFFF the gap is 0 % and the symbol reads as a hole punched
                through the tile, which is what it is. 17,1:1 on the tile.
                It is also drawn slightly larger — 54 % of the tile against 50 —
                because a dark surface eats thin features, so a glyph needs more
                of the box on burgundy than it does on paper.
              */}
              <Glyph name={s.glyph} size={S.tile * 0.54} color="#FFFFFF" counter={C.deep} />
            </div>

            <div style={{width: labelW}}>
              {/*
                The step number, as a kicker over its label.
                It was a big ghost numeral behind the tile — and a 150 px figure
                set behind a 190 px tile is 70 % hidden, so all three read as a
                pale smudge escaping on the left. Small, in the accent, above the
                title, it states the number instead of decorating with it.
              */}
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: W_BOLD,
                  fontSize: S.num,
                  letterSpacing: '0.18em',
                  lineHeight: 1,
                  marginBottom: 12,
                  color: C.blue600,
                  opacity: g,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: W_BOLD,
                  fontSize: S.label,
                  lineHeight: 1.14,
                  letterSpacing: '-0.028em',
                  color: C.deep,
                }}
              >
                <div>{s.label[0]}</div>
                <div>{s.label[1]}</div>
              </div>
            </div>
          </div>
        );
      })}

      {/*
        Carried by -camX like the rows, so the run-out takes it out of frame with
        them. Anything left standing while the camera leaves would still be on
        screen at the cut the reviews land on.
      */}
      <div
        style={{
          position: 'absolute',
          left: -camX,
          top: (tall ? 0.78 : 0.80) * H,
          width: W,
          height: (tall ? 0.16 : 0.15) * H,
        }}
      >
        {/*
          The accent, not the ink. This is the beat's conclusion, and Didot in
          #941101 carries that without competing with the Futura labels, which
          hold the frame by weight rather than by colour.
        */}
        <Exposure
          frame={frame}
          rows={['On s’occupe de tout.']}
          from={LINE_FROM}
          reveal={34}
          exitFrom={RUSH_FROM}
          exitTo={RUSH_FROM + 20}
          fontSize={S.line}
          font={SANS}
          weight={W_MED}
          tracking="-0.012em"
          ground="light"
          accentRow={0}
          soft={10}
        />
      </div>
    </AbsoluteFill>
  );
};
