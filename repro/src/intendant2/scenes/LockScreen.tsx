import React from 'react';
import {AbsoluteFill} from 'remotion';
import {T, UI, SANS, W_MED} from '../theme';
import {useStage} from '../../intendant/format';
import {Exposure} from '../../intendant/components/Exposure';
import {prog} from '../../ease';
import {springIn, smoothIn, whipUpOut} from '../motion';
import {EASE} from '../../bezier';
import {Phone, phoneGeom} from '../components/Phone';
import {Notification, type Note} from '../components/Notification';

/**
 * Beats 1 à 3 — le hook, le débordement, l'entrée dans l'écran. 0 -> 10,3 s.
 *
 * Les trois sont dans UN fichier parce qu'ils sont un seul plan sur un seul
 * objet : le téléphone ne quitte jamais le cadre entre l'image 0 et l'image
 * 620. Les découper en trois scènes aurait forcé chacune à recalculer la
 * position, l'échelle et l'état de la pile que la précédente laissait — trois
 * copies d'un même état, et trois occasions de dériver.
 */

const FROM = T.hook.from;
/** La coupe vers les services : c'est là que la caméra monte. */
const CUT = T.services.from;

/**
 * Le téléphone, posé sur le fond crème.
 *
 * L'écran fait 544 px de large, ce qui donne un appareil de 574 x 1210 dans un
 * cadre de 1080 x 1350 : assez grand pour qu'une notification se lise au
 * défilement, assez petit pour garder une marge de marque autour.
 */
const SCREEN_W = 544;

/** Quand chaque notification tombe, et ce qu'elle dit. */
type Timed = Note & {at: number; lines: number};

const NOTES: Timed[] = [
  {
    at: FROM + 40,
    lines: 1,
    photo: 'p07',
    bg: 'linear-gradient(180deg,#5BE168 0%,#25B93B 100%)',
    glyph: 'bubble',
    who: 'Camille D.',
    thread: '⚠️ Problème d’accès',
    body: 'Le code de la porte ne marche pas.',
    when: '',
  },
  {
    at: FROM + 88,
    lines: 1,
    bg: 'linear-gradient(180deg,#FF5A5F 0%,#E0484D 100%)',
    glyph: 'airbnb',
    who: 'Airbnb',
    thread: '⚠️ Réservation annulée',
    body: 'Le voyageur a annulé pour le 12 mars.',
    when: '',
  },
  {
    at: FROM + 128,
    lines: 1,
    bg: 'linear-gradient(180deg,#4FC3D4 0%,#2A8FA6 100%)',
    glyph: 'spray',
    who: 'Ménage',
    thread: 'Planning de demain',
    body: 'Je ne peux pas venir.',
    when: '',
  },
  {
    at: FROM + 164,
    lines: 2,
    photo: 'p09',
    bg: 'linear-gradient(180deg,#5BE168 0%,#25B93B 100%)',
    glyph: 'bubble',
    who: 'Thomas B.',
    thread: 'Arrivée demain',
    body: 'On arrive avec deux heures d’avance, c’est possible ?',
    when: '',
  },
];

/**
 * L'horodatage vit, comme sur un vrai écran.
 *
 * Une chaîne figée obligeait à mentir sur un des deux bouts : soit la première
 * notification affichait « il y a 6 min » à la seconde où elle tombait, soit
 * la pile finissait avec quatre « maintenant ». Le dérouler depuis l'instant
 * d'arrivée règle les deux, et ajoute ce que fait un vrai téléphone — le temps
 * qui passe pendant que ça continue de tomber.
 */
const whenOf = (frame: number, at: number) => {
  const dt = frame - at;
  if (dt < 55) return 'maintenant';
  if (dt < 105) return 'il y a 1 min';
  if (dt < 160) return 'il y a 3 min';
  return 'il y a 6 min';
};

/** Hauteur d'une carte, calculée plutôt que mesurée : le contenu est fixe. */
/**
 * Hauteur d'une carte, calculée plutôt que mesurée : le contenu est fixe.
 * 26 de marges, 18 pour la ligne de l'expéditeur, 19,2 pour celle du fil, et
 * 19,2 par ligne de message.
 */
const heightOf = (n: Timed, k: number) => (26 + 18 + 19.2 + 19.2 * n.lines) * k;

/**
 * Combien de temps une notification met à se poser.
 *
 * Sur un ressort SANS rebond — `smoothIn` — et sur 32 images plutôt que 24.
 * Les deux vont ensemble : un mouvement critiquement amorti a besoin d'un peu
 * plus de temps pour ne pas paraître sec, et c'est ce couple qui donne le
 * glissé d'iOS plutôt qu'un empilement qui tressaute.
 */
const DROP = 32;

export const LockScreen: React.FC<{frame: number}> = ({frame}) => {
  const {w: W, h: H} = useStage();
  const g = phoneGeom(SCREEN_W);
  const deviceH = g.screenH + 2 * g.bezel;

  /*
   * L'appareil monte dans le cadre, puis l'écran s'allume. L'ordre compte : un
   * écran déjà allumé pendant que le téléphone bouge encore ressemble à une
   * capture qu'on fait glisser ; allumé une fois posé, à un téléphone qu'on
   * regarde.
   */
  const rise = springIn(frame, FROM, 28, 0.68);
  const lit = prog(frame, FROM + 14, FROM + 28);

  /*
   * Le beat du débordement recule un peu l'appareil pour ouvrir une bande de
   * fond en haut, où la phrase se révèle. C'est la seule façon de tenir une
   * ligne de marque dans un cadre qu'un téléphone de 1210 px occupe déjà à
   * 90 %.
   */
  const back = EASE.camera(prog(frame, T.overflow.from + 20, T.overflow.from + 74));
  const scale = 1 - 0.15 * back;

  /*
   * LA SORTIE : la caméra monte, d'un seul coup.
   *
   * Elle entrait dans l'écran par un zoom, ce qui coûtait quatre-vingts images
   * pour un mouvement qui n'allait nulle part — on s'enfonçait dans un objet
   * puis on le perdait, et l'écran se dissolvait faute de destination. Un
   * fouetté vertical dit la même chose en un tiers du temps et il DIT quelque
   * chose : on quitte le problème par le haut, et la réponse arrive d'en bas.
   */
  const dy = whipUpOut(frame, CUT, H);

  const cy = H / 2 + 74 * back;

  /* combien chaque notification est arrivée : 0 avant, 1 posée */
  const arrived = NOTES.map((n) => smoothIn(frame, n.at, DROP));

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${dy}px)`}}>
        {/*
          La phrase du beat 2, au-dessus de l'appareil reculé. Même geste
          « exposition » que les phrases du film #1 : c'est le même composant,
          donc les deux publicités parlent avec la même voix.
        */}
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 0.21 * H}}>
          <Exposure
            frame={frame}
            rows={['Vous en avez assez', 'de tout gérer ?']}
            from={T.overflow.from + 44}
            reveal={30}
            exitFrom={CUT + 999}
            exitTo={CUT + 1000}
            fontSize={66}
            font={SANS}
            weight={W_MED}
            tracking="-0.012em"
            ground="light"
            soft={10}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: W / 2,
            top: cy,
            transform:
              `translate(-50%,-50%) translateY(${(1 - rise) * 0.16 * deviceH}px) ` +
              `scale(${scale})`,
            opacity: rise,
          }}
        >
          <Phone g={g} clock="23:47" date="mardi 1 avril" lit={lit}>
            <div
              style={{
                position: 'absolute',
                left: g.noteInset,
                top: g.notesTop,
                width: g.screenW - 2 * g.noteInset,
              }}
            >
              {NOTES.map((n, i) => {
                /*
                 * Une notification est poussée vers le bas par toutes celles qui
                 * sont tombées APRÈS elle : la plus récente est en haut, comme
                 * sur iOS. L'offset se calcule donc à partir des arrivées, pas
                 * d'un index figé — sinon la pile saute d'un cran au lieu de
                 * glisser.
                 */
                let y = 0;
                for (let j = i + 1; j < NOTES.length; j++) {
                  y += (heightOf(NOTES[j], g.k) + g.noteGap) * arrived[j];
                }
                const a = arrived[i];
                if (a <= 0.001) return null;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: y,
                      width: '100%',
                      opacity: Math.min(1, a * 1.8),
                      transform: `translateY(${(1 - a) * -20 * g.k}px) scale(${
                        0.96 + 0.04 * a
                      })`,
                      transformOrigin: '50% 0%',
                    }}
                  >
                    <Notification g={g} note={{...n, when: whenOf(frame, n.at)}} />
                  </div>
                );
              })}
            </div>
          </Phone>
        </div>
      </div>
      {void UI}
    </AbsoluteFill>
  );
};
