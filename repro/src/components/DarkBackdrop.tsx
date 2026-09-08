import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';

/**
 * The dark scenes all share one backdrop: a flat #11171C ground with a wide
 * blue radial glow rising from the bottom centre (measured #123357 at the
 * brightest point, falling to the base colour by mid-frame).
 */
export const DarkBackdrop: React.FC<{glow?: number}> = ({glow = 1}) => (
  <AbsoluteFill style={{background: C.dark}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% 118%, rgba(31,110,190,${
          0.55 * glow
        }) 0%, rgba(18,51,87,${0.42 * glow}) 32%, rgba(17,23,28,0) 68%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(70% 50% at 8% 42%, rgba(24,72,120,${
          0.28 * glow
        }) 0%, rgba(17,23,28,0) 70%)`,
      }}
    />
  </AbsoluteFill>
);
