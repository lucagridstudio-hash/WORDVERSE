import { useEffect, useState } from 'react';
import { buildMissing, type MissingQuestion } from '../lib/questions';
import { useCountdown } from '../lib/hooks';
import { Icon } from '../components/Icon';
import { ProgressRing } from '../components/ProgressRing';
import { AccentBar, ContinueBar, GameBoard, Reveal, RoundMeter, TeacherReveal } from './shared';
import type { GameProps } from './types';

const ACCENT = '#f0c36b';
const SECONDS = 25;

export function MissingWord({ pool, all, rounds, timer, paused, onAnswer, onComplete }: GameProps) {
  const [questions] = useState<MissingQuestion[]>(() => buildMissing(pool, all, rounds));
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
    const isCorrect = option.toLowerCase() === question.entry.en.toLowerCase();
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
        <div className="py-6 text-center">
          <Icon name="warn" className="mx-auto h-8 w-8 text-amber-300/80" />
          <h2 className="mt-3 font-display text-2xl text-ink">Nessuna frase verificata</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            Questa modalità usa solo frasi di esempio che contengono la parola. Aggiungine qualcuna nell&apos;editor
            del vocabolario, oppure gioca un&apos;altra modalità.
          </p>
          <button type="button" className="btn-primary mt-4" onClick={onComplete}>
            Torna al territorio
          </button>
        </div>
      </GameBoard>
    );
  }

  return (
    <div className="animate-rise">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <RoundMeter current={index + 1} total={questions.length} label="Frase" accent={ACCENT} />
        {timer ? (
          <ProgressRing value={(remaining / SECONDS) * 100} size={52} color={remaining <= 6 ? '#fb7185' : '#f2cd8a'}>
            <span className="text-sm font-semibold tabular-nums text-ink">{remaining}</span>
          </ProgressRing>
        ) : (
          <span className="chip">senza timer</span>
        )}
      </div>

      <GameBoard>
        <AccentBar accent={ACCENT} />
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Completa la frase
          </span>
          <span className="chip border-gold-300/20 text-gold-200">suggerimento: {question.entry.it}</span>
        </div>

        <p className="mt-4 font-display text-2xl leading-[1.45] text-ink sm:text-3xl lg:text-[2.5rem]">
          {question.before}
          <span className="mx-1 inline-block min-w-[110px] border-b-2 border-dashed border-gold-300/60 px-2 text-center align-baseline font-sans text-xl text-gold-200/60">
            {locked ? question.entry.en : '…'}
          </span>
          {question.after}
        </p>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {question.options.map((option, optionIndex) => {
            let state: 'idle' | 'selected' | 'correct' | 'wrong' | 'muted' = 'idle';
            if (locked) {
              if (option === question.entry.en) state = 'correct';
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

        {locked ? (
          <>
            <Reveal
              correct={correct}
              entry={question.entry}
              points={points}
              note={timedOut ? 'Tempo scaduto.' : undefined}
            />
            <ContinueBar onContinue={next} isLast={isLast} accent={ACCENT} hint="Invio per continuare" />
          </>
        ) : (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-muted/70">Solo frasi verificate del vocabolario attivo</p>
            <TeacherReveal onClick={reveal} disabled={paused} />
          </div>
        )}
      </GameBoard>
    </div>
  );
}
