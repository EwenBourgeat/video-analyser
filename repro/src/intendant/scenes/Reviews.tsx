import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, W, H, SANS, MONO, T} from '../theme';
import {Ink} from '../components/Grounds';
import {prog} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beat 6 — what the owners say, 19.75 -> 23.75 s.
 *
 * Four seconds, and the camera never stops.
 *
 * This beat has been through three shapes. It was a wall of cards falling from
 * the sky; then a row that built in place, held 3.5 s to be read, and only then
 * began to drift. The hold was the problem: it was dead time, and it made the
 * beat read as a separate scene bolted on after the travelling.
 *
 * So there is no build and no hold. The camera comes off the five-step
 * travelling at 34 px/frame — it accelerates across the empty ground rather than
 * braking into it — and settles to 8 here. The cards are not animated at all:
 * they are objects standing in the world at x = R0 + i * PITCH, and the camera
 * passes them. Every arrival and every departure is a consequence of the camera
 * moving, which is the only thing moving in the whole passage.
 *
 * That removes the seam for free. The technical cut lands while the frame is
 * bare — the last station gone, the first card not yet arrived — and the camera
 * speed is identical either side of it, so there is nothing to see and nothing
 * to match.
 *
 * Once settled, 8 px/frame puts one cycle of the twelve cards at 15.6 s, still
 * inside the 15-25 s band that reads as neither anxious nor broken.
 */

const FROM = T.reviews.from;
const TO = T.reviews.to;

/** Row geometry, unchanged. */
const CARD_W = 560;
const CARD_H = 302;
const GAP = 64;
const PITCH = CARD_W + GAP;
const ROW_Y = 536;

/**
 * The camera arrives from the travelling at 34 px/frame — a whip across the
 * empty ground — and settles to 8 over 110 frames. It never stops.
 *
 * The rush is arithmetic, not style. A row entering from the right must cross a
 * full 1920 px frame before three cards are on screen; at 8 px/frame that is 240
 * frames, the whole beat, so the picture would fill only on its last frame. The
 * whip crosses it in 56 and the frame is full 1.1 s in.
 */
const CAM0 = 5851.1;
const V_IN = 34;
const V_OUT = 8;
const SETTLE = 110;

const camXAt = (f: number) => {
  const t = f - FROM;
  const full = SETTLE * (V_IN + (V_OUT - V_IN) * 0.5);
  if (t >= SETTLE) return CAM0 + full + (t - SETTLE) * V_OUT;
  const u = t / SETTLE;
  return CAM0 + SETTLE * (V_IN * u + (V_OUT - V_IN) * (u * u * u - (u * u * u * u) / 2));
};
/** World x of the first card: exactly the frame's right edge on the first frame. */
const R0 = 7771;

type Review = {q: string; who: string; when: string; photo: string};

/** The client's own Google reviews. */
const REVIEWS: Review[] = [
  {q: 'Rien à gérer, des revenus chaque mois.', who: 'Alexis', when: 'il y a 2 mois', photo: 'p01'},
  {q: 'Zéro stress, des voyageurs ravis.', who: 'Laure Estève', when: 'il y a 3 mois', photo: 'p10'},
  {q: 'Le ménage est irréprochable.', who: 'Thomas Barrau', when: 'il y a 4 mois', photo: 'p11'},
  {q: 'Un interlocuteur qui connaît vraiment mon logement.', who: 'Claire Fabre', when: 'il y a 5 mois', photo: 'p02'},
  {q: 'Aucune mauvaise surprise depuis le premier mois.', who: 'Julien Roux', when: 'il y a 5 mois', photo: 'p03'},
  {q: 'Réactifs, sérieux, et toujours joignables.', who: 'Anne Gaillard', when: 'il y a 6 mois', photo: 'p04'},
  {q: 'Mon appartement est mieux tenu que par moi-même.', who: 'Pierre Sabatier', when: 'il y a 7 mois', photo: 'p05'},
  {q: 'Le reporting mensuel est limpide.', who: 'Hélène Cazes', when: 'il y a 8 mois', photo: 'p06'},
  {q: 'Ils ont doublé mon taux d’occupation.', who: 'Nicolas Bru', when: 'il y a 9 mois', photo: 'p07'},
  {q: 'Une équipe locale qui connaît Toulouse.', who: 'Marc Vidal', when: 'il y a 10 mois', photo: 'p09'},
  {q: 'Des revenus versés à la date près.', who: 'Émilie Cros', when: 'il y a 11 mois', photo: 'p12'},
  {q: 'Je recommande sans hésiter.', who: 'Sophie Girard', when: 'il y a 1 an', photo: 'p08'},
];

const LOOP = REVIEWS.length * PITCH;

const GoogleG: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 2-1.6 5-4.5 7l6.9 5.3c4.1-3.8 6.6-9.4 6.6-15.6Z" />
    <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.3c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.7l-7.1 5.5C8 40.3 15.4 46 24 46Z" />
    <path fill="#FBBC05" d="M11.5 27.9A13.4 13.4 0 0 1 10.8 24c0-1.4.3-2.7.7-3.9l-7.1-5.5A22 22 0 0 0 2 24c0 3.5.8 6.8 2.4 9.4l7.1-5.5Z" />
    <path fill="#EA4335" d="M24 10.2c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 4 29.9 2 24 2 15.4 2 8 7.7 4.4 14.6l7.1 5.5C13.3 14 18.2 10.2 24 10.2Z" />
  </svg>
);

const Stars: React.FC = () => (
  <div style={{display: 'flex', gap: 5, height: 27}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} width={27} height={27} viewBox="0 0 24 24" fill={C.star}>
        <path d="M12 2.2l3 6.4 6.9.9-5 4.9 1.2 6.9L12 18l-6.1 3.3 1.2-6.9-5-4.9 6.9-.9Z" />
      </svg>
    ))}
  </div>
);

/** One card. Nothing animates inside it — only its x, and that comes from the camera. */
const Card: React.FC<{r: Review; x: number}> = ({r, x}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: ROW_Y,
      width: CARD_W,
      height: CARD_H,
      borderRadius: 30,
      background: C.paper,
      boxShadow: '0 18px 44px rgba(0,0,0,0.34)',
      padding: '30px 36px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      fontFamily: SANS,
      boxSizing: 'border-box',
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <Img
        src={staticFile(`people/${r.photo}.jpg`)}
        style={{width: 66, height: 66, borderRadius: '50%', objectFit: 'cover', flexShrink: 0}}
      />
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontWeight: 600, fontSize: 31, color: C.ink, letterSpacing: '-0.014em'}}>
          {r.who}
        </div>
        <div style={{fontWeight: 400, fontSize: 22, color: '#70757A', marginTop: 3}}>{r.when}</div>
      </div>
      <GoogleG size={32} />
    </div>

    <Stars />

    <div
      style={{
        fontWeight: 400,
        fontSize: 30,
        lineHeight: 1.42,
        letterSpacing: '-0.008em',
        color: C.inkSoft,
      }}
    >
      {`« ${r.q} »`}
    </div>
  </div>
);

export const Reviews: React.FC<{frame: number}> = ({frame}) => {
  const camX = camXAt(frame);

  const kicker = EASE.entrance(prog(frame, FROM + 26, FROM + 46));
  const title = EASE.entrance(prog(frame, FROM + 32, FROM + 56));
  const out = 1 - prog(frame, TO - 16, TO);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/*
        The ground stays opaque to the last frame; only the content fades. The
        film's root background is white, so fading the whole scene put a white
        flash between two dark beats.
      */}
      <Ink glow={0.5} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 232,
          width: W,
          textAlign: 'center',
          fontFamily: MONO,
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: '0.22em',
          color: C.blue350,
          opacity: kicker * out,
          transform: `translateY(${(1 - kicker) * 14}px)`,
        }}
      >
        AVIS GOOGLE
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 292,
          width: W,
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 76,
          letterSpacing: '-0.03em',
          color: C.inkDark,
          opacity: title * out,
          transform: `translateY(${(1 - title) * 22}px)`,
        }}
      >
        Ce qu’en disent les propriétaires
      </div>

      <div style={{position: 'absolute', inset: 0, opacity: out}}>
        {REVIEWS.map((r, i) => {
          // wrap so the row can never run out of cards
          let x = R0 + i * PITCH - camX;
          while (x < -CARD_W - GAP) x += LOOP;
          if (x > W + GAP) return null;
          return <Card key={i} r={r} x={x} />;
        })}
      </div>
      {void H}
    </AbsoluteFill>
  );
};
