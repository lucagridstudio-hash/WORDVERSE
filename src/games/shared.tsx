import type { ReactNode } from 'react';
import { Icon } from '../components/Icon';
import { SpeakButton } from '../components/SpeakButton';
import type { WordEntry } from '../types';

export function RoundMeter({
  current,
  total,
  label,
  accent,
}: {
  current: number;
  total: number;
  label: string;
  accent: string;
}) {
  const safeTotal = Math.max(1, total);
  return (
    <div className="flex w-full items-center gap-3 sm:w-auto">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10 sm:w-40 sm:flex-none">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, (current / safeTotal) * 100)}%`, background: accent }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted">
        {current}/{total}
      </span>
    </div>
  );
}

export function GameBoard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`panel-solid relative mx-auto w-full max-w-5xl p-4 sm:p-7 lg:p-8 ${className}`}>{children}</div>
  );
}

export function Reveal({
  correct,
  entry,
  points,
  note,
  extra,
}: {
  correct: boolean;
  entry: WordEntry;
  points?: number;
  note?: string;
  extra?: ReactNode;
}) {
  return (
    <div
      className={`animate-rise mt-4 rounded-2xl border p-4 sm:p-5 ${
        correct ? 'border-emerald-400/30 bg-emerald-400/[0.08]' : 'border-rose-400/30 bg-rose-400/[0.07]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`flex items-center gap-2 text-sm font-semibold ${correct ? 'text-emerald-200' : 'text-rose-200'}`}>
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full ${
              correct ? 'bg-emerald-400/20' : 'bg-rose-400/20'
            }`}
          >
            <Icon name={correct ? 'check' : 'close'} className="h-3.5 w-3.5" />
          </span>
          {correct ? 'Risposta corretta' : 'Risposta non corretta'}
        </p>
        <div className="flex items-center gap-2">
          {extra}
          {points ? <span className="text-sm font-semibold text-gold-200">+{points} punti</span> : null}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-2xl text-ink">{entry.en}</span>
        <span className="text-lg text-teal-100/85">— {entry.it}</span>
        <SpeakButton text={entry.en} />
      </div>
      {entry.example ? <p className="mt-1.5 text-sm italic leading-relaxed text-muted">{entry.example}</p> : null}
      {note ? <p className="mt-2 text-xs text-muted/90">{note}</p> : null}
    </div>
  );
}

export function ContinueBar({
  onContinue,
  isLast,
  accent,
  hint,
  children,
}: {
  onContinue: () => void;
  isLast: boolean;
  accent: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[11px] text-muted/70">{hint}</p>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {children}
        <button type="button" className="btn-primary btn-lg min-w-[190px]" onClick={onContinue}>
          {isLast ? 'Vedi i risultati' : 'Continua'}
          <Icon name={isLast ? 'trophy' : 'arrowRight'} className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function TeacherReveal({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-quiet text-[11px] uppercase tracking-[0.16em]"
      title="Mostra la soluzione senza assegnare punti"
    >
      <Icon name="info" className="h-3.5 w-3.5" />
      Mostra risposta
    </button>
  );
}

export function AccentBar({ accent }: { accent: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${accent}aa, transparent)` }}
    />
  );
}
