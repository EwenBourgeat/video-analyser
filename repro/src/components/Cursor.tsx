import React from 'react';

/** The arrow pointer used in beats 11 and 28: black fill, thick white outline. */
export const Cursor: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 1.32} viewBox="0 0 44 58">
    <path
      d="M5 3 L39 30 L24.5 32.5 L33 49 L25 53 L17 36 L5 46 Z"
      fill="#2D2D2D"
      stroke="#FFFFFF"
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
  </svg>
);
