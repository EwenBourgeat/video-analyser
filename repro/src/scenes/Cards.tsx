import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, W, H, FONT, SPF} from '../theme';
import {keyframes, prog, outCubic} from '../ease';
import {P} from '../tunables';

/**
 * Beat 6 — the business-card wall, 12.467 -> 15.867 s.
 *
 * Iteration 7 — rebuilt from measurement instead of guesswork. This scene alone
 * was carrying 45% of the film's error (30.2% against 2-7% everywhere else).
 *
 * What it actually is: a STATIC wall of cards, and a camera that whips upward
 * through it and lands with a small overshoot. Nothing "flies into place".
 *   - the wall's vertical displacement was recovered by phase correlation frame
 *     by frame: 3183 px of travel, peaking at 124 px/frame around f=416,
 *     overshooting to +88 at f=426 and settling by f=436
 *   - each card's world position then follows from the frame at which it crosses
 *     the top of frame: world_top = -D(f_entry). Predicted screen positions match
 *     the detections to the pixel (132 vs 132, 141 vs 141)
 *   - the landing composition was read off f=440: card 645 x 397, three rows at
 *     world y -2301 / -2712 / -3093
 *   - after f=442 the wall drifts left ~2.75 px/frame (template matching)
 * Avatars are the real photographs cut out of the source (tools/avatars.py).
 */



/** Content displacement, measured. screen_y = world_y + D(frame). */
const D: [number, number][] = [
  // f<=418 from an exhaustive 1D search on the row profile (robust under the
  // motion blur that defeats phase correlation); f>=429 from template matching
  // the Laurent card. The f=420-426 template hits were discarded: they had
  // locked onto the wrong card (x=1411 instead of ~500).
  [374, 0], [376, 160], [378, 285], [380, 387], [382, 475], [384, 552],
  [386, 619], [388, 683], [390, 747], [392, 811], [394, 875], [396, 947],
  [398, 1029], [400, 1128], [402, 1240], [404, 1368], [406, 1512], [408, 1672],
  [410, 1851], [412, 2064], [414, 2294], [416, 2550], [418, 2700], [421, 2980],
  [424, 3180], [426, 3235], [428, 3245], [430, 3225], [432, 3188], [435, 3177], [441, 3175],
  [447, 3180], [453, 3183], [477, 3181],
];

/**
 * The "drift" of the settled wall is not a translation at all: template matching
 * two cards shows their separation growing 912 -> 995 px between f=430 and f=474,
 * i.e. a slow 9% ZOOM about (1262, 737). Modelling it as a sideways drift was
 * why the error grew from 28 to 59 across the held section.
 */
const ZOOM: [number, number][] = [
  [374, 1], [430, 0.9945], [438, 1], [446, 1], [450, 1.003], [454, 1.012],
  [458, 1.021], [462, 1.035], [466, 1.050], [470, 1.068], [474, 1.085],
  [477, 1.093],
];
const ZCX = 1262;
const ZCY = 737;

/**
 * One-frame shutter. Five samples read as five ghosts once the wall passes
 * ~60 px/frame, so the sample count follows the speed: at the 124 px/frame peak
 * the smear needs ~17 slices to look continuous the way the source does.
 */
const shutter = (frame: number) => {
  const half = SPF / 2;
  const v = Math.abs(keyframes(frame + half, D) - keyframes(frame - half, D));
  // at 60 fps the wall covers half as much ground per frame, so it needs far
  // fewer slices — and less blur is exactly what "plus fluide" asks for
  const n = Math.max(1, Math.min(11, Math.round(v / 7) | 1));
  return Array.from({length: n}, (_, i) => -half + (SPF * (i + 0.5)) / n);
};

type Card = {
  key: string;
  avatar: string;
  name: string;
  role: string;
  mail: string;
  tel: string;
  x: number;
  y: number;
  rot?: number;
};

const CARDS: Card[] = [
  {key: 'a', avatar: 'lucas-maycock', name: 'Lucas Maycock', role: 'CEO, Clickland', mail: 'lucasmaycock@email.fr', tel: '+33 1 678901234', x: 979, y: -158},
  {key: 'b', avatar: 'lucas-martin', name: 'Lucas Martin', role: 'Chef de projet', mail: 'lucas.martin@email.fr', tel: '+33 1 098765432', x: 319, y: -631},
  {key: 'c', avatar: 'jules', name: 'Jules Lefevre', role: 'Chef de projet', mail: 'jules.lefevre@email.fr', tel: '+33 1 234598761', x: 1651, y: -1140},
  {key: 'd', avatar: 'laurent', name: 'Laurent', role: 'CEO, Deco and pro', mail: 'leon.martin@email.fr', tel: '+33 1 987654321', x: 621, y: -1504},
  {key: 'e', avatar: 'romain', name: 'Romain Iamurey', role: 'Fondeur, RLM Agency', mail: 'baptiste.laurent@email.fr', tel: '+33 1 345678912', x: 1375, y: -1750},
  // landing composition, read off f=440
  {key: 'h', avatar: 'lucas-martin', name: 'Lucas Martin', role: 'Chef de projet', mail: 'lucas.martin@email.fr', tel: '+33 1 098765432', x: 136, y: -2290},
  {key: 'i', avatar: 'lucas-maycock', name: 'Lucas Maycock', role: 'CEO, Clickland', mail: 'lucasmaycock@email.fr', tel: '+33 1 678901234', x: 932, y: -2290},
  {key: 'j', avatar: 'jules', name: 'Jules Lefevre', role: 'Chef de projet', mail: 'jules.lefevre@email.fr', tel: '+33 1 234598761', x: 1754, y: -2290},
  {key: 'k', avatar: 'laurent', name: 'Laurent', role: 'CEO, Deco and pro', mail: 'leon.martin@email.fr', tel: '+33 1 987654321', x: 487, y: -2699},
  {key: 'l', avatar: 'romain', name: 'Romain Iamurey', role: 'Fondeur, RLM Agency', mail: 'baptiste.laurent@email.fr', tel: '+33 1 345678912', x: 1400, y: -2699},
  {key: 'm', avatar: 'robin', name: 'Robin Tessier', role: 'CEO, YASKA WEB', mail: 'robintessier@email.fr', tel: '+33 1 890123456', x: 675, y: -3090, rot: -8},
];

const CardFace: React.FC<{c: Card; sx: number; sy: number; rot: number}> = ({
  c,
  sx,
  sy,
  rot,
}) => {
  const t = P();
  const CW = t.cardW;
  const CH = t.cardH;
  return (
  <div
    style={{
      position: 'absolute',
      left: sx - CW / 2,
      top: sy - CH / 2,
      width: CW,
      height: CH,
      borderRadius: t.cardR,
      background: C.white,
      boxShadow: `0 26px 64px rgba(0,0,0,${t.cardShadow})`,
      transform: `rotate(${rot}deg)`,
      fontFamily: FONT,
      overflow: 'hidden',
    }}
  >
    <Img
      src={staticFile(`avatars/${c.avatar}.png`)}
      style={{
        position: 'absolute',
        left: CW / 2 - t.cardAvatar / 2,
        top: CH * t.cardAvatarY - t.cardAvatar / 2,
        width: t.cardAvatar,
        height: t.cardAvatar,
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: CH * t.cardNameY,
        width: '100%',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: t.cardNameSize,
        color: '#0B0B0C',
      }}
    >
      {c.name}
    </div>
    <div
      style={{
        position: 'absolute',
        top: CH * (t.cardNameY + 0.105),
        width: '100%',
        textAlign: 'center',
        fontWeight: 400,
        fontSize: t.cardRoleSize,
        color: '#6B7280',
      }}
    >
      {c.role}
    </div>
    <div
      style={{
        position: 'absolute',
        top: CH * (t.cardNameY + 0.33),
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 13,
        fontSize: t.cardFootSize,
        color: '#7A828C',
      }}
    >
      <span>{c.mail}</span>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: C.blue600,
          display: 'inline-block',
        }}
      />
      <span>{c.tel}</span>
    </div>
  </div>
  );
};

export const Cards: React.FC<{frame: number}> = ({frame}) => {
  const t = P();
  const CH = t.cardH;
  // dy is sampled per sub-frame inside the shutter loop below
  const dx = t.cardDX;
  const zoom = keyframes(frame, ZOOM);
  const swing = outCubic(prog(frame, 428, 446));

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Img
        src={staticFile('plates/cards.png')}
        style={{position: 'absolute', width: W, height: H}}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${zoom})`,
          transformOrigin: `${ZCX}px ${ZCY}px`,
        }}
      >
        {shutter(frame).map((o, oi) => (
          // painting back-to-front with alpha 1/(i+1) makes the composite the
          // exact average of the samples; a flat 1/n would just wash them out
          <div key={oi} style={{position: 'absolute', inset: 0, opacity: 1 / (oi + 1)}}>
            {CARDS.map((c) => {
              const sy = c.y + keyframes(frame + o, D) + t.cardDY;
              if (sy < -CH || sy > H + CH) return null;
              const rot =
                c.key === 'm' ? (c.rot ?? 0) - 6 * prog(frame, 430, 477) : c.rot ?? 0;
              return <CardFace key={c.key} c={c} sx={c.x + dx} sy={sy} rot={rot} />;
            })}
          </div>
        ))}
      </div>
      {/* Camille Mercier arrives top-right during the landing then swings away */}
      {frame >= 418 && frame <= 448 ? (
        <CardFace
          c={{
            key: 'n', avatar: 'jules', name: 'Camille Mercier',
            role: 'Spécialiste SEO', mail: 'camille.mercier@email.fr',
            tel: '+33 1 789012345', x: 0, y: 0,
          }}
          sx={1640 + dx + 140 * swing}
          sy={-3040 + keyframes(frame, D) + t.cardDY - 130 * swing}
          rot={14 + 16 * swing}
        />
      ) : null}
    </AbsoluteFill>
  );
};
