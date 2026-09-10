import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS} from '../theme';
import {Paper} from '../components/Grounds';
import {prog} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beat 12 — the payoff line, 28.5 -> 30 s.
 * "Vous percevez." is the site's own promise, so it carries the accent.
 */

const FROM = 2504;

/** Exactly where the transition disc lands, so the hand-over is invisible. */
export const BADGE_X = 960;
export const BADGE_Y = 516;

/**
 * Half the gap each phrase leaves for the badge. It was 46 px, which put the
 * 64 px disc 14 px from each phrase — it read as stuck to the comma rather than
 * as a mark of its own between the two halves. At 96 the badge sits in a clear
 * 54 px of space on both sides.
 */
const GAP = 96;

export const Simple: React.FC<{frame: number}> = ({frame}) => {
  const p1 = EASE.entrance(prog(frame, FROM + 46, FROM + 84));
  const p2 = EASE.entrance(prog(frame, FROM + 62, FROM + 104));
  // the transition disc contracts onto the badge and hands it over here
  const badge = prog(frame, 2570, 2582);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper wash={0.4} />
      {/*
        The two halves are anchored to the badge's exact centre rather than laid
        out by flexbox: the transition disc contracts onto this same point, and a
        24 px discrepancy was enough to show the disc's tick and the scene's tick
        side by side for a few frames.
      */}
      <div
        style={{
          position: 'absolute',
          left: BADGE_X - GAP,
          top: BADGE_Y,
          transform: `translate(-100%, -50%) scale(${1 + (1 - p1) * 0.03})`,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 94,
          letterSpacing: '-0.03em',
          color: C.ink,
          whiteSpace: 'nowrap',
          opacity: p1,
        }}
      >
        Nous gérons,
      </div>
      <div
        style={{
          position: 'absolute',
          left: BADGE_X + GAP,
          top: BADGE_Y,
          transform: `translateY(-50%) scale(${1 + (1 - p2) * 0.03})`,
          transformOrigin: '0% 50%',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 94,
          letterSpacing: '-0.03em',
          color: C.blue600,
          whiteSpace: 'nowrap',
          opacity: p2,
        }}
      >
        vous percevez.
      </div>
      <div
        style={{
          position: 'absolute',
          left: BADGE_X,
          top: BADGE_Y,
          transform: 'translate(-50%,-50%)',
          opacity: badge,
        }}
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

    </AbsoluteFill>
  );
};
