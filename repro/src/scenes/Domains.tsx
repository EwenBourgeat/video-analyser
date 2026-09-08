import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, FONT} from '../theme';
import {P} from '../tunables';
import {ScaleadMark} from '../components/ScaleadLogo';
import {ramp, outCubic, outBack, prog, linear, softOut} from '../ease';

/**
 * Beat 9 — domain purchase, 19.7 -> 21.0 s.
 *
 * Iteration 2 sizing, measured off the source: pill 840 x 128 px on a 146 px
 * pitch (round 1 had 600 x 107 on 115), label ~46 px, tick badge 91 px across,
 * mark 270 px. The halo stack fills most of the right half of frame.
 */

const FROM = 591;
const DOMAINS = ['votre-entreprise.net', 'votre-entreprise.com', 'votre-entreprise.org'];
const MARK = 340;

const Spinner: React.FC<{size: number; frame: number}> = ({size, frame}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <g transform={`rotate(${frame * 12} 20 20)`}>
      <path
        d="M20 3.5 a16.5 16.5 0 1 1 -11.7 4.8"
        fill="none"
        stroke={C.blue500}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

const Tick: React.FC<{size: number; p: number}> = ({size, p}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    style={{transform: `scale(${outBack(p, 1.9)})`}}
  >
    <circle cx="20" cy="20" r="19" fill={C.blue600} />
    <path
      d="M11.5 20.5 L17.5 26.5 L28.5 14"
      fill="none"
      stroke="#fff"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Domains: React.FC<{frame: number}> = ({frame}) => {
  const t = P();
  const exit = ramp(frame, [FROM + 26, FROM + 42], [0, -560], softOut);
  const zoom = ramp(frame, [FROM, FROM + 40], [1.0, 1.1], linear);
  const hubX = t.domHubX + exit * 0.3;

  return (
    <AbsoluteFill style={{background: C.white, overflow: 'hidden'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <filter id="domHalo" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        <g filter="url(#domHalo)">
          <circle cx={hubX} cy={H / 2} r={t.domH1 * zoom} fill="#E7F1FD" />
          <circle cx={hubX} cy={H / 2} r={t.domH1 * 0.732 * zoom} fill="#D5E7FB" />
          <circle cx={hubX} cy={H / 2} r={t.domH1 * 0.5 * zoom} fill="#C3DCF8" />
        </g>
        {/* soft white card behind the mark */}
        <rect
          x={hubX - 150 * zoom}
          y={H / 2 - 150 * zoom}
          width={300 * zoom}
          height={300 * zoom}
          rx={70 * zoom}
          fill="#FFFFFF"
          opacity={0.7}
        />
        {/* bracket drawing itself on the right of the mark */}
        <path
          d={`M ${hubX - 20 * zoom} ${H / 2 - 165 * zoom}
              h ${95 * zoom}
              a ${72 * zoom} ${72 * zoom} 0 0 1 ${72 * zoom} ${72 * zoom}
              v ${186 * zoom}
              a ${72 * zoom} ${72 * zoom} 0 0 1 ${-72 * zoom} ${72 * zoom}
              h ${-95 * zoom}`}
          fill="none"
          stroke={C.blue500}
          strokeWidth={9 * zoom}
          strokeLinecap="round"
          strokeDasharray={1200}
          strokeDashoffset={1200 * (1 - outCubic(prog(frame, FROM - 8, FROM + 16)))}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: hubX,
          top: H / 2,
          transform: `translate(-50%,-50%) scale(${zoom})`,
        }}
      >
        <ScaleadMark size={t.domMark} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: t.domPillX + exit,
          top: H / 2,
          transform: `translateY(-50%) scale(${zoom})`,
          transformOrigin: '0 50%',
          display: 'flex',
          flexDirection: 'column',
          gap: t.domPillGap,
        }}
      >
        {DOMAINS.map((d, i) => {
          const inP = softOut(prog(frame, FROM - 6 + i * 3, FROM + 10 + i * 3));
          const done = prog(frame, FROM + 2 + i * 5, FROM + 8 + i * 5);
          return (
            <div
              key={d}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: t.domPillW,
                height: t.domPillH,
                paddingLeft: 46,
                paddingRight: 36,
                borderRadius: 26,
                background: C.white,
                boxShadow: '0 16px 40px rgba(28,72,130,0.14)',
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: t.domFont,
                color: '#111318',
                opacity: inP,
                transform: `translateX(${(1 - inP) * -100}px)`,
              }}
            >
              <span>{d}</span>
              {done > 0 ? (
                <Tick size={t.domTick} p={done} />
              ) : (
                <Spinner size={t.domTick} frame={frame - FROM} />
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
