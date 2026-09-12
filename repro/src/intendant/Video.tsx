import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, T} from './theme';
import {useStage} from './format';
import {prog, softOut, inCubic} from '../ease';
import {MapPins} from './scenes/MapPins';
import {ClockStage} from './scenes/ClockStage';
import {Browser} from './scenes/Browser';
import {Metier} from './scenes/Metier';
import {Journey} from './scenes/Journey';
import {Reviews} from './scenes/Reviews';
import {KeyRise} from './scenes/KeyRise';
import {LogoReveal} from './scenes/LogoReveal';
import {Diffusion} from './scenes/Diffusion';
import {Calendar} from './scenes/Calendar';
import {Simple, badgeAt} from './scenes/Simple';
import {EndCard} from './scenes/EndCard';
import {Ink} from './components/Grounds';

/*
  No web fonts to load: the charter's Didot and Futura are installed system
  faces, which Chrome resolves by family name. See theme.ts for the fallbacks
  and for why only two Futura weights are usable.
*/

/** Radius of the disc that carries the calendar -> payoff transition. */
const MORPH_OPEN = T.calendar.to - 20;
const MORPH_PEAK = T.calendar.to + 12;
const MORPH_LAND = T.simple.from + 74;
const MORPH_R = (f: number) => {
  if (f <= MORPH_PEAK) return 1400 * inCubic(prog(f, MORPH_OPEN, MORPH_PEAK)); // floods out
  return 1400 + (32 - 1400) * softOut(prog(f, MORPH_PEAK + 4, MORPH_LAND));    // onto the badge
};

const In: React.FC<{from: number; to: number; frame: number; children: React.ReactNode}> = ({
  from,
  to,
  frame,
  children,
}) => (frame >= from && frame < to ? <>{children}</> : null);

export const Intendant: React.FC = () => {
  const frame = useCurrentFrame();
  /*
    The disc reads the badge's position from the same helper the payoff line
    uses, so the two can never drift apart — they used to be two hardcoded
    copies of 960/516, which is exactly how a 24 px mismatch got in once before.
  */
  const {w, h} = useStage();
  const badge = badgeAt(w, h);

  return (
    <AbsoluteFill style={{background: C.paper}}>
      <In from={T.map.from} to={T.map.to} frame={frame}>
        <MapPins frame={frame} />
      </In>

      {/* the clock runs full-bleed, then becomes the browser's content.
          It dissolves in over the same window the compass dissolves out. */}
      <In from={T.clock.from} to={T.browser.from} frame={frame}>
        <div style={{position: 'absolute', inset: 0, opacity: softOut(prog(frame, T.map.to - 40, T.map.to))}}>
          <ClockStage frame={frame} />
        </div>
      </In>
      <In from={T.browser.from} to={T.browser.to} frame={frame}>
        <Browser frame={frame} />
      </In>

      <In from={T.browser.to} to={T.metier.from} frame={frame}>
        <Ink glow={0.9} />
      </In>
      <In from={T.metier.from} to={T.metier.to} frame={frame}>
        <Metier frame={frame} />
      </In>

      <In from={T.journey.from} to={T.journey.to} frame={frame}>
        <Journey frame={frame} />
      </In>
      <In from={T.reviews.from} to={T.reviews.to} frame={frame}>
        <Reviews frame={frame} />
      </In>
      <In from={T.key.from} to={T.key.to} frame={frame}>
        <KeyRise frame={frame} />
      </In>
      <In from={T.logo.from} to={T.logo.to} frame={frame}>
        <LogoReveal frame={frame} />
      </In>
      <In from={T.diffusion.from} to={T.diffusion.to} frame={frame}>
        <Diffusion frame={frame} />
      </In>
      <In from={T.calendar.from} to={T.calendar.to} frame={frame}>
        <Calendar frame={frame} />
      </In>
      <In from={T.simple.from} to={T.simple.to} frame={frame}>
        <Simple frame={frame} />
      </In>

      {/*
        Calendar -> payoff line. The pill the pointer just pressed swells until
        its blue owns the frame, the cut happens hidden inside it, then the blue
        contracts onto the check badge of the next line. The button becomes the
        badge — the transition is one object changing size, not a cut.
      */}
      {frame >= MORPH_OPEN && frame <= MORPH_LAND ? (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <div
            style={{
              position: 'absolute',
              left: badge.x,
              top: badge.y,
              width: 2 * MORPH_R(frame),
              height: 2 * MORPH_R(frame),
              marginLeft: -MORPH_R(frame),
              marginTop: -MORPH_R(frame),
              borderRadius: '50%',
              background: C.blue600,
              /*
                The disc used to shrink to badge size and hold, with a white tick
                drawn inside it — so the transition ended on a generic "task
                completed" mark. It now hands over instead: the disc dissolves as
                it finishes contracting and the brand's diamond, which `Simple`
                fades in over exactly this window, is what it leaves behind.
              */
              opacity: 1 - prog(frame, MORPH_LAND - 14, MORPH_LAND),
            }}
          />
        </AbsoluteFill>
      ) : null}
      <In from={T.endcard.from} to={T.endcard.to} frame={frame}>
        <EndCard frame={frame} />
      </In>

    </AbsoluteFill>
  );
};
