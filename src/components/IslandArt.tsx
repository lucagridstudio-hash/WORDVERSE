import { useId } from 'react';
import type { MotifKey, TerritoryTheme } from '../types';

const BLOBS = [
  'M100 24c37 0 66 20 68 58 2 37-25 68-65 70-38 2-70-22-72-58-2-37 27-70 69-70Z',
  'M104 22c36 4 62 26 62 60 0 38-28 64-66 66-36 2-66-24-66-62 0-34 32-68 70-64Z',
  'M97 25c40-3 70 22 70 58 0 38-30 68-70 66-38-2-63-26-63-62 0-34 26-59 63-62Z',
];

const BLOB_INDEX: Record<MotifKey, number> = {
  food: 0,
  art: 1,
  fun: 2,
  tech: 0,
  work: 1,
  places: 2,
  sports: 0,
  travel: 1,
  nature: 2,
  home: 0,
  custom: 1,
};

const motifArt: Record<MotifKey, React.ReactNode> = {
  food: (
    <>
      <path d="M7 3v5a2 2 0 0 0 4 0V3" />
      <path d="M9 10v11" />
      <path d="M17 3c1.4 3.3 1.4 6.7 0 10v8" />
    </>
  ),
  art: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 0-4h-.7a1.8 1.8 0 0 1 0-3.6H16a5 5 0 0 0 5-5c0-3-4-5.4-9-5.4z" />
      <circle cx="7.8" cy="11.4" r="1" fill="currentColor" stroke="none" />
      <circle cx="9.8" cy="7.4" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.2" cy="6.9" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  fun: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.4" />
      <circle cx="8.5" cy="8.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  tech: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2.2" />
      <rect x="10" y="10" width="4" height="4" rx="1" />
      <path d="M10 7V3M14 7V3M10 21v-4M14 21v-4M7 10H3M7 14H3M21 10h-4M21 14h-4" />
    </>
  ),
  work: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.4" />
      <path d="M9 7.5V6a2.4 2.4 0 0 1 2.4-2.4h1.2A2.4 2.4 0 0 1 15 6v1.5" />
      <path d="M3 12.6h18" />
      <path d="M10.5 12.6v2h3v-2" />
    </>
  ),
  places: (
    <>
      <path d="M3 21h18" />
      <path d="M4.5 21V11l3.5-2.4L11.5 11v10" />
      <path d="M11.5 21V6.2L16.5 4l4 3v14" />
      <path d="M6.6 13.6h2.6M6.6 16.6h2.6M14.4 9.4h1.4M14.4 12.6h1.4M14.4 15.8h1.4" />
    </>
  ),
  sports: <path d="M3.5 9.5v5M7 7.5v9M17 7.5v9M20.5 9.5v5M7 12h10" />,
  travel: (
    <>
      <path d="M21 3.5 3 11l7.2 2.8L13 21l8-17.5Z" />
      <path d="M21 3.5 10.2 13.8" />
    </>
  ),
  nature: (
    <>
      <path d="M4 20c0-9 6.6-15.4 16-16 .8 10.2-6 16.4-16 16Z" />
      <path d="M4 20C8.2 14.4 12.6 10.3 20 4" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 10.8 12 3.8l8.5 7" />
      <path d="M5.6 9.6V20h12.8V9.6" />
      <path d="M10 20v-5.2h4V20" />
    </>
  ),
  custom: <path d="M12 3.2 14 9l5.8 2-5.8 2-2 5.8-2-5.8L4.2 11 10 9l2-5.8Z" />,
};

type Props = {
  motif: MotifKey;
  theme: TerritoryTheme;
  className?: string;
  dim?: boolean;
};

export function IslandArt({ motif, theme, className = '', dim = false }: Props) {
  const rawId = useId().replace(/[:]/g, '');
  const landId = `land-${rawId}`;
  const glowId = `glow-${rawId}`;
  const blob = BLOBS[BLOB_INDEX[motif] ?? 0];

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      style={{ opacity: dim ? 0.55 : 1, overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={glowId} cx="50%" cy="46%" r="50%">
          <stop offset="0%" stopColor={theme.accent} stopOpacity="0.34" />
          <stop offset="55%" stopColor={theme.accent} stopOpacity="0.1" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={landId} x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor={theme.mid} />
          <stop offset="55%" stopColor={theme.mid} stopOpacity="0.92" />
          <stop offset="100%" stopColor={theme.deep} />
        </linearGradient>
      </defs>

      <circle cx="100" cy="104" r="94" fill={`url(#${glowId})`} />
      <ellipse cx="100" cy="178" rx="64" ry="11" fill="#03070e" opacity="0.6" />
      <ellipse cx="100" cy="178" rx="64" ry="11" fill="none" stroke={theme.accent} strokeOpacity="0.16" />

      <g transform="translate(100 106) scale(1 0.9) translate(-100 -100)">
        <path d={blob} transform="translate(0 14)" fill="#03070e" opacity="0.65" />
      </g>
      <path d={blob} fill={`url(#${landId})`} stroke={theme.accent} strokeOpacity="0.4" strokeWidth="1.4" />
      <path
        d={blob}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.1"
        strokeWidth="1"
        transform="translate(100 100) scale(0.9) translate(-111.1 -111.1)"
      />

      <g
        transform="translate(76 76) scale(2)"
        fill="none"
        stroke={theme.accent}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      >
        {motifArt[motif] ?? motifArt.custom}
      </g>
    </svg>
  );
}
