import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS, W_MED, T} from '../theme';
import {useStage} from '../format';
import {Paper} from '../components/Grounds';
import {Mark} from '../components/Brand';
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

const FROM = T.simple.from;

/**
 * Where the transition disc lands, derived from the frame rather than fixed at
 * 960/516. The disc that floods out of the calendar's button contracts onto
 * exactly this point, and both it and the badge below read it from here — a
 * 24 px discrepancy once put two ticks on screen side by side for a few frames.
 */
export const badgeAt = (w: number, h: number) => ({x: w / 2, y: h * 0.478});

/** Side by side: half the gap each phrase leaves for the badge. */
const GAP = 96;
/**
 * Stacked: how far each phrase sits from the mark — and the two are NOT equal.
 *
 * Set symmetrically at 122 they looked wrong, and the cause is optical rather
 * than geometric. "Nous gérons," opens on a capital, so its ink fills the top of
 * its line and its lowest mark is a descender; "vous percevez." has neither
 * capital nor ascender, so its ink starts only at x-height. Measured against
 * Didot's metrics at 98 px, equal spacing leaves 39 px of air above the mark and
 * 75 px below — almost double. Bringing the lower line up to 86 evens them out.
 */
const STACK_UP = 122;
const STACK_DOWN = 86;

/**
 * The brand's diamond, not a tick. A check in a circle is the generic mark of a
 * completed task; here the line is the film's closing promise, and signing it
 * with the identity says more than confirming it does.
 */
const Seal: React.FC<{o: number; x: number; y: number}> = ({o, x, y}) => (
  <div
    style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: o}}
  >
    <Mark size={62} />
  </div>
);

export const Simple: React.FC<{frame: number}> = ({frame}) => {
  const {w, h, tall} = useStage();
  const badgePos = badgeAt(w, h);

  const p1 = EASE.entrance(prog(frame, FROM + 46, FROM + 84));
  const p2 = EASE.entrance(prog(frame, FROM + 62, FROM + 104));
  // the transition disc contracts onto the badge and hands it over here
  // the contracting disc dissolves over 1996-2010; the diamond rises into it
  const badge = prog(frame, FROM + 60, FROM + 76);

  const type: React.CSSProperties = {
    position: 'absolute',
    fontFamily: SANS,
    fontWeight: W_MED,
    fontSize: 98,
    letterSpacing: '-0.012em',
    whiteSpace: 'nowrap',
  };

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper wash={0.4} />

      <div
        style={{
          ...type,
          left: tall ? badgePos.x : badgePos.x - GAP,
          top: tall ? badgePos.y - STACK_UP : badgePos.y,
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
          top: tall ? badgePos.y + STACK_DOWN : badgePos.y,
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

      <Seal o={badge} x={badgePos.x} y={badgePos.y} />
    </AbsoluteFill>
  );
};
