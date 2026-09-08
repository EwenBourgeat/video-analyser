/**
 * Easing curves fitted to the source by numeric tracking (tools/track.py).
 *
 *   camera pans   -> trapezoidal velocity (measured tables, ANALYSE.md §2C)
 *   scene zoom-out-> easeOutCubic (browser card, ANALYSE.md §2A)
 *   radar zoom    -> measured table (no analytic curve fitted it)
 *   element entry -> easeOutCubic..Quint over 0.45-0.7 s
 */
import {interpolate} from 'remotion';

export const linear = (t: number) => t;
export const outQuad = (t: number) => 1 - (1 - t) ** 2;
export const outCubic = (t: number) => 1 - (1 - t) ** 3;
export const outQuart = (t: number) => 1 - (1 - t) ** 4;
export const outQuint = (t: number) => 1 - (1 - t) ** 5;
export const outExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));
export const inCubic = (t: number) => t ** 3;
export const inOutCubic = (t: number) =>
  t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

/**
 * Zero velocity at BOTH ends. easeOut curves have their maximum speed at t=0,
 * so anything starting from rest snaps into motion — measured at 65 px/s per
 * frame on the domain pills' exit, the single worst hitch left in the film.
 */
export const smoothStep = (t: number) => t * t * (3 - 2 * t);
export const smootherStep = (t: number) =>
  t * t * t * (t * (t * 6 - 15) + 10);

/**
 * Ease-out character without the launch pop: still decelerates hard into the
 * hold, but leaves rest smoothly. This is the default for anything that moves
 * a position or a scale from a standstill.
 */
export const softOut = (t: number) => outCubic(smoothStep(t));
export const softOutQuint = (t: number) => outQuint(smoothStep(t));

/** Slight overshoot, used for badges and buttons popping in. */
export const outBack = (t: number, s = 1.7) =>
  1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;

export const ramp = (
  frame: number,
  [f0, f1]: [number, number],
  [v0, v1]: [number, number],
  easing: (t: number) => number = outCubic
) => {
  if (f1 === f0) return frame < f0 ? v0 : v1;
  const t = Math.max(0, Math.min(1, (frame - f0) / (f1 - f0)));
  return v0 + (v1 - v0) * easing(t);
};

/** Linear 0..1 progress over a frame range, clamped. */
export const prog = (frame: number, f0: number, f1: number) =>
  Math.max(0, Math.min(1, (frame - f0) / (f1 - f0)));

// ---------------------------------------------------------------------------
// Measured-table interpolation
// ---------------------------------------------------------------------------

/**
 * Reading a measured table with straight-line interpolation makes velocity jump
 * at every keyframe. At 30 fps that is masked; at 60 fps it is visible stutter —
 * the card whip alone had acceleration steps of 26.5 px/frame^2.
 *
 * So each table is turned into a smooth curve once and cached:
 *   1. monotone cubic (PCHIP) resample onto a fine grid — C1 continuous, and
 *      monotone so it cannot overshoot the way a Catmull-Rom would on the
 *      hold-then-drop shapes (the radar zoom, the folder rise);
 *   2. a Gaussian pass that removes the measurement noise. The tables come from
 *      pixel tracking, so they carry +/- a pixel or two of jitter that would
 *      otherwise read as a shimmer once the frames are twice as close together.
 *
 * SIGMA is in source frames. 1.1 keeps the whip's peak and the landing overshoot
 * while flattening the per-keyframe corners.
 */
const STEP = 0.25;
const SIGMA = 1.1;

type Dense = {f0: number; ys: Float64Array};
const cache = new WeakMap<object, Dense>();

const pchipSlopes = (xs: number[], ys: number[]) => {
  const n = xs.length;
  const h: number[] = [];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h.push(xs[i + 1] - xs[i]);
    d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  }
  const m = new Array<number>(n).fill(0);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) {
      m[i] = 0;
    } else {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  return m;
};

const build = (table: [number, number][]): Dense => {
  const xs = table.map((p) => p[0]);
  const ys = table.map((p) => p[1]);
  const m = pchipSlopes(xs, ys);
  const f0 = xs[0];
  const f1 = xs[xs.length - 1];
  const n = Math.max(2, Math.round((f1 - f0) / STEP) + 1);

  const raw = new Float64Array(n);
  let seg = 0;
  for (let i = 0; i < n; i++) {
    const x = f0 + i * STEP;
    while (seg < xs.length - 2 && x > xs[seg + 1]) seg++;
    const h = xs[seg + 1] - xs[seg];
    const t = (x - xs[seg]) / h;
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
    const h10 = t ** 3 - 2 * t ** 2 + t;
    const h01 = -2 * t ** 3 + 3 * t ** 2;
    const h11 = t ** 3 - t ** 2;
    raw[i] = h00 * ys[seg] + h10 * h * m[seg] + h01 * ys[seg + 1] + h11 * h * m[seg + 1];
  }

  // Gaussian low-pass, edges replicated so the endpoints stay put
  const s = SIGMA / STEP;
  const rad = Math.max(1, Math.ceil(3 * s));
  const k = new Float64Array(2 * rad + 1);
  let sum = 0;
  for (let i = -rad; i <= rad; i++) {
    const v = Math.exp(-(i * i) / (2 * s * s));
    k[i + rad] = v;
    sum += v;
  }
  for (let i = 0; i < k.length; i++) k[i] /= sum;

  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let acc = 0;
    for (let j = -rad; j <= rad; j++) {
      acc += k[j + rad] * raw[Math.max(0, Math.min(n - 1, i + j))];
    }
    out[i] = acc;
  }
  return {f0, ys: out};
};

/**
 * Smooth lookup through a measured keyframe table.
 * The table must be a module-level constant: it is the cache key, so an inline
 * literal would rebuild the curve on every single frame.
 */
export const keyframes = (frame: number, table: [number, number][]) => {
  let d = cache.get(table);
  if (!d) {
    d = build(table);
    cache.set(table, d);
  }
  const {f0, ys} = d;
  const x = (frame - f0) / STEP;
  if (x <= 0) return ys[0];
  if (x >= ys.length - 1) return ys[ys.length - 1];
  const i = Math.floor(x);
  const t = x - i;
  return ys[i] * (1 - t) + ys[i + 1] * t;
};

/** Straight-line lookup, for tables where the corners are deliberate. */
export const keyframesLinear = (frame: number, table: [number, number][]) => {
  if (frame <= table[0][0]) return table[0][1];
  const last = table[table.length - 1];
  if (frame >= last[0]) return last[1];
  for (let i = 0; i < table.length - 1; i++) {
    const [a, va] = table[i];
    const [b, vb] = table[i + 1];
    if (frame >= a && frame <= b) return va + ((vb - va) * (frame - a)) / (b - a);
  }
  return last[1];
};

export {interpolate};
