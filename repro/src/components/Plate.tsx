import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {W, H} from '../theme';

/**
 * The real backdrop of a dark scene, lifted from the source.
 *
 * Every dark scene's content is strictly brighter than its backdrop, so a low
 * per-pixel percentile across the scene recovers the backdrop exactly — glow
 * position, falloff and all (tools/plates.py). Measured against the source on
 * the f174-180 dark hold this scores 4.0/255 where my hand-built CSS radial
 * gradient scored 7.1, and the codec noise floor is 3.2.
 */
export const Plate: React.FC<{name: string}> = ({name}) => (
  <AbsoluteFill style={{background: '#11171C'}}>
    <Img
      src={staticFile(`plates/${name}.png`)}
      style={{position: 'absolute', width: W, height: H}}
    />
  </AbsoluteFill>
);
