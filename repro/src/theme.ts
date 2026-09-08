/**
 * Design tokens recovered from the source video by pixel sampling.
 * See ANALYSE.md §1 — every hex here was measured, not chosen.
 */

export const C = {
  // brand blues
  blue600: '#1878EC', // radar dots, agenda chips, funnel, highlighted mail
  blue500: '#2E86F1', // logo mark, CTA gradient start
  blue450: '#4694F2', // clock ring bottom, blue text
  blue400: '#4195F8', // folder gradient top
  blue350: '#5CA6FF', // CTA gradient end
  blue300: '#83B8F8', // clock ring top
  blue280: '#79B6FF', // folder gradient bottom
  blue250: '#93C4FF',
  blue150: '#C0DDFF',
  blue050: '#DDECFD',
  blue025: '#EAF4FD',
  textBlue: '#307FED', // kinetic text blue (measured @ t=3.4)

  // neutrals
  dark: '#11171C', // main dark background
  darkBlue: '#12181F',
  glowNavy: '#123357', // bottom radial glow on dark scenes
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  ink: '#010101',
  greyLabel: '#CAD0D5',
  greyRole: '#6B7280',
  chrome: '#2C3238', // browser title bar
  chromeRed: '#FF5F57',
  chromeYellow: '#FEBC2E',
  chromeGreen: '#28C840',
} as const;

/** Master canvas — the source motion design is 16:9, not 9:16. */
export const W = 1920;
export const H = 1080;

/**
 * The source runs at 30 fps; this renders at 60 for fluidity.
 *
 * Every measured table, scene boundary and timing constant in the project is
 * expressed in SOURCE frames, so nothing below had to be renumbered: the root
 * composition divides its own frame by 2 and hands scenes a fractional source
 * frame. Smooth table interpolation (see ease.ts) then produces genuinely new
 * in-between positions rather than duplicated ones.
 */
export const SRC_FPS = 30;
export const FPS = 60;
/** Source frames per rendered frame — the shutter width for motion blur. */
export const SPF = SRC_FPS / FPS;

export const FONT = "'Outfit', 'Poppins', system-ui, sans-serif";

/**
 * Scene boundaries in source frame numbers @30fps.
 * Derived from inter-frame difference analysis (tools/cuts.py).
 */
export const T = {
  radar: {from: 0, to: 66},
  clock: {from: 52, to: 173}, // continues inside the browser from f=109
  browser: {from: 109, to: 173},
  pastText: {from: 181, to: 235},
  journey: {from: 235, to: 376},
  cards: {from: 374, to: 476},
  folder: {from: 476, to: 545},
  logo: {from: 545, to: 591},
  domains: {from: 591, to: 630},
  envelopes: {from: 630, to: 663},
  agenda: {from: 663, to: 750},
  simple: {from: 750, to: 773},
  iris: {from: 773, to: 776},
} as const;

export const SRC_FRAMES = 776;
export const TOTAL_FRAMES = SRC_FRAMES * (FPS / SRC_FPS); // 1552 @ 60 fps = 25.867 s
