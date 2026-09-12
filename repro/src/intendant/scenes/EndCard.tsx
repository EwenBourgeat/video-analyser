import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, W, H, SANS, MONO, W_MED, W_BOLD, T} from '../theme';
import {Paper} from '../components/Grounds';
import {Mark, Wordmark} from '../components/Brand';
import {prog} from '../../ease';
import {EASE} from '../../bezier';

/**
 * Beat 12 — the close, 30.5 -> 34 s.
 *
 * The pointer, the CTA pill and the click are gone: "ça fait pas beau du tout,
 * l'apparition fluide et smooth du reste suffit". What is left is the lockup,
 * a hairline, the line of copy and the number — and every one of them now
 * arrives on a longer, softer ramp than before, with the rule drawing outward
 * from its own centre rather than snapping to width.
 *
 * The offer still reads: the contact line carries it, without a button to click.
 */

const FROM = T.endcard.from;

export const EndCard: React.FC<{frame: number}> = ({frame}) => {
  // longer, more overlapped ramps — nothing lands on the same frame as anything else
  const mark = EASE.entrance(prog(frame, FROM + 6, FROM + 80));
  const word = EASE.entrance(prog(frame, FROM + 28, FROM + 116));
  const rule = EASE.entrance(prog(frame, FROM + 62, FROM + 146));
  const tag = EASE.entrance(prog(frame, FROM + 88, FROM + 172));
  const sub = EASE.entrance(prog(frame, FROM + 118, FROM + 204));
  const tel = EASE.entrance(prog(frame, FROM + 144, FROM + 236));

  const rise = (e: number, px = 26) => `translateY(${(1 - e) * px}px)`;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper wash={0.5} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            opacity: mark,
            transform: rise(mark, 18),
          }}
        >
          <Mark size={112} />
          <Wordmark size={98} shown={word} />
        </div>

        <div
          style={{
            width: 320 * rule,
            height: 1,
            background: C.lineStrong,
            opacity: rule,
          }}
        />

        <div
          style={{
            fontFamily: SANS,
            fontWeight: W_MED,
            fontSize: 33,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: C.muted,
            opacity: tag,
            transform: rise(tag, 14),
          }}
        >
          Conciergerie · Toulouse
        </div>

        <div
          style={{
            marginTop: 26,
            textAlign: 'center',
            fontFamily: SANS,
            fontWeight: W_MED,
            fontSize: 34,
            lineHeight: 1.6,
            color: C.inkSoft,
            opacity: sub,
            transform: rise(sub, 20),
          }}
        >
          Estimation gratuite et sans engagement,
          <br />
          réponse sous 48 h.
        </div>

        <div
          style={{
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 44,
            letterSpacing: '0.02em',
            color: C.blue600,
            opacity: tel,
            transform: rise(tel, 16),
          }}
        >
          06 21 93 44 13
        </div>
      </div>
      {void W}
      {void H}
    </AbsoluteFill>
  );
};
