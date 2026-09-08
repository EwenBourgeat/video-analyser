import React from 'react';

/**
 * The source uses real photographs of people. Those files are not available, so
 * avatars are synthesised: a deterministic warm portrait silhouette per seed,
 * which reads correctly at the sizes used (30-130 px) without pretending to be
 * a photo of a real person.
 */
const SKIN = ['#E8B892', '#C98C63', '#8D5A3B', '#F0C9A6', '#A9714B', '#6E4630'];
const HAIR = ['#2E2118', '#4A3524', '#1B1512', '#6B4A2C', '#3A2A1E', '#8A6238'];
const BG = ['#F2E4D6', '#DDE6F0', '#E9E1D2', '#D9E3E8', '#EFDCCF', '#E2E7DC'];

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

export const Avatar: React.FC<{seed: string; size: number}> = ({seed, size}) => {
  const h = hash(seed);
  const skin = SKIN[h % SKIN.length];
  const hair = HAIR[(h >> 3) % HAIR.length];
  const bg = BG[(h >> 6) % BG.length];
  const beard = (h >> 9) % 3 === 0;
  const longHair = (h >> 11) % 3 === 0;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <clipPath id={`c${h}`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#c${h})`}>
        <rect width="100" height="100" fill={bg} />
        {longHair ? (
          <ellipse cx="50" cy="52" rx="34" ry="40" fill={hair} />
        ) : null}
        {/* shoulders */}
        <ellipse cx="50" cy="108" rx="40" ry="42" fill={skin} opacity="0.9" />
        <ellipse cx="50" cy="112" rx="34" ry="38" fill="#3C4650" />
        {/* head */}
        <ellipse cx="50" cy="46" rx="23" ry="27" fill={skin} />
        {/* hair cap */}
        <path
          d="M27 44c0-15 10-24 23-24s23 9 23 24c-4-9-12-13-23-13s-19 4-23 13Z"
          fill={hair}
        />
        {beard ? (
          <path d="M31 52c2 15 9 22 19 22s17-7 19-22c-4 10-11 14-19 14s-15-4-19-14Z" fill={hair} opacity="0.85" />
        ) : null}
        {/* eyes */}
        <circle cx="42" cy="47" r="2.2" fill="#2A2118" />
        <circle cx="58" cy="47" r="2.2" fill="#2A2118" />
      </g>
    </svg>
  );
};
