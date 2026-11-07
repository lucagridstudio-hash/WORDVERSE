import type { ReactNode } from 'react';

export type IconName =
  | 'back'
  | 'play'
  | 'pause'
  | 'next'
  | 'pencil'
  | 'plus'
  | 'trash'
  | 'check'
  | 'close'
  | 'flame'
  | 'clock'
  | 'trophy'
  | 'sparkles'
  | 'refresh'
  | 'volume'
  | 'chevronDown'
  | 'users'
  | 'settings'
  | 'map'
  | 'arrowRight'
  | 'info'
  | 'star'
  | 'target'
  | 'bolt'
  | 'search'
  | 'home'
  | 'warn'
  | 'grid'
  | 'layers'
  | 'keyboard'
  | 'shuffle'
  | 'quiz'
  | 'matching'
  | 'missing';

const paths: Record<IconName, ReactNode> = {
  back: <path d="M15 18l-6-6 6-6" />,
  play: <path d="M8 5.2v13.6L19.2 12 8 5.2z" fill="currentColor" stroke="none" />,
  pause: <path d="M9.5 5v14M14.5 5v14" />,
  next: <path d="M9 18l6-6-6-6" />,
  pencil: (
    <>
      <path d="M4.5 19.5h4L20 8l-4-4L4.5 15.5v4z" />
      <path d="M14.5 5.5l4 4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l.9 12.2h9.2L17.5 7" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5L20 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  flame: (
    <path d="M12 3.2c2.9 3.4 4.8 5.9 4.8 8.8a4.8 4.8 0 0 1-9.6 0c0-1.8.8-3.2 2-4.6.2 1.8 1 2.9 2.1 3.2.9-2.6.4-4.6.7-7.4z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.4V12l3.2 2" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4.5h8v4.2a4 4 0 0 1-8 0V4.5z" />
      <path d="M8 5.5H5.2v1.8a3 3 0 0 0 3 3M16 5.5h2.8v1.8a3 3 0 0 1-3 3M12 12.7v3.6M9 20h6M10 16.3h4v3.7h-4z" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.5l1.7 4.6 4.6 1.7-4.6 1.7L12 16.1l-1.7-4.6L5.7 9.8l4.6-1.7L12 3.5z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4.5V10h-5.5" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9.5h3l4-3.2v11.4l-4-3.2H4V9.5z" />
      <path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.4 7.4 0 0 1 0 10.4" />
    </>
  ),
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  users: (
    <>
      <path d="M8.2 11.4a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2z" />
      <path d="M2.4 20.4v-1.6a5 5 0 0 1 5-5h1.6a5 5 0 0 1 5 5v1.6" />
      <path d="M17 4.8a3 3 0 0 1 0 5.8M21.6 20.4v-1.5a4.4 4.4 0 0 0-3.4-4.3" />
    </>
  ),
  settings: <path d="M4 7.5h8M16.5 7.5H20M4 16.5h4M12 16.5h8M14.5 4.5v6M10 13.5v6" />,
  map: (
    <>
      <path d="M9 3.6L3.6 6v14.4L9 18l6 2.4 5.4-2.4V3.6L15 6 9 3.6z" />
      <path d="M9 3.6V18M15 6v14.4" />
    </>
  ),
  arrowRight: <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.2M12 7.9h.01" />
    </>
  ),
  star: <path d="M12 3.6l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 10l6-.8L12 3.6z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  bolt: <path d="M13.2 2.8L5 13.6h5.4L9.8 21.2 19 10.2h-5.6l-.2-7.4z" />,
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.6" />
      <path d="M15.8 15.8L21 21" />
    </>
  ),
  home: (
    <>
      <path d="M3.6 10.8L12 4l8.4 6.8" />
      <path d="M5.8 9.6V20h12.4V9.6" />
      <path d="M9.8 20v-4.8h4.4V20" />
    </>
  ),
  warn: (
    <>
      <path d="M12 4.2L21 19.6H3L12 4.2z" />
      <path d="M12 9.8v4M12 16.8h.01" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.5l8.5 4.6L12 12.7 3.5 8.1 12 3.5z" />
      <path d="M3.5 12.3L12 16.9l8.5-4.6M3.5 16.5L12 21l8.5-4.5" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2.6" y="6" width="18.8" height="12" rx="2" />
      <path d="M6 9.6h.01M9.4 9.6h.01M12.8 9.6h.01M16.2 9.6h.01M19 9.6h.01M6 12.8h.01M9.4 12.8h.01M12.8 12.8h.01M16.2 12.8h.01M19 12.8h.01M7.5 15.8h9" />
    </>
  ),
  shuffle: <path d="M4 7h4l8 10h4M4 17h4l2.4-3M16 7h4M18 5l2 2-2 2M18 15l2 2-2 2" />,
  quiz: (
    <>
      <path d="M8 6.5h12M8 12h12M8 17.5h12" />
      <path d="M3.6 6.5l1.4 1.4 2.2-2.6M3.6 12l1.4 1.4 2.2-2.6M3.6 17.5l1.4 1.4 2.2-2.6" />
    </>
  ),
  matching: (
    <>
      <rect x="3.2" y="4.4" width="7" height="6.4" rx="1.6" />
      <rect x="13.6" y="13.2" width="7" height="6.4" rx="1.6" />
      <path d="M10.6 7.6h3.6a2 2 0 0 1 2 2v3.6M13.2 16.4H9.6a2 2 0 0 1-2-2V10.8" />
    </>
  ),
  missing: (
    <>
      <path d="M4 5.5h16M4 10.5h6M4 15.5h16M4 20h9" />
      <rect x="12.6" y="8.9" width="5.4" height="3.4" rx="0.9" strokeDasharray="2 2" />
    </>
  ),
};

type Props = {
  name: IconName;
  className?: string;
  strokeWidth?: number;
};

export function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.7 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
