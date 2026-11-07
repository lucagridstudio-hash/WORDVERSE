import { useEffect, useRef, useState } from 'react';
import type { WordEntry } from '../types';
import { buildMissing, buildQuiz, type MissingQuestion, type QuizQuestion } from '../lib/questions';
import { isAnswerCorrect, shuffle } from '../lib/utils';
import { useCountdown } from '../lib/hooks';
import { Icon } from '../components/Icon';
import { ProgressRing } from '../components/ProgressRing';
import { AccentBar, ContinueBar, GameBoard, Reveal, RoundMeter, TeacherReveal } from './shared';
import type { GameProps } from './types';

const ACCENT = '#f2cd8a';
const SECONDS = 30;

type FinalRound =
  | { kind: 'quiz'; question: QuizQuestion }
  | { kind: 'missing'; question: MissingQuestion }
  | { kind: 'translation'; entry: WordEntry };

const buildPlan = (pool: WordEntry[], all: WordEntry[], rounds: number): FinalRound[] => {
  const entries = shuffle(pool).slice(0, Math.max(1, rounds));
  return entries.map((entry, index): FinalRound => {
    const phase = index % 3;
    if (phase === 2) return { kind: 'translation', entry };
    if (phase === 1) {
      const missing = buildMissing([entry], all, 1)[0];
      if (missing) return { kind: 'missing', question: missing };
    }
    const quiz = buildQuiz([entry], all, 1)[0];
    return { kind: 'quiz', question: quiz };
  });
};

const phaseLabel = (kind: FinalRound['kind']) =>
  kind === 'quiz' ? 'Quiz rapido' : kind === 'missing' ? 'Parola mancante' : 'Traduzione';

export function FinalChallenge({ pool, all, rounds, timer, paused, onAnswer, onComplete }: GameProps) {
  const [plan] = useState<FinalRound[]>(() => buildPlan(pool, all, rounds));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [points, setPoints] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const round = plan[index];
  const isLast = index >= plan.length - 1;
  const entry: WordEntry | undefined =
    round?.kind === 'translation' ? round.entry : round?.question.entry;

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

  const settle = (isCorrect: boolean) => {
    if (!entry) return;
    const speed = timer ? remaining / SECONDS : undefined;
    const gained = onAnswer(entry, isCorrect, { speed });
    setCorrect(isCorrect);
    setPoints(gained);
    setLocked(true);
  };

  const choose = (option: string) => {
    if (!round || round.kind === 'translation' || locked || paused) return;
    const answer = round.kind === 'quiz' ? round.question.answer : round.question.entry.en;
    setSelected(option);
    settle(option.toLowerCase() === answer.toLowerCase());
  };

  const submit = () => {
    if (!round || round.kind !== 'translation' || locked || paused) return;
    if (!value.trim()) return;
    settle(isAnswerCorrect(value, round.entry));
  };

  const reveal = () => {
    if (!entry || locked || paused) return;
    setLocked(true);
    setCorrect(false);
    setTimedOut(false);
    onAnswer(entry, false);
  };

  const next = () => {
    if (!isLast) {
      setIndex((current) => current + 1);
      setSelected(null);
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
    if (round?.kind === 'translation' && !locked && !paused) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [locked, paused, index, round]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (paused || !round) return;
      if (event.key === 'Enter' && locked) {
        event.preventDefault();
        next();
        return;
      }
      if (locked) return;
      if (round.kind === 'quiz' || round.kind === 'missing') {
        const numeric = Number(event.key);
        if (numeric >= 1 && numeric <= round.question.options.length) {
          event.preventDefault();
          choose(round.question.options[numeric - 1]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!round || !entry) {
    return (
      <GameBoard>
        <p className="text-center text-sm text-muted">Nessun round disponibile.</p>
        <button type="button" className="btn-primary mx-auto mt-4 flex" onClick={onComplete}>
          Torna al territorio
        </button>
      </GameBoard>
    );
  }

  const options =
    round.kind === 'quiz' ? round.question.options : round.kind === 'missing' ? round.question.options : [];
  const answerText =
    round.kind === 'quiz' ? round.question.answer : round.kind === 'missing' ? round.question.entry.en : entry.en;

  return (
    <div className="animate-rise">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <RoundMeter current={index + 1} total={plan.length} label="Finale" accent={ACCENT} />
          <span className="chip border-gold-300/30 bg-gold-300/[0.07] text-gold-200">
            <Icon name="trophy" className="h-3.5 w-3.5" />
            {phaseLabel(round.kind)}
          </span>
        </div>
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

        {round.kind === 'quiz' ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                {round.question.direction === 'it-en' ? 'Italiano → English' : 'English → Italiano'}
              </span>
            </div>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">{round.question.prompt}</h2>
          </>
        ) : null}

        {round.kind === 'missing' ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                Completa la frase
              </span>
              <span className="chip border-gold-300/20 text-gold-200">suggerimento: {entry.it}</span>
            </div>
            <p className="mt-3 font-display text-2xl leading-[1.45] text-ink sm:text-3xl">
              {round.question.before}
              <span className="mx-1 inline-block min-w-[110px] border-b-2 border-dashed border-gold-300/60 px-2 text-center align-baseline font-sans text-xl text-gold-200/60">
                {locked ? entry.en : '…'}
              </span>
              {round.question.after}
            </p>
          </>
        ) : null}

        {round.kind === 'translation' ? (
          <>
            <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Italiano → English
            </span>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-6xl">{entry.it}</h2>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                ref={inputRef}
                className="field-lg flex-1 text-2xl tracking-wide"
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
              />
              {!locked ? (
                <button type="button" className="btn-primary btn-lg" onClick={submit} disabled={!value.trim() || paused}>
                  <Icon name="check" className="h-4 w-4" />
                  Controlla
                </button>
              ) : null}
            </div>
          </>
        ) : null}

        {options.length ? (
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {options.map((option, optionIndex) => {
              let state: 'idle' | 'selected' | 'correct' | 'wrong' | 'muted' = 'idle';
              if (locked) {
                if (option.toLowerCase() === answerText.toLowerCase()) state = 'correct';
                else if (option === selected) state = 'wrong';
                else state = 'muted';
              } else if (option === selected) {
                state = 'selected';
              }
              return (
                <button
                  key={`${option}-${optionIndex}`}
                  type="button"
                  className="option-card"
                  data-state={state === 'idle' ? undefined : state}
                  disabled={locked}
                  onClick={() => choose(option)}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-xs font-bold text-muted">
                    {state === 'correct' ? (
                      <Icon name="check" className="h-4 w-4" />
                    ) : state === 'wrong' ? (
                      <Icon name="close" className="h-4 w-4" />
                    ) : (
                      String.fromCharCode(65 + optionIndex)
                    )}
                  </span>
                  <span className="text-lg font-medium leading-snug text-ink sm:text-xl">{option}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {locked ? (
          <>
            <Reveal
              correct={correct}
              entry={entry}
              points={points}
              note={
                timedOut
                  ? 'Tempo scaduto.'
                  : round.kind === 'translation' && !correct
                    ? `La tua risposta: «${value.trim() || '—'}»`
                    : undefined
              }
            />
            <ContinueBar onContinue={next} isLast={isLast} accent={ACCENT} hint="Invio per continuare" />
          </>
        ) : (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-muted/70">Round misti: quiz, frasi verificate e traduzione scritta.</p>
            <TeacherReveal onClick={reveal} disabled={paused} />
          </div>
        )}
      </GameBoard>
    </div>
  );
}
