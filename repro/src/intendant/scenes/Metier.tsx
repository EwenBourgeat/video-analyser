import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, H, SANS} from '../theme';
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

const ROWS = [
  'Parce que gérer une location courte durée,',
  'c’est un vrai métier.',
];
const ACCENT_ROW = 1;
const TOTAL = ROWS[0].length + ROWS[1].length;

const FONT = 72;

export const Metier: React.FC<{frame: number}> = ({frame}) => {
  // the wave's head, in letters along the sentence
  const head = READING(prog(frame, FROM, FROM + REVEAL)) * (TOTAL + SOFT);
  const out = 1 - prog(frame, TO - 14, TO);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Ink />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: out,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: FONT,
          lineHeight: 1.2,
          letterSpacing: '-0.028em',
        }}
      >
        {ROWS.map((row, ri) => {
          const accent = ri === ACCENT_ROW;
          const before = ri === 0 ? 0 : ROWS[0].length;
          return (
            <div key={ri} style={{display: 'flex', whiteSpace: 'pre', height: '1.2em'}}>
              {[...row].map((ch, ci) => {
                const i = before + ci;
                const p = SETTLE(Math.max(0, Math.min(1, (head - i) / SOFT)));
                const done = p > 0.999;
                // opacity leads the resolve so a letter is never a grey smudge
                const o = Math.min(1, p * 1.5);
                const glow = accent ? '146,196,255' : '255,255,255';
                return (
                  <span
                    key={ci}
                    style={{
                      display: 'inline-block',
                      opacity: o,
                      color: accent ? C.blue350 : C.inkDark,
                      // the whole reveal: out of focus and over-exposed, into place
                      filter: done ? undefined : `blur(${(1 - p) * BLUR}px)`,
                      textShadow: done
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
      {void H}
    </AbsoluteFill>
  );
};
