import React from 'react';
import {AbsoluteFill} from 'remotion';
import {W, H} from '../theme';
import {Paper} from '../components/Grounds';
import {Mark} from '../components/Brand';
import {ramp, softOut, softOutQuint, prog} from '../../ease';

/**
 * Beat 8 — the mark lands, 32.5 -> 33.7 s.
 *
 * The mark alone now. This beat used to spell out "L'Intendant" and then
 * "CONCIERGERIE · TOULOUSE" beneath it, which is the same information the end
 * card already carries in full — so the words were saying twice what only needs
 * saying once, and they set the beat's length: it ran 2.3 s because that is how
 * long two lines of type take to arrive and be read.
 *
 * With nothing to read it is a punctuation rather than a stop: the diamond
 * arrives, holds for a breath, and leaves to the right. 1.2 s.
 *
 * It still grows on softOutQuint — a bare outQuint launches at five times its
 * average speed, which is exactly the snap this project has been correcting
 * everywhere else.
 */

const FROM = 1545;
const MARK = 300;

/**
 * The beat has to hand the mark over to the distribution beat mid-flight: that
 * scene picks it up at x = W * 0.72 and size 300, and slides it left from there.
 * So the drift must finish at exactly +422 from centre (960 + 422 = 1382 =
 * W * 0.72), fully settled before the last frame of the beat. Change these and
 * the seam between the two scenes reopens.
 */
const DRIFT_TO = 422;
const DRIFT_FROM_F = FROM + 32;
const DRIFT_TO_F = FROM + 70;

export const LogoReveal: React.FC<{frame: number}> = ({frame}) => {
  const e = softOutQuint(prog(frame, FROM, FROM + 28));
  const scale = 0.08 + 0.92 * e;
  const rot = -38 * (1 - e);
  const cx = W / 2;
  const cy = H / 2 - 44;
  const driftX = ramp(frame, [DRIFT_FROM_F, DRIFT_TO_F], [0, DRIFT_TO], softOut);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper wash={0.55} />
      <div
        style={{
          position: 'absolute',
          left: cx + driftX,
          top: cy,
          transform: `translate(-50%,-50%) scale(${scale}) rotate(${rot}deg)`,
        }}
      >
        <Mark size={MARK} />
      </div>
    </AbsoluteFill>
  );
};
