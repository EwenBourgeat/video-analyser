/**
 * L'Intendant — conciergerie Airbnb, Toulouse.
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
  paperSoft: '#F7FAFE',
  paperDark: '#11171C',

  // ink
  ink: '#0B0B0C',
  inkSoft: '#22222A',
  muted: '#56565C',
  inkDark: '#F4F6F8',
  inkSoftDark: '#DCDDE0',
  mutedDark: '#9AA1A8',

  // rules
  line: '#E4E9F0',
  lineStrong: '#C9D3E0',
  lineDark: '#242C34',
  lineStrongDark: '#39434E',

  // blues, measured off the Scalead film
  blue600: '#1878EC',
  blue500: '#2E86F1',
  blue450: '#4694F2',
  blue400: '#4195F8',
  blue350: '#5CA6FF',
  blue300: '#83B8F8',
  blue250: '#93C4FF',
  blue150: '#C0DDFF',
  blue050: '#DDECFD',
  blueWash: '#EFF6FE',

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
  journey: {from: 684, to: 1185},
  reviews: {from: 1185, to: 1425},
  key: {from: 1425, to: 1545},
  logo: {from: 1545, to: 1617},
  diffusion: {from: 1617, to: 1897},
  calendar: {from: 1897, to: 2127},
  simple: {from: 2127, to: 2287},
  endcard: {from: 2287, to: 2533},
} as const;

export const TOTAL_FRAMES = 2533; // 42,2 s
