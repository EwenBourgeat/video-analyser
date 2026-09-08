import React from 'react';
import {FONT} from '../theme';
import {outQuad, outCubic, prog} from '../ease';

export type Seg = {text: string; color: string};

/**
 * Two reveal grammars exist in the source and they are NOT the same effect:
 *
 *  'inplace' — the line is laid out at its final centred position and characters
 *              simply appear where they belong (scene 2, measured: x0 pinned at
 *              97/720 from the first character to the last).
 *  'scroll'  — words append at the right and the whole line translates left so the
 *              newest word stays near centre; earlier words slide off (scenes 4, 27,
 *              measured: x0 pinned then decreasing from t=60.53 s).
 */
type Props = {
  segments: Seg[];
  frame: number;
  from: number;
  to: number;
  fontSize: number;
  mode?: 'inplace' | 'scroll';
  weight?: number;
  letterSpacing?: string;
  /** Characters per unit of the reveal curve; 'word' staggers whole words. */
  unit?: 'char' | 'word';
  charFrames?: number;
  style?: React.CSSProperties;
};

type Tok = {text: string; color: string; isSpace: boolean};

const tokenize = (segments: Seg[], unit: 'char' | 'word'): Tok[] => {
  const out: Tok[] = [];
  for (const s of segments) {
    if (unit === 'char') {
      for (const ch of s.text) {
        out.push({text: ch, color: s.color, isSpace: ch === ' '});
      }
    } else {
      const parts = s.text.split(/(\s+)/).filter((p) => p !== '');
      for (const p of parts) {
        out.push({text: p, color: s.color, isSpace: /^\s+$/.test(p)});
      }
    }
  }
  return out;
};

export const KineticText: React.FC<Props> = ({
  segments,
  frame,
  from,
  to,
  fontSize,
  mode = 'inplace',
  weight = 600,
  letterSpacing = '-0.022em',
  unit = 'char',
  charFrames = 6,
  style,
}) => {
  const toks = tokenize(segments, unit);
  const revealable = toks.filter((t) => !t.isSpace).length;

  // Decelerating reveal: measured 38 chars over ~1.1 s, faster at the head.
  const t = prog(frame, from, to);
  const revealed = revealable * outQuad(t);

  let seen = 0;
  const nodes: React.ReactNode[] = [];

  toks.forEach((tok, i) => {
    if (tok.isSpace) {
      nodes.push(
        <span key={i} style={{whiteSpace: 'pre'}}>
          {tok.text}
        </span>
      );
      return;
    }
    const idx = seen++;
    // progress of this token: 0 when the reveal head reaches it, 1 charFrames later
    const headAt = idx + 1;
    const p = Math.max(0, Math.min(1, (revealed - idx) / (charFrames / 6)));
    const e = outCubic(p);
    nodes.push(
      <span
        key={i}
        style={{
          display: 'inline-block',
          whiteSpace: 'pre',
          color: tok.color,
          opacity: e,
          transform: `translateY(${(1 - e) * -0.14 * fontSize}px) scale(${
            1 + (1 - e) * 0.55
          })`,
          transformOrigin: '50% 60%',
          willChange: 'transform, opacity',
        }}
      >
        {tok.text}
      </span>
    );
    void headAt;
  });

  const base: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: weight,
    fontSize,
    letterSpacing,
    lineHeight: 1.18,
    whiteSpace: 'nowrap',
    ...style,
  };

  if (mode === 'inplace') {
    return <div style={base}>{nodes}</div>;
  }

  // 'scroll': measure-free approximation — shift left proportionally to how much
  // of the line has been revealed, so the newest token sits near the centre.
  const shift = -outCubic(t) * 0.5;
  return (
    <div style={{...base, transform: `translateX(${shift * 100}%)`}}>{nodes}</div>
  );
};
