/**
 * Cubic-Bézier timing functions — the same construction CSS `cubic-bezier()`
 * uses, solved the same way browsers solve it.
 *
 * A Bézier ease is a curve through (0,0) and (1,1) with two control points. The
 * curve is parametric in an internal variable t, but an animation needs y for a
 * given x (elapsed time). There is no closed form, so x(t) = X is solved
 * numerically: Newton–Raphson while the derivative is healthy, bisection as the
 * fallback when it is not. That is exactly what Blink/WebKit do.
 *
 * Why this matters here: the film had been driven by smoothstep-family curves,
 * which are symmetric and read as evenly-paced. Bézier lets each move carry its
 * own character — a long tail on an entrance, a hard in-and-out on a camera
 * push, a touch of overshoot on a badge — which is what stops motion reading
 * as mechanical without making it jittery.
 */

const A = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1;
const B = (a1: number, a2: number) => 3 * a2 - 6 * a1;
const Cc = (a1: number) => 3 * a1;

const calc = (t: number, a1: number, a2: number) =>
  ((A(a1, a2) * t + B(a1, a2)) * t + Cc(a1)) * t;

const slope = (t: number, a1: number, a2: number) =>
  3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + Cc(a1);

const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 1e-7;
const SUBDIVISION_MAX = 12;

const binarySubdivide = (x: number, a: number, b: number, x1: number, x2: number) => {
  let cur: number;
  let t: number;
  let i = 0;
  do {
    t = a + (b - a) / 2;
    cur = calc(t, x1, x2) - x;
    if (cur > 0) b = t;
    else a = t;
  } while (Math.abs(cur) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX);
  return t;
};

const newtonRaphson = (x: number, guess: number, x1: number, x2: number) => {
  let t = guess;
  for (let i = 0; i < NEWTON_ITERATIONS; i++) {
    const s = slope(t, x1, x2);
    if (s === 0) return t;
    t -= (calc(t, x1, x2) - x) / s;
  }
  return t;
};

/** Build a reusable easing function from four control-point coordinates. */
export const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  if (x1 === y1 && x2 === y2) return (x: number) => x; // the identity, i.e. linear

  // sample x(t) once so the solver always starts from a close guess
  const SAMPLES = 11;
  const step = 1 / (SAMPLES - 1);
  const table = new Float32Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i++) table[i] = calc(i * step, x1, x2);

  const tForX = (x: number) => {
    let interval = 0;
    for (let i = 1; i < SAMPLES && table[i] <= x; i++) interval = i;
    const dist = (x - table[interval]) / (table[interval + 1] - table[interval]);
    const guess = (interval + dist) * step;
    const s = slope(guess, x1, x2);
    if (s >= NEWTON_MIN_SLOPE) return newtonRaphson(x, guess, x1, x2);
    if (s === 0) return guess;
    return binarySubdivide(x, interval * step, (interval + 1) * step, x1, x2);
  };

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return calc(tForX(x), y1, y2);
  };
};

/**
 * The film's vocabulary. Four curves, each with a job — reusing a small set is
 * what makes a piece feel authored rather than assembled.
 */
export const EASE = {
  /**
   * Entrances. Leaves rest gently, then a long tail into the hold: the text
   * settles instead of arriving. (An easeOutExpo, cubic-bezier(.16,1,.3,1),
   * would be more dramatic but starts at maximum speed — the exact snap that
   * was flagged earlier in this project.)
   */
  entrance: cubicBezier(0.22, 0.68, 0.24, 1),

  /** Camera pushes and travels: firm acceleration, long deceleration. */
  camera: cubicBezier(0.68, 0, 0.2, 1),

  /** Big transitions, dramatic at both ends — an easeInOutQuint. */
  dramatic: cubicBezier(0.83, 0, 0.17, 1),

  /** Small elements landing, with a touch of overshoot. */
  pop: cubicBezier(0.34, 1.42, 0.64, 1),

  /** Things leaving frame: slow to release, then gone. */
  exit: cubicBezier(0.6, 0, 0.9, 0.25),

  /** Neutral, still eased at both ends — the default when in doubt. */
  smooth: cubicBezier(0.45, 0.05, 0.2, 1),

  /**
   * Measured, not chosen. The reference film's clock-to-browser pull-back was
   * traced frame by frame (the dial's ring radius, 665 px down to 430 px over
   * 40 frames at 30 fps) and the result fitted to a cubic Bezier: RMS 0.006 on
   * a 0-to-1 progression across sixteen samples. It leaves rest quickly but
   * without a jolt, then spends more than half its time settling — which is why
   * that transition reads as soft rather than as a snap.
   */
  pullback: cubicBezier(0.276, 1, 0.776, 0.97),
} as const;
