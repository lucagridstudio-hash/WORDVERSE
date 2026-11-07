import { useEffect, useRef, useState } from 'react';
import type { WordEntry } from '../types';
import { shuffle } from '../lib/utils';
import { useElapsed } from '../lib/hooks';
import { Icon } from '../components/Icon';
import { GameBoard, RoundMeter, TeacherReveal } from './shared';
import type { GameProps } from './types';

const ACCENT = '#a5b4fc';
const PAIR_COLORS = ['#7dd3fc', '#a5b4fc', '#c4b5fd', '#6ee7b7', '#f2cd8a', '#fca5a5', '#5eead4', '#f0abfc'];

export function WordMatching({ pool, rounds, paused, onAnswer, onComplete }: GameProps) {
  const [entries] = useState<WordEntry[]>(() => shuffle(pool).slice(0, Math.max(1, rounds)));
  const [englishOrder] = useState<WordEntry[]>(() => shuffle(entries));
  const [italianOrder] = useState<WordEntry[]>(() => shuffle(entries));
  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [selectedIt, setSelectedIt] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ en: string; it: string } | null>(null);
  const [moves, setMoves] = useState(0);
  const [notice, setNotice] = useState<{ text: string; tone: 'good' | 'bad' } | null>(null);
  const [revealed, setRevealed] = useState(false);

  const elapsed = useElapsed(!paused);
  const resolveTimer = useRef<number | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    return () => {
      if (resolveTimer.current) window.clearTimeout(resolveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (entries.length > 0 && matched.length === entries.length) {
      const id = window.setTimeout(() => completeRef.current(), 900);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [matched.length, entries.length]);

  const busy = wrongPair !== null || revealed;

  const selectEn = (id: string) => {
    if (paused || busy || matched.includes(id)) return;
    if (selectedEn === id) {
      setSelectedEn(null);
      return;
    }
    setSelectedEn(id);
    setNotice(null);
  };

  const selectIt = (id: string) => {
    if (paused || busy || matched.includes(id)) return;
    if (selectedIt === id) {
      setSelectedIt(null);
      return;
    }
    setSelectedIt(id);
    setNotice(null);
  };

  useEffect(() => {
    if (!selectedEn || !selectedIt) return;
    const enEntry = entries.find((entry) => entry.id === selectedEn);
    const itEntry = entries.find((entry) => entry.id === selectedIt);
    if (!enEntry || !itEntry) return;

    setMoves((value) => value + 1);

    if (enEntry.id === itEntry.id) {
      const gained = onAnswer(enEntry, true);
      setMatched((current) => [...current, enEntry.id]);
      setSelectedEn(null);
      setSelectedIt(null);
      setNotice({ text: `Coppia trovata: ${enEntry.en} — ${enEntry.it}${gained ? ` · +${gained}` : ''}`, tone: 'good' });
      return;
    }

    onAnswer(enEntry, false);
    setWrongPair({ en: enEntry.id, it: itEntry.id });
    setNotice({ text: `${enEntry.en} e ${itEntry.it} non vanno insieme.`, tone: 'bad' });
    resolveTimer.current = window.setTimeout(() => {
      setWrongPair(null);
      setSelectedEn(null);
      setSelectedIt(null);
    }, 780);
  }, [selectedEn, selectedIt, entries, onAnswer]);

  const revealAll = () => {
    if (busy) return;
    const remaining = entries.filter((entry) => !matched.includes(entry.id));
    if (!remaining.length) return;
    remaining.forEach((entry) => onAnswer(entry, false));
    setMatched(entries.map((entry) => entry.id));
    setSelectedEn(null);
    setSelectedIt(null);
    setRevealed(true);
    setNotice({ text: 'Coppie mostrate dal docente: nessun punto assegnato.', tone: 'bad' });
  };

  const cardState = (id: string, side: 'en' | 'it') => {
    if (matched.includes(id)) return 'matched';
    if (wrongPair) {
      if (wrongPair[side] === id) return 'wrong';
    }
    if (side === 'en' && selectedEn === id) return 'selected';
    if (side === 'it' && selectedIt === id) return 'selected';
    return 'idle';
  };

  const renderCard = (entry: WordEntry, side: 'en' | 'it') => {
    const state = cardState(entry.id, side);
    const color = PAIR_COLORS[entries.findIndex((item) => item.id === entry.id) % PAIR_COLORS.length];
    return (
      <button
        key={`${side}-${entry.id}`}
        type="button"
        disabled={paused || state === 'matched'}
        onClick={() => (side === 'en' ? selectEn(entry.id) : selectIt(entry.id))}
        className={`group relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-xl border px-3.5 py-3 text-left transition duration-200 sm:px-4 sm:py-3.5 ${
          state === 'matched'
            ? 'border-emerald-300/25 bg-emerald-400/[0.07] opacity-70'
            : state === 'selected'
              ? 'border-teal-300/70 bg-teal-400/10 shadow-[0_0_0_1px_rgba(94,234,212,0.3)]'
              : state === 'wrong'
                ? 'animate-shake border-rose-400/60 bg-rose-400/10'
                : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]'
        }`}
      >
        <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: state === 'matched' ? '#6ee7b7' : color, opacity: state === 'matched' ? 0.9 : 0.5 }} />
        <span className={`min-w-0 break-words pl-1 text-base leading-tight sm:text-lg ${side === 'en' ? 'font-medium text-ink' : 'text-teal-50/90'}`}>
          {side === 'en' ? entry.en : entry.it}
        </span>
        {state === 'matched' ? (
          <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-300" />
        ) : (
          <span className={`h-2 w-2 shrink-0 rounded-full transition ${state === 'selected' ? 'bg-teal-300' : 'bg-white/15'}`} />
        )}
      </button>
    );
  };

  return (
    <div className="animate-rise">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <RoundMeter current={matched.length} total={entries.length} label="Coppie" accent={ACCENT} />
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="chip">
            <Icon name="clock" className="h-3.5 w-3.5" />
            {elapsed}s
          </span>
          <span className="chip">{moves} mosse</span>
        </div>
      </div>

      <GameBoard className="!max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">Trova le coppie</h2>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              Seleziona una parola inglese e la sua traduzione italiana. {selectedEn ? 'Ora scegli a destra.' : selectedIt ? 'Ora scegli a sinistra.' : ''}
            </p>
          </div>
          <TeacherReveal onClick={revealAll} disabled={busy || paused} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted/80">English</p>
            <div className="space-y-2">{englishOrder.map((entry) => renderCard(entry, 'en'))}</div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted/80">Italiano</p>
            <div className="space-y-2">{italianOrder.map((entry) => renderCard(entry, 'it'))}</div>
          </div>
        </div>

        <div className="mt-4 flex min-h-[42px] flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <p className={`text-xs ${notice?.tone === 'bad' ? 'text-rose-200/90' : notice?.tone === 'good' ? 'text-emerald-200/90' : 'text-muted'}`}>
            {notice ? notice.text : 'Le coppie corrette si illuminano e restano visibili.'}
          </p>
          {notice?.tone === 'bad' && selectedEn ? (
            <span className="text-[11px] uppercase tracking-wider text-muted/70">riprova</span>
          ) : null}
        </div>

        {matched.length === entries.length && entries.length > 0 ? (
          <div className="animate-pop mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-400/[0.08] p-4 text-center">
            <p className="font-display text-2xl text-emerald-100">Tutte le coppie trovate</p>
            <p className="mt-1 text-sm text-muted">
              {moves} mosse · {elapsed} secondi. Preparo i risultati…
            </p>
          </div>
        ) : null}
      </GameBoard>
    </div>
  );
}
