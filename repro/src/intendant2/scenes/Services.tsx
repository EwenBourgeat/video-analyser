import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, T, SANS, W_MED, W_BOLD} from '../theme';
import {useStage} from '../../intendant/format';
import {Exposure} from '../../intendant/components/Exposure';
import {Glyph, type GlyphName} from '../../intendant/components/Glyphs';
import {prog} from '../../ease';
import {smoothIn, whipOut, whipUpIn} from '../motion';
import {EASE} from '../../bezier';

/**
 * Beat 4 — les trois services. 10,3 -> 16,0 s.
 *
 * Les cartes reprennent la SILHOUETTE de la notification : pastille d'icône à
 * gauche, titre en gras, une ligne en dessous. C'est une rime, et elle porte
 * l'argument du film — le même objet qui déversait les corvées porte
 * maintenant les services. Agrandie au plein cadre et passée dans la charte,
 * elle ne ressemble plus du tout aux rangées tuile + libellé du film #1.
 *
 * Elles arrivent en cascade par la droite, alors que les notifications
 * tombaient par le haut : même rythme, autre direction, pour que la séquence
 * ne se lise pas comme une répétition de la précédente.
 */

const FROM = T.services.from;
const TO = T.services.to;

type Service = {n: string; glyph: GlyphName; title: string; line: string};

const SERVICES: Service[] = [
  {n: '01', glyph: 'camera', title: 'Annonce et photos', line: 'Shooting pro, mise en ligne.'},
  {n: '02', glyph: 'key', title: 'Accueil 7 j / 7', line: 'Arrivées, messages, imprévus.'},
  {n: '03', glyph: 'spray', title: 'Ménage hôtelier', line: 'Linge fourni, contrôle qualité.'},
];

/*
 * La cascade commence AVANT la coupe, pas après.
 *
 * C'est un défaut vu au rendu : le fouetté vertical montait le téléphone et
 * découvrait, en dessous, une scène vide — son titre et ses cartes ne
 * commençaient à se révéler qu'une fois la transition terminée. Un fouetté
 * n'est pas un fondu : il amène une scène DÉJÀ composée, sinon il ne relie
 * rien et le film se troue au moment précis où il devait accélérer.
 *
 * Le titre est donc entièrement révélé avant la coupe, pendant qu'il monte
 * encore depuis le bas du cadre, et les cartes enchaînent aussitôt.
 */
/**
 * Le déroulé de la scène, en quatre temps.
 *
 * La phrase arrive en grand au CENTRE du cadre et y tient, puis la caméra
 * descend — donc la phrase remonte — jusqu'à la place qu'elle occupait
 * jusqu'ici, et les trois cartes se posent dans l'espace que la descente vient
 * d'ouvrir. C'est le mouvement qui fait la liaison : les cartes n'apparaissent
 * pas à côté de la phrase, elles apparaissent SOUS elle, là où la caméra est
 * allée les chercher.
 */
const HOLD_TO = FROM + 63;
const DIVE_TO = FROM + 111;
const CARD_IN = FROM + 115;
const CARD_STEP = 32;
const CARD_DUR = 38;

/**
 * De combien la caméra descend : l'écart entre le centre du cadre et la place
 * finale du titre. Dérivé des deux positions plutôt que saisi, sinon déplacer
 * le titre casserait silencieusement l'amplitude du mouvement.
 */
const TITLE_TOP = 0.11;
const TITLE_MID = 0.42;

export const Services: React.FC<{frame: number}> = ({frame}) => {
  const {w: W, h: H} = useStage();
  /* la scène arrive par le bas pendant que l'écran verrouillé monte */
  const dyIn = whipUpIn(frame, FROM, H);

  /*
   * La descente. `dive` vaut 0 pendant que la phrase tient au centre et 1 une
   * fois la caméra posée ; tout le contenu de la scène est décalé du même
   * `worldY`, donc la phrase et les cartes appartiennent au même monde et le
   * mouvement est une vraie caméra, pas deux animations qui se ressemblent.
   */
  const dive = EASE.camera(prog(frame, HOLD_TO, DIVE_TO));
  const worldY = (1 - dive) * (TITLE_MID - TITLE_TOP) * H;
  /* et elle recule un peu en se posant : le titre passe de grand à sa taille */
  const titleScale = 1.34 - 0.34 * dive;

  const cardW = Math.min(880, W - 100);
  const tile = 104;
  const gap = 26;
  /* 28 de marge en haut et en bas, plus le bloc de texte : 186 px. */
  const CARD_H = 186;

  /* la scène file vers la gauche pendant que les avis arrivent par la droite */
  const dx = whipOut(frame, TO, W);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>

      <div
        style={{
          position: 'absolute',
          left: dx,
          top: TITLE_TOP * H + dyIn + worldY,
          width: W,
          height: 0.17 * H,
          transform: `scale(${titleScale})`,
          transformOrigin: '50% 50%',
        }}
      >
        <Exposure
          frame={frame}
          rows={['Nous prenons le relais.']}
          from={FROM - 26}
          reveal={28}
          exitFrom={TO + 999}
          exitTo={TO + 1000}
          fontSize={64}
          font={SANS}
          weight={W_MED}
          tracking="-0.012em"
          ground="light"
          soft={10}
        />
      </div>

      {SERVICES.map((s, i) => {
        const a = CARD_IN + i * CARD_STEP;
        const p = smoothIn(frame, a, CARD_DUR);
        if (p <= 0.001) return null;
        /*
          * Le pas est la hauteur de carte PLUS l'écart, calculé et non deviné :
          * un premier jet additionnait la tuile et les marges sans compter le
          * bloc de texte, plus haut qu'elle, et les trois cartes se touchaient
          * à huit pixels près.
          */
        const top = 0.345 * H + i * (CARD_H + gap) + dyIn + worldY;
        return (
          <div
            key={s.n}
            style={{
              position: 'absolute',
              left: W / 2 - cardW / 2,
              top,
              width: cardW,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: 30,
              padding: '28px 34px',
              borderRadius: 40,
              background: C.paper,
              boxShadow: '0 16px 38px rgba(70,12,6,0.09)',
              /* elles entrent par la droite, les notifications tombaient du haut */
              transform: `translateX(${(1 - p) * 0.7 * W + dx}px)`,
              opacity: Math.min(1, p * 1.6),
            }}
          >
            <div
              style={{
                width: tile,
                height: tile,
                flex: '0 0 auto',
                borderRadius: 30,
                background: C.deep,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* blanc pur : sur du bordeaux, un crème se lit gris à côté d'une page claire */}
              <Glyph name={s.glyph} size={tile * 0.54} color="#FFFFFF" counter={C.deep} />
            </div>

            <div style={{flex: 1, minWidth: 0}}>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: W_BOLD,
                  fontSize: 25,
                  letterSpacing: '0.18em',
                  color: C.blue600,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontFamily: SANS,
                  fontWeight: W_BOLD,
                  fontSize: 46,
                  letterSpacing: '-0.028em',
                  lineHeight: 1.1,
                  color: C.deep,
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: SANS,
                  fontWeight: W_MED,
                  fontSize: 30,
                  letterSpacing: '-0.014em',
                  color: C.muted,
                }}
              >
                {s.line}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
