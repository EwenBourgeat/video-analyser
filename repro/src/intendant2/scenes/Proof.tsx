import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {C, T, SANS, W_MED, W_BOLD} from '../theme';
import {useStage} from '../../intendant/format';
import {prog} from '../../ease';
import {EASE} from '../../bezier';
import {springIn, whipAt, whipIn, whipOut} from '../motion';
import {GoogleG, Stars} from '../components/GoogleReview';

/**
 * Beat 5 — la preuve. 10,3 -> 15,8 s.
 *
 * Les avis DÉFILENT, de la droite vers la gauche, comme sur le film #1 : c'est
 * la seule séquence des deux publicités qui partage sa mécanique, et c'est
 * voulu — le défilé est ce qui fait sentir qu'il y en a d'autres derrière, ce
 * qu'une pile de trois cartes posées ne dit pas.
 *
 * Au-dessus, la note et une phrase sur l'unanimité. L'ordre compte : le
 * spectateur lit « tous disent la même chose », puis en voit passer trois qui
 * le disent. La phrase n'est pas un titre, c'est la conclusion posée avant sa
 * démonstration.
 */

const FROM = T.proof.from;
const TO = T.proof.to;

type Review = {who: string; when: string; quote: string; photo: string};

/** Les avis du client, mot pour mot — comme sur le film #1. */
const REVIEWS: Review[] = [
  {who: 'Alexis', when: 'il y a 2 mois', quote: 'Rien à gérer, des revenus chaque mois.', photo: 'p01'},
  {who: 'Laure Estève', when: 'il y a 3 mois', quote: 'Zéro stress, des voyageurs ravis.', photo: 'p10'},
  {who: 'Thomas Barrau', when: 'il y a 4 mois', quote: 'Le ménage est irréprochable.', photo: 'p11'},
  {who: 'Claire Fabre', when: 'il y a 5 mois', quote: 'Un interlocuteur qui connaît mon logement.', photo: 'p02'},
  {who: 'Julien Roux', when: 'il y a 5 mois', quote: 'Aucune mauvaise surprise depuis le premier mois.', photo: 'p03'},
  {who: 'Anne Gaillard', when: 'il y a 6 mois', quote: 'Réactifs, sérieux, et toujours joignables.', photo: 'p04'},
];

const CARD_W = 440;
const CARD_H = 468;
const PITCH = CARD_W + 44;

/**
 * Le défilé n'est PAS à vitesse constante.
 *
 * La rangée arrive à 22 px par image et décélère jusqu'à 5,4 en 70 images :
 * elle entre en trombe, puis se pose à une vitesse où l'on peut lire. C'est la
 * mécanique du film #1, et c'est ce qui règle un problème d'arithmétique
 * autant que de rythme — à vitesse de lecture, amener la première carte depuis
 * le bord droit prendrait à elle seule le tiers du beat, et l'image ne serait
 * pleine qu'à la fin.
 *
 * L'intégrale est calculée en forme fermée plutôt qu'accumulée image par
 * image : une position qui dépend de la somme des images précédentes dérive
 * dès qu'on rend une image isolée, et tout ce film est rendu image par image.
 */
const SCROLL_FROM = FROM + 18;
const V_IN = 22;
const V_OUT = 5.4;
const SETTLE = 70;

const scrollAt = (t: number) => {
  if (t <= 0) return 0;
  const full = SETTLE * (V_IN + (V_OUT - V_IN) * 0.5);
  if (t >= SETTLE) return full + (t - SETTLE) * V_OUT;
  const u = t / SETTLE;
  return SETTLE * (V_IN * u + (V_OUT - V_IN) * (u * u * u - (u * u * u * u) / 2));
};

const Card: React.FC<{r: Review; x: number; y: number}> = ({r, x, y}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: CARD_W,
      height: CARD_H,
      boxSizing: 'border-box',
      padding: '38px 34px',
      borderRadius: 36,
      background: C.paper,
      boxShadow: '0 18px 42px rgba(70,12,6,0.10)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    }}
  >
    <img
      src={staticFile(`people/${r.photo}.jpg`)}
      style={{width: 104, height: 104, borderRadius: '50%', objectFit: 'cover', display: 'block'}}
    />
    <div
      style={{
        marginTop: 20,
        fontFamily: SANS,
        fontWeight: W_BOLD,
        fontSize: 34,
        letterSpacing: '-0.02em',
        color: C.ink,
      }}
    >
      {r.who}
    </div>
    <div style={{marginTop: 6, fontFamily: SANS, fontWeight: W_MED, fontSize: 24, color: C.muted}}>
      {r.when}
    </div>
    <div style={{marginTop: 16}}>
      <Stars size={28} />
    </div>
    <div
      style={{
        marginTop: 20,
        fontFamily: SANS,
        fontWeight: W_MED,
        fontSize: 30,
        lineHeight: 1.34,
        letterSpacing: '-0.014em',
        color: C.inkSoft,
      }}
    >
      « {r.quote} »
    </div>
  </div>
);

export const Proof: React.FC<{frame: number}> = ({frame}) => {
  const {w: W, h: H} = useStage();

  /* le fouetté amène la page depuis la droite, et l'emmène à gauche à la fin */
  const dx = whipIn(frame, FROM, W) + whipOut(frame, TO, W);

  const kick = springIn(frame, FROM + 18, 34);
  const line = springIn(frame, FROM + 28, 38);
  const note = springIn(frame, FROM + 40, 36);
  const lit = 5 * EASE.entrance(prog(frame, FROM + 44, FROM + 82));

  /*
   * LA RANGÉE S'ÉCHAPPE AVEC LE FOUETTÉ, elle n'est pas seulement poussée.
   *
   * C'était un vrai défaut, trouvé par le calcul : à la fin de la transition,
   * deux cartes étaient encore dans le cadre. Un fouetté déplace la scène
   * d'une largeur d'image, mais le défilé, lui, continue d'en amener de
   * nouvelles par la droite — la rangée se réalimentait exactement aussi vite
   * qu'elle était chassée, et se vidait donc jamais. Une carte semblait
   * s'attarder alors que c'était une AUTRE carte qui venait d'entrer.
   *
   * Le défilé accélère donc pendant le fouetté, de 1150 px répartis sur sa
   * durée. Ajouté au déplacement de la scène, cela dépasse la longueur de
   * rangée restante, et le cadre est net avant que la scène suivante ne
   * s'installe. C'est aussi plus juste à regarder : les avis s'envolent au
   * lieu de se faire pousser.
   */
  const scroll = scrollAt(frame - SCROLL_FROM) + whipAt(frame, TO) * 1150;
  /* 0,475 et non 0,535 : mesuré sur le rendu, la note et les cartes étaient
     séparées par 230 px de vide dans un cadre qui n'en fait que 1350. */
  const rowY = 0.475 * H;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>

      <div style={{position: 'absolute', inset: 0, transform: `translateX(${dx}px)`}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0.085 * H,
            width: W,
            textAlign: 'center',
            fontFamily: SANS,
            fontWeight: W_BOLD,
            fontSize: 26,
            letterSpacing: '0.22em',
            color: C.blue600,
            opacity: kick,
            transform: `translateY(${(1 - kick) * 22}px)`,
          }}
        >
          AVIS GOOGLE
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0.135 * H,
            width: W,
            textAlign: 'center',
            fontFamily: SANS,
            fontWeight: W_MED,
            fontSize: 60,
            lineHeight: 1.16,
            letterSpacing: '-0.016em',
            color: C.deep,
            opacity: line,
            transform: `translateY(${(1 - line) * 28}px)`,
          }}
        >
          Tous nos propriétaires
          <br />
          en disent la même chose.
        </div>

        {/*
          La note, en gros, à côté des étoiles qui se remplissent.
          Le « 5,0 » et les cinq étoiles disent la même chose deux fois, et
          c'est exactement ce que fait une fiche Google : le chiffre se retient,
          les étoiles se voient de loin.
        */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0.335 * H,
            width: W,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            opacity: note,
            transform: `translateY(${(1 - note) * 20}px)`,
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontWeight: W_BOLD,
              fontSize: 76,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: C.ink,
            }}
          >
            5,0
          </div>
          <Stars size={46} gap={8} shown={lit} />
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <GoogleG size={38} />
            <span
              style={{
                fontFamily: SANS,
                fontWeight: W_MED,
                fontSize: 32,
                color: C.muted,
              }}
            >
              sur Google
            </span>
          </div>
        </div>

        {REVIEWS.map((r, i) => {
          /* la première carte part du bord droit : la rangée entre, elle n'est pas déjà là */
          const x = W + 60 + i * PITCH - scroll;
          if (x < -CARD_W - 40 || x > W + 60) return null;
          return <Card key={r.who} r={r} x={x} y={rowY} />;
        })}
      </div>
    </AbsoluteFill>
  );
};
