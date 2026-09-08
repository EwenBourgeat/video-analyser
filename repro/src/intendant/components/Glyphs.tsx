import React from 'react';

/** Icons for the five service steps, authored on a 24x24 grid. */
export type GlyphName =
  | 'camera'
  | 'chart'
  | 'key'
  | 'sparkle'
  | 'report'
  | 'star'
  | 'phone';

const paths: Record<GlyphName, React.ReactNode> = {
  camera: (
    <>
      <path d="M3.4 7.6h3.4l1.5-2.3h7.4l1.5 2.3h3.4a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8H3.4a1.8 1.8 0 0 1-1.8-1.8V9.4a1.8 1.8 0 0 1 1.8-1.8Z" />
      <circle cx="12" cy="13.4" r="4.6" fill="#fff" />
      <circle cx="12" cy="13.4" r="2.6" />
    </>
  ),
  chart: (
    <>
      <rect x="2.6" y="13.2" width="4.2" height="8.2" rx="1.3" />
      <rect x="9.9" y="8.4" width="4.2" height="13" rx="1.3" />
      <rect x="17.2" y="3.4" width="4.2" height="18" rx="1.3" />
    </>
  ),
  key: (
    <>
      <circle cx="7.6" cy="8.4" r="5.4" />
      <circle cx="7.6" cy="8.4" r="2.1" fill="#fff" />
      <path d="M10.9 11.7 21 21.8l-2.4 0-1.6-1.6-1.7 1.7-1.9-1.9 1.7-1.7-1.7-1.7-2.3 2.3-2.3-2.3Z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 1.8l2.2 6.1 6.1 2.2-6.1 2.2-2.2 6.1-2.2-6.1-6.1-2.2 6.1-2.2Z" />
      <path d="M18.9 15.2l1.1 3 3 1.1-3 1.1-1.1 3-1.1-3-3-1.1 3-1.1Z" />
    </>
  ),
  report: (
    <>
      <path d="M5.4 2.4h8.2l5.4 5.4v13.8a1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8V4.2a1.8 1.8 0 0 1 1.8-1.8Z" />
      <path d="M13.6 2.4 19 7.8h-5.4Z" fill="#fff" opacity="0.55" />
      <rect x="7" y="12" width="4" height="7" rx="1" fill="#fff" />
      <rect x="12.6" y="9.2" width="4" height="9.8" rx="1" fill="#fff" />
    </>
  ),
  star: (
    <path d="M12 2.2l3 6.4 6.9.9-5 4.9 1.2 6.9L12 18l-6.1 3.3 1.2-6.9-5-4.9 6.9-.9Z" />
  ),
  phone: (
    <path d="M7.6 3.3c.7 0 1.3.4 1.6 1l1.3 3a1.8 1.8 0 0 1-.45 2.05l-1.1 1a12.4 12.4 0 0 0 4.7 4.7l1-1.1a1.8 1.8 0 0 1 2.05-.45l3 1.3c.6.3 1 .9 1 1.6v2.3a2 2 0 0 1-2.2 2A17.6 17.6 0 0 1 3.5 5.5a2 2 0 0 1 2-2.2Z" />
  ),
};

export const Glyph: React.FC<{name: GlyphName; size: number; color: string}> = ({
  name,
  size,
  color,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    {paths[name]}
  </svg>
);

/** Five-star row used on the owner-review cards. */
export const Stars: React.FC<{size: number; color: string}> = ({size, color}) => (
  <div style={{display: 'flex', gap: size * 0.18}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <Glyph key={i} name="star" size={size} color={color} />
    ))}
  </div>
);
