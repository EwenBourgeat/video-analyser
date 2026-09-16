import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, T, SANS, W_MED, W_BOLD} from '../theme';
import {useStage} from '../../intendant/format';
import {prog} from '../../ease';
import {EASE} from '../../bezier';
import {springIn, whipIn} from '../motion';
import {Mark} from '../../intendant/components/Brand';

/**
 * Beat 6 — la phrase qui décide. 15,8 -> 18,2 s.
 *
 * Elle remplace le plan « et votre téléphone se tait », qui refermait joliment
 * le film sur son objet mais ne demandait rien. À cet endroit, deux secondes
 * avant le numéro, il ne faut pas une chute : il faut la raison de décrocher.
 *
 * « Confiez-nous les clés. Gardez les revenus. » dit l'échange en entier —
 * ce qu'on donne, ce qu'on garde — et la seconde moitié est celle qui compte,
 * donc elle porte l'accent et arrive après.
 *
 * Elle arrive par le même fouetté que les avis, pour que le fil ne se rompe
 * pas, puis le losange se pose entre les deux lignes : c'est la marque qui
 * signe l'échange, et c'est aussi elle qui ouvre la carte finale.
 */

const FROM = T.finale.from;
const TO = T.finale.to;

export const Finale: React.FC<{frame: number}> = ({frame}) => {
  const {w: W, h: H} = useStage();

  const dx = whipIn(frame, FROM, W);

  /*
   * La première ligne est révélée AVANT la coupe, pendant que la scène arrive
   * encore par la droite. Même raison que pour les services : un fouetté amène
   * une scène déjà composée. Amener un cadre vide, c'est n'avoir à regarder
   * pendant la transition que ce qui s'en va — et c'est exactement ce qui
   * faisait paraître un avis attardé.
   */
  const l1 = springIn(frame, FROM - 34, 40);
  const seal = springIn(frame, FROM + 6, 30, 0.5);
  const l2 = springIn(frame, FROM + 16, 38);
  /* le tout recule légèrement à la fin : la carte finale grandit depuis là */
  const away = EASE.camera(prog(frame, TO - 22, TO));

  const type: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: W,
    textAlign: 'center',
    fontFamily: SANS,
    letterSpacing: '-0.018em',
    lineHeight: 1.1,
  };

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${dx}px) scale(${1 - 0.06 * away})`,
          opacity: 1 - away,
        }}
      >
        <div
          style={{
            ...type,
            top: 0.335 * H,
            fontWeight: W_MED,
            fontSize: 82,
            color: C.deep,
            opacity: l1,
            transform: `translateY(${(1 - l1) * 34}px)`,
          }}
        >
          Confiez-nous les clés.
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0.50 * H,
            transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * seal}) rotate(${
              (1 - seal) * -28
            }deg)`,
            opacity: seal,
          }}
        >
          <Mark size={74} />
        </div>

        <div
          style={{
            ...type,
            top: 0.575 * H,
            fontWeight: W_BOLD,
            fontSize: 82,
            color: C.blue600,
            opacity: l2,
            transform: `translateY(${(1 - l2) * 34}px)`,
          }}
        >
          Gardez les revenus.
        </div>
      </div>
    </AbsoluteFill>
  );
};
