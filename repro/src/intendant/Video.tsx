import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {loadFont as loadInstrument} from '@remotion/google-fonts/InstrumentSans';
import {loadFont as loadJetBrains} from '@remotion/google-fonts/JetBrainsMono';
import {C, T} from './theme';
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
import {Simple} from './scenes/Simple';
import {EndCard} from './scenes/EndCard';
import {Ink} from './components/Grounds';

// the brand's own typefaces, taken from the site's CSS
loadInstrument('normal', {weights: ['400', '500', '600', '700']});
loadJetBrains('normal', {weights: ['400', '500', '600']});

/** Radius of the disc that carries the calendar -> payoff transition. */
const MORPH_R = (f: number) => {
  if (f <= 2516) return 1400 * inCubic(prog(f, 2484, 2516));   // the pill floods out
  return 1400 + (32 - 1400) * softOut(prog(f, 2520, 2578));    // and contracts to the badge
};

const In: React.FC<{from: number; to: number; frame: number; children: React.ReactNode}> = ({
  from,
  to,
  frame,
  children,
}) => (frame >= from && frame < to ? <>{children}</> : null);

export const Intendant: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{background: C.paper}}>
      <In from={T.map.from} to={T.map.to} frame={frame}>
        <MapPins frame={frame} />
      </In>

      {/* the clock runs full-bleed, then becomes the browser's content.
          It dissolves in over the same window the compass dissolves out. */}
      <In from={T.clock.from} to={T.browser.from} frame={frame}>
        <div style={{position: 'absolute', inset: 0, opacity: softOut(prog(frame, 150, 190))}}>
          <ClockStage frame={frame} />
        </div>
      </In>
      <In from={T.browser.from} to={T.browser.to} frame={frame}>
        <Browser frame={frame} />
      </In>

      <In from={T.browser.to} to={T.metier.from} frame={frame}>
        <Ink />
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
      {frame >= 2484 && frame <= 2578 ? (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <div
            style={{
              position: 'absolute',
              left: 960,
              top: 516,
              width: 2 * MORPH_R(frame),
              height: 2 * MORPH_R(frame),
              marginLeft: -MORPH_R(frame),
              marginTop: -MORPH_R(frame),
              borderRadius: '50%',
              background: C.blue600,
            }}
          />
          {MORPH_R(frame) < 60 ? (
            <div
              style={{
                position: 'absolute',
                left: 960,
                top: 516,
                transform: 'translate(-50%,-50%)',
                opacity: prog(frame, 2560, 2572),
              }}
            >
              <svg width={64} height={64} viewBox="0 0 40 40">
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
          ) : null}
        </AbsoluteFill>
      ) : null}
      <In from={T.endcard.from} to={T.endcard.to} frame={frame}>
        <EndCard frame={frame} />
      </In>

    </AbsoluteFill>
  );
};
