import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, FONT} from '../theme';
import {Plate} from '../components/Plate';
import {Glyph, GlyphName} from '../components/Glyphs';
import {prog, outCubic, keyframes, softOut} from '../ease';
import {P} from '../tunables';

/**
 * Beat 5 — the five-step journey, 7.833 -> 12.467 s.
 *
 * Iteration 2. The round-1 "linear pan at 651 px/s" was wrong at the ends: the
 * phase-correlation fit was dominated by the cruise section. Tracking the blue
 * glyph centroids frame by frame shows a TRAPEZOIDAL velocity profile —
 *   ~10 px/frame at f=244, ramping to ~29.5 px/frame at f=302, back to ~5 by f=364
 * — plus a simultaneous vertical pan of ~2.78 px/frame that reverses at f=342.
 * Both are now measured tables rather than curves.
 */

const PAN: [number, number][] = [
  [236, -14], [240, 0], [244, 27], [248, 66], [252, 114], [256, 174], [260, 243],
  [264, 321], [268, 406], [272, 498], [276, 596], [280, 700], [284, 808],
  [288, 919], [292, 1033], [296, 1149], [300, 1266], [304, 1384], [308, 1500],
  [312, 1603], [316, 1706], [320, 1817], [324, 1923], [328, 2024], [332, 2121],
  [336, 2211], [340, 2292], [344, 2367], [348, 2432], [352, 2488], [356, 2533],
  [360, 2568], [364, 2589], [368, 2600], [376, 2610],
];

/**
 * Iteration 3. There is NO vertical camera pan through the cruise — the
 * "2.78 px/frame drift" measured in round 2 was an artefact of the 404/405
 * decode bug. Re-measured with aligned frames, every tile holds a constant y
 * until f=340, after which the whole scene dives out of frame.
 */
const PAN_Y: [number, number][] = [
  [236, 0], [340, 0], [344, -10], [348, -29], [352, -59], [356, -104],
  [360, -172], [364, -277], [368, -420], [376, -720],
];



type Step = {
  n: number;
  glyph: GlyphName;
  label: string[];
  x: number;
  y: number;
  labelBelow: boolean;
};

// world positions recovered from the glyph tracking (see PAN above).
// `at` is the frame the tile starts fading in, taken from the first detection.
const STEPS: (Step & {at: number})[] = [
  {n: 1, glyph: 'chat', label: ['Mise en place'], x: 712, y: 599, labelBelow: false, at: 236},
  {n: 2, glyph: 'search', label: ['Trouver des', 'prospects'], x: 1637, y: 413, labelBelow: true, at: 265},
  {n: 3, glyph: 'mail', label: ['Rédaction des', 'messages'], x: 2489, y: 401, labelBelow: false, at: 297},
  {n: 4, glyph: 'flag', label: ['Suivi des', 'réponses'], x: 3122, y: 672, labelBelow: true, at: 313},
  {n: 5, glyph: 'phone', label: ['Relancer'], x: 3999, y: 600, labelBelow: false, at: 352},
];

/**
 * The connector, traced directly out of the source rather than guessed.
 * Every frame was scanned column by column for the thin bright ridge (large
 * blobs removed by a morphological opening first), and each hit converted to
 * world space with the known camera displacement. Averaged over 140 frames this
 * gives the real curve — which WAVES between the tiles (a trough near x=1260,
 * a crest near x=2070) instead of running straight from one to the next, as the
 * hand-built Bezier did.
 */
const PATH_PTS: [number, number][] = [
  [-400, 980], [90, 936], [270, 945], [430, 730], [712, 599], [1000, 610],
  [1260, 627], [1440, 544], [1637, 413], [1800, 299], [2070, 256], [2250, 293],
  [2489, 401], [2700, 538], [2790, 593], [3122, 672], [3450, 606], [3999, 600],
  [4600, 470],
];

/** Monotone cubic through the traced points — no Bezier overshoot. */
const buildPath = () => {
  const xs = PATH_PTS.map((p) => p[0]);
  const ys = PATH_PTS.map((p) => p[1]);
  const n = xs.length;
  const dx: number[] = [], dy: number[] = [], m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(xs[i + 1] - xs[i]);
    dy.push(ys[i + 1] - ys[i]);
    m.push(dy[i] / dx[i]);
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  }
  t.push(m[n - 2]);
  const at = (x: number) => {
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const h = dx[i];
    const s = (x - xs[i]) / h;
    const h00 = 2 * s ** 3 - 3 * s ** 2 + 1;
    const h10 = s ** 3 - 2 * s ** 2 + s;
    const h01 = -2 * s ** 3 + 3 * s ** 2;
    const h11 = s ** 3 - s ** 2;
    return h00 * ys[i] + h10 * h * t[i] + h01 * ys[i + 1] + h11 * h * t[i + 1];
  };
  let d = "";
  for (let x = xs[0]; x <= xs[n - 1]; x += 12) {
    d += (d ? " L " : "M ") + x.toFixed(0) + " " + at(x).toFixed(1);
  }
  return d;
};
const PATH_D = buildPath();

const ClockGhost: React.FC<{cx: number; cy: number; r: number}> = ({cx, cy, r}) => {
  if (cx + r < -20 || cx - r > W + 20) return null;
  const ring = r * 0.088;
  const faceR = r - ring;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r - ring / 2} fill="none" stroke="#6FAEF6" strokeWidth={ring} />
      <circle r={faceR} fill={C.offWhite} />
      {Array.from({length: 12}, (_, i) => (
        <rect
          key={i}
          x={-faceR * 0.026}
          y={-faceR * 0.88}
          width={faceR * 0.052}
          height={faceR * 0.075}
          fill="#111"
          transform={`rotate(${i * 30} 0 0)`}
        />
      ))}
      <rect x={-faceR * 0.045} y={-faceR * 0.5} width={faceR * 0.09} height={faceR * 0.58} fill="#111" transform="rotate(255 0 0)" />
      <rect x={-faceR * 0.04} y={-faceR * 0.74} width={faceR * 0.08} height={faceR * 0.85} fill="#111" transform="rotate(160 0 0)" />
    </g>
  );
};

export const Journey: React.FC<{frame: number}> = ({frame}) => {
  const tp = P();
  const TILE = tp.jTile;
  const camX = keyframes(frame, PAN);
  const camY = keyframes(frame, PAN_Y);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Plate name="journey" />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        <defs>
          <clipPath id="pathReveal">
            <rect x={-3000} y={-2000} width={camX + W * 0.9 + 3000} height={H + 4000} />
          </clipPath>
        </defs>

        {/* the beat-3 clock leaving to the left, and a second one entering right */}
        <ClockGhost cx={330 - (camX + 14) * 1.06} cy={720 + (camX + 14) * 0.28} r={300} />
        {frame >= 330 ? (
          <ClockGhost cx={2050 - (camX - 2292)} cy={700 + Math.max(0, camX - 2292) * 0.5} r={330} />
        ) : null}

        <g transform={`translate(${-camX} ${-camY})`}>
          {STEPS.map((s) => (
            <text
              key={`n${s.n}`}
              x={s.x - 96}
              y={s.y + 66}
              fontFamily={FONT}
              fontWeight={700}
              fontSize={tp.jGhost}
              fill={C.white}
              fillOpacity={tp.jGhostOp}
              textAnchor="middle"
            >
              {s.n}
            </text>
          ))}
          <path
            d={PATH_D}
            fill="none"
            stroke={C.white}
            strokeWidth={tp.jStroke}
            strokeLinecap="round"
            clipPath="url(#pathReveal)"
          />
        </g>
      </svg>

      {STEPS.map((s) => {
        const screenX = s.x - camX;
        const screenY = s.y - camY;
        if (screenX < -520 || screenX > W + 520) return null;
        const arrive = s.at;
        const e = softOut(prog(frame, arrive, arrive + 18));
        return (
          <React.Fragment key={s.n}>
            <div
              style={{
                position: 'absolute',
                left: screenX - TILE / 2,
                top: screenY - TILE / 2,
                width: TILE,
                height: TILE,
                borderRadius: tp.jTileR,
                background: C.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 ${tp.jGlow * e}px ${tp.jGlow * 0.29 * e}px rgba(255,255,255,0.45)`,
                opacity: e,
                transform: `scale(${0.6 + 0.4 * e})`,
              }}
            >
              <Glyph name={s.glyph} size={TILE * 0.6} color={C.blue500} />
            </div>
            <div
              style={{
                position: 'absolute',
                // measured: labels sitting below a tile start near its left
                // edge; labels above are pushed further right
                left: screenX + (s.labelBelow ? TILE * 0.18 : TILE * 0.55) + tp.jLabelDX,
                top: s.labelBelow
                  ? screenY + TILE * 0.8 + tp.jLabelDY
                  : screenY - TILE * 0.35 - 84 * s.label.length + tp.jLabelDY,
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: tp.jLabel,
                lineHeight: 1.16,
                letterSpacing: '-0.022em',
                color: C.white,
                whiteSpace: 'pre',
              }}
            >
              {s.label.map((line, li) => {
                const lp = outCubic(prog(frame, arrive + 3 + li * 4, arrive + 13 + li * 4));
                return (
                  <div
                    key={li}
                    style={{opacity: lp, transform: `translateY(${(1 - lp) * 16}px)`}}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
