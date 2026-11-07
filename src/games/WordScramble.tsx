import { useEffect, useState } from 'react';
import { buildScramble, type ScrambleQuestion } from '../lib/questions';
import { findWordInSentence } from '../lib/utils';
import { Icon } from '../components/Icon';
import { AccentBar, ContinueBar, GameBoard, Reveal, RoundMeter, TeacherReveal } from './shared';
import type { GameProps } from './types';

const ACCENT = '#fb7185';

export function WordScramble({ pool, rounds, paused, onAnswer, onComplete }: GameProps) {
  const [questions] = useState<ScrambleQuestion[]>(() => buildScramble(pool, rounds));
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [points, setPoints] = useState(0);
  const [misses, setMisses] = useState(0);

  const question = questions[index];
  const isLast = index >= questions.length - 1;
  const attempt = placed.map((letterIndex) => question?.letters[letterIndex] ?? '').join('');

  const submit = () => {
    if (locked || paused || !question) return;
    if (placed.length !== question.letters.length) return;
    const isCorrect = attempt.toLowerCase() === question.entry.en.toLowerCase();
    const gained = onAnswer(question.entry, isCorrect);
    setLocked(true);
    setCorrect(isCorrect);
    setPoints(gained);
    if (!isCorrect) setMisses((value) => value + 1);
  };

  const reveal = () => {
    if (locked || paused) return;
    setLocked(true);
    setCorrect(false);
    onAnswer(question.entry, false);
  };

  const next = () => {
    if (!isLast) {
      setIndex((value) => value + 1);
      setPlaced([]);
      setLocked(false);
      setCorrect(false);
      setPoints(0);
      return;
    }
    onComplete();
  };

  const addLetter = (letterIndex: number) => {
    if (locked || paused) return;
    setPlaced((current) => (current.includes(letterIndex) ? current : [...current, letterIndex]));
  };

  const removeAt = (position: number) => {
    if (locked || paused) return;
    setPlaced((current) => current.filter((_, itemIndex) => itemIndex !== position));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (paused || !question) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        if (locked) next();
        else submit();
        return;
      }
      if (event.key === 'Backspace') {
        event.preventDefault();
        if (!locked) setPlaced((current) => current.slice(0, -1));
        return;
      }
      if (!locked && /^[a-zA-Z]$/.test(event.key)) {
        const letter = event.key.toUpperCase();
        const used = new Set(placed);
        const found = question.letters.findIndex((item, itemIndex) => item === letter && !used.has(itemIndex));
        if (found >= 0) {
          event.preventDefault();
          addLetter(found);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!question) {
    return (
      <GameBoard>
        <p className="py-6 text-center text-sm text-muted">Nessuna parola adatta a questa modalità.</p>
        <button type="button" className="btn-primary mx-auto mt-4 flex" onClick={onComplete}>
          Torna al territorio
        </button>
      </GameBoard>
    );
  }

  const location = question.entry.example ? findWordInSentence(question.entry.example, question.entry.en) : null;
  const exampleHint = location
    ? `${question.entry.example?.slice(0, location.start)}____${question.entry.example?.slice(location.end)}`
    : null;

  return (
    <div className="animate-rise">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <RoundMeter current={index + 1} total={questions.length} label="Parola" accent={ACCENT} />
        <span className="chip">
          {question.letters.length} lettere
        </span>
      </div>

      <GameBoard>
        <AccentBar accent={ACCENT} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Ricostruisci la parola
          </span>
          <span className="chip border-rose-300/20 text-rose-100/90">{question.entry.it}</span>
        </div>

        {exampleHint ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">{exampleHint}</p>
        ) : null}

        <div className="mt-5 flex min-h-[4.5rem] flex-wrap items-center gap-2">
          {question.letters.map((_, slotIndex) => {
            const letterIndex = placed[slotIndex];
            const filled = letterIndex !== undefined;
            return (
              <button
                key={`slot-${slotIndex}`}
                type="button"
                className="slot"
                data-filled={filled}
                onClick={() => filled && removeAt(slotIndex)}
                aria-label={filled ? `Rimuovi ${question.letters[letterIndex]}` : `Posizione ${slotIndex + 1} vuota`}
                disabled={locked || !filled}
              >
                {filled ? question.letters[letterIndex] : ''}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {question.letters.map((letter, letterIndex) => {
            const used = placed.includes(letterIndex);
            return (
              <button
                key={`tile-${letterIndex}`}
                type="button"
                className="letter-tile"
                data-used={used}
                onClick={() => addLetter(letterIndex)}
                disabled={locked || used}
                aria-label={`Lettera ${letter}`}
              >
                {letter}
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
              note={!correct ? `La tua ricostruzione: ${attempt.toLowerCase() || '—'}` : undefined}
            />
            <ContinueBar
              onContinue={next}
              isLast={isLast}
              accent={ACCENT}
              hint={misses > 0 ? `${misses} errori in questa sessione` : 'Invio per continuare'}
            />
          </>
        ) : (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={submit}
                disabled={placed.length !== question.letters.length || paused}
              >
                <Icon name="check" className="h-4 w-4" />
                Controlla
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setPlaced([])}
                disabled={placed.length === 0 || paused}
              >
                <Icon name="refresh" className="h-4 w-4" />
                Azzera
              </button>
            </div>
            <TeacherReveal onClick={reveal} disabled={paused} />
          </div>
        )}

        {!locked ? (
          <p className="mt-3 text-[11px] text-muted/70">
            Tocca le lettere per comporle · tocca una lettera inserita per rimuoverla · Invio per controllare
          </p>
        ) : null}
      </GameBoard>
    </div>
  );
}
