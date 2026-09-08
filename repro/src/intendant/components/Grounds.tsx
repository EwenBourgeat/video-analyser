import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';

/** Light ground with a cool blue wash rising from the lower third. */
export const Paper: React.FC<{wash?: number}> = ({wash = 1}) => (
  <AbsoluteFill style={{background: C.paper}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 85% at 50% 112%, rgba(24,120,236,${
          0.10 * wash
        }) 0%, rgba(24,120,236,${0.038 * wash}) 34%, rgba(255,255,255,0) 70%)`,
      }}
    />
  </AbsoluteFill>
);

/** Dark ground with the blue glow low, exactly the Scalead construction. */
export const Ink: React.FC<{glow?: number}> = ({glow = 1}) => (
  <AbsoluteFill style={{background: C.paperDark}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(118% 80% at 50% 116%, rgba(31,110,190,${
          0.52 * glow
        }) 0%, rgba(18,51,87,${0.30 * glow}) 34%, rgba(17,23,28,0) 70%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(62% 46% at 7% 32%, rgba(24,72,120,${
          0.24 * glow
        }) 0%, rgba(17,23,28,0) 72%)`,
      }}
    />
  </AbsoluteFill>
);
