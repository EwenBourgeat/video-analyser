import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, W, H, SANS, MONO, T} from '../theme';
import {Ink} from '../components/Grounds';
import {prog} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beat 6 — what the owners say, 17.7 -> 27.7 s.
 *
 * Rebuilt from scratch: the falling wall is gone entirely. The beat is now a
 * row of three reviews that build across the frame, hold long enough to be
 * read, and then drift right-to-left as an endless marquee.
 *
 * The construction follows what motion designers actually do for a testimonial
 * marquee, rather than what looked good in isolation:
 *
 *  - SPEED. The consensus figure for a card marquee is 15-25 s for one full
 *    cycle; faster reads as anxious, slower as broken. Twelve cards at a 624 px
 *    pitch is 7488 px, so 7 px/frame (420 px/s) puts one cycle at 17.8 s —
 *    at the quick end of that band, which suits a film where the row only runs
 *    for five seconds rather than forever.
 *
 *  - STAGGER. Cards are offset 8 frames apart, and inside each one the five
 *    stars pop 3 frames apart as the wipe climbs past them. That second layer
 *    is what gives the build its rhythm; without it three cards arriving is
 *    just three cards arriving.
 *
 *  - NO JERK AT THE START OF THE SCROLL. Velocity ramps on a smoothstep, so
 *    acceleration itself starts and ends at zero. Integrated, that is
 *    u^3 - u^4/2 — a closed form, so position, speed and acceleration are all
 *    continuous where the hold becomes the drift. A linear velocity ramp would
 *    have put a visible kink at both ends of it.
 */

const FROM = T.reviews.from;
const TO = T.reviews.to;

/** Row geometry. Three cards across the frame, evenly gapped. */
const CARD_W = 560;
/**
 * 302, down from 356. At 356 a one- or two-line quote left a bare 150 px of
 * white at the foot of every card — it read as a layout that had not been
 * finished rather than as deliberate space.
 */
const CARD_H = 302;
/**
 * 64, not the 44 it started at. At 44 the fourth card rests at x = 1888 and
 * showed a 32 px sliver of itself at the right edge all through the hold, which
 * quietly broke the "three across the frame" the beat is built on. The gap that
 * pushes it clear is 60; 64 leaves a little margin and keeps the cycle at 17.8 s.
 */
const GAP = 64;
const PITCH = CARD_W + GAP;
const X0 = (W - (3 * CARD_W + 2 * GAP)) / 2;
const ROW_Y = 536;   // recentres the block now that the cards are shorter

/** Build. */
const HEAD_AT = FROM + 4;
const CARD_AT = FROM + 26;
const CARD_STEP = 8;
/**
 * 26, down from 38. The plate arrives empty and the text follows it, so the
 * wipe's length is also the length of time a blank white rectangle sits on
 * screen. At 38 that was 0.43 s per card with three of them overlapping — three
 * empty boxes at once, which reads as a page that has failed to load rather
 * than as a build. At 26, with the text starting at 12, the blank window is
 * 0.2 s: long enough to register as the card opening, too short to look broken.
 */
const CARD_DUR = 26;
const STAR_STEP = 3;

/** Scroll. */
const SCROLL_AT = FROM + 300;
const RAMP = 70;
const CRUISE = 7;

type Review = {q: string; who: string; when: string; photo: string};

/**
 * The reviews themselves. Texts are the client's own Google reviews; the three
 * that lead are the shortest, because those are the ones that have to be read
 * inside the hold rather than skimmed as they drift past.
 */
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

/**
 * THE EDGE FADE WAS REMOVED, and the reason is worth recording.
 *
 * The advice found for marquees is to mask both edges so items dissolve rather
 * than appear and vanish at a hard border. That advice is written for the WEB,
 * where a marquee sits mid-page and its container edge is an arbitrary line the
 * reader can see is arbitrary. Applied here it actively hurt: fading a white
 * card's alpha over this near-black ground takes it through grey, so each card
 * entering or leaving carried a 250 px grey smear across itself. Widening the
 * falloff and shaping it as an S-curve made the band softer but not absent,
 * because the grey is not an artefact of the curve — it is what white over
 * black looks like at 50 % alpha.
 *
 * In a film the frame edge is not arbitrary: it is the frame. Something moving
 * out of shot is ordinary cinematic language, and every other beat in this film
 * already lets elements cross it. So the cards simply travel off the edge.
 */

/**
 * How far the row has travelled. Velocity ramps on a smoothstep and then holds,
 * so there is no acceleration step at either end of the ramp.
 */
const offsetAt = (f: number) => {
  const t = f - SCROLL_AT;
  if (t <= 0) return 0;
  if (t >= RAMP) return CRUISE * RAMP * 0.5 + (t - RAMP) * CRUISE;
  const u = t / RAMP;
  return CRUISE * RAMP * (u * u * u - (u * u * u * u) / 2);
};

const GoogleG: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 2-1.6 5-4.5 7l6.9 5.3c4.1-3.8 6.6-9.4 6.6-15.6Z" />
    <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.3c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.7l-7.1 5.5C8 40.3 15.4 46 24 46Z" />
    <path fill="#FBBC05" d="M11.5 27.9A13.4 13.4 0 0 1 10.8 24c0-1.4.3-2.7.7-3.9l-7.1-5.5A22 22 0 0 0 2 24c0 3.5.8 6.8 2.4 9.4l7.1-5.5Z" />
    <path fill="#EA4335" d="M24 10.2c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 4 29.9 2 24 2 15.4 2 8 7.7 4.4 14.6l7.1 5.5C13.3 14 18.2 10.2 24 10.2Z" />
  </svg>
);

const Star: React.FC<{size: number; p: number}> = ({size, p}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={C.star}
    style={{transform: `scale(${EASE.pop(p)})`, opacity: Math.min(1, p * 2)}}
  >
    <path d="M12 2.2l3 6.4 6.9.9-5 4.9 1.2 6.9L12 18l-6.1 3.3 1.2-6.9-5-4.9 6.9-.9Z" />
  </svg>
);

/**
 * One card, built as two layers.
 *
 * `p` wipes the PLATE up from the bottom; `cp` fades the CONTENT in over it;
 * `sp` is the star stagger's own clock, in frames.
 *
 * The split is what makes the reveal usable. With the content inside the wiped
 * element, the mask edge sliced straight through the reviewer's name for a few
 * frames — a card cut in half reads as a mask, a name cut in half reads as a
 * bug. Now the plate arrives first and the text fades in on top of it, which
 * also means the fade happens over opaque white, so it never passes through the
 * grey that fading over the dark ground produced.
 */
const Card: React.FC<{r: Review; x: number; p: number; cp: number; sp: number}> = ({
  r,
  x,
  p,
  cp,
  sp,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: ROW_Y + (1 - p) * 46,
      width: CARD_W,
      height: CARD_H,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 30,
        background: C.paper,
        boxShadow: `0 ${18 * p}px ${44 * p}px rgba(0,0,0,${0.34 * p})`,
        clipPath: `inset(${((1 - p) * 100).toFixed(2)}% 0 0 0 round 30px)`,
      }}
    />

    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: '30px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        fontFamily: SANS,
        boxSizing: 'border-box',
        opacity: cp,
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
          <div style={{fontWeight: 400, fontSize: 22, color: '#70757A', marginTop: 3}}>
            {r.when}
          </div>
        </div>
        <GoogleG size={32} />
      </div>

      <div style={{display: 'flex', gap: 5, height: 27}}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={27} p={Math.max(0, Math.min(1, (sp - i * STAR_STEP) / 12))} />
        ))}
      </div>

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
  </div>
);

export const Reviews: React.FC<{frame: number}> = ({frame}) => {
  const offset = offsetAt(frame);

  // the edge mask widens as the drift begins, and only then

  const kicker = EASE.entrance(prog(frame, HEAD_AT, HEAD_AT + 30));
  const title = EASE.entrance(prog(frame, HEAD_AT + 10, HEAD_AT + 48));
  const out = 1 - prog(frame, TO - 16, TO);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/*
        The ground stays opaque to the last frame. Fading the WHOLE scene out
        took it through the film's root background, which is white — so two dark
        beats were joined by a white flash. Only the content fades; the dark
        ground holds until the cut, and the beat that follows is dark too.
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

      <div
        style={{position: 'absolute', inset: 0, opacity: out}}>
        {REVIEWS.map((r, i) => {
          // wrap so the row can never run out of cards
          let x = X0 + i * PITCH - offset;
          while (x < -CARD_W - GAP) x += LOOP;
          if (x > W + GAP) return null;

          // only the three that lead get the build; the rest arrive already formed
          const at = CARD_AT + i * CARD_STEP;
          const p = i < 3 ? EASE.entrance(prog(frame, at, at + CARD_DUR)) : 1;
          // the text only starts once the plate is nearly all there
          const cp = i < 3 ? EASE.entrance(prog(frame, at + 12, at + 32)) : 1;
          /**
           * The stars follow the text in, 3 frames apart. Their row keeps a
           * fixed height so nothing below it shifts as they land.
           */
          const sp = i < 3 ? frame - (at + 28) : 99;

          return <Card key={i} r={r} x={x} p={p} cp={cp} sp={sp} />;
        })}
      </div>
      {void H}
    </AbsoluteFill>
  );
};
