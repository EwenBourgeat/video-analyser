import React from 'react';
import {C, SANS, W_MED, W_BOLD} from '../theme';
import {softOut, outCubic, prog} from '../../ease';

export type Seg = {text: string; accent?: boolean};

/**
 * The kinetic line of the film, in two grammars — the same two the Scalead
 * piece uses:
 *   'inplace' — the line is laid out at its final position and characters
 *               simply appear where they belong;
 *   'scroll'  — words append at the right, the line slides left, and words fade
 *               out behind the head so only the closing phrase is left standing.
 *
 * Each character eases in with softOut rather than outCubic: an ease-out has its
 * maximum speed at t=0, so glyphs would snap into place instead of settling.
 */
export const Kinetic: React.FC<{
  segments: Seg[];
  frame: number;
  from: number;
  to: number;
  fontSize: number;
  tone?: 'light' | 'dark';
  weight?: number;
  unit?: 'char' | 'word';
  letterSpacing?: string;
  /** Set to let the line wrap inside this width — needed in the 4:5 frame. */
  maxWidth?: number;
  /** Defaults to Futura; the film's statement lines pass Didot. */
  font?: string;
  style?: React.CSSProperties;
}> = ({
  segments,
  frame,
  from,
  to,
  fontSize,
  tone = 'light',
  weight = W_BOLD,
  unit = 'char',
  letterSpacing = '-0.028em',
  maxWidth,
  font = SANS,
  style,
}) => {
  const ink = tone === 'dark' ? C.inkDark : C.ink;
  const accent = tone === 'dark' ? C.blue350 : C.blue600;

  type Tok = {text: string; accent: boolean; space: boolean};
  const toks: Tok[] = [];
  for (const s of segments) {
    const parts =
      unit === 'char' ? [...s.text] : s.text.split(/(\s+)/).filter(Boolean);
    for (const p of parts) {
      toks.push({text: p, accent: Boolean(s.accent), space: /^\s+$/.test(p)});
    }
  }

  const revealable = toks.filter((t) => !t.space).length;
  const head = revealable * outCubic(prog(frame, from, to));

  /**
   * Runs of consecutive non-space tokens — i.e. words.
   *
   * Every letter is its own `inline-block`, and adjacent inline-blocks are break
   * opportunities: given a width to wrap in, the browser was free to break
   * BETWEEN TWO LETTERS. That is what split "rien" across two lines with the "n"
   * left alone underneath. Making the spaces `pre-wrap` had opened a break
   * opportunity at the spaces but never closed the ones inside the words.
   *
   * Grouping each word in a `nowrap` wrapper leaves the spaces as the only place
   * the line can break, which is what a line of type is supposed to do.
   */
  const groups: Tok[][] = [];
  for (const tok of toks) {
    const last = groups[groups.length - 1];
    if (tok.space || !last || last[0].space) groups.push([tok]);
    else last.push(tok);
  }

  let seen = 0;
  const letter = (tok: Tok, i: number) => {
    const idx = seen++;
    const e = softOut(Math.max(0, Math.min(1, head - idx)));
    if (e <= 0) return null;
    return (
      <span
        key={i}
        style={{
          display: 'inline-block',
          whiteSpace: 'pre',
          color: tok.accent ? accent : ink,
          opacity: e,
          // a gentle rise and a barely-there scale: the old 1.42 pop read
          // as the letters being thrown at the frame
          transform: `translateY(${(1 - e) * 0.16 * fontSize}px) scale(${
            1 + (1 - e) * 0.06
          })`,
          transformOrigin: '50% 70%',
          filter: `blur(${(1 - e) * 5}px)`,
        }}
      >
        {tok.text}
      </span>
    );
  };
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: weight,
        fontSize,
        letterSpacing,
        lineHeight: 1.14,
        // one line by default; given a width, it breaks inside it instead
        whiteSpace: maxWidth ? 'normal' : 'nowrap',
        maxWidth,
        textAlign: maxWidth ? 'center' : undefined,
        ...style,
      }}
    >
      {groups.map((g, gi) =>
        g[0].space ? (
          /*
            `pre` keeps the space from collapsing but also forbids breaking at
            it — so when the line is allowed to wrap, the spaces have to be
            `pre-wrap`, which preserves them AND leaves the break opportunity.
            Without this the text simply overflows the width it was given.
          */
          <span key={gi} style={{whiteSpace: maxWidth ? 'pre-wrap' : 'pre'}}>
            {g[0].text}
          </span>
        ) : (
          <span key={gi} style={{whiteSpace: 'nowrap'}}>
            {g.map((tok, i) => letter(tok, i))}
          </span>
        )
      )}
    </div>
  );
};

/**
 * Scrolling variant: words append right, older ones fade away behind the head.
 *
 * The words sit in NATURAL inline flow, so the browser owns the spacing — an
 * earlier version positioned each word absolutely from an estimated advance
 * width, which quietly collided pairs like "gérer une" into "gérerune".
 * `transform: scale()` does not affect layout, so the per-word animation is
 * free to run without disturbing the flow. The estimate survives only to decide
 * how far the line has scrolled, where a few percent of error is invisible.
 */
export const KineticScroll: React.FC<{
  words: string[];
  accentFrom: number;
  keepFrom: number;
  frame: number;
  from: number;
  land: number;
  settle: number;
  fontSize: number;
  tone?: 'light' | 'dark';
  y: number;
}> = ({
  words,
  accentFrom,
  keepFrom,
  frame,
  from,
  land,
  settle,
  fontSize,
  tone = 'dark',
  y,
}) => {
  const ink = tone === 'dark' ? C.inkDark : C.ink;
  const accent = tone === 'dark' ? C.blue350 : C.blue600;

  const NARROW = "iljtfr'’.,àéèIîï";
  const widthOf = (w: string) =>
    [...w].reduce((a, ch) => a + fontSize * (NARROW.includes(ch) ? 0.31 : 0.58), 0);
  const gap = fontSize * 0.29;

  const w = words.map(widthOf);
  const x: number[] = [];
  let acc = 0;
  for (const ww of w) {
    x.push(acc);
    acc += ww + gap;
  }
  const total = acc - gap;
  const tailW = total - x[keepFrom];

  const head = words.length * prog(frame, from, land);
  const shown = Math.max(1, Math.min(words.length, Math.ceil(head)));
  const headRight = x[shown - 1] + w[shown - 1];
  const scrollX = 0.76 * 1920 - headRight;
  const finalX = (1920 - tailW) / 2 - x[keepFrom];
  const t = softOut(prog(frame, land, settle));
  const shift = scrollX + (finalX - scrollX) * t;

  return (
    <div
      style={{
        position: 'absolute',
        left: shift,
        top: y,
        transform: 'translateY(-50%)',
        whiteSpace: 'nowrap',
        fontFamily: SANS,
        fontWeight: W_BOLD,
        fontSize,
        letterSpacing: '-0.028em',
      }}
    >
      {words.map((word, i) => {
        const p = Math.max(0, Math.min(1, head - i));
        const e = softOut(p);
        const fade =
          i < keepFrom ? 1 - prog(frame, land - 22 + i * 3.4, land - 12 + i * 3.4) : 1;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: gap,
              color: i >= accentFrom ? accent : ink,
              opacity: p <= 0 ? 0 : Math.min(1, e * 1.5) * Math.max(0, fade),
              transform: `translateY(${(1 - e) * 0.2 * fontSize}px) scale(${
                1 + (1 - e) * 0.08
              })`,
              transformOrigin: '0% 66%',
              filter: `blur(${(1 - e) * 6}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
