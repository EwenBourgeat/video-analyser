import {getInputProps} from 'remotion';

/**
 * Every quantity I could not measure directly lives here, so it can be searched
 * numerically against the source instead of guessed by eye.
 *
 * tools/optimize.py renders a short frame range with `--props`, scores it, and
 * runs coordinate descent. Defaults below are the current best values.
 */
export type Tunables = {
  // beat 1 — radar
  radarDiscA: number; radarDiscB: number; radarRingOp: number;
  radarDotR: number; radarDotWhite: number; radarSweepOp: number;
  // beat 6 — cards
  cardW: number; cardH: number; cardR: number; cardShadow: number;
  cardAvatar: number; cardAvatarY: number; cardNameSize: number;
  cardNameY: number; cardRoleSize: number; cardFootSize: number;
  cardDX: number; cardDY: number;
  // beat 5 — journey
  jTile: number; jTileR: number; jGlow: number; jLabel: number;
  jLabelDX: number; jLabelDY: number; jGhost: number; jGhostOp: number;
  jStroke: number;
  // beat 8 — logo
  logoMark: number; logoCX: number; logoCY: number;
  logoH1: number; logoH2: number; logoH3: number;
  logoWord: number; logoWordY: number; logoCard: number;
  // beat 9 — domains
  domHubX: number; domHubY: number; domMark: number; domH1: number;
  domPillX: number; domPillW: number; domPillH: number; domPillGap: number;
  domFont: number; domTick: number; domCard: number;
  // beat 10 — envelopes
  envHubX: number; envScale: number; envSpread: number; envDX: number; envDY: number;
  // beat 2/3 — clock hands (smooth spin, searched against the source)
  clkA: number; clkB: number; clkSec: number; clkSlices: number;
  // beat 3 — browser
  brDX: number; brDY: number; brScale: number; brTitle: number;
  // beat 7 — folder
  foDX: number; foDY: number; foFront: number; foTab: number; foText: number;
  // beat 11 — agenda
  agDX: number; agDY: number; agZoom: number; agFont: number; agTime: number;
  agRowH: number; agRadius: number;
};

const DEFAULTS: Tunables = {
  radarDiscA: 0.90, radarDiscB: 0.90, radarRingOp: 0.60,
  radarDotR: 20, radarDotWhite: 34, radarSweepOp: 1.0,

  cardW: 645, cardH: 397, cardR: 22, cardShadow: 0.05,
  cardAvatar: 134, cardAvatarY: 0.23, cardNameSize: 41,
  cardNameY: 0.46, cardRoleSize: 28, cardFootSize: 20,
  cardDX: 0, cardDY: 1,

  jTile: 212, jTileR: 40, jGlow: 70, jLabel: 74,
  jLabelDX: 35, jLabelDY: 0, jGhost: 300, jGhostOp: 0.05,
  jStroke: 6,

  logoMark: 320, logoCX: 959, logoCY: 543,
  logoH1: 710, logoH2: 175, logoH3: 125,
  logoWord: 74, logoWordY: 762, logoCard: 0,

  domHubX: 1375, domHubY: 540, domMark: 260, domH1: 540,
  domPillX: 60, domPillW: 820, domPillH: 124, domPillGap: 10,
  domFont: 47, domTick: 84, domCard: 300,

  envHubX: 475, envScale: 1, envSpread: 1, envDX: 0, envDY: 0,

  // Chosen, not searched. The search collapses these onto "slowest + no blur",
  // because the source's hands are crisp (After Effects renders no motion blur)
  // so any blur costs fidelity. But a fast spin with no blur strobes, and this
  // render is for fluidity: 1.2 -> ~3.7 rev/s stays under ~22 deg per 60 fps
  // frame, which reads as motion rather than as a stutter.
  clkA: 1.2, clkB: 0.32, clkSec: 2.2, clkSlices: 5,

  brDX: 0, brDY: 0, brScale: 1, brTitle: 48,

  foDX: 10, foDY: 0, foFront: 260, foTab: 68, foText: 215,

  agDX: -279, agDY: -17, agZoom: 1, agFont: 68, agTime: 100,
  agRowH: 186, agRadius: 30,
};

let cached: Tunables | null = null;

export const P = (): Tunables => {
  if (!cached) {
    const inp = (getInputProps() ?? {}) as Partial<Tunables>;
    cached = {...DEFAULTS, ...inp};
  }
  return cached;
};
