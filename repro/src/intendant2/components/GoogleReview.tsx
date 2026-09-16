import React from 'react';
import {C, SANS, W_MED, W_BOLD} from '../theme';

/**
 * La fiche d'avis Google, façon vraie fiche.
 *
 * Deux choix qui font la crédibilité, et qui sont les mêmes que ceux d'une
 * vraie fiche : l'étoile est JAUNE et non de la couleur de la marque, et
 * l'avatar est une initiale sur fond coloré. Habiller un avis aux couleurs de
 * l'annonceur, c'est lui retirer ce qui en fait une preuve — il faut qu'il ait
 * l'air de venir d'ailleurs.
 *
 * Sur le film #1 les textes étaient de vrais avis mais les visages venaient
 * d'une banque d'images. L'initiale règle ça : c'est exactement ce que Google
 * affiche quand l'auteur n'a pas de photo, donc rien n'est inventé.
 */

export const GOOGLE_YELLOW = '#FBBC05';

export const GoogleG: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 2-1.6 5-4.5 7l6.9 5.3c4.1-3.8 6.6-9.4 6.6-15.6Z" />
    <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.3c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.7l-7.1 5.5C8 40.3 15.4 46 24 46Z" />
    <path fill="#FBBC05" d="M11.5 27.9A13.4 13.4 0 0 1 10.8 24c0-1.4.3-2.7.7-3.9l-7.1-5.5A22 22 0 0 0 2 24c0 3.5.8 6.8 2.4 9.4l7.1-5.5Z" />
    <path fill="#EA4335" d="M24 10.2c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 4 29.9 2 24 2 15.4 2 8 7.7 4.4 14.6l7.1 5.5C13.3 14 18.2 10.2 24 10.2Z" />
  </svg>
);

const Star: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={GOOGLE_YELLOW}>
    <path d="M12 2.2l3 6.4 6.9.9-5 4.9 1.2 6.9L12 18l-6.1 3.3 1.2-6.9-5-4.9 6.9-.9Z" />
  </svg>
);

export const Stars: React.FC<{size: number; gap?: number; shown?: number}> = ({
  size,
  gap = size * 0.2,
  shown = 5,
}) => (
  <div style={{display: 'flex', gap}}>
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} style={{opacity: Math.max(0, Math.min(1, shown - i))}}>
        <Star size={size} />
      </div>
    ))}
  </div>
);

/**
 * Les couleurs d'avatar de Google, reprises telles quelles : ce sont elles
 * qu'on reconnaît sans savoir qu'on les reconnaît.
 */
const AVATAR_BG = ['#1A73E8', '#E37400', '#0B8043', '#C5221F', '#7627BB', '#00796B'];

export type Review = {who: string; when: string; quote: string};

export const ReviewCard: React.FC<{r: Review; i: number; w: number}> = ({r, i, w}) => (
  <div
    style={{
      width: w,
      boxSizing: 'border-box',
      display: 'flex',
      gap: 26,
      alignItems: 'flex-start',
      padding: '28px 32px',
      borderRadius: 28,
      background: C.paper,
      boxShadow: '0 14px 34px rgba(70,12,6,0.08)',
    }}
  >
    <div
      style={{
        width: 68,
        height: 68,
        flex: '0 0 auto',
        borderRadius: '50%',
        background: AVATAR_BG[i % AVATAR_BG.length],
        color: '#fff',
        fontFamily: SANS,
        fontWeight: W_MED,
        fontSize: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {r.who.slice(0, 1).toUpperCase()}
    </div>

    <div style={{flex: 1, minWidth: 0}}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: W_BOLD,
          fontSize: 33,
          letterSpacing: '-0.02em',
          color: C.ink,
        }}
      >
        {r.who}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 8}}>
        <Stars size={24} />
        <div
          style={{
            fontFamily: SANS,
            fontWeight: W_MED,
            fontSize: 24,
            color: C.muted,
          }}
        >
          {r.when}
        </div>
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: SANS,
          fontWeight: W_MED,
          fontSize: 30,
          lineHeight: 1.32,
          letterSpacing: '-0.014em',
          color: C.inkSoft,
        }}
      >
        {r.quote}
      </div>
    </div>
  </div>
);
