import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../state';
import { modeById } from '../data/modes';
import { pointsFor, validEntries } from '../lib/questions';
import { formatClock } from '../lib/utils';
import { useElapsed } from '../lib/hooks';
import { Icon } from '../components/Icon';
import { Modal } from '../components/Modal';
import { QuickQuiz } from '../games/QuickQuiz';
import { WordMatching } from '../games/WordMatching';
import { MissingWord } from '../games/MissingWord';
import { WordScramble } from '../games/WordScramble';
import { MemoryChallenge } from '../games/MemoryChallenge';
import { TranslationChallenge } from '../games/TranslationChallenge';
import { FinalChallenge } from '../games/FinalChallenge';
import type { GameProps } from '../games/types';

const TEAM_COLORS = ['#7dd3fc', '#f2cd8a', '#6ee7b7', '#c4b5fd'];

export function GameScreen() {
  const {
    session,
    teams,
    adjustTeam,
    exitGame,
    finishSession,
    getCollection,
    startGame,
  } = useApp();

  const [paused, setPaused] = useState(false);
  const [askExit, setAskExit] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [flash, setFlash] = useState<{ id: number; text: string } | null>(null);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);

  const gameRef = useRef({
    score: 0,
    streak: 0,
    best: 0,
    results: [] as Array<{ id: string; correct: boolean }>,
  });
  const doneRef = useRef(false);
  const elapsed = useElapsed(Boolean(session) && !paused);
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsed;

  const activeTeam = session?.teams ? teams[activeTeamIndex % Math.max(1, teams.length)] : null;
  const activeTeamIdRef = useRef<string | null>(null);
  activeTeamIdRef.current = activeTeam?.id ?? null;

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(null), 1300);
    return () => window.clearTimeout(id);
  }, [flash]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !askExit) {
        setPaused((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [askExit]);

  const handleAnswer = useCallback(
    (entry: { id: string }, correct: boolean, options?: { speed?: number }) => {
      const game = gameRef.current;
      const points = correct ? pointsFor(game.streak, options?.speed) : 0;
      game.results.push({ id: entry.id, correct });
      if (correct) {
        game.score += points;
        game.streak += 1;
        game.best = Math.max(game.best, game.streak);
      } else {
        game.streak = 0;
      }
      setScore(game.score);
      setStreak(game.streak);
      setBestStreak(game.best);
      if (correct && points) setFlash({ id: Date.now(), text: String(points) });

      const teamId = activeTeamIdRef.current;
      if (teamId) {
        if (correct && points) adjustTeam(teamId, points);
        setActiveTeamIndex((index) => (index + 1) % Math.max(1, teams.length));
      }
      return points;
    },
    [adjustTeam, teams.length],
  );

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const game = gameRef.current;
    finishSession({
      answered: game.results.length,
      correct: game.results.filter((result) => result.correct).length,
      score: game.score,
      bestStreak: game.best,
      seconds: elapsedRef.current,
      results: game.results,
    });
  }, [finishSession]);

  if (!session) return null;

  const mode = modeById(session.mode);
  const collection = getCollection(session.collectionId);
  const all = validEntries(collection?.words ?? session.pool);

  const gameProps: GameProps = {
    pool: session.pool,
    all,
    rounds: session.rounds,
    timer: session.timer,
    paused,
    teams: session.teams,
    activeTeamName: activeTeam?.name ?? null,
    onAnswer: (entry, correct, options) => handleAnswer(entry, correct, options),
    onComplete: finish,
  };

  const restart = () => {
    startGame(session.collectionId, session.mode, session.focus ?? undefined);
  };

  const modes: Record<string, React.ReactNode> = {
    quiz: <QuickQuiz {...gameProps} />,
    matching: <WordMatching {...gameProps} />,
    missing: <MissingWord {...gameProps} />,
    scramble: <WordScramble {...gameProps} />,
    memory: <MemoryChallenge {...gameProps} />,
    translation: <TranslationChallenge {...gameProps} />,
    final: <FinalChallenge {...gameProps} />,
  };

  return (
    <div className="screen !pb-10">
      <header className="panel-solid relative overflow-hidden px-3 py-3 sm:px-4">
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${mode.accent}cc, transparent)` }}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-quiet shrink-0 px-2"
            onClick={() => setAskExit(true)}
            aria-label="Esci dalla partita"
          >
            <Icon name="back" className="h-4 w-4" />
            <span className="hidden sm:inline">Esci</span>
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted/70">
              Game {mode.index} · {mode.it}
            </p>
            <h1 className="truncate font-display text-lg leading-tight text-ink sm:text-xl">
              {mode.name}
              <span className="ml-2 hidden text-sm font-normal text-muted sm:inline">· {session.collectionName}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5">
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted/70">Punti</p>
              <p className="font-display text-xl leading-none tabular-nums text-ink">{score}</p>
              {flash ? (
                <span
                  key={flash.id}
                  className="animate-pop absolute -top-5 right-0 whitespace-nowrap text-sm font-bold text-gold-200"
                >
                  +{flash.text}
                </span>
              ) : null}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5">
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted/70">Serie</p>
              <p className={`font-display text-xl leading-none tabular-nums ${streak >= 3 ? 'text-gold-200' : 'text-ink'}`}>
                {streak}
              </p>
            </div>
            <div className="hidden rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 sm:block">
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted/70">Tempo</p>
              <p className="font-display text-xl leading-none tabular-nums text-ink">{formatClock(elapsed)}</p>
            </div>
            <button type="button" className="btn-ghost px-3 py-2" onClick={() => setPaused(true)}>
              <Icon name="pause" className="h-4 w-4" />
              <span className="hidden sm:inline">Pausa</span>
            </button>
          </div>
        </div>

        {session.teams && session.teams.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted/70">Squadre</span>
            {teams.map((team, index) => {
              const isActive = activeTeam?.id === team.id;
              return (
                <div
                  key={team.id}
                  className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition ${
                    isActive ? 'border-gold-300/50 bg-gold-300/[0.09]' : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: TEAM_COLORS[index % TEAM_COLORS.length] }}
                  />
                  <span className={`max-w-[120px] truncate text-xs font-semibold ${isActive ? 'text-gold-100' : 'text-ink/80'}`}>
                    {team.name || `Squadra ${index + 1}`}
                  </span>
                  <span className="text-xs tabular-nums text-muted">{team.score}</span>
                  <div className="flex">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-muted transition hover:bg-white/10 hover:text-ink"
                      onClick={() => adjustTeam(team.id, 50)}
                      aria-label={`Aggiungi 50 punti a ${team.name}`}
                      title="+50"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-muted transition hover:bg-white/10 hover:text-ink"
                      onClick={() => adjustTeam(team.id, -50)}
                      aria-label={`Togli 50 punti a ${team.name}`}
                      title="−50"
                    >
                      −
                    </button>
                  </div>
                </div>
              );
            })}
            {activeTeam ? (
              <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-gold-200/80">
                Turno di {activeTeam.name || 'squadra'}
              </span>
            ) : null}
          </div>
        ) : null}
      </header>

      <main className="mt-4 pb-10">{modes[session.mode]}</main>

      {paused ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#02060d]/85 backdrop-blur-sm" />
          <div className="panel-solid animate-pop relative w-full max-w-md p-6 text-center">
            <p className="eyebrow">Partita in pausa</p>
            <h2 className="mt-1 font-display text-3xl text-ink">Un momento di respiro</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Il timer è fermo. Riprendi quando la classe è pronta, oppure chiudi il round e guarda i risultati.
            </p>
            <div className="mt-5 grid gap-2">
              <button type="button" className="btn-primary btn-lg" onClick={() => setPaused(false)}>
                <Icon name="play" className="h-4 w-4" />
                Riprendi
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="btn-ghost" onClick={restart}>
                  <Icon name="refresh" className="h-4 w-4" />
                  Ricomincia
                </button>
                <button type="button" className="btn-ghost" onClick={finish}>
                  <Icon name="trophy" className="h-4 w-4" />
                  Termina
                </button>
              </div>
              <button
                type="button"
                className="btn-quiet justify-center"
                onClick={() => {
                  setPaused(false);
                  setAskExit(true);
                }}
              >
                Torna alla mappa
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Modal
        open={askExit}
        onClose={() => setAskExit(false)}
        title="Uscire dalla partita?"
        subtitle="I progressi di questa partita non verranno salvati."
        width="sm"
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setAskExit(false)}>
              Continua a giocare
            </button>
            <button type="button" className="btn-danger" onClick={exitGame}>
              Esci
            </button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          Puoi terminare il round e vedere comunque i risultati, oppure restare sulla mappa senza salvare nulla.
        </p>
      </Modal>
    </div>
  );
}
