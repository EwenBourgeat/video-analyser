import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SERIF} from '../theme';
import {useStage} from '../format';
import {Ink} from '../components/Grounds';
import {prog} from '../../ease';
import {cubicBezier} from '../../bezier';

/**
 * Beat 4 — the turn, 7.8 -> 11.4 s.
 *
 * Fourth construction, and this one drops movement entirely.
 *
 * The brief was "type l'animation exposition sur After Effects". There is no
 * text preset by that name — AE's text presets live in Animate In, Animate Out,
 * Blurs, Curves and Spins and so on. In the FRENCH interface "Exposition" is the
 * Exposure effect, a colour correction. What that names in practice is the
 * Exposure-plus-Glow reveal: type is pushed well past white, blown out and
 * bloomed, and the exposure is then brought back down so the letters resolve out
 * of the light rather than arriving from somewhere.
 *
 * So nothing here translates, scales or reflows. A letter begins as a soft
 * over-exposed bloom and comes into focus in place:
 *
 *   blur        18px -> 0      the letter resolves
 *   bloom       wide, bright -> gone   the over-exposure falls away
 *   opacity     0 -> 1         carried faster than the rest so it is never grey
 *
 * All three are driven by ONE progress value on ONE curve. That matters: the
 * first version of this beat stacked four properties per word on four different
 * staggers against a line that was itself sliding, and it juddered. Properties
 * are not the problem; independent timings are.
 *
 * Two Beziers, two jobs:
 *
 *  1. READING — the speed of the wave along the sentence: it opens gently,
 *     flows, and arrives at the full stop without braking hard.
 *  2. SETTLE — how one letter comes out of the bloom, with a long tail so it
 *     finishes slowly. This is where the "satisfying" lives: the last 20 % of
 *     the resolve takes as long as the first 60 %.
 */

const FROM = 466;
const TO = 684;

/** The wave crosses the whole sentence in this many frames — 2.5 s. */
const REVEAL = 150;
/** Letters resolving at once — a third of the sentence, so the bloom reads as
 *  one band of light sweeping the line rather than sixty separate flickers. */
const SOFT = 20;

/** Peak blur on a letter, in px, before it resolves. */
const BLUR = 18;
/** Peak bloom radius, in px. */
const BLOOM = 46;

/**
 * The speed of the wave along the line. Deliberately FLAT for a Bezier: a
 * strongly eased curve peaks at 3.3x its own average, and that peak is what
 * compressed the middle of the sentence into a snap. This one peaks at 2.0x, so
 * a letter takes 8 to 16 frames to resolve wherever it sits in the line.
 */
const READING = cubicBezier(0.35, 0.12, 0.3, 0.9);
/** How a single letter comes out of the light — long tail on purpose. */
const SETTLE = cubicBezier(0.45, 0, 0.22, 1);

/**
 * The sentence is broken by hand for each frame rather than reflowed.
 *
 * In 4:5 it takes FOUR short lines instead of two long ones, and that is what
 * lets the type get BIGGER rather than smaller: reflowing the 16:9 wording into
 * a 1080-wide frame would have forced roughly 47 px to fit, where four short
 * lines hold 80. Breaking by hand also means no word ever jumps rows mid-reveal.
 */
const LINES = (tall: boolean) =>
  tall
    ? ['Parce que gérer', 'une location', 'courte durée,', 'c’est un vrai métier.']
    : ['Parce que gérer une location courte durée,', 'c’est un vrai métier.'];

/** The closing line carries the accent, in either frame. */
const accentRow = (rows: string[]) => rows.length - 1;

export const Metier: React.FC<{frame: number}> = ({frame}) => {
  const {tall} = useStage();
  const rows = LINES(tall);
  const ACCENT_ROW = accentRow(rows);
  const TOTAL = rows.reduce((n, r) => n + r.length, 0);
  const FONT = tall ? 80 : 72;

  // the wave's head, in letters along the sentence
  const head = READING(prog(frame, FROM, FROM + REVEAL)) * (TOTAL + SOFT);
  /**
   * The exit is the entrance played backwards: the letters go out of focus and
   * back into the over-exposed bloom they resolved out of. It used to be a flat
   * opacity fade on the whole block, which is a different gesture from the one
   * the beat is built on — and a plain fade is exactly what makes a boundary
   * read as two scenes stacked rather than one continuous thing.
   */
  const exit = prog(frame, TO - 30, TO);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Ink glow={0.9} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: SERIF,
          fontWeight: 400,
          fontSize: FONT,
          lineHeight: 1.2,
          letterSpacing: '-0.028em',
        }}
      >
        {rows.map((row, ri) => {
          const accent = ri === ACCENT_ROW;
          // letters are indexed continuously across every row, whatever their number
          const before = rows.slice(0, ri).reduce((n, r) => n + r.length, 0);
          return (
            <div key={ri} style={{display: 'flex', whiteSpace: 'pre', height: '1.2em'}}>
              {[...row].map((ch, ci) => {
                const i = before + ci;
                const p = SETTLE(Math.max(0, Math.min(1, (head - i) / SOFT))) * (1 - exit);
                const done = p > 0.999;
                // opacity leads the resolve so a letter is never a grey smudge
                const o = Math.min(1, p * 1.5);
                /*
                  A letter that is still invisible carries no filter and no
                  bloom. It used to: every not-yet-revealed character was given a
                  blur and two text-shadows of 46 and 101 px for no visible
                  result, and on the beat's first frames that is sixty-odd of
                  them at once. It made the frame so expensive that a render
                  timed out on it after seven minutes. Skipping work that draws
                  nothing is free.
                */
                const lit = o > 0.004;
                const glow = accent ? '146,196,255' : '255,255,255';
                return (
                  <span
                    key={ci}
                    style={{
                      display: 'inline-block',
                      opacity: o,
                      color: accent ? C.blue350 : C.inkDark,
                      // the whole reveal: out of focus and over-exposed, into place
                      filter: done || !lit ? undefined : `blur(${(1 - p) * BLUR}px)`,
                      textShadow:
                        done || !lit
                          ? undefined
                          : `0 0 ${(1 - p) * BLOOM}px rgba(${glow},${(1 - p) * 0.95}),` +
                            ` 0 0 ${(1 - p) * BLOOM * 2.2}px rgba(${glow},${(1 - p) * 0.5})`,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
