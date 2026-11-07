import { useEffect, useRef, useState } from 'react';
import type { WordEntry } from '../types';
import { shuffle } from '../lib/utils';
import { useElapsed } from '../lib/hooks';
import { Icon } from '../components/Icon';
import { GameBoard, RoundMeter, TeacherReveal } from './shared';
import type { GameProps } from './types';

const ACCENT = '#c084fc';

type Card = {
  key: string;
  entryId: string;
  text: string;
  lang: 'en' | 'it';
};

export function MemoryChallenge({ pool, rounds, paused, onAnswer, onComplete }: GameProps) {
  const [entries] = useState<WordEntry[]>(() => shuffle(pool).slice(0, Math.max(1, rounds)));
  const [cards] = useState<Card[]>(() =>
    shuffle(
      entries.flatMap((entry) => [
        { key: `${entry.id}-en`, entryId: entry.id, text: entry.en, lang: 'en' as const },
        { key: `${entry.id}-it`, entryId: entry.id, text: entry.it, lang: 'it' as const },
      ]),
    ),
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const elapsed = useElapsed(!paused);
  const timers = useRef<number[]>([]);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (entries.length > 0 && matched.length === entries.length) {
      const id = window.setTimeout(() => completeRef.current(), 950);
      timers.current.push(id);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [matched.length, entries.length]);

  const flip = (cardKey: string) => {
    if (paused || locked || revealed) return;
    if (flipped.includes(cardKey) || matched.some((id) => cardKey.startsWith(`${id}-`))) return;
    if (flipped.length >= 2) return;

    const next = [...flipped, cardKey];
    setFlipped(next);
    if (next.length < 2) return;

    const first = cards.find((card) => card.key === next[0]);
    const second = cards.find((card) => card.key === next[1]);
    if (!first || !second) return;

    setMoves((value) => value + 1);
    setLocked(true);

    if (first.entryId === second.entryId) {
      const entry = entries.find((item) => item.id === first.entryId);
      if (entry) onAnswer(entry, true);
      const id = window.setTimeout(() => {
        setMatched((current) => (current.includes(first.entryId) ? current : [...current, first.entryId]));
        setFlipped([]);
        setLocked(false);
      }, 420);
      timers.current.push(id);
      return;
    }

    const entry = entries.find((item) => item.id === first.entryId);
    if (entry) onAnswer(entry, false);
    const id = window.setTimeout(() => {
      setFlipped([]);
      setLocked(false);
    }, 980);
    timers.current.push(id);
  };

  const revealAll = () => {
    if (locked || revealed) return;
    const remaining = entries.filter((entry) => !matched.includes(entry.id));
    if (!remaining.length) return;
    remaining.forEach((entry) => onAnswer(entry, false));
    setFlipped([]);
    setMatched(entries.map((entry) => entry.id));
    setRevealed(true);
    setLocked(true);
  };

  const isFaceUp = (card: Card) =>
    flipped.includes(card.key) || matched.includes(card.entryId);

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

      <GameBoard className="!max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">Memory Challenge</h2>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              Gira due carte: ogni coppia unisce una parola inglese e la sua traduzione.
            </p>
          </div>
          <TeacherReveal onClick={revealAll} disabled={locked || paused} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
          {cards.map((card) => {
            const faceUp = isFaceUp(card);
            const isMatched = matched.includes(card.entryId);
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => flip(card.key)}
                className={`flip-scene relative aspect-[4/5] w-full rounded-2xl text-left transition ${
                  isMatched ? 'opacity-70' : ''
                }`}
                aria-label={faceUp ? `Carta scoperta: ${card.text}` : 'Carta coperta'}
                disabled={paused}
              >
                <div className={`flip-inner relative h-full w-full ${faceUp ? 'is-flipped' : ''}`}>
                  <div
                    className="flip-face flex flex-col items-center justify-center border border-white/10"
                    style={{
                      background:
                        'radial-gradient(90% 80% at 50% 0%, rgba(56,50,90,0.95), rgba(10,15,28,0.98))',
                    }}
                  >
                    <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 50% 35%, ${ACCENT}, transparent 65%)` }} />
                    <span className="relative font-display text-2xl text-white/25">✦</span>
                    <span className="relative mt-2 text-[9px] uppercase tracking-[0.3em] text-white/20">wordverse</span>
                  </div>
                  <div
                    className={`flip-face flip-back flex flex-col justify-between border p-2.5 ${
                      isMatched ? 'border-emerald-300/50 bg-emerald-500/15' : 'border-white/15 bg-[#0d1a2c]'
                    }`}
                    style={{
                      background: isMatched
                        ? 'linear-gradient(150deg, rgba(16,185,129,0.22), rgba(8,20,32,0.98))'
                        : 'linear-gradient(150deg, rgba(29,45,74,0.98), rgba(9,17,30,1))',
                    }}
                  >
                    <span className={`text-[9px] font-semibold uppercase tracking-[0.2em] ${card.lang === 'en' ? 'text-teal-300/80' : 'text-gold-200/80'}`}>
                      {card.lang === 'en' ? 'English' : 'Italiano'}
                    </span>
                    <span className="break-words text-center font-display text-sm leading-tight text-ink sm:text-lg">
                      {card.text}
                    </span>
                    <span className="flex justify-center">
                      {isMatched ? (
                        <Icon name="check" className="h-4 w-4 text-emerald-300" />
                      ) : (
                        <span className="h-1 w-6 rounded-full bg-white/10" />
                      )}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {matched.length === entries.length && entries.length > 0 ? (
          <div className="animate-pop mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-400/[0.08] p-4 text-center">
            <p className="font-display text-2xl text-emerald-100">Tutte le coppie trovate</p>
            <p className="mt-1 text-sm text-muted">
              {moves} mosse · {elapsed} secondi
            </p>
          </div>
        ) : (
          <p className="mt-4 text-center text-[11px] text-muted/70">
            {locked ? 'Confronto le due carte…' : 'Gira due carte per volta'}
          </p>
        )}
      </GameBoard>
    </div>
  );
}
