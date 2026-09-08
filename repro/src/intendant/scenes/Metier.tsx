import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, SANS} from '../theme';
import {Ink} from '../components/Grounds';
import {prog} from '../../ease';
import {cubicBezier} from '../../bezier';

/**
 * Beat 4 — the turn, 7.8 -> 11.4 s.
 *
 * Third construction for this beat, and the reason for each is worth keeping.
 *
 *  - It began as eleven per-word entrances (opacity + scale + blur + offset)
 *    firing against a line that was itself sliding: four animations per word,
 *    none of them continuous. That juddered.
 *  - It then became a constant-speed slide behind a soft window. Smooth, but
 *    mechanical.
 *  - It was then rebuilt from the reference film, where each word lands at about
 *    three times its size while the whole line rescales. Faithful, but the note
 *    on it was plain: "trop rapide et violente ... la manière dont les mots se
 *    posent, j'aime pas du tout".
 *
 * So the arrival scale is gone, and so is the rescaling of the line. The
 * sentence is set at its final size from the first frame and never moves. What
 * animates is a soft wave travelling along it, and the letters settle as it
 * passes — nothing lands on top of anything, nothing changes size.
 *
 * Two Beziers, doing two different jobs:
 *
 *  1. READING is the speed of the wave along the sentence. It eases in and out,
 *    so the reveal opens gently, flows through the middle, and arrives at the
 *    full stop without braking hard.
 *  2. SETTLE is how one letter lands once the wave reaches it — a long tail, so
 *    it comes to rest rather than snapping into place.
 *
 * The wave is deliberately wide (SOFT letters are in motion at once), which is
 * what makes it read as one continuous gesture instead of sixty small ones.
 */

const FROM = 466;
const TO = 684;

/** The wave crosses the whole sentence in this many frames — 2.5 s. */
const REVEAL = 150;
/** How many letters are mid-landing at any moment. */
const SOFT = 6;
/** How far a letter drifts up into place. Small on purpose. */
const RISE = 16;

/** The speed of the wave along the line. */
const READING = cubicBezier(0.42, 0.02, 0.24, 1);
/** How a single letter comes to rest. */
const SETTLE = cubicBezier(0.16, 0.62, 0.22, 1);

const ROWS = [
  'Parce que gérer une location courte durée,',
  'c’est un vrai métier.',
];
const ACCENT_ROW = 1;
const TOTAL = ROWS[0].length + ROWS[1].length;

/**
 * Fixed size: the line no longer rescales as it fills, so this is simply what
 * the sentence reads at. 72 px puts the longer row at 79 % of frame width,
 * which is the proportion measured on the reference film's own held line.
 */
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
          const before = ri === 0 ? 0 : ROWS[0].length;
          return (
            <div key={ri} style={{display: 'flex', whiteSpace: 'pre', height: '1.2em'}}>
              {[...row].map((ch, ci) => {
                const i = before + ci;
                const p = SETTLE(Math.max(0, Math.min(1, (head - i) / SOFT)));
                return (
                  <span
                    key={ci}
                    style={{
                      display: 'inline-block',
                      opacity: p,
                      transform: `translateY(${(1 - p) * RISE}px)`,
                      color: ri === ACCENT_ROW ? C.blue350 : C.inkDark,
                    }}
                  >
                    {ch === ' ' ? ' ' : ch}
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
