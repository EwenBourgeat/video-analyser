import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, FONT} from '../theme';
import {Plate} from '../components/Plate';
import {outCubic, prog, ramp, softOut} from '../ease';

/**
 * Beat 4 — "Parce que ça ne sert à rien de pleurer sur le passé", 6.033 -> 7.833 s.
 *
 * Iteration 4. Two things had to be right for this to match:
 *  1. the reveal is LINEAR, not eased — 7 words are on screen at f=195 (14 frames
 *     in) and the line completes around f=205;
 *  2. words do not merely scroll off, they FADE OUT behind the head. At f=205 the
 *     source shows words 2..10 with 0..1 already gone, and at f=215 only the
 *     closing phrase "de pleurer sur le passé" remains while the frame to its
 *     left is empty — scrolling geometry alone cannot produce that.
 * Measured widths: 7 words span 1107 px, 5 words span 826 px -> ~161 px/word.
 */

const WORDS = [
  'Parce', 'que', 'ça', 'ne', 'sert', 'à', 'rien',
  'de', 'pleurer', 'sur', 'le', 'passé',
];
const BLUE_FROM = 11; // "passé"
const KEEP_FROM = 7; // "de ... passé" is the phrase that stays

const FROM = 181;
const LAND = 205;
const SETTLE = 213;
const FS = 80;
const GAP = FS * 0.3;

// narrow glyphs advance much less than the 0.5 em average; without this the
// estimated word positions drift and the scroll anchor lands in the wrong place
const NARROW = "iljtfr'.,àéèI";
const widthOf = (w: string) =>
  [...w].reduce((a, ch) => a + FS * (NARROW.includes(ch) ? 0.28 : 0.55), 0);

export const PastText: React.FC<{frame: number}> = ({frame}) => {
  const head = WORDS.length * prog(frame, FROM, LAND); // linear, measured

  const w = WORDS.map(widthOf);
  const x: number[] = [];
  let acc = 0;
  for (const ww of w) {
    x.push(acc);
    acc += ww + GAP;
  }
  const totalW = acc - GAP;
  const tailW = totalW - x[KEEP_FROM];

  const shown = Math.max(1, Math.min(WORDS.length, Math.ceil(head)));
  const headRight = x[shown - 1] + w[shown - 1];
  const scrollX = 0.78 * W - headRight;
  const finalX = (W - tailW) / 2 - x[KEEP_FROM];
  const shift = ramp(prog(frame, LAND, SETTLE), [0, 1], [scrollX, finalX], softOut);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Plate name="pasttext" />
      <div
        style={{
          position: 'absolute',
          left: shift,
          top: 0.505 * H - 60,   // measured residual dy
          transform: 'translateY(-50%)',
          whiteSpace: 'nowrap',
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: FS,
          letterSpacing: '-0.02em',
        }}
      >
        {WORDS.map((word, i) => {
          const p = Math.max(0, Math.min(1, head - i));
          if (p <= 0) return null;
          const e = outCubic(p);
          // words behind the head fade away; the closing phrase never does
          const fade =
            i < KEEP_FROM ? 1 - prog(frame, 194 + i * 1.8, 202 + i * 1.8) : 1;
          if (fade <= 0) return null;
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: x[i],
                color: i >= BLUE_FROM ? '#3B8CF5' : C.white,
                opacity: Math.min(1, e * 1.5) * fade,
                transform: `scale(${1 + (1 - e) * 0.9})`,
                transformOrigin: '0% 55%',
                display: 'inline-block',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
