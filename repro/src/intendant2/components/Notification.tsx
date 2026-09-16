import React from 'react';
import {staticFile} from 'remotion';
import {UI} from '../theme';
import type {PhoneGeom} from './Phone';

/**
 * La carte de notification de l'écran verrouillé, d'après la référence.
 *
 * Trois choses font la ressemblance, et j'en avais raté deux au premier jet.
 *
 * 1. LA CARTE EST SOMBRE, PAS CLAIRE. J'avais posé un matériau laiteux avec du
 *    texte noir, ce qu'iOS fait sur un fond d'écran clair. Sur celui-ci, qui
 *    est un bleu moyen, le système bascule sur un matériau sombre et du texte
 *    blanc. C'est visible au premier coup d'œil sur la capture, et ça change
 *    tout le ton de l'écran.
 *
 * 2. IL Y A TROIS LIGNES, PAS DEUX : l'expéditeur, le fil, puis le message.
 *    Une carte à deux lignes se lit comme une maquette ; c'est la ligne du
 *    milieu, en semibold, qui fait vrai.
 *
 * 3. L'AVATAR EST UNE PHOTO RONDE AVEC UNE PASTILLE D'APPLICATION en bas à
 *    droite, quand la notification vient d'un contact. Celles qui ne viennent
 *    pas d'une personne gardent l'icône carrée de leur application.
 */

/** Bulle de message, pour la pastille comme pour l'icône carrée. */
const BubbleGlyph: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <path d="M12 3.4c5 0 9 3.2 9 7.2s-4 7.2-9 7.2a11 11 0 0 1-2.6-.3l-4 1.9a.4.4 0 0 1-.6-.4l.6-3.1C3.6 14.6 3 12.9 3 10.6c0-4 4-7.2 9-7.2Z" />
  </svg>
);

const CalendarGlyph: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <rect x="3.2" y="5" width="17.6" height="16" rx="3.2" />
    <rect x="3.2" y="5" width="17.6" height="5.2" rx="2.6" fillOpacity="0.55" />
    <rect x="7" y="2.4" width="2.2" height="4.4" rx="1.1" />
    <rect x="14.8" y="2.4" width="2.2" height="4.4" rx="1.1" />
  </svg>
);

const SprayGlyph: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <rect x="5.6" y="9.4" width="10.4" height="12.6" rx="2.4" />
    <rect x="8.6" y="6.6" width="4.4" height="3.2" />
    <rect x="7.8" y="3.6" width="6" height="3.2" rx="1" />
    <rect x="13.8" y="4.2" width="3.6" height="2" rx="0.8" />
    <path d="M7.8 6.8H5.4a1.4 1.4 0 0 0-1.4 1.4v1.4h2.2V8.4h1.6Z" />
    <circle cx="19.7" cy="2.9" r="1.05" />
    <circle cx="21.5" cy="5.5" r="0.85" />
    <circle cx="19.3" cy="7.6" r="0.7" />
  </svg>
);

/**
 * Le Bélo d'Airbnb.
 *
 * La plateforme est nommée parce que c'est chez elle que se passe le problème :
 * une conciergerie qui gère des annonces Airbnb a le droit de la nommer, et une
 * notification de réservation annulée sans son logo ne ressemble à rien. C'est
 * un usage nominatif, pas une association de marques.
 */
const AirbnbGlyph: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <path d="M12 2.4c-1.6 0-2.8 1-3.7 3L4 14c-.6 1.3-1.1 2.6-1.1 3.9 0 2.2 1.6 3.7 3.7 3.7 1.9 0 3.6-1.1 5.4-3.1 1.8 2 3.5 3.1 5.4 3.1 2.1 0 3.7-1.5 3.7-3.7 0-1.3-.5-2.6-1.1-3.9l-4.3-8.6c-.9-2-2.1-3-3.7-3Zm0 2.3c.6 0 1.1.5 1.7 1.8l4.3 8.7c.5 1 .8 1.9.8 2.6 0 1-.6 1.7-1.6 1.7-1.2 0-2.6-1-4.1-2.7 1.4-1.8 2.1-3.2 2.1-4.6 0-2-1.4-3.3-3.2-3.3S8.8 10.2 8.8 12.2c0 1.4.7 2.8 2.1 4.6-1.5 1.7-2.9 2.7-4.1 2.7-1 0-1.6-.7-1.6-1.7 0-.7.3-1.6.8-2.6l4.3-8.7c.6-1.3 1.1-1.8 1.7-1.8Zm0 6.6c.8 0 1.3.5 1.3 1.3 0 .8-.4 1.8-1.3 3.1-.9-1.3-1.3-2.3-1.3-3.1 0-.8.5-1.3 1.3-1.3Z" />
  </svg>
);

const glyphs = {
  bubble: BubbleGlyph,
  calendar: CalendarGlyph,
  spray: SprayGlyph,
  airbnb: AirbnbGlyph,
};

export type Note = {
  /** Photo de contact : la notification prend alors la forme « message ». */
  photo?: string;
  /** La couleur de l'application — icône carrée, ou pastille sur la photo. */
  bg: string;
  glyph: keyof typeof glyphs;
  who: string;
  thread: string;
  body: string;
  when: string;
};

export const Notification: React.FC<{g: PhoneGeom; note: Note}> = ({g, note}) => {
  const k = g.k;
  const av = 38 * k;
  const Glyph = glyphs[note.glyph];

  return (
    <div
      style={{
        width: g.screenW - 2 * g.noteInset,
        borderRadius: g.noteR,
        padding: `${13 * k}px ${14 * k}px`,
        boxSizing: 'border-box',
        display: 'flex',
        gap: 11 * k,
        alignItems: 'flex-start',
        /*
         * PAS de `backdrop-filter`, et c'est une décision mesurée.
         *
         * Le verre dépoli s'obtient normalement en floutant ce qui est
         * derrière. Chrome headless le rend — vérifié sur une image — mais le
         * coût explose avec le nombre de calques : une image avec une carte
         * sortait en 60 s, la même avec quatre dépassait 400 s. Sur un film
         * entier, c'est un rendu qui n'aboutit pas.
         *
         * Le repli ne coûte rien parce que le fond d'écran est DÉJÀ flouté à
         * 26 px : il n'y a aucun détail derrière la carte qu'un flou
         * supplémentaire pourrait adoucir.
         */
        background: 'rgba(26,36,52,0.44)',
        fontFamily: UI,
      }}
    >
      <div style={{position: 'relative', width: av, height: av, flex: '0 0 auto'}}>
        {note.photo ? (
          <img
            src={staticFile(`people/${note.photo}.jpg`)}
            style={{
              width: av,
              height: av,
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: av,
              height: av,
              borderRadius: av * 0.23,
              background: note.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Glyph size={av * 0.6} />
          </div>
        )}

        {note.photo ? (
          /* la pastille de l'app, à cheval sur le bord bas-droit de la photo */
          <div
            style={{
              position: 'absolute',
              right: -2 * k,
              bottom: -2 * k,
              width: av * 0.46,
              height: av * 0.46,
              borderRadius: av * 0.14,
              background: note.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Glyph size={av * 0.28} />
          </div>
        ) : null}
      </div>

      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 8 * k}}>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 15 * k,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.96)',
              letterSpacing: -0.2 * k,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {note.who}
          </div>
          <div
            style={{
              flex: '0 0 auto',
              fontSize: 13 * k,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.62)',
            }}
          >
            {note.when}
          </div>
        </div>

        <div
          style={{
            fontSize: 15 * k,
            fontWeight: 600,
            color: '#fff',
            letterSpacing: -0.2 * k,
            lineHeight: 1.28,
          }}
        >
          {note.thread}
        </div>

        <div
          style={{
            fontSize: 15 * k,
            fontWeight: 400,
            lineHeight: 1.28,
            color: 'rgba(255,255,255,0.94)',
            letterSpacing: -0.2 * k,
          }}
        >
          {note.body}
        </div>
      </div>
    </div>
  );
};
