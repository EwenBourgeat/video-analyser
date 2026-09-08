import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, SANS} from '../theme';
import {Ink} from '../components/Grounds';
import {prog} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beat 4 — the turn, 7.8 -> 11.4 s.
 *
 * Rebuilt straight off the reference film. Its equivalent beat was read one
 * panel per frame (source f174 to f244) and measured, and the construction is:
 *
 *   a new word arrives at about three times its final size, ON TOP of the line,
 *   and shrinks into place — while the WHOLE line is rescaled so the growing
 *   sentence keeps filling the same width of frame.
 *
 * That second half is what makes it read as one gesture: as the sentence gets
 * longer, every earlier word is quietly shrinking too, so the eye tracks a
 * single object settling rather than eleven arriving. Cadence measured at one
 * word every 3 frames at 30 fps, each shrinking over about 3.5 — doubled here.
 *
 * ONE DELIBERATE DEPARTURE. In the source the line keeps a single row, so once
 * it is full the oldest words scroll off the left: by source f214 the opening
 * "Parce que ça ne sert" is gone and only the tail is on screen at 77 px. That
 * keeps the type large, and it is why the reference never shrinks to nothing —
 * but it also means the whole sentence is never readable at once. Given how
 * often this project has come back to "on n'a pas le temps de lire", the line
 * is authored here as TWO fixed rows instead. Nothing scrolls away, the
 * measured 77 px type size is kept, and because the break is authored rather
 * than reflowed, no word ever jumps rows mid-reveal.
 */

const FROM = 466;
const TO = 684;

/** Frames between two words. Measured: 3 at 30 fps. */
const CADENCE = 7;
/** How long a word takes to shrink into place. Measured: ~3.5 at 30 fps. */
const POP = 9;
/** The size a word arrives at, relative to its final size. */
const POP_SCALE = 3.1;

const ROWS = [
  'Parce que gérer une location courte durée,'.split(' '),
  'c’est un vrai métier.'.split(' '),
];
const TOTAL = ROWS[0].length + ROWS[1].length;
/** The closing words carry the accent, as the reference's last word does. */
const ACCENT_ROW = 1;

/**
 * Advance widths in ems, only ever used to decide how much to scale the WHOLE
 * block. The rows are centred by flexbox, so an error here changes the size
 * slightly and can never break the layout.
 */
const NARROW = "iljtI.,'’!|:;";
const WIDE = 'mwMWÉ';
const em = (ch: string) =>
  ch === ' ' ? 0.26 : NARROW.includes(ch) ? 0.28 : WIDE.includes(ch) ? 0.86 : 0.54;
const widthOf = (s: string) => [...s].reduce((a, ch) => a + em(ch), 0);

/** Widest revealed row, in ems, after n words. */
const blockEm = (n: number) => {
  const a = ROWS[0].slice(0, Math.min(n, ROWS[0].length)).join(' ');
  const b = ROWS[1].slice(0, Math.max(0, n - ROWS[0].length)).join(' ');
  return Math.max(widthOf(a), widthOf(b), 0.5);
};

/** The block always fills this much of the frame; measured at 77 px of type. */
const TARGET = W * 0.80;
const MAX_FONT = 176;

export const Metier: React.FC<{frame: number}> = ({frame}) => {
  const shown = Math.min(TOTAL, Math.floor((frame - FROM) / CADENCE) + 1);
  const newest = shown - 1;

  const popRaw = prog(frame, FROM + newest * CADENCE, FROM + newest * CADENCE + POP);
  const pop = EASE.pullback(popRaw);

  // blend the block's width across the arriving word, so the rescale never steps
  const wEm = blockEm(shown - 1) + (blockEm(shown) - blockEm(shown - 1)) * popRaw;
  const font = Math.min(MAX_FONT, TARGET / wEm);

  const out = 1 - prog(frame, TO - 12, TO);

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
          fontSize: font,
          lineHeight: 1.18,
          letterSpacing: '-0.028em',
        }}
      >
        {ROWS.map((row, ri) => {
          const before = ri === 0 ? 0 : ROWS[0].length;
          return (
            <div key={ri} style={{display: 'flex', whiteSpace: 'pre', height: '1.18em'}}>
              {row.map((word, wi) => {
                const gi = before + wi;
                if (gi >= shown) return null;
                const p = gi === newest ? pop : 1;
                return (
                  <span
                    key={wi}
                    style={{
                      // one property, and only one: the arrival scale
                      display: 'inline-block',
                      transform: `scale(${POP_SCALE + (1 - POP_SCALE) * p})`,
                      color: ri === ACCENT_ROW ? C.blue350 : C.inkDark,
                      marginRight: '0.26em',
                    }}
                  >
                    {word}
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
