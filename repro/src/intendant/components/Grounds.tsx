import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';

/** Light ground with a warm red wash rising from the lower third. */
export const Paper: React.FC<{wash?: number}> = ({wash = 1}) => (
  <AbsoluteFill style={{background: C.paper}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 85% at 50% 112%, rgba(148,17,1,${
          0.10 * wash
        }) 0%, rgba(148,17,1,${0.038 * wash}) 34%, rgba(255,255,255,0) 70%)`,
      }}
    />
  </AbsoluteFill>
);

/** Dark ground with the ember glow low, same construction as the blue version on main. */
export const Ink: React.FC<{glow?: number}> = ({glow = 1}) => (
  <AbsoluteFill style={{background: C.paperDark}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(118% 80% at 50% 116%, rgba(170,89,60,${
          0.52 * glow
        }) 0%, rgba(91,49,37,${0.30 * glow}) 34%, rgba(45,31,26,0) 70%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(62% 46% at 7% 32%, rgba(106,61,41,${
          0.24 * glow
        }) 0%, rgba(45,31,26,0) 72%)`,
      }}
    />
  </AbsoluteFill>
);
