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

/**
 * The brand's two typefaces, from the client's charter: Didot and Futura.
 *
 * Neither exists on Google Fonts — they are licensed faces — but both ship with
 * macOS, so headless Chrome resolves them directly and the film gets the real
 * charter rather than lookalikes. The trade is portability: rendered on a
 * machine without them, the fallbacks below take over and the metrics shift.
 * Rendering happens on this Mac, so that is an accepted, documented risk rather
 * than a hidden one. The fallbacks are chosen to be the nearest in shape —
 * Bodoni for the didone, a geometric grotesque for Futura — so a stray render
 * degrades rather than collapses.
 *
 * WEIGHTS. macOS Futura ships Medium and Bold only: there is no Regular and no
 * Light. Asking for 400 or 600 makes the browser synthesise, which smears the
 * geometry. Use 500 and 700 — the two constants below exist so that rule is
 * applied rather than remembered.
 */
export const SANS = "Futura, 'Jost', 'Century Gothic', system-ui, sans-serif";
export const SERIF = "Didot, 'Bodoni Moda', 'Didot LT STD', Georgia, serif";
/** Figures in tables and amounts. Same family — the charter has two faces. */
export const MONO = SANS;

/** The only two Futura weights that exist; anything else is synthesised. */
export const W_MED = 500;
export const W_BOLD = 700;

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
  journey: {from: 684, to: 964},
  reviews: {from: 964, to: 1204},
  key: {from: 1204, to: 1324},
  logo: {from: 1324, to: 1396},
  diffusion: {from: 1396, to: 1706},
  calendar: {from: 1706, to: 1936},
  simple: {from: 1936, to: 2096},
  endcard: {from: 2096, to: 2342},
} as const;

export const TOTAL_FRAMES = 2342; // 39,0 s
