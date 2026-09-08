import React from 'react';

/**
 * The five step glyphs of beat 5, redrawn as SVG from the source frames.
 * Each is authored on a 24x24 grid and drawn in the brand blue.
 */
export type GlyphName = 'chat' | 'search' | 'mail' | 'flag' | 'phone';

const paths: Record<GlyphName, React.ReactNode> = {
  chat: (
    <>
      <path d="M3.2 5.6A2.4 2.4 0 0 1 5.6 3.2h12.8a2.4 2.4 0 0 1 2.4 2.4v8.2a2.4 2.4 0 0 1-2.4 2.4H9.1L5 19.9a.7.7 0 0 1-1.15-.55V5.6Z" />
      <rect x="6.4" y="7.2" width="9.6" height="1.9" rx="0.95" fill="#fff" />
      <rect x="6.4" y="10.9" width="6.2" height="1.9" rx="0.95" fill="#fff" />
    </>
  ),
  search: (
    <>
      <circle cx="10.4" cy="10.4" r="6.4" />
      <circle cx="10.4" cy="10.4" r="3.9" fill="#fff" />
      <rect
        x="14.4"
        y="15.6"
        width="7"
        height="2.9"
        rx="1.45"
        transform="rotate(43 14.4 15.6)"
      />
    </>
  ),
  mail: (
    <>
      <rect x="2.6" y="5.2" width="18.8" height="13.6" rx="2.6" />
      <path
        d="M3.9 7.4 12 13.1l8.1-5.7"
        fill="none"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  flag: (
    <>
      <rect x="4.1" y="2.9" width="2.2" height="18.2" rx="1.1" />
      <path d="M7.1 3.6h11.6c.8 0 1.2.9.7 1.5l-2.7 3.2 2.7 3.2c.5.6.1 1.5-.7 1.5H7.1Z" />
    </>
  ),
  phone: (
    <path d="M7.6 3.3c.7 0 1.3.4 1.6 1l1.3 3a1.8 1.8 0 0 1-.45 2.05l-1.1 1a12.4 12.4 0 0 0 4.7 4.7l1-1.1a1.8 1.8 0 0 1 2.05-.45l3 1.3c.6.3 1 .9 1 1.6v2.3a2 2 0 0 1-2.2 2A17.6 17.6 0 0 1 3.5 5.5a2 2 0 0 1 2-2.2Z" />
  ),
};

export const Glyph: React.FC<{
  name: GlyphName;
  size: number;
  color: string;
}> = ({name, size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    {paths[name]}
  </svg>
);
