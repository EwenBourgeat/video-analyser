import React from 'react';
import {C, SANS, SERIF, W_MED} from '../theme';
import {useStage, clockGeom} from '../format';
import {ramp, prog} from '../../ease';
import {EASE} from '../../bezier';
import {Kinetic} from '../components/Type';

/**
 * Beat 2 — the hours a short-let eats, 2.2 -> 7.0 s.
 *
 * A self-contained 16:9 stage: full-bleed first, then the content of the
 * browser window in beat 3. Geometry is expressed as fractions of the page so
 * the window can scale it without anything drifting.
 *
 * The hands take a smooth accelerating spin, motion-blurred across the shutter.
 * Seven slices keep the fastest hand reading as a smear rather than a strobe —
 * the same treatment the Scalead clock needed once it ran at 60 fps.
 */

/** The dial rises a little as it settles, in both frames. */
const RISE = 0.055;

// the second hand runs at its true ratio now, so it needs a real smear
const SLICES = 13;

const Clock: React.FC<{frame: number}> = ({frame}) => {
  const {w, h, tall} = useStage();
  const dial = clockGeom(w, h, tall);
  const cx = dial.cx;
  // it settles upward onto its resting centre over the first second
  const cy = ramp(frame, [150, 208], [dial.cy + RISE * h, dial.cy], EASE.smooth);
  const r = dial.r;
  const ring = r * 0.075;
  const faceR = r - ring;

  /**
   * The hands are driven by ONE quantity — how much clock time has elapsed —
   * and the three angles are derived from it with the real gear ratios:
   * 6 deg per second for the second hand, a sixtieth of that for the minute,
   * a twelfth of that again for the hour.
   *
   * They used to be three independent spins, and the second hand ran at only
   * 2.1x the minute hand instead of 60x. That is what read as wrong: a real
   * clock's second hand outruns the minute hand so far that the minute hand
   * looks almost still beside it. Now the beat starts at one revolution of the
   * second hand per second — legible — and accelerates into a smear.
   */
  const spinAt = (f: number) => {
    const t = Math.max(0, (f - 150) / 60);
    /**
     * Eight times slower than it was. The old law reached 45 revolutions of the
     * second hand PER SECOND by the end of the beat, and already ran at 3.3 at
     * the start — past any speed a hand can be read at, so it stopped looking
     * like a clock racing and started looking like a fault. It now opens at one
     * revolution a second, which is legible, and accelerates to five.
     *
     * The gear ratios below are untouched: one quantity drives all three hands.
     */
    const clockSeconds = 60 * t + 23 * t * t;
    const sec = clockSeconds * 6;
    return {sec: sec + 40, min: sec / 60, hour: sec / 720 + 108};
  };
  const subs = Array.from({length: SLICES}, (_, i) =>
    spinAt(frame - 0.5 + (i + 0.5) / SLICES)
  );

  /**
   * Past a certain speed a real second hand stops being a hand and becomes a
   * haze. Without this the thirteen shutter slices read as thirteen separate
   * spokes; fading the hand as it outruns the shutter is both what a camera
   * does and what stops the fan from showing.
   */
  const secSpeed = Math.abs(spinAt(frame + 0.5).sec - spinAt(frame - 0.5).sec);
  const secOpacity = Math.max(0.16, Math.min(1, 1 - (secSpeed - 26) / 210));

  const tick = (i: number) => {
    const cardinal = i % 3 === 0;
    return (
      <rect
        key={i}
        x={-(cardinal ? faceR * 0.028 : faceR * 0.021) / 2}
        y={-faceR * 0.9}
        width={cardinal ? faceR * 0.028 : faceR * 0.021}
        height={cardinal ? faceR * 0.09 : faceR * 0.058}
        rx={faceR * 0.008}
        fill={C.ink}
        transform={`rotate(${i * 30} 0 0)`}
      />
    );
  };

  const hand = (angle: number, len: number, wdt: number, color: string, back = 0.14) => (
    <rect
      x={-wdt / 2}
      y={-len}
      width={wdt}
      height={len * (1 + back)}
      rx={wdt * 0.4}
      fill={color}
      transform={`rotate(${angle} 0 0)`}
    />
  );

  return (
    <g transform={`translate(${cx} ${cy})`}>
      <defs>
        <linearGradient id="dialRing" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#5CA6FF" />
          <stop offset="100%" stopColor="#1F6BC9" />
        </linearGradient>
      </defs>
      <circle r={r - ring / 2} fill="none" stroke="url(#dialRing)" strokeWidth={ring} />
      <circle r={faceR} fill="#FDFEFF" />
      {Array.from({length: 12}, (_, i) => tick(i))}
      {subs.map((a, i) => (
        <g key={i} opacity={1 / (i + 1)}>
          {hand(a.hour, faceR * 0.48, faceR * 0.044, C.ink)}
          {hand(a.min, faceR * 0.72, faceR * 0.038, C.ink)}
          <g opacity={secOpacity}>{hand(a.sec, faceR * 0.80, faceR * 0.012, C.blue600, 0.3)}</g>
        </g>
      ))}
      <circle r={faceR * 0.024} fill={C.blue600} />
    </g>
  );
};

export const ClockStage: React.FC<{frame: number}> = ({frame}) => {
  const {w: W, h: H, tall} = useStage();
  return (
  <div style={{position: 'absolute', inset: 0, background: C.paper, overflow: 'hidden'}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(120% 80% at 50% 118%, rgba(163,74,56,0.07) 0%, rgba(250,249,246,0) 66%)',
      }}
    />
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
      <Clock frame={frame} />
    </svg>

    {/*
      In 4:5 the question sits higher (the dial is lower and larger there) and is
      given a width to wrap inside: at 66 px the line runs about 1400 px, so in a
      1080 frame it has to break. `Kinetic` reveals it the same way either way.
    */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: tall ? 0.10 * H : 0.2 * H,
        width: W,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Kinetic
        frame={frame}
        from={172}
        to={368}
        fontSize={tall ? 70 : 72}
        font={SERIF}
        weight={400}
        letterSpacing="-0.012em"
        maxWidth={tall ? 940 : undefined}
        segments={[
          {text: 'combien d’heures ', accent: true},
          {text: 'passez-vous sur votre location ?'},
        ]}
      />
    </div>

    <div
      style={{
        position: 'absolute',
        left: 0,
        top: tall ? 0.10 * H + 210 : 0.2 * H + 96,
        width: W,
        textAlign: 'center',
        fontFamily: SANS,
        fontWeight: W_MED,
        fontSize: 32,
        letterSpacing: '-0.01em',
        color: C.muted,
        opacity: EASE.entrance(prog(frame, 352, 404)),
      }}
    >
      Messages, ménage, tarifs, imprévus.
    </div>
  </div>
  );
};
