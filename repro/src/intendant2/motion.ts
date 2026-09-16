import {prog} from '../ease';
import {EASE} from '../bezier';

/**
 * Le vocabulaire de mouvement de la publicité #2.
 *
 * Deux gestes seulement, mais ce sont eux qui donnent au film son allure
 * « After Effects » : un ressort pour tout ce qui se pose, un fouetté pour tout
 * ce qui change de scène.
 */

/**
 * Ressort amorti, normalisé : s(0) = 0, s(1) = 1, avec un léger dépassement.
 *
 * C'est la courbe d'iOS, et c'est une vraie différence — pas un détail.
 * Une notification qui arrive en décélération simple se pose ; la même sur un
 * ressort dépasse d'environ 8 % puis revient, et c'est ce petit retour qui
 * fait qu'on la lit comme un objet physique plutôt que comme un calque dont on
 * anime l'opacité. Apple la documente sous `usingSpringWithDamping`, où
 * l'amortissement proche de 0 rebondit et proche de 1 se fige ; 0,62 est le
 * réglage qui donne un seul dépassement visible et aucune oscillation.
 *
 * La formule est la réponse indicielle d'un système du second ordre
 * sous-amorti, donc la position à t = 1 est déjà stabilisée à 1 % près : rien
 * ne continue de trembler après la fin de la fenêtre.
 */
export const spring = (t: number, damping = 0.62, cycles = 1.2) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const w = cycles * Math.PI * 2;
  const z = damping;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
};

/**
 * Le ressort SANS rebond — celui d'iOS pour l'insertion d'une notification.
 *
 * `spring` ci-dessus dépasse d'environ 8 % puis revient, ce qui est la courbe
 * d'un objet qu'on lâche. Une notification qui s'insère dans la pile n'en est
 * pas un : SwiftUI la pose avec `.smooth`, un ressort dont le rebond vaut
 * exactement zéro. C'est un système CRITIQUEMENT AMORTI — il rejoint sa
 * position au plus vite sans jamais la dépasser — et sa réponse indicielle
 * s'écrit en une ligne, sans la racine de (1 - z²) qui s'annule à cet endroit.
 *
 * La différence est petite à décrire et large à voir : avec le rebond, quatre
 * notifications qui tombent coup sur coup font trembler la pile entière ; sans
 * lui, elle se pose.
 */
export const smoothSpring = (t: number, w = 7.6) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - (1 + w * t) * Math.exp(-w * t);
};

export const smoothIn = (frame: number, from: number, dur: number, w?: number) =>
  smoothSpring(prog(frame, from, from + dur), w);

/** Le ressort appliqué à une fenêtre d'images. */
export const springIn = (frame: number, from: number, dur: number, damping?: number) =>
  spring(prog(frame, from, from + dur), damping);

/**
 * Le fouetté qui relie deux scènes.
 *
 * Renvoie 0 avant la transition et 1 après. La scène sortante s'en sert pour
 * filer vers la gauche, l'entrante pour arriver depuis la droite, et comme les
 * deux lisent la MÊME valeur elles se rejoignent exactement au milieu : au
 * cœur du fouetté, le bord droit de la sortante touche le bord gauche de
 * l'entrante, sans trou ni recouvrement.
 *
 * Seul le CONTENU file. Le fond reste posé, parce que les deux scènes ont le
 * même sable : faire glisser le sol aussi n'ajouterait aucun mouvement visible
 * et ne ferait que risquer une couture.
 */
export const WHIP = 46;

export const whipAt = (frame: number, cut: number, dur: number = WHIP) =>
  EASE.dramatic(prog(frame, cut - dur / 2, cut + dur / 2));

/** Décalage en x de la scène qui SORT vers la gauche. */
export const whipOut = (frame: number, cut: number, w: number, dur?: number) =>
  -whipAt(frame, cut, dur) * w;

/** Décalage en x de la scène qui ARRIVE depuis la droite. */
export const whipIn = (frame: number, cut: number, w: number, dur?: number) =>
  (1 - whipAt(frame, cut, dur)) * w;

/** Décalage en y de la scène qui SORT vers le haut. */
export const whipUpOut = (frame: number, cut: number, h: number, dur?: number) =>
  -whipAt(frame, cut, dur) * h;

/** Décalage en y de la scène qui ARRIVE depuis le bas. */
export const whipUpIn = (frame: number, cut: number, h: number, dur?: number) =>
  (1 - whipAt(frame, cut, dur)) * h;
