import { useEffect, useState } from 'react';
import { buildQuiz, type QuizQuestion } from '../lib/questions';
import { useCountdown } from '../lib/hooks';
import { posLabel } from '../data/territories';
import { Icon } from '../components/Icon';
import { ProgressRing } from '../components/ProgressRing';
import { AccentBar, ContinueBar, GameBoard, Reveal, RoundMeter, TeacherReveal } from './shared';
import type { GameProps } from './types';

const ACCENT = '#2dd4bf';
const SECONDS = 20;

export function QuickQuiz({ pool, all, rounds, timer, paused, onAnswer, onComplete }: GameProps) {
  const [questions] = useState<QuizQuestion[]>(() => buildQuiz(pool, all, rounds));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [points, setPoints] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  const question = questions[index];
  const isLast = index >= questions.length - 1;

  const remaining = useCountdown(
    SECONDS,
    timer && !paused && !locked,
    () => {
      if (locked || !question) return;
      setLocked(true);
      setTimedOut(true);
      setCorrect(false);
      onAnswer(question.entry, false);
    },
    index,
  );

  const choose = (option: string) => {
    if (locked || paused || !question) return;
    const isCorrect = option === question.answer;
    const speed = timer ? remaining / SECONDS : undefined;
    const gained = onAnswer(question.entry, isCorrect, { speed });
    setSelected(option);
    setCorrect(isCorrect);
    setPoints(gained);
    setLocked(true);
  };

  const reveal = () => {
    if (locked || paused) return;
    setLocked(true);
    setCorrect(false);
    setTimedOut(false);
    setSelected(null);
    onAnswer(question.entry, false);
  };

  const next = () => {
    if (!isLast) {
      setIndex((value) => value + 1);
      setSelected(null);
      setLocked(false);
      setCorrect(false);
      setPoints(0);
      setTimedOut(false);
      return;
    }
    onComplete();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (paused) return;
      if (!locked) {
        const numeric = Number(event.key);
        if (numeric >= 1 && numeric <= (question?.options.length ?? 0)) {
          event.preventDefault();
          choose(question.options[numeric - 1]);
        }
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!question) {
    return (
      <GameBoard>
        <p className="text-center text-sm text-muted">Nessuna domanda disponibile per questa raccolta.</p>
        <button type="button" className="btn-primary mx-auto mt-4 flex" onClick={onComplete}>
          Torna al territorio
        </button>
      </GameBoard>
    );
  }

  return (
    <div className="animate-rise">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <RoundMeter current={index + 1} total={questions.length} label="Domanda" accent={ACCENT} />
        {timer ? (
          <ProgressRing value={(remaining / SECONDS) * 100} size={52} color={remaining <= 5 ? '#fb7185' : '#f2cd8a'}>
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
            {question.direction === 'it-en' ? 'Italiano → English' : 'English → Italiano'}
          </span>
          <span className="tag-pos">{posLabel[question.entry.pos]}</span>
        </div>

        <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl">
          {question.prompt}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {question.direction === 'it-en'
            ? 'Qual è la traduzione inglese?'
            : 'Qual è il significato italiano?'}
        </p>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {question.options.map((option, optionIndex) => {
            let state: 'idle' | 'selected' | 'correct' | 'wrong' | 'muted' = 'idle';
            if (locked) {
              if (option === question.answer) state = 'correct';
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
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                    state === 'correct'
                      ? 'border-emerald-300/60 bg-emerald-400/20 text-emerald-100'
                      : state === 'wrong'
                        ? 'border-rose-300/60 bg-rose-400/20 text-rose-100'
                        : 'border-white/15 bg-white/[0.06] text-muted'
                  }`}
                >
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

        {locked ? (
          <>
            <Reveal
              correct={correct}
              entry={question.entry}
              points={points}
              note={timedOut ? 'Tempo scaduto: la classe può comunque ripassare la parola.' : undefined}
            />
            <ContinueBar
              onContinue={next}
              isLast={isLast}
              accent={ACCENT}
              hint="1–4 per rispondere · Invio per continuare"
            />
          </>
        ) : (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-muted/70">Tocca una risposta, oppure premi 1–4</p>
            <TeacherReveal onClick={reveal} disabled={paused} />
          </div>
        )}
      </GameBoard>
    </div>
  );
}
