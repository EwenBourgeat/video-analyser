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

  /**
   * The charter's own fields, used as themselves rather than derived.
   * `cream` and `sand` are the client's two neutrals; `deep` is the true
   * burgundy of the charter, distinct from `paperDark` — that one was
   * deliberately desaturated to hsl(16, 26 %, 14 %) so it could carry whole
   * frames without turning aggressive, which is exactly what a large ground
   * needs and exactly what a small solid surface does not.
   */
  cream: '#EDE5DE',
  sand: '#E4CAB4',
  deep: '#400106',

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
