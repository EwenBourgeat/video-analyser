import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {loadFont as loadOutfit} from '@remotion/google-fonts/Outfit';
import {loadFont as loadPoppins} from '@remotion/google-fonts/Poppins';
import {loadFont as loadFigtree} from '@remotion/google-fonts/Figtree';
loadFigtree('normal', {weights: ['400','500','600','700']});
import {C, T, SRC_FPS, FPS} from './theme';
import {Radar} from './scenes/Radar';
import {ClockStage} from './scenes/ClockStage';
import {BrowserScene} from './scenes/BrowserScene';
import {PastText} from './scenes/PastText';
import {Journey} from './scenes/Journey';
import {Cards} from './scenes/Cards';
import {Folder} from './scenes/Folder';
import {LogoReveal} from './scenes/LogoReveal';
import {Domains} from './scenes/Domains';
import {Envelopes} from './scenes/Envelopes';
import {Agenda} from './scenes/Agenda';
import {SimpleNon} from './scenes/SimpleNon';
import {Plate} from './components/Plate';
import {prog} from './ease';

loadOutfit('normal', {weights: ['300', '400', '500', '600', '700']});
loadPoppins('normal', {weights: ['400', '500', '600', '700']});

const In: React.FC<{
  from: number;
  to: number;
  frame: number;
  children: React.ReactNode;
}> = ({from, to, frame, children}) =>
  frame >= from && frame < to ? <>{children}</> : null;

export const Main: React.FC = () => {
  // scenes are authored in source-frame units; hand them a fractional one so
  // the 60 fps render lands real in-betweens instead of doubling frames
  const frame = useCurrentFrame() * (SRC_FPS / FPS);

  // iris wipe closing the block (beat 12, measured f773 -> f776)
  const iris = prog(frame, 773, 777);

  return (
    <AbsoluteFill style={{background: C.white}}>
      <In from={T.radar.from} to={T.radar.to} frame={frame}>
        <Radar frame={frame} />
      </In>

      {/* beat 2: the clock stage full-bleed, before the browser wraps it */}
      <In from={T.clock.from} to={T.browser.from} frame={frame}>
        <ClockStage frame={frame} />
      </In>

      <In from={T.browser.from} to={T.browser.to} frame={frame}>
        <BrowserScene frame={frame} />
      </In>

      {/* short dark hold between the cut at f173 and the text at f181 */}
      <In from={T.browser.to} to={T.pastText.from} frame={frame}>
        <Plate name="gap" />
      </In>

      <In from={T.pastText.from} to={T.pastText.to} frame={frame}>
        <PastText frame={frame} />
      </In>

      <In from={T.journey.from} to={T.cards.from} frame={frame}>
        <Journey frame={frame} />
      </In>

      <In from={T.cards.from} to={T.cards.to} frame={frame}>
        <Cards frame={frame} />
      </In>

      <In from={T.folder.from} to={T.folder.to} frame={frame}>
        <Folder frame={frame} />
      </In>

      <In from={T.logo.from} to={T.domains.from} frame={frame}>
        <LogoReveal frame={frame} />
      </In>

      <In from={T.domains.from} to={T.envelopes.from} frame={frame}>
        <Domains frame={frame} />
      </In>

      <In from={T.envelopes.from} to={T.agenda.from} frame={frame}>
        <Envelopes frame={frame} />
      </In>

      <In from={T.agenda.from} to={T.agenda.to} frame={frame}>
        <Agenda frame={frame} />
      </In>

      <In from={T.simple.from} to={T.simple.to} frame={frame}>
        <SimpleNon frame={frame} />
      </In>

      {iris > 0 ? (
        <AbsoluteFill
          style={{
            background: C.dark,
            clipPath: `circle(${iris * 78}% at 50% 50%)`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
