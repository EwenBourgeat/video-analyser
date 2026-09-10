import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS} from '../theme';
import {useStage} from '../format';
import {Paper} from '../components/Grounds';
import {prog} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beat 12 — the payoff line.
 * "Vous percevez." is the site's own promise, so it carries the accent.
 *
 * 16:9 sets the two halves side by side with the check badge between them.
 * 4:5 stacks them, badge in the middle, because side by side the line runs about
 * 1 400 px and would have to drop to roughly 60 px to fit a 1080 frame. Stacked,
 * it keeps its full 94 px.
 */

const FROM = 2062;

/**
 * Where the transition disc lands, derived from the frame rather than fixed at
 * 960/516. The disc that floods out of the calendar's button contracts onto
 * exactly this point, and both it and the badge below read it from here — a
 * 24 px discrepancy once put two ticks on screen side by side for a few frames.
 */
export const badgeAt = (w: number, h: number) => ({x: w / 2, y: h * 0.478});

/** Side by side: half the gap each phrase leaves for the badge. */
const GAP = 96;
/** Stacked: how far each phrase sits from the badge. */
const STACK = 122;

const Tick: React.FC<{o: number; x: number; y: number}> = ({o, x, y}) => (
  <div
    style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o}}
  >
    <svg width={64} height={64} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill={C.blue600} />
      <path
        d="M12 20.5 L17.5 26 L28 14.5"
        fill="none"
        stroke={C.paper}
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export const Simple: React.FC<{frame: number}> = ({frame}) => {
  const {w, h, tall} = useStage();
  const badgePos = badgeAt(w, h);

  const p1 = EASE.entrance(prog(frame, FROM + 46, FROM + 84));
  const p2 = EASE.entrance(prog(frame, FROM + 62, FROM + 104));
  // the transition disc contracts onto the badge and hands it over here
  const badge = prog(frame, 2128, 2140);

  const type: React.CSSProperties = {
    position: 'absolute',
    fontFamily: SANS,
    fontWeight: 600,
    fontSize: 94,
    letterSpacing: '-0.03em',
    whiteSpace: 'nowrap',
  };

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper wash={0.4} />

      <div
        style={{
          ...type,
          left: tall ? badgePos.x : badgePos.x - GAP,
          top: tall ? badgePos.y - STACK : badgePos.y,
          transform: `translate(${tall ? '-50%' : '-100%'}, -50%) scale(${1 + (1 - p1) * 0.03})`,
          color: C.ink,
          opacity: p1,
        }}
      >
        Nous gérons,
      </div>

      <div
        style={{
          ...type,
          left: tall ? badgePos.x : badgePos.x + GAP,
          top: tall ? badgePos.y + STACK : badgePos.y,
          transform: tall
            ? `translate(-50%, -50%) scale(${1 + (1 - p2) * 0.03})`
            : `translateY(-50%) scale(${1 + (1 - p2) * 0.03})`,
          transformOrigin: tall ? '50% 50%' : '0% 50%',
          color: C.blue600,
          opacity: p2,
        }}
      >
        vous percevez.
      </div>

      <Tick o={badge} x={badgePos.x} y={badgePos.y} />
    </AbsoluteFill>
  );
};
