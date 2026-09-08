import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Video';
import {W, H, FPS, TOTAL_FRAMES} from './theme';
import {Intendant} from './intendant/Video';
import {
  W as IW,
  H as IH,
  FPS as IFPS,
  TOTAL_FRAMES as ITOTAL,
} from './intendant/theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Scalead"
      component={Main}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={W}
      height={H}
    />
    <Composition
      id="Intendant"
      component={Intendant}
      durationInFrames={ITOTAL}
      fps={IFPS}
      width={IW}
      height={IH}
    />
  </>
);
