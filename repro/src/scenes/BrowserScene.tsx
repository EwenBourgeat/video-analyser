import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H} from '../theme';
import {ramp, outCubic, inCubic, prog, softOut} from '../ease';
import {ClockStage} from './ClockStage';
import {Plate} from '../components/Plate';

/**
 * Beat 3 — the white stage becomes the content of a macOS browser window and
 * the camera pulls back, 3.633 -> 5.767 s.
 *
 * Measured window rect (master space, tools measurement of the white page):
 *   f109  x 27..1891  y  29..1075   width 1864   titlebar top y=3
 *   f157  x 349..1568 y  99.. 781   width 1219   titlebar top y=51
 *   width settles at f~148; the fit against the progress table is easeOutCubic.
 *   From f157 the whole window slides down, easeInCubic (page y0 99 -> 557 by f172).
 */

const TITLEBAR = 48; // measured: page top 99 - titlebar top 51

export const BrowserScene: React.FC<{frame: number}> = ({frame}) => {
  // Iteration 3, re-measured after the decode-alignment fix.
  // The settled page is x 349..1568 (w 1219), y 224..907 — the previous
  // pageTop of 99 came from the corrupted vertical measurement.
  const pageW = ramp(frame, [109, 151], [1864, 1219], softOut);
  const pageH = pageW / (16 / 9);
  const cxPage = 954; // measured: window stays centred horizontally
  const pageTop = ramp(frame, [109, 151], [39, 234], softOut);

  // exit: accelerating slide downwards. Fitted to the measured page-top deltas
  // (f160 +8, f163 +37, f166 +93, f169 +200, f172 +458) -> easeInCubic over
  // f157..174 with a 700 px throw.
  // exit deltas measured from the settled top of 227:
  // f160 +16, f163 +53, f166 +117, f169 +232, f172 +498 -> easeInCubic, 725 throw
  const exitY = frame > 157 ? ramp(frame, [157, 176], [0, 725], inCubic) : 0;

  const pageLeft = cxPage - pageW / 2;
  const top = pageTop + exitY;
  const scale = pageW / W;

  // pause overlay: present by f=155, absent at f=145 -> ramps over f147..155
  const pauseP = prog(frame, 147, 155);
  const pauseR = 172 * (pageW / 1219) * (0.72 + 0.28 * outCubic(pauseP));

  return (
    <AbsoluteFill>
      <Plate name="gap" />
      <div
        style={{
          position: 'absolute',
          left: pageLeft,
          top: top - TITLEBAR * (pageW / 1219),
          width: pageW,
          height: pageH + TITLEBAR * (pageW / 1219),
          borderRadius: 18 * (pageW / 1219),
          overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,0,0,0.55)',
        }}
      >
        {/* title bar */}
        <div
          style={{
            height: TITLEBAR * (pageW / 1219),
            background: C.chrome,
            display: 'flex',
            alignItems: 'center',
            gap: 10 * (pageW / 1219),
            paddingLeft: 20 * (pageW / 1219),
          }}
        >
          {[C.chromeRed, C.chromeYellow, C.chromeGreen].map((col) => (
            <div
              key={col}
              style={{
                width: 20 * (pageW / 1219),
                height: 20 * (pageW / 1219),
                borderRadius: '50%',
                background: col,
              }}
            />
          ))}
        </div>

        {/* the clock stage, scaled into the window */}
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

      {/* pause overlay, drawn over the window */}
      {pauseP > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: cxPage,
            top: top + pageH * 0.437,
            transform: 'translate(-50%, -50%)',
            width: pauseR * 2,
            height: pauseR * 2,
            borderRadius: '50%',
            background: 'rgba(138,138,138,0.55)',
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
                width: pauseR * 0.2,
                height: pauseR * 0.78,
                borderRadius: pauseR * 0.09,
                background: C.white,
              }}
            />
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
