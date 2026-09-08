import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, W, H, SANS, MONO, T} from '../theme';
import {Paper} from '../components/Grounds';
import {keyframes, prog} from '../../ease';
import {EASE} from '../../bezier';

/** The arrow pointer: dark fill, thick paper outline. */
export const Cursor: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 1.32} viewBox="0 0 44 58">
    <path
      d="M5 3 L39 30 L24.5 32.5 L33 49 L25 53 L17 36 L5 46 Z"
      fill={C.inkSoft}
      stroke={C.paper}
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Beat 11 — the calendar, 31.4 -> 34.7 s.
 *
 * Three notes drove this rewrite.
 *
 * 1. It zoomed immediately, so there was never a wide shot to read: "on
 *    comprend pas du tout ce qui se passe". The beat now opens on a full view
 *    of the bookings and HOLDS there for a second and a half before the camera
 *    starts moving at all.
 * 2. The push-in runs on a Bezier (EASE.camera) rather than a keyframe table,
 *    so it eases in and out instead of gliding at a flat rate — and it is far
 *    gentler than before.
 * 3. The rows had to read as real bookings, so each one now carries a guest
 *    photo, the platform, the dates, the number of nights and the payout, the
 *    way a channel manager actually lists them.
 */

const FROM = T.calendar.from;
const TO = T.calendar.to;

/** The wide shot holds until here, then the camera starts. */
const ZOOM_FROM = FROM + 100;
const CLICK = FROM + 170;

type Row = {
  when: string;
  nights: string;
  who: string;
  platform: string;
  amount: string;
  photo: string;
};

const ROWS: Row[] = [
  {when: '12 — 15 mars', nights: '3 nuits', who: 'Camille D.', platform: 'Airbnb', amount: '412 €', photo: 'p01'},
  {when: '18 — 21 mars', nights: '3 nuits', who: 'Thomas B.', platform: 'Booking.com', amount: '268 €', photo: 'p02'},
  {when: '24 — 29 mars', nights: '5 nuits', who: 'Léa M.', platform: 'Abritel', amount: '540 €', photo: 'p03'},
  {when: '02 — 05 avril', nights: '3 nuits', who: 'Marco R.', platform: 'Airbnb', amount: '327 €', photo: 'p04'},
  {when: '09 — 13 avril', nights: '4 nuits', who: 'Sofia L.', platform: 'Expedia', amount: '455 €', photo: 'p05'},
  {when: '16 — 20 avril', nights: '4 nuits', who: 'Hugo P.', platform: 'Airbnb', amount: '388 €', photo: 'p06'},
];

const PITCH = 176;
const BTN_ROW = 2;

/**
 * Framing at the end of the push-in. Locking the pill to the centre of frame
 * left the right third of the picture empty — the rows simply end before it. So
 * the lock is expressed on the ROW's right edge instead: it is held a fixed
 * margin inside the frame, and the pill's screen position follows from that. The
 * camera still converges on the click by construction, and the picture stays
 * full.
 */
const RIGHT_MARGIN = 150;
const TARGET_Y = H / 2;

const WIDE: [number, number][] = [[FROM, 0.62], [ZOOM_FROM, 0.62]];

export const Calendar: React.FC<{frame: number}> = ({frame}) => {
  // wide shot, then a slow Bezier push-in — 0.62 to 1.22, not 0.84 to 2.15
  const push = EASE.camera(prog(frame, ZOOM_FROM, TO - 10));
  const zoom = keyframes(frame, WIDE) + (1.22 - 0.62) * push;

  // solved from the row's own box model, so the pointer cannot miss it
  const ROW_L = 70;
  const ROW_W = W - 140;
  const BTN_WX = ROW_L + ROW_W - 30 - 150;
  const BTN_WY = BTN_ROW * PITCH + 68;

  // the two values that hold the row's right edge and the pressed row in frame
  const panLock = ROW_L + ROW_W - W / 2 - (W - RIGHT_MARGIN - W / 2) / zoom;
  const scrollLock = BTN_WY - H / 2 - (TARGET_Y - H / 2) / zoom;
  const conv = EASE.smooth(prog(frame, ZOOM_FROM, CLICK - 10));
  const panX = panLock * conv;
  const scroll = (BTN_WY - H / 2 + 40) * (1 - conv) + scrollLock * conv;

  /**
   * The click: the shockwave rings are gone — they were the "onde de choc" that
   * was called out. In their place the pill dips, turns green and relabels
   * itself, which is what a confirmation actually does.
   */
  const dip =
    frame >= CLICK && frame < CLICK + 16
      ? 1 - 0.055 * Math.sin((Math.PI * (frame - CLICK)) / 16)
      : 1;
  const go = EASE.smooth(prog(frame, CLICK + 4, CLICK + 30));
  const btnBg = go < 0.5 ? C.blue600 : C.green;
  const swap = prog(frame, CLICK + 8, CLICK + 22);

  // pointer, projected through the same transform as the rows
  const btnX = W / 2 + zoom * (BTN_WX - W / 2 - panX);
  const btnY = H / 2 + zoom * (BTN_WY - H / 2 - scroll);
  const CUR = 190;
  const tipX = (CUR * 5) / 44;
  const tipY = (CUR * 1.32 * 3) / 58;
  const travel = EASE.entrance(prog(frame, ZOOM_FROM + 10, CLICK));
  const cx = 1780 + (btnX - 1780) * travel - tipX;
  const cy = 1040 + (btnY - 1040) * travel - tipY;

  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <Paper wash={0.35} />
      <div
        style={{
          position: 'absolute',
          left: W / 2,
          top: H / 2,
          width: W,
          height: H,
          transform: `scale(${zoom}) translate(${-W / 2 - panX}px, ${-H / 2 - scroll}px)`,
          transformOrigin: '0 0',
        }}
      >
        {ROWS.map((r, i) => {
          const p = EASE.entrance(prog(frame, FROM + i * 9, FROM + 44 + i * 9));
          const isBtn = i === BTN_ROW;
          return (
            <div
              key={r.when}
              style={{
                position: 'absolute',
                left: ROW_L,
                top: i * PITCH,
                width: ROW_W,
                height: 136,
                borderRadius: 22,
                background: '#FDFEFF',
                border: `1px solid ${C.line}`,
                boxShadow: '0 8px 22px rgba(20,50,90,0.06)',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 30,
                paddingRight: 30,
                gap: 26,
                fontFamily: SANS,
                opacity: p,
                transform: `translateY(${(1 - p) * 30}px)`,
              }}
            >
              <Img
                src={staticFile(`people/${r.photo}.jpg`)}
                style={{width: 72, height: 72, borderRadius: '50%', objectFit: 'cover'}}
              />
              <div style={{minWidth: 300}}>
                <div style={{fontWeight: 600, fontSize: 34, color: C.ink}}>{r.who}</div>
                <div style={{fontWeight: 400, fontSize: 25, color: C.muted, marginTop: 2}}>
                  {r.platform}
                </div>
              </div>
              <div style={{minWidth: 340}}>
                <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 32, color: C.inkSoft}}>
                  {r.when}
                </div>
                <div style={{fontWeight: 400, fontSize: 25, color: C.muted, marginTop: 2}}>
                  {r.nights}
                </div>
              </div>
              <div
                style={{
                  marginLeft: 'auto',
                  fontFamily: MONO,
                  fontWeight: 500,
                  fontSize: 40,
                  color: C.blue600,
                  marginRight: isBtn ? 34 : 0,
                }}
              >
                {r.amount}
              </div>
              {isBtn ? (
                <div
                  style={{
                    width: 300,
                    height: 84,
                    borderRadius: 42,
                    background: btnBg,
                    color: C.paper,
                    fontWeight: 500,
                    fontSize: 34,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    transform: `scale(${dip})`,
                    boxShadow:
                      go > 0.5
                        ? '0 10px 26px rgba(22,163,74,0.34)'
                        : '0 10px 26px rgba(24,120,236,0.32)',
                    transition: 'none',
                  }}
                >
                  {swap < 0.5 ? (
                    <span style={{opacity: 1 - swap * 2}}>Confirmer</span>
                  ) : (
                    <span
                      style={{
                        opacity: (swap - 0.5) * 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <svg width={30} height={30} viewBox="0 0 40 40">
                        <path
                          d="M11 20.5 L17.5 27 L29 14"
                          fill="none"
                          stroke={C.paper}
                          strokeWidth="4.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Confirmé
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div style={{position: 'absolute', left: cx, top: cy}}>
        <Cursor size={CUR} />
      </div>
    </AbsoluteFill>
  );
};
