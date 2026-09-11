/**
 * L'Intendant — conciergerie Airbnb, Toulouse.  ***BRANCHE red-version***
 *
 * ATTENTION AUX NOMS. Les clés s'appellent toujours `blue600`, `blue350`… mais
 * elles contiennent des ROUGES sur cette branche. C'est délibéré : garder les
 * noms fait de `red-version` un diff de couleurs pur, qui peut suivre `main`
 * sans conflit sur les quinze fichiers de scènes. Les renommer coûterait une
 * cinquantaine d'éditions et rendrait tout rebase pénible.
 *
 * Référence client : #941101, gardée telle quelle comme PRIMAIRE.
 *
 * LE FOND SOMBRE N'EST PAS #400106. Cette valeur a d'abord été posée telle
 * quelle, et le résultat était agressif : mesuré sur le rendu, le fond moyen
 * ressortait à 81 % de saturation, contre 29 % pour la version bleue. La cause
 * était structurelle — #400106 est une couleur de MARQUE, hsl(355, 97 %, 13 %),
 * placée dans un rôle de FOND, alors que le fond bleu était hsl(207, 24 %, 9 %) :
 * un quasi-neutre avec une simple dominante.
 *
 * Le fond est donc un terre cuite très sombre et peu saturé, hsl(16, 26 %, 14 %).
 * La teinte est décalée de 355° vers 16° : le rouge sang est la teinte la plus
 * agressive à grande surface, la terre cuite se supporte beaucoup mieux. Le rouge
 * saturé ne sert plus que d'accent.
 *
 * `blue350` porte le texte d'accent sur ce fond et a été calé à un contraste de
 * 7,27, pour égaler le 7,18 qu'avait l'ancien accent bleu.
 *
 * Palette révisée : le brique/terracotta a été remplacé par le bleu, à la
 * demande du client (« un beau bleu moderne se rapprochant de l'autre
 * animation »). Ce sont les bleus mesurés sur le film Scalead, donc la parenté
 * est exacte et non approchée. L'identité propre à L'Intendant tient désormais
 * au logo losange et aux typographies du site.
 */

export const C = {
  // grounds
  paper: '#FFFFFF',
  paperSoft: '#FDF7F5',
  paperDark: '#2D1F1A',

  // ink
  ink: '#120A09',
  inkSoft: '#2A1B18',
  muted: '#6B5450',
  inkDark: '#FBF2EF',
  inkSoftDark: '#E9D9D4',
  mutedDark: '#B99B94',

  // rules
  line: '#F0E2DD',
  lineStrong: '#DFC7C0',
  lineDark: '#46322B',
  lineStrongDark: '#65483E',

  // the red palette of this branch — see the note at the top of the file
  blue600: '#941101',
  blue500: '#AB1D07',
  blue450: '#BE290E',
  blue400: '#D13415',
  blue350: '#EC9B89',
  blue300: '#EEA796',
  blue250: '#F5BDAD',
  blue150: '#FADBD1',
  blue050: '#FCEDE8',
  blueWash: '#FDF5F2',

  // the validation green asked for on the distribution beat
  green: '#16A34A',
  greenSoft: '#22C55E',

  // Google review chrome
  star: '#FBBC04',
} as const;

export const W = 1920;
export const H = 1080;

export const SRC_FPS = 60;
export const FPS = 60;
export const SPF = 1;

export const SANS = "'Instrument Sans', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, monospace";
export const SERIF = "'Playfair Display', Georgia, serif";

/**
 * Beat boundaries, in frames at 60 fps — the single source of truth. Every
 * scene derives its own start from here rather than repeating a literal, so
 * re-timing the film is one edit.
 *
 * This pass lengthened almost every beat: the brief was that several scenes cut
 * before the copy could be read. Each text beat now holds for at least a second
 * after its reveal finishes.
 */
export const T = {
  map: {from: 0, to: 190},
  clock: {from: 150, to: 462},
  browser: {from: 300, to: 462},
  metier: {from: 466, to: 684},
  journey: {from: 684, to: 1120},
  reviews: {from: 1120, to: 1360},
  key: {from: 1360, to: 1480},
  logo: {from: 1480, to: 1552},
  diffusion: {from: 1552, to: 1862},
  calendar: {from: 1862, to: 2092},
  simple: {from: 2092, to: 2252},
  endcard: {from: 2252, to: 2498},
} as const;

export const TOTAL_FRAMES = 2498; // 41,6 s
