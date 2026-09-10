import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {useStage} from '../format';
import {ramp, inCubic, prog} from '../../ease';
import {EASE} from '../../bezier';
import {ClockStage} from './ClockStage';
import {Ink} from '../components/Grounds';

/**
 * Beat 3 — the whole thing turns out to be a screen, 4.5 -> 7.0 s.
 *
 * The paper stage becomes the content of a browser window and the camera pulls
 * back onto the dark ground. softOut on the pull-back: an ease-out would have
 * the window snap away from rest on its first frame.
 */

const TITLEBAR = 52;

/**
 * The pull-back runs on the curve measured off the reference film, over the
 * same 80 frames (1.34 s) it takes there. It used to be a generic camera ease
 * over 96 frames, which is what made this cut feel abrupt at the front.
 */
const PULL_FROM = 300;
const PULL_TO = 380;

export const Browser: React.FC<{frame: number}> = ({frame}) => {
  /*
    The page inside the window is a scaled copy of the STAGE, not of the 16:9
    master — so in 4:5 the window is 4:5 too and the clock beat inside it lays
    itself out for that shape. Scaling a 1920-wide page into a 1080 frame would
    have cut a third of it off.
  */
  const {w: W, h: H, tall} = useStage();
  const FULL = tall ? W * 0.995 : 1900;
  const SETTLED = tall ? W * 0.87 : 1216;
  const pageW = ramp(frame, [PULL_FROM, PULL_TO], [FULL, SETTLED], EASE.pullback);
  const pageH = pageW * (H / W);
  const pageTop = ramp(frame, [PULL_FROM, PULL_TO], [22, (H - pageW * (H / W)) / 2], EASE.pullback);
  /**
   * The window has to be COMPLETELY out of frame before the cut, and it never
   * was: it slid down 780 px when 844 are needed to clear a 736 px-tall window
   * sitting at y = 236. So the beat cut on a window still halfway through its
   * exit — the abruptness was a sliced object, not a timing problem. 940 px,
   * finished by f458, leaves three clear frames before the boundary.
   */
  const exitY = frame > 418 ? ramp(frame, [418, 458], [0, 940], EASE.exit) : 0;

  const left = W / 2 - pageW / 2;
  const top = pageTop + exitY;
  const k = pageW / SETTLED;
  const scale = pageW / W;

  const pauseP = prog(frame, 396, 424);
  const pauseR = 150 * k * (0.74 + 0.26 * EASE.pop(pauseP));

  return (
    <AbsoluteFill>
      <Ink glow={0.9} />
      <div
        style={{
          position: 'absolute',
          left,
          top: top - TITLEBAR * k,
          width: pageW,
          height: pageH + TITLEBAR * k,
          borderRadius: 20 * k,
          overflow: 'hidden',
          boxShadow: '0 48px 130px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            height: TITLEBAR * k,
            background: '#1C1C20',
            display: 'flex',
            alignItems: 'center',
            gap: 11 * k,
            paddingLeft: 22 * k,
          }}
        >
          {['#FF5F57', '#FEBC2E', '#28C840'].map((col) => (
            <div
              key={col}
              style={{width: 21 * k, height: 21 * k, borderRadius: '50%', background: col}}
            />
          ))}
        </div>
        <div
          style={{
            position: 'relative',
            width: W,
            height: H,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          <ClockStage frame={frame} />
        </div>
      </div>

      {pauseP > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: W / 2,
            top: top + pageH * 0.5,
            transform: 'translate(-50%,-50%)',
            width: pauseR * 2,
            height: pauseR * 2,
            borderRadius: '50%',
            background: 'rgba(30,30,32,0.5)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: pauseR * 0.24,
            opacity: pauseP,
          }}
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                width: pauseR * 0.19,
                height: pauseR * 0.76,
                borderRadius: pauseR * 0.09,
                background: C.paper,
              }}
            />
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
