/**
 * Publicité #2 — « Le téléphone qui déborde ».
 *
 * Les couleurs, les polices et les poids viennent du film #1 : c'est la même
 * marque, et une seconde copie de la palette finirait par diverger de la
 * première. Seule la TIMELINE est propre à ce film, parce qu'elle seule lui
 * appartient.
 */
export {C, SANS, SERIF, MONO, W_MED, W_BOLD, FPS} from '../intendant/theme';

/**
 * Le cadre : 4:5, le format du fil Facebook et Instagram. Pas de 16:9 ici —
 * le #1 en portait un par héritage, celui-ci est né pour le fil.
 */
export const W = 1080;
export const H = 1350;

/**
 * Les bornes des beats, en images à 60 i/s, et la seule source de vérité.
 *
 * Chaque scène en dérive plutôt que de répéter un littéral. Le film #1 avait
 * appris cette leçon à ses dépens : une douzaine de scènes y portaient leur
 * propre image de départ, et allonger un beat voulait dire déplacer une
 * soixantaine de nombres à la main.
 *
 * 1500 images = 25,0 s. Le hook doit être lisible bien avant la fin du
 * premier beat : un fil ne donne pas deux secondes à une annonce pour dire à
 * qui elle parle.
 */
export const T = {
  hook: {from: 0, to: 110},
  overflow: {from: 110, to: 330},
  /*
   * Il n'y a plus de beat « entrée ».
   *
   * On entrait dans l'écran par un zoom, ce qui coûtait 80 images pour un
   * mouvement qui n'allait nulle part : la caméra s'enfonçait dans un objet
   * puis le perdait. Elle monte maintenant, d'un seul fouetté vertical, et le
   * fouetté n'a pas besoin d'un beat à lui — il vit à cheval sur la coupe.
   */
  /*
   * Les services repassent à 4,5 s — ils étaient à 3,0.
   *
   * La scène enchaîne maintenant quatre choses : elle arrive, elle tient la
   * phrase en grand, la caméra descend, puis les trois cartes se posent. À
   * 3,0 s la dernière carte n'était plus lisible que 0,3 s. Le mouvement de
   * caméra demandé coûte 0,8 s à lui seul ; les lui refuser aurait donné une
   * scène qui fait le geste sans laisser voir ce qu'il amène.
   *
   * Une demi-seconde est reprise sur les avis, qui en avaient de reste.
   */
  services: {from: 330, to: 600},
  proof: {from: 600, to: 900},
  finale: {from: 900, to: 1040},
  endcard: {from: 1040, to: 1190},
} as const;

export const TOTAL_FRAMES = 1190; // 19,8 s

/**
 * L'interface du téléphone est en San Francisco, pas en Futura.
 *
 * Une notification iOS composée dans la police de la marque ne ressemble à
 * rien : ce qui rend un écran crédible, c'est justement qu'il ne soit pas
 * habillé par l'annonceur. La parole de la marque — les phrases, les
 * libellés, le CTA — reste en Futura. Deux voix, et c'est volontaire.
 *
 * `-apple-system` résout vers /System/Library/Fonts/SFNS.ttf, vérifié présent
 * sur cette machine.
 */
export const UI = '-apple-system, "SF Pro Display", "Helvetica Neue", system-ui, sans-serif';
