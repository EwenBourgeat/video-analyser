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
import {PW, PH} from './intendant/format';

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
    {/*
      The feed cut. Same component, same timeline, same pixel scale — the scenes
      read the real viewport through useStage() and lay themselves out for it.
      See format.ts for why this is a re-layout and not a crop.
    */}
    <Composition
      id="Intendant45"
      component={Intendant}
      durationInFrames={ITOTAL}
      fps={IFPS}
      width={PW}
      height={PH}
    />
  </>
);
