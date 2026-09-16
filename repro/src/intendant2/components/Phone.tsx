import React from 'react';
import {UI} from '../theme';

/**
 * Le châssis du téléphone, reproduit d'après la référence fournie.
 *
 * Tout est dérivé de UNE mesure : la largeur de l'écran. Les métriques iOS
 * sont exprimées en points sur une base de 393 (la largeur d'un iPhone 15
 * Pro), et le facteur `k` les amène à la taille demandée. C'est ce qui permet
 * de poser le téléphone en grand pour le hook et en plus petit pour le payoff
 * sans que l'encoche, les marges des notifications ou la barre d'accueil se
 * mettent à dériver les unes par rapport aux autres.
 *
 * Les proportions viennent de la capture : Dynamic Island, barre d'état à
 * droite seulement, date puis heure très grande, pile de notifications, deux
 * boutons ronds en bas, barre d'accueil.
 */

/** Largeur de référence, en points iOS. Tout le reste en découle. */
const BASE = 393;

export type PhoneGeom = ReturnType<typeof phoneGeom>;

export const phoneGeom = (screenW: number) => {
  const k = screenW / BASE;
  return {
    k,
    screenW,
    screenH: 852 * k,
    bezel: 11 * k,
    deviceR: 58 * k,
    screenR: 47 * k,
    island: {w: 125 * k, h: 37 * k, top: 11 * k},
    statusY: 20 * k,
    dateTop: 58 * k,
    dateSize: 17 * k,
    clockTop: 76 * k,
    clockSize: 96 * k,
    noteInset: 12 * k,
    noteR: 22 * k,
    noteGap: 8 * k,
    notesTop: 320 * k,
    btn: 50 * k,
    btnInset: 38 * k,
    btnBottom: 34 * k,
    homeW: 140 * k,
    homeH: 5 * k,
    homeBottom: 9 * k,
  };
};

/**
 * Le fond d'écran : des formes organiques floues, vert, bleu et violet sombres.
 *
 * L'utilisateur a choisi de garder les teintes de la référence plutôt que
 * celles de la charte — elles n'existent nulle part ailleurs dans le film, et
 * c'est assumé : c'est l'écran de quelqu'un d'autre, pas une surface de la
 * marque. Le film rattrape l'écart en posant le téléphone sur un fond crème.
 *
 * Le calque est débordant de 12 % et flouté : un flou appliqué au ras d'un
 * conteneur découpé laisse voir ses propres bords, ce qui produit un liseré
 * clair tout autour de l'écran.
 */
const Wallpaper: React.FC<{g: PhoneGeom}> = ({g}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#090E16'}}>
    <div
      style={{
        position: 'absolute',
        left: '-12%',
        top: '-12%',
        width: '124%',
        height: '124%',
        filter: `blur(${26 * g.k}px)`,
        background: [
          /* la masse marine qui occupe le haut et la droite */
          'radial-gradient(48% 30% at 66% 16%, #2D3A78 0%, rgba(45,58,120,0) 100%)',
          'radial-gradient(34% 22% at 46% 27%, #3C4E8C 0%, rgba(60,78,140,0) 100%)',
          /* l'ardoise du bord gauche */
          'radial-gradient(40% 30% at 10% 26%, #5C788C 0%, rgba(92,120,140,0) 100%)',
          /* la sauge : franche, et bien plus haute que je ne l'avais mise */
          'radial-gradient(54% 36% at 24% 58%, #93AC90 0%, rgba(147,172,144,0) 100%)',
          'radial-gradient(46% 30% at 44% 76%, #A8BC9C 0%, rgba(168,188,156,0) 100%)',
          'radial-gradient(40% 26% at 14% 82%, #7E9B8A 0%, rgba(126,155,138,0) 100%)',
          /* le bleu du bas à droite */
          'radial-gradient(48% 32% at 80% 68%, #3A5B8C 0%, rgba(58,91,140,0) 100%)',
          'linear-gradient(162deg, #55708A 0%, #48607E 46%, #3A506E 100%)',
        ].join(','),
      }}
    />
    {/* le léger assombrissement des bords, qui fait tenir le texte blanc */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(84% 64% at 50% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.16) 100%)',
      }}
    />
  </div>
);

const StatusBar: React.FC<{g: PhoneGeom}> = ({g}) => {
  const s = g.k;
  return (
    <div
      style={{
        position: 'absolute',
        right: 20 * s,
        top: g.statusY,
        display: 'flex',
        alignItems: 'center',
        gap: 5 * s,
      }}
    >
      {/* réseau : quatre barres croissantes */}
      <svg width={17 * s} height={11 * s} viewBox="0 0 17 11" fill="#fff">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 4.4} y={7.5 - i * 2.5} width="3" height={3.5 + i * 2.5} rx="1" />
        ))}
      </svg>
      {/* wifi : trois arcs et le point */}
      <svg width={15 * s} height={11 * s} viewBox="0 0 15 11" fill="none" stroke="#fff">
        <path d="M1 3.6a9.6 9.6 0 0 1 13 0" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M3.6 6.2a6 6 0 0 1 7.8 0" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6 8.6a2.6 2.6 0 0 1 3 0" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {/* batterie */}
      <svg width={25 * s} height={12 * s} viewBox="0 0 25 12">
        <rect x="0.6" y="0.6" width="21" height="10.8" rx="3.2" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.1" />
        <rect x="2.2" y="2.2" width="17.8" height="7.6" rx="2" fill="#fff" />
        <path d="M23 4.2v3.6a2 2 0 0 0 0-3.6Z" fill="#fff" fillOpacity="0.45" />
      </svg>
    </div>
  );
};

const BottomButton: React.FC<{g: PhoneGeom; side: 'left' | 'right'}> = ({g, side}) => (
  <div
    style={{
      position: 'absolute',
      [side]: g.btnInset,
      bottom: g.btnBottom,
      width: g.btn,
      height: g.btn,
      borderRadius: '50%',
      /* même raison que les notifications : le fond derrière est déjà flou */
      background: 'rgba(255,255,255,0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {side === 'left' ? (
      // lampe torche
      <svg width={g.btn * 0.5} height={g.btn * 0.5} viewBox="0 0 24 24" fill="#fff">
        <path d="M6.6 2.4h10.8a1.4 1.4 0 0 1 1.4 1.6l-.7 3.4a1.4 1.4 0 0 1-1.4 1.1H7.3a1.4 1.4 0 0 1-1.4-1.1l-.7-3.4a1.4 1.4 0 0 1 1.4-1.6Z" />
        <path d="M8.1 10.5h7.8l-.8 9.8a3.1 3.1 0 0 1-6.2 0Z" />
      </svg>
    ) : (
      // appareil photo
      <svg width={g.btn * 0.46} height={g.btn * 0.46} viewBox="0 0 24 24" fill="#fff">
        <path d="M4 7.4h3.1l1.4-2.2h7l1.4 2.2H20a1.7 1.7 0 0 1 1.7 1.7v8.4A1.7 1.7 0 0 1 20 19H4a1.7 1.7 0 0 1-1.7-1.7V9.1A1.7 1.7 0 0 1 4 7.4Z" />
        <circle cx="12" cy="13.3" r="3.9" fill="#0B111B" />
        <circle cx="12" cy="13.3" r="2.5" fill="#fff" />
      </svg>
    )}
  </div>
);

export const Phone: React.FC<{
  g: PhoneGeom;
  /** L'heure et la date de l'écran verrouillé. */
  clock: string;
  date: string;
  /** 0 = écran éteint, 1 = allumé. Pilote l'allumage du hook. */
  lit?: number;
  /** Opacité de l'horloge, séparée : elle s'efface quand on entre dans l'écran. */
  clockOpacity?: number;
  /** La pile de notifications, posée par la scène. */
  children?: React.ReactNode;
  /** Recouvre l'écran — sert à la dissolution vers le plein cadre. */
  overlay?: React.ReactNode;
}> = ({g, clock, date, lit = 1, clockOpacity = 1, children, overlay}) => (
  <div
    style={{
      position: 'relative',
      width: g.screenW + 2 * g.bezel,
      height: g.screenH + 2 * g.bezel,
      borderRadius: g.deviceR,
      /* le biseau titane : un dégradé, pas un aplat, sinon le téléphone est un rectangle */
        /*
       * Du titane sombre, pas du chrome. Un premier essai en dégradé clair
       * donnait une bande argentée qui se lisait deux fois plus épaisse
       * qu'elle ne l'est : sur un appareil réel le cadre est gris foncé et
       * seules ses ARÊTES accrochent la lumière. Ce sont donc les arêtes qui
       * sont claires ici, et le corps qui reste sombre.
       */
      background:
        'linear-gradient(142deg, #8E8E93 0%, #47474B 8%, #3A3A3C 34%, #5A5A5F 50%, #35353A 68%, #4A4A4F 92%, #9A9AA0 100%)',
      padding: g.bezel,
      boxSizing: 'border-box',
      boxShadow: `0 ${40 * g.k}px ${90 * g.k}px rgba(40,10,4,0.28)`,
    }}
  >
    <div
      style={{
        position: 'relative',
        width: g.screenW,
        height: g.screenH,
        borderRadius: g.screenR,
        overflow: 'hidden',
        background: '#000',
      }}
    >
      <div style={{position: 'absolute', inset: 0, opacity: lit}}>
        <Wallpaper g={g} />
        <StatusBar g={g} />

        <div
          style={{
            position: 'absolute',
            left: 0,
            top: g.dateTop,
            width: '100%',
            textAlign: 'center',
            fontFamily: UI,
            fontWeight: 600,
            fontSize: g.dateSize,
            letterSpacing: 0,
            color: '#fff',
            opacity: 0.92 * clockOpacity,
          }}
        >
          {date}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: g.clockTop,
            width: '100%',
            textAlign: 'center',
            fontFamily: UI,
            /*
             * 300, pas 400. L'horloge de l'écran verrouillé est nettement plus
             * fine que le reste de l'interface, et c'est elle qui donne à la
             * capture son allure. Mais 300 à cette taille donnait des fûts si
             * maigres qu'ils se brisaient au rendu : 400 rend l'épaisseur de
             * trait de la référence tout en restant nettement plus léger que
             * le gras des notifications.
             */
            fontWeight: 400,
            /*
             * Et elle est TRANSLUCIDE. C'est le détail qui trahit une maquette
             * quand il manque : sur la référence, le fond d'écran se voit à
             * travers les chiffres. iOS pose l'horloge dans un matériau, pas en
             * blanc plein.
             */
            fontSize: g.clockSize,
            lineHeight: 1,
            letterSpacing: `${-0.02 * g.clockSize}px`,
            color: 'rgba(255,255,255,0.62)',
            opacity: clockOpacity,
          }}
        >
          {clock}
        </div>

        {children}

        <BottomButton g={g} side="left" />
        <BottomButton g={g} side="right" />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: g.homeBottom,
            width: g.homeW,
            height: g.homeH,
            borderRadius: g.homeH,
            background: 'rgba(255,255,255,0.92)',
          }}
        />
      </div>

      {overlay}

      {/* la Dynamic Island, par-dessus tout : elle est physique, pas affichée */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: g.island.top,
          width: g.island.w,
          height: g.island.h,
          borderRadius: g.island.h,
          background: '#000',
        }}
      >
        {/*
          L'objectif, à droite de l'île. Sur la référence on le devine comme un
          disque à peine plus clair que le noir autour — l'omettre suffit à
          faire lire la Dynamic Island comme un simple rectangle dessiné.
        */}
        <div
          style={{
            position: 'absolute',
            right: g.island.h * 0.30,
            top: '50%',
            transform: 'translateY(-50%)',
            width: g.island.h * 0.40,
            height: g.island.h * 0.40,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 34% 30%, #223047 0%, #0C1018 62%, #05070B 100%)',
          }}
        />
      </div>
    </div>
  </div>
);
