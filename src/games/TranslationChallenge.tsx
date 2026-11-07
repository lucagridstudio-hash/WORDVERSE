import { useEffect, useRef, useState } from 'react';
import type { WordEntry } from '../types';
import { isAnswerCorrect, shuffle } from '../lib/utils';
import { useCountdown } from '../lib/hooks';
import { posLabel } from '../data/territories';
import { Icon } from '../components/Icon';
import { ProgressRing } from '../components/ProgressRing';
import { AccentBar, ContinueBar, GameBoard, Reveal, RoundMeter, TeacherReveal } from './shared';
import type { GameProps } from './types';

const ACCENT = '#60a5fa';
const SECONDS = 30;

export function TranslationChallenge({ pool, rounds, timer, paused, onAnswer, onComplete }: GameProps) {
  const [questions] = useState<WordEntry[]>(() => shuffle(pool).slice(0, Math.max(1, rounds)));
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [points, setPoints] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const entry = questions[index];
  const isLast = index >= questions.length - 1;

  const remaining = useCountdown(
    SECONDS,
    timer && !paused && !locked,
    () => {
      if (locked || !entry) return;
      setLocked(true);
      setTimedOut(true);
      setCorrect(false);
      onAnswer(entry, false);
    },
    index,
  );

  const submit = () => {
    if (locked || paused || !entry) return;
    if (!value.trim()) return;
    const isCorrect = isAnswerCorrect(value, entry);
    const speed = timer ? remaining / SECONDS : undefined;
    const gained = onAnswer(entry, isCorrect, { speed });
    setCorrect(isCorrect);
    setPoints(gained);
    setLocked(true);
  };

  const reveal = () => {
    if (locked || paused) return;
    setLocked(true);
    setCorrect(false);
    setTimedOut(false);
    onAnswer(entry, false);
  };

  const next = () => {
    if (!isLast) {
      setIndex((current) => current + 1);
      setValue('');
      setLocked(false);
      setCorrect(false);
      setPoints(0);
      setTimedOut(false);
      return;
    }
    onComplete();
  };

  useEffect(() => {
    if (!locked && !paused) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [locked, paused, index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (paused) return;
      if (event.key === 'Enter' && locked) {
        event.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!entry) {
    return (
      <GameBoard>
        <p className="text-center text-sm text-muted">Nessuna parola disponibile.</p>
        <button type="button" className="btn-primary mx-auto mt-4 flex" onClick={onComplete}>
          Torna al territorio
        </button>
      </GameBoard>
    );
  }

  return (
    <div className="animate-rise">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <RoundMeter current={index + 1} total={questions.length} label="Traduzione" accent={ACCENT} />
        {timer ? (
          <ProgressRing value={(remaining / SECONDS) * 100} size={52} color={remaining <= 7 ? '#fb7185' : '#f2cd8a'}>
            <span className="text-sm font-semibold tabular-nums text-ink">{remaining}</span>
          </ProgressRing>
        ) : (
          <span className="chip">senza timer</span>
        )}
      </div>

      <GameBoard>
        <AccentBar accent={ACCENT} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Italiano → English
          </span>
          <span className="tag-pos">{posLabel[entry.pos]}</span>
          {entry.variants?.length ? (
            <span className="chip border-white/10 text-[10px]">più varianti accettate</span>
          ) : null}
        </div>

        <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-6xl">{entry.it}</h2>
        <p className="mt-2 text-sm text-muted">Scrivi la traduzione inglese. Maiuscole e spazi non contano.</p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            ref={inputRef}
            className={`field-lg flex-1 text-2xl tracking-wide ${locked && !correct ? 'border-rose-400/50' : ''} ${locked && correct ? 'border-emerald-400/50' : ''}`}
            placeholder="Scrivi in inglese…"
            value={value}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={locked || paused}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              // "Continua" is handled once by the window listener to avoid skipping a round.
              if (event.key === 'Enter' && !locked) {
                event.preventDefault();
                submit();
              }
            }}
            aria-label={`Traduzione inglese di ${entry.it}`}
          />
          {!locked ? (
            <button type="button" className="btn-primary btn-lg sm:w-auto" onClick={submit} disabled={!value.trim() || paused}>
              <Icon name="check" className="h-4 w-4" />
              Controlla
            </button>
          ) : null}
        </div>

        {locked ? (
          <>
            <Reveal
              correct={correct}
              entry={entry}
              points={points}
              note={
                timedOut
                  ? 'Tempo scaduto.'
                  : !correct
                    ? `La tua risposta: «${value.trim() || '—'}»`
                    : undefined
              }
              extra={
                entry.variants?.length ? (
                  <span className="text-[11px] text-muted">accettate anche: {entry.variants.join(', ')}</span>
                ) : null
              }
            />
            <ContinueBar onContinue={next} isLast={isLast} accent={ACCENT} hint="Invio per continuare" />
          </>
        ) : (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-muted/70">Ortografia sotto esame: nessun suggerimento.</p>
            <TeacherReveal onClick={reveal} disabled={paused} />
          </div>
        )}
      </GameBoard>
    </div>
  );
}
