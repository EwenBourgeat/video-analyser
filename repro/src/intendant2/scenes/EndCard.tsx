import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, T, SANS, MONO, W_MED} from '../theme';
import {useStage} from '../../intendant/format';
import {Mark, Wordmark} from '../../intendant/components/Brand';
import {prog} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beat 7 — l'appel à l'action. 22,5 -> 25,0 s.
 *
 * Mêmes informations que sur le film #1 — c'est la consigne, et c'est juste :
 * deux annonces d'une même campagne doivent demander la même chose, sinon le
 * client reçoit deux promesses différentes.
 *
 * Ce qui change, c'est l'ordre et le sol. Le #1 empile marque, filet, ligne et
 * numéro au centre d'un fond clair ; ici le sol est le sable du film, et les
 * éléments montent un par un depuis le bas, en reprenant la cascade qui a
 * porté les notifications puis les services. La dernière image reste donc dans
 * la même grammaire que les 22 secondes qui la précèdent.
 */

const FROM = T.endcard.from;

export const EndCard: React.FC<{frame: number}> = ({frame}) => {
  const {w: W, h: H} = useStage();

  /* des rampes longues et chevauchées : rien n'atterrit sur la même image */
  const mark = EASE.entrance(prog(frame, FROM + 4, FROM + 54));
  const word = EASE.entrance(prog(frame, FROM + 18, FROM + 76));
  const rule = EASE.entrance(prog(frame, FROM + 40, FROM + 92));
  const tag = EASE.entrance(prog(frame, FROM + 56, FROM + 112));
  const sub = EASE.entrance(prog(frame, FROM + 74, FROM + 132));
  const tel = EASE.entrance(prog(frame, FROM + 92, FROM + 150));

  const rise = (e: number, px = 26) => `translateY(${(1 - e) * px}px)`;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 36,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            opacity: mark,
            transform: rise(mark, 20),
          }}
        >
          <Mark size={104} />
          <Wordmark size={92} shown={word} />
        </div>

        <div style={{width: 300 * rule, height: 1, background: C.lineStrong, opacity: rule}} />

        <div
          style={{
            fontFamily: SANS,
            fontWeight: W_MED,
            fontSize: 31,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: C.muted,
            opacity: tag,
            transform: rise(tag, 14),
          }}
        >
          Conciergerie · Toulouse
        </div>

        <div
          style={{
            marginTop: 18,
            textAlign: 'center',
            fontFamily: SANS,
            fontWeight: W_MED,
            fontSize: 33,
            lineHeight: 1.6,
            color: C.inkSoft,
            opacity: sub,
            transform: rise(sub, 20),
          }}
        >
          Estimation gratuite et sans engagement,
          <br />
          réponse sous 48 h.
        </div>

        <div
          style={{
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 44,
            letterSpacing: '0.02em',
            color: C.blue600,
            opacity: tel,
            transform: rise(tel, 16),
          }}
        >
          06 21 93 44 13
        </div>
      </div>
      {void W}
      {void H}
    </AbsoluteFill>
  );
};
