import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, T} from './theme';
import {WHIP} from './motion';
import {Sand} from './components/Grounds';
import {LockScreen} from './scenes/LockScreen';
import {Services} from './scenes/Services';
import {Proof} from './scenes/Proof';
import {Finale} from './scenes/Finale';
import {EndCard} from './scenes/EndCard';

/**
 * Publicité #2 — le montage.
 *
 * Un composant `In` qui ne monte une scène que pendant sa fenêtre, et des
 * bornes qui viennent toutes de `T`.
 *
 * Les fenêtres se CHEVAUCHENT d'un demi-fouetté de part et d'autre des coupes
 * concernées. C'est ce qui permet à la scène sortante de filer vers la gauche
 * pendant que l'entrante arrive par la droite : les deux lisent la même
 * fonction, donc leurs bords se rejoignent exactement au milieu du mouvement,
 * sans trou ni recouvrement. Un simple raccord ne pourrait pas le faire — il
 * faut que les deux scènes existent en même temps pendant quelques images.
 *
 * Le fond est peint ICI, une seule fois, et jamais par les scènes.
 *
 * C'était un vrai défaut, trouvé sur le rendu : chaque scène posait son propre
 * sable en plein cadre, et pendant le fouetté celle qui arrive — plus bas dans
 * le DOM — recouvrait entièrement celle qui part. La moitié gauche de l'image
 * était vide au moment précis où la transition devait montrer les deux. Un
 * seul sol, et le problème ne peut plus exister.
 */
const In: React.FC<{from: number; to: number; frame: number; children: React.ReactNode}> = ({
  from,
  to,
  frame,
  children,
}) => (frame >= from && frame < to ? <>{children}</> : null);

const H = WHIP / 2;

export const Intendant2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.cream}}>
      <Sand />
      <In from={T.hook.from} to={T.services.from + H} frame={frame}>
        <LockScreen frame={frame} />
      </In>
      <In from={T.services.from - H} to={T.services.to + H} frame={frame}>
        <Services frame={frame} />
      </In>
      <In from={T.proof.from - H} to={T.proof.to + H} frame={frame}>
        <Proof frame={frame} />
      </In>
      <In from={T.finale.from - H} to={T.finale.to} frame={frame}>
        <Finale frame={frame} />
      </In>
      <In from={T.endcard.from} to={T.endcard.to} frame={frame}>
        <EndCard frame={frame} />
      </In>
    </AbsoluteFill>
  );
};
