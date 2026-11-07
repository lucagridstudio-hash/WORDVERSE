import { useState } from 'react';
import { useApp } from '../state';
import { HelpDialog } from './HelpDialog';
import { Icon } from './Icon';

function BrandMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id="wv-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9df3e2" />
          <stop offset="55%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="#06101d" stroke="rgba(94,234,212,0.35)" />
      <path
        d="M20 6.5l3.9 9.6 9.6 3.9-9.6 3.9L20 33.5l-3.9-9.6L6.5 20l9.6-3.9L20 6.5z"
        fill="url(#wv-mark)"
        opacity="0.92"
      />
      <circle cx="20" cy="20" r="2.1" fill="#050b17" />
    </svg>
  );
}

export function TopBar() {
  const { view, navigate, totalXp, resetAll } = useApp();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#04070f]/75 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1520px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => navigate({ name: 'map' })}
          className="group flex items-center gap-3 rounded-xl pr-2 text-left transition hover:opacity-90"
          aria-label="Torna alla mappa del mondo"
        >
          <BrandMark />
          <span>
            <span className="block font-display text-base leading-none tracking-[0.18em] text-ink sm:text-lg">
              WORDVERSE
            </span>
            <span className="mt-1 hidden text-[0.6rem] uppercase tracking-[0.24em] text-muted/80 sm:block">
              English Vocabulary Expedition
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          {view.name !== 'map' ? (
            <button type="button" className="btn-ghost hidden px-3 py-2 sm:inline-flex" onClick={() => navigate({ name: 'map' })}>
              <Icon name="map" className="h-4 w-4" />
              Mappa
            </button>
          ) : null}
          <div className="chip border-gold-300/25 bg-gold-300/[0.07] text-gold-200">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            <span className="tabular-nums text-ink">{totalXp}</span>
            <span className="hidden sm:inline">XP</span>
          </div>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="btn-quiet px-2.5"
            aria-label="Guida e impostazioni"
            title="Guida"
          >
            <Icon name="info" className="h-5 w-5" />
          </button>
        </div>
      </div>
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} onReset={resetAll} />
    </header>
  );
}
