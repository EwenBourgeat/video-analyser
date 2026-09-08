import React from 'react';
import {C} from '../theme';

/**
 * The Scalead mark, redrawn from the source frames: a pointy-top hexagon in
 * brand blue, with two white bands cutting across it on the isometric axis so
 * the whole thing reads as stacked layers forming an "S".
 * (Vector reconstruction — the original file was not available.)
 */
export const ScaleadMark: React.FC<{size: number}> = ({size}) => {
  const s = size / 100;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="mkTop" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#4B9AF7" />
          <stop offset="100%" stopColor={C.blue500} />
        </linearGradient>
        <linearGradient id="mkBot" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#2E86F1" />
          <stop offset="100%" stopColor="#1E6FDA" />
        </linearGradient>
      </defs>
      {/* hexagon, points top and bottom */}
      <path d="M50 3 L92 27 V73 L50 97 L8 73 V27 Z" fill="url(#mkTop)" />
      {/* lower half slightly deeper, as in the source */}
      <path d="M8 50 L50 74 L92 50 V73 L50 97 L8 73 Z" fill="url(#mkBot)" />
      {/* two white bands on the isometric axis */}
      <path d="M18 44 L62 20 L78 29 L34 53 Z" fill="#FFFFFF" />
      <path d="M22 62 L66 38 L82 47 L38 71 Z" fill="#FFFFFF" />
      {/* re-cut the right edge so the bands read as folded layers */}
      <path d="M62 20 L78 29 L78 33 L62 24 Z" fill="#3B8FF4" opacity="0.0" />
      <g transform={`scale(${1})`} />
      {void s}
    </svg>
  );
};

export const ScaleadLockup: React.FC<{
  markSize: number;
  fontSize: number;
  gap?: number;
  wordOpacity?: number;
  children?: React.ReactNode;
}> = ({markSize, fontSize, gap = 24, wordOpacity = 1}) => (
  <div style={{display: 'flex', alignItems: 'center', gap}}>
    <ScaleadMark size={markSize} />
    <div
      style={{
        fontFamily: "'Poppins', 'Outfit', sans-serif",
        fontWeight: 400,
        fontSize,
        letterSpacing: '-0.01em',
        color: '#0A0A0A',
        opacity: wordOpacity,
      }}
    >
      Scalead<span style={{color: '#5B5B5B'}}>.ai</span>
    </div>
  </div>
);
