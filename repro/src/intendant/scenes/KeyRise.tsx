import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SERIF} from '../theme';
import {Ink, Paper} from '../components/Grounds';
import {Exposure} from '../components/Exposure';
import {prog} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beat 7 — the payoff of the travelling, 20.1 -> 22.1 s.
 *
 * The key is gone. It had been redrawn twice — first stripped of its glow and
 * sparks, then flattened to a single silhouette — and the honest reading of
 * that sequence is that the object was never carrying the beat. The line is:
 * "vous ne gérez plus rien". A key drawn beside it illustrates the noun and says
 * nothing about the sentence, and it took two thirds of the frame to do it.
 *
 * So the beat is now the line alone, centred on white, revealed with the same
 * `Exposure` gesture as "Parce que gérer une location courte durée" — the
 * film's two statement lines, told the same way.
 *
 * The white is raised and lowered INSIDE the scene, exactly as the stations beat
 * does it. Both of this beat's cuts land on dark ground, and painting the scene
 * white outright would put a sixty-point luminance step at each one.
 */

const FROM = 1204;
const TO = 1324;

/** The wave crosses the line in this many frames. */
const REVEAL = 52;
const REVEAL_FROM = FROM + 10;

/** The line goes back out of focus before the ground starts to darken. */
const EXIT_FROM = 1288;
const EXIT_TO = 1306;

/**
 * Ground: up to white once the cut has landed — and it STAYS there.
 *
 * The stations beat has to come back down because the reviews that follow it are
 * on dark ground. This one does not: the logo beat that follows opens on
 * `Paper`, so holding the white all the way to the cut is what MATCHES it.
 *
 * It also fixes a step that predates this rebuild. The old key-on-dark version
 * ended at luminance 36 and the logo beat opens at 253, so the boundary carried
 * a 217-point jump — a white flash that every other cut in the film had been
 * measured and tuned to avoid. Ending on the same ground the next beat begins on
 * takes it to zero.
 */
const WHITE_IN: [number, number] = [FROM + 2, FROM + 36];

/**
 * Two rows rather than one, in both frames.
 *
 * The accent falls on "plus rien", which is half the sentence — so the break is
 * where the colour changes and the line reads as a statement and its turn,
 * rather than as one line that happens to wrap.
 */
const ROWS = ['vous ne gérez', 'plus rien'];

/**
 * Nine, not the twenty `Exposure` defaults to.
 *
 * `soft` is how many letters are resolving at once, and the default is set for a
 * sixty-character sentence. On a twenty-two character line it would have the
 * whole thing blooming simultaneously — a fade, not a sweep.
 */
const SOFT = 9;

export const KeyRise: React.FC<{frame: number}> = ({frame}) => {
  const whiteness = EASE.entrance(prog(frame, WHITE_IN[0], WHITE_IN[1]));

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Ink glow={0.5} />
      {/* the NEXT beat's ground, faded up over this one's — so the cut is a no-op */}
      <AbsoluteFill style={{opacity: whiteness, pointerEvents: 'none'}}>
        <Paper wash={0.55} />
      </AbsoluteFill>
      <Exposure
        frame={frame}
        rows={ROWS}
        from={REVEAL_FROM}
        reveal={REVEAL}
        exitFrom={EXIT_FROM}
        exitTo={EXIT_TO}
        fontSize={92}
        font={SERIF}
        ground="light"
        soft={SOFT}
      />
    </AbsoluteFill>
  );
};
