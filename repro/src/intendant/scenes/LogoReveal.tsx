import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, SANS} from '../theme';
import {Paper} from '../components/Grounds';
import {Mark, Wordmark} from '../components/Brand';
import {ramp, softOut, softOutQuint, prog} from '../../ease';

/**
 * Beat 8 — the mark lands, 20.5 -> 22.7 s.
 * Arrives small and turned, grows on softOutQuint (a bare outQuint would launch
 * at five times its average speed), with concentric brick washes opening behind
 * it and the wordmark typing on after.
 */

const FROM = 1424;
const MARK = 300;

export const LogoReveal: React.FC<{frame: number}> = ({frame}) => {
  const e = softOutQuint(prog(frame, FROM, FROM + 30));
  const scale = 0.08 + 0.92 * e;
  const rot = -38 * (1 - e);
  const word = prog(frame, FROM + 22, FROM + 70);
  const cx = W / 2;
  const cy = H / 2 - 44;
  const driftX = ramp(frame, [FROM + 74, FROM + 128], [0, 422], softOut);
  const tail = 1 - prog(frame, FROM + 84, FROM + 106);

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

      <div
        style={{
          position: 'absolute',
          left: cx + driftX,
          top: cy + 250,
          transform: 'translateX(-50%)',
          opacity: tail,
        }}
      >
        <Wordmark size={80} shown={softOut(word)} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: cx + driftX,
          top: cy + 348,
          transform: 'translateX(-50%)',
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 32,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: C.muted,
          opacity: softOut(prog(frame, FROM + 54, FROM + 84)) * tail,
        }}
      >
        Conciergerie · Toulouse
      </div>
    </AbsoluteFill>
  );
};
