import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SERIF, T} from '../theme';
import {useStage} from '../format';
import {Ink} from '../components/Grounds';
import {Exposure} from '../components/Exposure';

/**
 * Beat 4 — the turn, 7.8 -> 11.4 s.
 *
 * The reveal itself lives in `Exposure`, which this beat and the payoff beat
 * ("vous ne gérez plus rien") both use: they are the film's two statement lines
 * and they are meant to read as the same gesture.
 */

const FROM = T.metier.from;
const TO = T.metier.to;

/** The wave crosses the whole sentence in this many frames — 2.5 s. */
const REVEAL = 150;

/**
 * The sentence is broken by hand for each frame rather than reflowed.
 *
 * In 4:5 it takes FOUR short lines instead of two long ones, and that is what
 * lets the type get BIGGER rather than smaller: reflowing the 16:9 wording into
 * a 1080-wide frame would have forced roughly 47 px to fit, where four short
 * lines hold 80. Breaking by hand also means no word ever jumps rows mid-reveal.
 */
const LINES = (tall: boolean) =>
  tall
    ? ['Parce que gérer', 'une location', 'courte durée,', 'c’est un vrai métier.']
    : ['Parce que gérer une location courte durée,', 'c’est un vrai métier.'];

export const Metier: React.FC<{frame: number}> = ({frame}) => {
  const {tall} = useStage();

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Ink glow={0.9} />
      <Exposure
        frame={frame}
        rows={LINES(tall)}
        from={FROM}
        reveal={REVEAL}
        exitFrom={TO - 30}
        exitTo={TO}
        fontSize={tall ? 80 : 72}
        font={SERIF}
        ground="dark"
      />
    </AbsoluteFill>
  );
};
