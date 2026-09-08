import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, W, H, SANS} from '../theme';
import {Ink} from '../components/Grounds';
import {keyframes} from '../../ease';

/**
 * Beat 6 — the owners' reviews, 15 -> 18.3 s.
 *
 * Rebuilt to the client's notes: the cards are now laid out like real Google
 * reviews — round photo, name, "il y a N mois", the amber five-star row, the
 * quote, and the Google glyph in the corner — instead of the generic quote
 * cards they were. Portraits are real photographs (randomuser.me's sample set,
 * published for exactly this kind of mock-up).
 *
 * The fall was asked for explicitly: the cards had to drop from the sky the way
 * the Scalead wall does. The wall is static and the camera whips up through it,
 * which is what reads on screen as a downpour. Denser than before — eighteen
 * cards instead of eleven — and faster, so the stream is continuous rather than
 * a handful of drifting panels.
 */

const FROM = 1064;
const CW = 620;
const CH = 340;

/**
 * The fall, taken straight from the TikTok reference rather than invented.
 *
 * The brief was "exactement comme dans la vidéo que tu as essayé de recopier,
 * re regarde là ... en terme de physique et de logique". That motion was already
 * measured, frame by frame, when the Scalead film was reverse-engineered: an
 * exhaustive 1D search on the row profile for the fast section (phase
 * correlation breaks down under that much motion blur) and template matching
 * for the landing.
 *
 * So this is the source's own curve — its ramp, its 124 px/frame peak, its
 * overshoot at the landing and the small settle back — remapped from 30 to
 * 60 fps and scaled by 1.322 to span this wall. Same physics, same logic.
 */
const D: [number, number][] = [
  [1064, 0], [1068, 212], [1072, 377], [1075, 512], [1079, 628], [1083, 730],
  [1087, 818], [1091, 1067], [1094, 1152], [1098, 1236], [1102, 1157], [1106, 1252],
  [1110, 1360], [1113, 1491], [1117, 1639], [1121, 1809], [1125, 1999], [1129, 2211],
  [1132, 2447], [1136, 2729], [1140, 3033], [1144, 3371], [1148, 3569], [1153, 3940],
  [1159, 4204], [1163, 4277], [1167, 4290], [1171, 4264], [1174, 4215],
  [1180, 4200], [1191, 4197], [1203, 4204], [1214, 4208], [1260, 4205],
];

type Card = {
  q: string;
  who: string;
  when: string;
  photo: string;
  x: number;
  y: number;
  rot?: number;
};

const P = ['p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10', 'p11', 'p12'];

const CARDS: Card[] = [
  // Re-watching the reference settled this: its cards do not sit in a grid,
  // they OVERLAP and they are TILTED. Cards land on top of cards, each one
  // casting its shadow on the one below, at angles from -18 to +14 degrees.
  // Later entries render on top, so the pile reads as something that was
  // dropped rather than laid out.
  {q: '« Rien à gérer, des revenus chaque mois. »', who: 'Alexis', when: 'il y a 2 mois', photo: P[0], x: 340, y: 150, rot: 7},
  {q: '« Un interlocuteur qui connaît vraiment mon logement. »', who: 'Claire Fabre', when: 'il y a 3 mois', photo: P[1], x: 1144, y: -60, rot: -6},
  {q: '« Aucune mauvaise surprise depuis le premier mois. »', who: 'Julien Roux', when: 'il y a 4 mois', photo: P[2], x: 1560, y: -300, rot: 11},
  {q: '« Réactifs, sérieux, et toujours joignables. »', who: 'Anne Gaillard', when: 'il y a 5 mois', photo: P[3], x: 500, y: -470, rot: -12},
  {q: '« Mon appartement est mieux tenu que par moi-même. »', who: 'Pierre Sabatier', when: 'il y a 5 mois', photo: P[4], x: 1150, y: -650, rot: 5},
  {q: '« Le reporting mensuel est limpide. »', who: 'Hélène Cazes', when: 'il y a 6 mois', photo: P[5], x: 1720, y: -880, rot: -8},
  {q: '« Ils ont doublé mon taux d’occupation. »', who: 'Nicolas Bru', when: 'il y a 7 mois', photo: P[6], x: 300, y: -1254, rot: 9},
  {q: '« Je recommande sans hésiter. »', who: 'Sophie Girard', when: 'il y a 8 mois', photo: P[7], x: 880, y: -1290, rot: -4},
  {q: '« Une équipe locale qui connaît Toulouse. »', who: 'Marc Vidal', when: 'il y a 8 mois', photo: P[8], x: 1480, y: -1500, rot: 13},
  {q: '« Zéro stress, des voyageurs ravis. »', who: 'Laure Estève', when: 'il y a 9 mois', photo: P[9], x: 620, y: -1720, rot: -10},
  {q: '« Le ménage est irréprochable. »', who: 'Thomas Barrau', when: 'il y a 10 mois', photo: P[10], x: 1250, y: -1930, rot: 6},
  {q: '« Des revenus versés à la date près. »', who: 'Émilie Cros', when: 'il y a 11 mois', photo: P[11], x: 1780, y: -2160, rot: -14},
  {q: '« Un suivi sérieux, mois après mois. »', who: 'Paul Rieux', when: 'il y a 11 mois', photo: P[2], x: 380, y: -2380, rot: 8},
  {q: '« Ils gèrent tout, vraiment tout. »', who: 'Nadia Belkacem', when: 'il y a 1 an', photo: P[5], x: 1184, y: -2560, rot: -5},
  {q: '« Mes voyageurs sont toujours ravis. »', who: 'Vincent Roques', when: 'il y a 1 an', photo: P[8], x: 1620, y: -2760, rot: 12},

  // the landing pile — overlapping, tilted, layered front-to-back
  {q: '« Une équipe locale qui connaît Toulouse. »', who: 'Marc Vidal', when: 'il y a 8 mois', photo: P[8], x: 1660, y: -3210, rot: 9},
  {q: '« Le ménage est irréprochable. »', who: 'Thomas Barrau', when: 'il y a 10 mois', photo: P[10], x: 300, y: -3170, rot: -11},
  {q: '« Des revenus versés à la date près. »', who: 'Émilie Cros', when: 'il y a 11 mois', photo: P[11], x: 1144, y: -3260, rot: 4},
  {q: '« Nous avons confié notre logement il y a plusieurs mois et n’avons fait face à aucune mauvaise surprise. »', who: 'Alexis', when: 'il y a 3 mois', photo: P[3], x: 560, y: -3530, rot: 6},
  {q: '« Je peux déléguer en toute confiance. »', who: 'Margaux Reymond', when: 'il y a 2 mois', photo: P[4], x: 1420, y: -3600, rot: -13},
  {q: '« Dès le début, j’ai été rassurée par leur professionnalisme et leur réactivité. »', who: 'Margaux Reymond', when: 'il y a 2 mois', photo: P[0], x: 330, y: -3830, rot: -5},
  {q: '« Merci pour votre travail et votre implication. »', who: 'Jade Peris', when: 'il y a 4 mois', photo: P[1], x: 1124, y: -3900, rot: 8},
  {q: '« La gestion est sérieuse, l’équipe est disponible. »', who: 'Jade Peris', when: 'il y a 4 mois', photo: P[2], x: 1590, y: -3860, rot: -7},
  {q: '« On sent l’envie du travail bien fait. »', who: 'Alexis', when: 'il y a 3 mois', photo: P[5], x: 780, y: -4180, rot: 14},
  {q: '« Un professionnalisme rassurant. »', who: 'Claire Fabre', when: 'il y a 3 mois', photo: P[6], x: 1400, y: -4230, rot: -9},
];


const GoogleG: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 2-1.6 5-4.5 7l6.9 5.3c4.1-3.8 6.6-9.4 6.6-15.6Z" />
    <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.3c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.7l-7.1 5.5C8 40.3 15.4 46 24 46Z" />
    <path fill="#FBBC05" d="M11.5 27.9A13.4 13.4 0 0 1 10.8 24c0-1.4.3-2.7.7-3.9l-7.1-5.5A22 22 0 0 0 2 24c0 3.5.8 6.8 2.4 9.4l7.1-5.5Z" />
    <path fill="#EA4335" d="M24 10.2c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 4 29.9 2 24 2 15.4 2 8 7.7 4.4 14.6l7.1 5.5C13.3 14 18.2 10.2 24 10.2Z" />
  </svg>
);

const Stars: React.FC<{size: number}> = ({size}) => (
  <div style={{display: 'flex', gap: size * 0.16}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={C.star}>
        <path d="M12 2.2l3 6.4 6.9.9-5 4.9 1.2 6.9L12 18l-6.1 3.3 1.2-6.9-5-4.9 6.9-.9Z" />
      </svg>
    ))}
  </div>
);

const Face: React.FC<{c: Card; sy: number}> = ({c, sy}) => (
  <div
    style={{
      position: 'absolute',
      left: c.x - CW / 2,
      top: sy - CH / 2,
      width: CW,
      height: CH,
      borderRadius: 18,
      background: C.paper,
      // a tighter, darker shadow so a card visibly sits ON the one beneath it
      boxShadow: '0 10px 22px rgba(0,0,0,0.42), 0 30px 70px rgba(0,0,0,0.5)',
      transform: `rotate(${c.rot ?? 0}deg)`,
      fontFamily: SANS,
      padding: '34px 36px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      overflow: 'hidden',
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <Img
        src={staticFile(`people/${c.photo}.jpg`)}
        style={{width: 66, height: 66, borderRadius: '50%', objectFit: 'cover'}}
      />
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontWeight: 600, fontSize: 30, color: C.ink, letterSpacing: '-0.012em'}}>
          {c.who}
        </div>
        <div style={{fontWeight: 400, fontSize: 22, color: '#70757A', marginTop: 3}}>
          {c.when}
        </div>
      </div>
      <GoogleG size={34} />
    </div>
    <Stars size={26} />
    <div
      style={{
        fontWeight: 400,
        fontSize: 29,
        lineHeight: 1.36,
        letterSpacing: '-0.008em',
        color: C.inkSoft,
      }}
    >
      {c.q}
    </div>
  </div>
);

/** One-frame shutter; slice count follows the speed of the fall. */
const shutter = (frame: number) => {
  const v = Math.abs(keyframes(frame + 0.5, D) - keyframes(frame - 0.5, D));
  const n = Math.max(1, Math.min(11, Math.round(v / 7) | 1));
  return Array.from({length: n}, (_, i) => -0.5 + (i + 0.5) / n);
};

export const Reviews: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Ink glow={0.5} />
    {shutter(frame).map((o, oi) => (
      // back-to-front alpha 1/(i+1): the stack averages instead of washing out
      <div key={oi} style={{position: 'absolute', inset: 0, opacity: 1 / (oi + 1)}}>
        {CARDS.map((c, i) => {
          const sy = c.y + keyframes(frame + o, D);
          if (sy < -CH || sy > H + CH) return null;
          return <Face key={i} c={c} sy={sy} />;
        })}
      </div>
    ))}
    {void W}
  </AbsoluteFill>
);
