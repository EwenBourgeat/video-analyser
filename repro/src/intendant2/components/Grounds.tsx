import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';

/**
 * Le fond du film #2 : crème, avec un voile de sable qui monte du bas.
 *
 * Même construction que le `Paper` du #1 — une base et un dégradé radial bas —
 * mais dans les deux neutres de la charte qui n'y servaient presque à rien.
 * C'est ce qui fait que les deux publicités se reconnaissent comme la même
 * marque sans se ressembler : même grammaire de fond, autre couleur.
 */
export const Sand: React.FC<{wash?: number}> = ({wash = 1}) => (
  <AbsoluteFill style={{background: C.cream}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 82% at 50% 112%, rgba(228,202,180,${
          0.92 * wash
        }) 0%, rgba(228,202,180,${0.42 * wash}) 38%, rgba(237,229,222,0) 72%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(58% 42% at 12% 14%, rgba(255,255,255,${
          0.7 * wash
        }) 0%, rgba(255,255,255,0) 70%)`,
      }}
    />
  </AbsoluteFill>
);
