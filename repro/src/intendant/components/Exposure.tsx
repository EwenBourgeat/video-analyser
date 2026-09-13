import React from 'react';
import {C} from '../theme';
import {prog} from '../../ease';
import {cubicBezier} from '../../bezier';

/**
 * The film's statement reveal — the "exposition" gesture.
 *
 * The brief asked for "l'animation exposition sur After Effects". There is no
 * text preset by that name: in the FRENCH interface "Exposition" is the Exposure
 * effect, a colour correction. What that names in practice is the
 * Exposure-plus-Glow reveal — type is pushed past white, blown out and bloomed,
 * and the exposure is then brought back down so the letters resolve out of the
 * light rather than arriving from somewhere.
 *
 * So nothing here translates, scales or reflows. A letter begins as a soft
 * over-exposed bloom and comes into focus in place:
 *
 *   blur        18px -> 0                the letter resolves
 *   bloom       wide, bright -> gone     the over-exposure falls away
 *   opacity     0 -> 1                   carried faster so it is never grey
 *
 * All three are driven by ONE progress value on ONE curve. That matters: an
 * early version stacked four properties per word on four different staggers
 * against a line that was itself sliding, and it juddered. Properties are not
 * the problem; independent timings are.
 *
 * This lives in one place because TWO beats now use it — "Parce que gérer une
 * location courte durée" and "vous ne gérez plus rien". They are the film's two
 * statement lines and they should read as the same gesture, which a second copy
 * of the code would guarantee they eventually stop doing.
 */

/**
 * The speed of the wave along the line. Deliberately FLAT for a Bezier: a
 * strongly eased curve peaks at 3.3x its own average, and that peak is what
 * compressed the middle of the sentence into a snap. This one peaks at 2.0x, so
 * a letter takes 8 to 16 frames to resolve wherever it sits in the line.
 */
const READING = cubicBezier(0.35, 0.12, 0.3, 0.9);
/** How a single letter comes out of the light — long tail on purpose. */
const SETTLE = cubicBezier(0.45, 0, 0.22, 1);

/** Peak blur on a letter, in px, before it resolves. */
const BLUR = 18;
/** Peak bloom radius, in px. */
const BLOOM = 46;

export const Exposure: React.FC<{
  frame: number;
  /** The sentence, broken by hand — never reflowed, so no word jumps rows. */
  rows: string[];
  from: number;
  /** Frames for the wave to cross the whole sentence. */
  reveal: number;
  /** The exit is the entrance played backwards: back out of focus, into light. */
  exitFrom: number;
  exitTo: number;
  fontSize: number;
  font: string;
  /**
   * Futura needs a weight and a tracking that a didone did not.
   * This component was written when every statement in the film was set in
   * Didot at 400: one weight, one tracking, no reason to expose either. Now the
   * statements are geometric sans, where 400 is a synthesised smear (only Medium
   * and Bold are installed) and -0.028em closes the counters of a face built on
   * circles. Both are therefore parameters, with the didone values as defaults
   * so nothing that still passes a serif changes.
   */
  weight?: number;
  tracking?: string;
  /** Which row carries the accent. Defaults to the last. */
  accentRow?: number;
  /**
   * The GROUND the line sits on, not the colour of the type.
   *
   * On dark ground the letters are pale and the over-exposure is a real white
   * bloom. On white there is nothing to blow out TO, so the bloom is dropped and
   * the blur carries the whole resolve — the letter still comes out of the page
   * rather than arriving on it, which is the gesture; a white glow painted on
   * white would only have cost frames to render nothing.
   */
  ground?: 'dark' | 'light';
  /**
   * Letters resolving at once — a third of a long sentence, so the bloom reads
   * as one band of light sweeping the line rather than sixty separate flickers.
   */
  soft?: number;
}> = ({
  frame,
  rows,
  from,
  reveal,
  exitFrom,
  exitTo,
  fontSize,
  font,
  weight = 400,
  tracking = '-0.028em',
  accentRow,
  ground = 'dark',
  soft = 20,
}) => {
  const ACCENT_ROW = accentRow ?? rows.length - 1;
  const TOTAL = rows.reduce((n, r) => n + r.length, 0);
  const dark = ground === 'dark';
  const ink = dark ? C.inkDark : C.ink;
  const accentInk = dark ? C.blue350 : C.blue600;

  // the wave's head, in letters along the sentence
  const head = READING(prog(frame, from, from + reveal)) * (TOTAL + soft);
  const exit = prog(frame, exitFrom, exitTo);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: font,
        fontWeight: weight,
        fontSize,
        lineHeight: 1.2,
        letterSpacing: tracking,
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
              const p = SETTLE(Math.max(0, Math.min(1, (head - i) / soft))) * (1 - exit);
              const done = p > 0.999;
              // opacity leads the resolve so a letter is never a grey smudge
              const o = Math.min(1, p * 1.5);
              /*
                A letter that is still invisible carries no filter and no bloom.
                It used to: every not-yet-revealed character was given a blur and
                two text-shadows of 46 and 101 px for no visible result, and on
                the beat's first frames that is sixty-odd of them at once. It
                made the frame so expensive that a render timed out on it after
                seven minutes. Skipping work that draws nothing is free.
              */
              const lit = o > 0.004;
              const glow = accent ? '146,196,255' : '255,255,255';
              const bloom =
                !dark || done || !lit
                  ? undefined
                  : `0 0 ${(1 - p) * BLOOM}px rgba(${glow},${(1 - p) * 0.95}),` +
                    ` 0 0 ${(1 - p) * BLOOM * 2.2}px rgba(${glow},${(1 - p) * 0.5})`;
              return (
                <span
                  key={ci}
                  style={{
                    display: 'inline-block',
                    opacity: o,
                    color: accent ? accentInk : ink,
                    // the whole reveal: out of focus and over-exposed, into place
                    filter: done || !lit ? undefined : `blur(${(1 - p) * BLUR}px)`,
                    textShadow: bloom,
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
  );
};
