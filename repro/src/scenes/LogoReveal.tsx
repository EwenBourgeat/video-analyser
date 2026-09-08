import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, FONT} from '../theme';
import {P} from '../tunables';
import {ScaleadMark} from '../components/ScaleadLogo';
import {ramp, outQuint, outCubic, prog, softOut, softOutQuint} from '../ease';

/**
 * Beat 8 — logo reveal on white, 18.167 -> 19.7 s.
 *
 * Iteration 2: the mark is ~300 px across (round 1 used 230 and reached full
 * size far too late — the source is already settled by f=556), the lockup sits
 * above centre with the wordmark under it, and a blue rounded bracket draws
 * itself around the mark. Halos are soft concentric pale-blue discs.
 */

const FROM = 545;
// the SVG box is larger than the visible hexagon (it spans 8..92 of the 100 grid),
// so a 365 box gives the 307 px mark measured in the source
let MARK = 365;
const WORD = 'Scalead.ai';

export const LogoReveal: React.FC<{frame: number}> = ({frame}) => {
  const t = P();
  const p = prog(frame, FROM, FROM + 13);
  const e = softOutQuint(p);
  const scale = 0.06 + 0.94 * e;
  const rot = -44 * (1 - e);

  const halo = prog(frame, FROM + 3, FROM + 34);
  const wordP = prog(frame, FROM + 9, FROM + 32);
  const bracket = outCubic(prog(frame, FROM + 8, FROM + 30));

  const driftX = ramp(frame, [FROM + 34, FROM + 52], [0, 210], softOut);
  const wordOut = 1 - prog(frame, FROM + 34, FROM + 44);

  const chars = [...WORD];
  const shown = chars.length * outCubic(wordP);
  const cx = t.logoCX + driftX;
  const cy = t.logoCY;

  return (
    <AbsoluteFill style={{background: C.white, overflow: 'hidden'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <filter id="haloSoft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <g filter="url(#haloSoft)">
          {[
            [t.logoH1, '#E2EEFC'],
            [t.logoH2, '#D2E5FA'],
            [t.logoH3, '#C0DCF8'],
          ].map(([r, col], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy + 60}
              r={(r as number) * (0.4 + 0.6 * outCubic(halo))}
              fill={col as string}
            />
          ))}
        </g>

        {/* Measured from the source: the bracket runs down the LEFT side of the
            mark and along its bottom, drawing itself in as an open rounded box. */}
        <path
          d={`M ${cx + MARK * 0.02} ${cy - MARK * 0.56}
              h ${-MARK * 0.24}
              a ${MARK * 0.32} ${MARK * 0.32} 0 0 0 ${-MARK * 0.32} ${MARK * 0.32}
              v ${MARK * 0.4}
              a ${MARK * 0.32} ${MARK * 0.32} 0 0 0 ${MARK * 0.32} ${MARK * 0.32}
              h ${MARK * 0.42}`}
          fill="none"
          stroke={C.blue500}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={1000}
          strokeDashoffset={1000 * (1 - bracket)}
          opacity={0.92}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: cx - t.logoMark * 0.62,
          top: cy - t.logoMark * 0.62,
          width: t.logoMark * 1.24,
          height: t.logoMark * 1.24,
          borderRadius: t.logoMark * 0.29,
          background: 'rgba(255,255,255,0.92)',
          opacity: outCubic(halo),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cy,
          transform: `translate(-50%,-50%) scale(${scale}) rotate(${rot}deg)`,
        }}
      >
        <ScaleadMark size={t.logoMark} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: cx,
          top: t.logoWordY,
          transform: 'translateX(-50%)',
          fontFamily: "'Poppins', 'Outfit', sans-serif",
          fontWeight: 400,
          fontSize: t.logoWord,
          letterSpacing: '-0.012em',
          whiteSpace: 'pre',
          opacity: wordOut,
        }}
      >
        {chars.map((ch, i) => {
          const ce = outCubic(Math.max(0, Math.min(1, shown - i)));
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: ce,
                color: i >= 7 ? '#5B5B5B' : '#0A0A0A',
                transform: `translateY(${(1 - ce) * -16}px) scale(${1 + (1 - ce) * 0.45})`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
