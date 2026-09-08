import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, FONT} from '../theme';
import {Cursor} from '../components/Cursor';
import {ramp, outCubic, outBack, prog, softOut} from '../ease';

/**
 * Beat 11b — "Simple, non ?", 25.0 -> 25.77 s.
 * The two words land, a blue tick badge pops between them, the cursor rests
 * just below and to the right.
 */

const FROM = 750;
const TO = 773;

export const SimpleNon: React.FC<{frame: number}> = ({frame}) => {
  const p1 = softOut(prog(frame, FROM, FROM + 11));
  const p2 = softOut(prog(frame, FROM + 5, FROM + 16));
  const badge = prog(frame, FROM + 11, FROM + 20);
  const cy = ramp(frame, [FROM, FROM + 18], [700, 640], softOut);

  return (
    <AbsoluteFill style={{background: C.white, overflow: 'hidden'}}>
      {/* the source carries a wide, very soft grey falloff across the lower half */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(75% 45% at 50% 92%, rgba(126,140,158,0.16) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          transform: 'translateX(22px)',   // measured residual dx
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 86,
          letterSpacing: '-0.02em',
        }}
      >
        <span
          style={{
            color: '#3B8CF5',
            opacity: p1,
            transform: `scale(${1 + (1 - p1) * 0.5})`,
            display: 'inline-block',
          }}
        >
          Simple,
        </span>
        {badge > 0 ? (
          <span
            style={{
              display: 'inline-flex',
              transform: `scale(${outBack(badge, 2.1)})`,
              filter: 'drop-shadow(0 0 22px rgba(59,140,245,0.5))',
            }}
          >
            <svg width={60} height={60} viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill={C.blue600} />
              <path
                d="M12 20.5 L17.5 26 L28 14.5"
                fill="none"
                stroke="#fff"
                strokeWidth="4.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : null}
        <span
          style={{
            color: C.ink,
            opacity: p2,
            transform: `scale(${1 + (1 - p2) * 0.5})`,
            display: 'inline-block',
          }}
        >
          non ?
        </span>
      </div>

      <div style={{position: 'absolute', left: W / 2 + 20, top: cy}}>
        <Cursor size={150} />
      </div>
      {void TO}
      {void H}
    </AbsoluteFill>
  );
};
