import React from 'react';
import {C, SANS} from '../theme';

/**
 * The real L'Intendant mark, supplied by the client: a diamond carrying a serif
 * capital I. It replaces the brick arch monogram I had drawn.
 *
 * Rebuilt as vector rather than dropped in as the PNG, so it stays crisp at any
 * size and can invert cleanly — the supplied file is black-on-white, which
 * would vanish on the dark grounds.
 */
export const Mark: React.FC<{size: number; tone?: 'light' | 'dark'}> = ({
  size,
  tone = 'light',
}) => {
  const solid = tone === 'dark' ? C.inkDark : C.ink;
  const counter = tone === 'dark' ? C.paperDark : C.paper;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect
        x="50"
        y="0"
        width="70.71"
        height="70.71"
        rx="2.5"
        transform="rotate(45 50 0)"
        fill={solid}
      />
      {/*
        The I was an SVG <text> in a serif face that was never actually loaded,
        so it fell back and re-rasterised every frame as the mark scaled — that
        is what read as the logo trembling. Drawn as paths it is deterministic
        and depends on no font at all.
      */}
      <g fill={counter}>
        <rect x="36.5" y="25" width="27" height="4.6" rx="0.6" />
        <rect x="45.6" y="25" width="8.8" height="50" rx="0.5" />
        <rect x="36.5" y="70.4" width="27" height="4.6" rx="0.6" />
      </g>
    </svg>
  );
};

export const Wordmark: React.FC<{
  size: number;
  tone?: 'light' | 'dark';
  shown?: number;
}> = ({size, tone = 'light', shown = 1}) => {
  const ink = tone === 'dark' ? C.inkDark : C.ink;
  const chars = [..."L'Intendant"];
  const n = chars.length * shown;
  return (
    <span
      style={{
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: '-0.022em',
        color: ink,
        whiteSpace: 'pre',
      }}
    >
      {chars.map((ch, i) => {
        const e = Math.max(0, Math.min(1, n - i));
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: e,
              transform: `translateY(${(1 - e) * -0.1 * size}px)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

export const Lockup: React.FC<{
  markSize: number;
  fontSize: number;
  tone?: 'light' | 'dark';
  shown?: number;
  gap?: number;
}> = ({markSize, fontSize, tone = 'light', shown = 1, gap = 24}) => (
  <div style={{display: 'flex', alignItems: 'center', gap}}>
    <Mark size={markSize} tone={tone} />
    <Wordmark size={fontSize} tone={tone} shown={shown} />
  </div>
);
