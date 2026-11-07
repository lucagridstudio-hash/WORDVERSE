import { useApp } from '../state';
import { modes } from '../data/modes';
import { playableModes } from '../data/modes';
import type { ModeId } from '../types';
import { Icon, type IconName } from '../components/Icon';
import { IslandArt } from '../components/IslandArt';
import { clozeReady, validEntries } from '../lib/questions';

const glyphFor: Record<ModeId, IconName> = {
  quiz: 'quiz',
  matching: 'matching',
  missing: 'missing',
  scramble: 'shuffle',
  memory: 'layers',
  translation: 'keyboard',
  final: 'trophy',
};

function ModePreview({ mode }: { mode: ModeId }) {
  if (mode === 'quiz') {
    return (
      <div className="grid grid-cols-2 gap-1">
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className="h-1.5 rounded-full bg-current" style={{ opacity: index === 1 ? 0.9 : 0.35 }} />
        ))}
      </div>
    );
  }
  if (mode === 'matching') {
    return (
      <div className="flex items-center gap-1">
        <span className="h-4 w-6 rounded border border-current/60" />
        <span className="h-px w-2 bg-current/50" />
        <span className="h-4 w-6 rounded border border-current/60" />
        <span className="h-px w-2 bg-current/50" />
        <span className="h-4 w-6 rounded border border-current/60" />
      </div>
    );
  }
  if (mode === 'missing') {
    return (
      <div className="flex items-center gap-1">
        <span className="h-1 w-5 rounded bg-current/60" />
        <span className="h-3.5 w-7 rounded border border-dashed border-current/70" />
        <span className="h-1 w-4 rounded bg-current/60" />
      </div>
    );
  }
  if (mode === 'scramble') {
    return (
      <div className="flex gap-1">
        {['A', 'T', 'E'].map((letter) => (
          <span key={letter} className="flex h-6 w-5 items-center justify-center rounded border border-current/60 text-[9px] font-semibold">
            {letter}
          </span>
        ))}
      </div>
    );
  }
  if (mode === 'memory') {
    return (
      <div className="flex gap-1">
        <span className="h-6 w-4 rounded-sm border border-current/60 bg-current/10" />
        <span className="h-6 w-4 rounded-sm border border-current/60 bg-current/10" />
        <span className="h-6 w-4 rounded-sm border border-current/70" />
      </div>
    );
  }
  if (mode === 'translation') {
    return (
      <div className="flex items-center gap-1">
        <span className="h-3 w-8 rounded-sm border border-current/60" />
        <span className="h-3 w-0.5 animate-pulse bg-current" />
      </div>
    );
  }
  return (
    <div className="flex gap-1">
      <span className="h-4 w-4 rounded-full border border-current/70" />
      <span className="h-4 w-4 rounded-full border border-current/70" />
      <span className="h-4 w-4 rounded-full bg-current/70" />
    </div>
  );
}

export function ModeScreen({ id }: { id: string }) {
  const {
    getCollection,
    navigate,
    startGame,
    classroom,
    setClassroom,
    teams,
    setTeamCount,
    renameTeam,
    resetTeamScores,
    rounds,
    setRounds,
    timer,
    setTimer,
  } = useApp();
  const collection = getCollection(id);

  if (!collection) {
    return (
      <div className="screen">
        <div className="panel-solid mx-auto max-w-lg p-8 text-center">
          <h1 className="font-display text-2xl text-ink">Raccolta non trovata</h1>
          <button type="button" className="btn-primary mt-5" onClick={() => navigate({ name: 'map' })}>
            Torna alla mappa
          </button>
        </div>
      </div>
    );
  }

  const words = validEntries(collection.words);
  const hasCloze = words.some(clozeReady);
  const hasScramble = words.some((word) => /^[A-Za-z]{3,12}$/.test(word.en.trim()));
  const canPlay = words.length >= 3;

  const blockedReason = (mode: ModeId): string | null => {
    if (!canPlay) return 'Servono almeno 3 parole valide.';
    if (mode === 'missing' && !hasCloze) return 'Nessuna frase con la parola: aggiungi esempi nell’editor.';
    if (mode === 'scramble' && !hasScramble) return 'Nessuna parola adatta (3–12 lettere, una sola parola).';
    return null;
  };

  return (
    <div className="screen">
      <button type="button" className="btn-quiet" onClick={() => navigate({ name: 'territory', id: collection.id })}>
        <Icon name="back" className="h-4 w-4" />
        {collection.name}
      </button>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Step 3 · modalità</p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">Scegli come giocare</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Tutte le modalità usano la stessa raccolta attiva: <strong className="text-ink">{collection.name}</strong>,{' '}
            {words.length} parole.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IslandArt motif={collection.motif} theme={collection.theme} className="hidden h-16 w-16 sm:block" />
          <div className="chip border-white/10">{words.length} parole attive</div>
        </div>
      </div>

      <section className="panel-solid mt-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Sessione di classe</p>
            <h2 className="mt-1 font-display text-xl text-ink">Chi risponde?</h2>
          </div>
          <div className="flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            <button
              type="button"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                classroom === 'individual' ? 'bg-teal-400/15 text-teal-100' : 'text-muted hover:text-ink'
              }`}
              onClick={() => setClassroom('individual')}
            >
              <Icon name="users" className="h-4 w-4" />
              Individuale
            </button>
            <button
              type="button"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                classroom === 'teams' ? 'bg-gold-300/15 text-gold-100' : 'text-muted hover:text-ink'
              }`}
              onClick={() => setClassroom('teams')}
            >
              <Icon name="trophy" className="h-4 w-4" />
              Squadre
            </button>
          </div>
        </div>

        {classroom === 'teams' ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Numero squadre</span>
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setTeamCount(count)}
                    className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${
                      teams.length === count
                        ? 'bg-gold-300 text-[#241a07]'
                        : 'border border-white/10 bg-white/[0.04] text-muted hover:text-ink'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <button type="button" className="btn-quiet text-xs" onClick={resetTeamScores}>
                <Icon name="refresh" className="h-3.5 w-3.5" />
                Azzera punti
              </button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {teams.map((team, index) => (
                <label key={team.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-[#06101d]" style={{ background: ['#7dd3fc', '#f2cd8a', '#6ee7b7', '#c4b5fd'][index] }}>
                    {index + 1}
                  </span>
                  <input
                    className="w-full bg-transparent text-sm text-ink placeholder:text-muted/60 focus:outline-none"
                    value={team.name}
                    maxLength={22}
                    onChange={(event) => renameTeam(team.id, event.target.value)}
                    aria-label={`Nome squadra ${index + 1}`}
                  />
                  <span className="shrink-0 text-[11px] tabular-nums text-muted">{team.score}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted">Round</span>
            <div className="flex overflow-hidden rounded-xl border border-white/10">
              {[
                { value: 8, label: '8' },
                { value: 12, label: '12' },
                { value: 0, label: 'Tutti' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRounds(option.value)}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${
                    rounds === option.value ? 'bg-teal-400/15 text-teal-100' : 'bg-white/[0.03] text-muted hover:text-ink'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTimer(!timer)}
            className="flex items-center gap-2 text-xs text-muted transition hover:text-ink"
            aria-pressed={timer}
          >
            <span
              className={`relative h-5 w-9 rounded-full transition ${timer ? 'bg-teal-400/70' : 'bg-white/15'}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${timer ? 'left-[18px]' : 'left-0.5'}`}
              />
            </span>
            Countdown attivo
          </button>

          <p className="text-[11px] leading-relaxed text-muted/70">
            Se ricarichi la pagina, la partita in corso si azzera. I progressi delle partite concluse restano salvati.
          </p>
        </div>

        {classroom === 'teams' ? (
          <p className="mt-3 text-[11px] leading-relaxed text-gold-100/70">
            I punti vanno alla squadra di turno a ogni risposta corretta. Il teacher può anche aggiungere o togliere
            punti manualmente durante la partita.
          </p>
        ) : null}
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {playableModes.map((mode) => {
          const blocked = blockedReason(mode.id);
          return (
            <article
              key={mode.id}
              className="panel-solid group relative flex flex-col overflow-hidden p-5 transition duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: `0 30px 70px -50px ${mode.accent}` }}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-25 blur-2xl transition group-hover:opacity-45"
                style={{ background: mode.accent }}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl border"
                    style={{ borderColor: `${mode.accent}55`, background: `${mode.accent}18`, color: mode.accent }}
                  >
                    <Icon name={glyphFor[mode.id]} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted/70">Game {mode.index}</p>
                    <h2 className="font-display text-xl leading-tight text-ink">{mode.name}</h2>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted/80">{mode.it}</p>
                  </div>
                </div>
                <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-muted">
                  {mode.timer ? (timer ? 'timer' : 'no timer') : 'libero'}
                </span>
              </div>

              <div className="relative mt-4 flex h-10 items-center" style={{ color: mode.accent }}>
                <ModePreview mode={mode.id} />
              </div>

              <p className="relative mt-2 flex-1 text-[13px] leading-relaxed text-ink/75">{mode.description}</p>

              <ul className="relative mt-3 space-y-1">
                {mode.rules.map((rule) => (
                  <li key={rule} className="flex items-start gap-1.5 text-[11px] text-muted">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: mode.accent }} />
                    {rule}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="btn-ghost relative mt-4 w-full justify-between"
                disabled={Boolean(blocked)}
                onClick={() => startGame(collection.id, mode.id)}
              >
                <span>{blocked ? 'Non disponibile' : 'Gioca ora'}</span>
                <Icon name="arrowRight" className="h-4 w-4" />
              </button>
              {blocked ? <p className="relative mt-2 text-[11px] text-amber-200/80">{blocked}</p> : null}
            </article>
          );
        })}
      </div>

      <section className="panel-solid relative mt-4 overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-50" style={{ background: 'radial-gradient(60% 100% at 85% 0%, rgba(232,180,92,0.18), transparent 70%)' }} />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold-300/40 bg-gold-300/10 text-gold-200">
              <Icon name="trophy" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-200/70">Final Challenge</p>
              <h2 className="font-display text-2xl text-ink">Prova finale del territorio</h2>
              <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink/70">
                Dieci round misti — quiz rapido, frase da completare e traduzione — con il vocabolario di{' '}
                {collection.name}. Consigliata dopo il 40% di completamento, ma sempre disponibile.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-gold shrink-0"
            disabled={!canPlay}
            onClick={() => startGame(collection.id, 'final')}
          >
            <Icon name="play" className="h-4 w-4" />
            Inizia la prova
          </button>
        </div>
      </section>

      <p className="mt-5 text-center text-[11px] uppercase tracking-[0.22em] text-muted/60">
        {modes.length} modalità · stesso vocabolario · nessun account
      </p>
    </div>
  );
}
