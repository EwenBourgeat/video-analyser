import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, FONT} from '../theme';
import {P} from '../tunables';
import {Cursor} from '../components/Cursor';
import {ramp, outCubic, prog, keyframes, softOut} from '../ease';

/**
 * Beat 11 — the agenda and the click, 22.1 -> 25.0 s.
 *
 * Iteration 2, measured: at f=680 the row pitch is 227 px with the time label at
 * ~100 px and the meeting label at ~68 px; by f=720 the pitch is 395 px, so the
 * push-in is a factor of 1.74 across those 40 frames. Round 1 was over-zoomed
 * from the start, which pushed the time column out of frame.
 */

const FROM = 663;
const TO = 750;
const CLICK = 736;

const ROWS: [string, string][] = [
  ['10:30', 'Réunion avec Sophie Martin'],
  ['11:15', 'Réunion avec Hugo Moreau'],
  ['12:00', 'Réunion avec Raphaël Garcia'],
  ['13:30', 'Réunion avec Jean Dumont'],
  ['14:00', 'Réunion avec Théo Dubois'],
  ['15:30', 'Réunion avec Lucas Bernard'],
  ['16:00', 'Réunion avec Camille Laurent'],
];

const ROW_PITCH = 227;
const BTN_ROW = 3;

// hoisted so ease.ts can cache their smoothed curves (keyed on array identity)
const ZOOM_KF: [number, number][] = [[FROM, 0.86], [680, 1.0], [720, 1.74], [TO, 2.3]];
const SCROLL_KF: [number, number][] = [[FROM, 80], [680, 221], [720, 205], [TO, 190]];
const PANX_KF: [number, number][] = [[FROM, -60], [680, 0], [720, 734], [TO, 900]];

export const Agenda: React.FC<{frame: number}> = ({frame}) => {
  const t = P();
  // zoom measured: 1.0 at f=680 -> 1.74 at f=720, continuing after
  // measured: row pitch is 227 px at f=680 (zoom 1.0) and 395 px at f=720 (1.74)
  const zoom = keyframes(frame, ZOOM_KF);
  // row 11:15 sits at y=200 at f=680; the stack scrolls slowly upward
  const scroll = keyframes(frame, SCROLL_KF);
  // the push-in is not centred: the camera also tracks right so the "Rejoindre"
  // pill stays in frame (source has it at screen centre by f=720)
  const panX = keyframes(frame, PANX_KF);

  const clickP = prog(frame, CLICK, CLICK + 13);
  const press =
    frame >= CLICK && frame < CLICK + 7
      ? 1 - 0.07 * Math.sin((Math.PI * (frame - CLICK)) / 7)
      : 1;

  const cx = ramp(frame, [FROM + 24, CLICK], [1680, 1210], softOut);
  const cy = ramp(frame, [FROM + 24, CLICK], [1020, 560], softOut);

  return (
    <AbsoluteFill style={{background: C.white, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: W / 2 + t.agDX,
          top: H / 2 + t.agDY,
          width: W,
          height: H,
          transform: `scale(${zoom * t.agZoom}) translate(${-W / 2 - panX}px, ${-H / 2 - scroll}px)`,
          transformOrigin: '0 0',
        }}
      >
        {ROWS.map(([time, label], i) => {
          const p = outCubic(prog(frame, FROM + i * 4, FROM + 16 + i * 4));
          return (
            <div
              key={time}
              style={{
                position: 'absolute',
                left: 40,
                top: i * ROW_PITCH,
                width: W - 80,
                height: t.agRowH,
                borderRadius: t.agRadius,
                background: '#F3F7FB',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 44,
                paddingRight: 36,
                gap: 44,
                fontFamily: FONT,
                transform: `rotate(-1.5deg) translateY(${(1 - p) * 46}px)`,
                opacity: p,
              }}
            >
              <span style={{fontWeight: 700, fontSize: t.agTime, color: '#0C0D10'}}>
                {time}
              </span>
              <span style={{fontWeight: 500, fontSize: t.agFont, color: '#111318'}}>
                {label}
              </span>
              {i === BTN_ROW ? (
                <div
                  style={{
                    marginLeft: 'auto',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 300,
                    height: 100,
                    borderRadius: 50,
                    background: `linear-gradient(100deg, ${C.blue500}, ${C.blue350})`,
                    color: C.white,
                    fontWeight: 500,
                    fontSize: 42,
                    transform: `scale(${press})`,
                    boxShadow: '0 12px 30px rgba(46,134,241,0.35)',
                  }}
                >
                  Rejoindre
                  {clickP > 0 && clickP < 1
                    ? [0, 0.35].map((d, k) => {
                        const q = Math.max(0, Math.min(1, (clickP - d) / (1 - d)));
                        if (q <= 0) return null;
                        return (
                          <span
                            key={k}
                            style={{
                              position: 'absolute',
                              width: 300,
                              height: 300,
                              borderRadius: '50%',
                              border: `5px solid ${C.blue500}`,
                              opacity: (1 - q) * 0.5,
                              transform: `scale(${0.35 + q * 1.1})`,
                            }}
                          />
                        );
                      })
                    : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div style={{position: 'absolute', left: cx, top: cy}}>
        <Cursor size={210} />
      </div>
    </AbsoluteFill>
  );
};
