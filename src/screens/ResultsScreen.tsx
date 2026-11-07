import { useApp } from '../state';
import { modeById } from '../data/modes';
import { Icon } from '../components/Icon';
import { ProgressRing } from '../components/ProgressRing';
import { SpeakButton } from '../components/SpeakButton';
import { formatClock, pct } from '../lib/utils';

const MEDALS = ['#f2cd8a', '#cbd5e1', '#e6a17a', '#a5b4fc'];

export function ResultsScreen() {
  const { summary, navigate, startGame, statsFor, getCollection } = useApp();

  if (!summary) {
    return (
      <div className="screen">
        <div className="panel-solid mx-auto max-w-lg p-8 text-center">
          <h1 className="font-display text-2xl text-ink">Nessun risultato disponibile</h1>
          <button type="button" className="btn-primary mt-5" onClick={() => navigate({ name: 'map' })}>
            Torna alla mappa
          </button>
        </div>
      </div>
    );
  }

  const mode = modeById(summary.mode);
  const stats = statsFor(summary.collectionId);
  const accent = getCollection(summary.collectionId)?.theme.accent ?? '#2dd4bf';
  const accuracy = summary.answered ? Math.round((summary.correct / summary.answered) * 100) : 0;
  const mistakes = summary.mistakes;
  const canReplayWeak = mistakes.length >= 2;
  const teamsSorted = summary.teams ? [...summary.teams].sort((a, b) => b.score - a.score) : [];

  const xpBar = Math.min(100, ((stats.xp % 400) / 400) * 100);

  return (
    <div className="screen">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="btn-quiet" onClick={() => navigate({ name: 'map' })}>
          <Icon name="map" className="h-4 w-4" />
          Mappa del mondo
        </button>
        <span className="text-[10px] uppercase tracking-[0.22em] text-muted/60">
          Round concluso · {mode.name}
        </span>
      </div>

      <section className="panel-solid relative mt-4 overflow-hidden p-5 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: `radial-gradient(70% 90% at 15% 0%, ${accent}22, transparent 65%)` }}
        />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
          <div>
            <p className="eyebrow">Risultati</p>
            <h1 className="mt-1 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {accuracy >= 80 ? 'Round brillante' : accuracy >= 50 ? 'Buon lavoro' : 'Si riparte da qui'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {summary.collectionName} · {mode.it} · {summary.answered} risposte
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="stat">
                <p className="stat-label">Punti</p>
                <p className="stat-value tabular-nums">{summary.score}</p>
              </div>
              <div className="stat">
                <p className="stat-label">Corrette</p>
                <p className="stat-value tabular-nums text-emerald-200">{summary.correct}</p>
              </div>
              <div className="stat">
                <p className="stat-label">Sbagliate</p>
                <p className="stat-value tabular-nums text-rose-200">{summary.answered - summary.correct}</p>
              </div>
              <div className="stat">
                <p className="stat-label">Serie migliore</p>
                <p className="stat-value tabular-nums text-gold-200">{summary.bestStreak}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="stat-label">Precisione</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-display text-2xl text-ink">{accuracy}%</span>
                  <span className="text-xs text-muted">di risposte corrette</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="stat-label">Durata</p>
                <p className="mt-1 font-display text-2xl tabular-nums text-ink">{formatClock(summary.seconds)}</p>
              </div>
              <div className="rounded-2xl border border-gold-300/25 bg-gold-300/[0.06] px-4 py-3">
                <p className="stat-label text-gold-200/70">XP guadagnati</p>
                <p className="mt-1 font-display text-2xl tabular-nums text-gold-100">+{summary.xpGained}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>Livello {stats.level} · {stats.xp} XP nel territorio</span>
                <span>{(stats.xp % 400)}/400</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${xpBar}%`, background: `linear-gradient(90deg, ${accent}, #f2cd8a)` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <ProgressRing value={accuracy} size={148} stroke={10} color={accent}>
              <div className="text-center">
                <p className="font-display text-4xl text-ink">{accuracy}%</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">precisione</p>
              </div>
            </ProgressRing>
            <div className="text-center">
              <p className="text-sm text-ink">
                {stats.mastered}/{stats.total} parole consolidate
              </p>
              <p className="text-xs text-muted">{stats.pct}% del territorio</p>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${stats.pct}%`, background: accent }} />
            </div>
          </div>
        </div>
      </section>

      {summary.teams && teamsSorted.length ? (
        <section className="panel-solid mt-4 p-5">
          <div className="flex items-center gap-2">
            <Icon name="trophy" className="h-4 w-4 text-gold-300" />
            <h2 className="font-display text-2xl text-ink">Classifica di classe</h2>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {teamsSorted.map((team, index) => (
              <div
                key={team.id}
                className="flex items-center gap-3 rounded-2xl border px-4 py-3"
                style={{
                  borderColor: index === 0 ? 'rgba(242,205,138,0.4)' : 'rgba(255,255,255,0.1)',
                  background: index === 0 ? 'rgba(242,205,138,0.08)' : 'rgba(255,255,255,0.03)',
                }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-[#12100a]"
                  style={{ background: MEDALS[index % MEDALS.length] }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{team.name || `Squadra ${index + 1}`}</p>
                  <p className="text-[11px] text-muted">{pct(team.score, Math.max(1, teamsSorted[0].score))}% del leader</p>
                </div>
                <span className="font-display text-xl tabular-nums text-ink">{team.score}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="panel-solid p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow">Ripasso</p>
              <h2 className="mt-1 font-display text-2xl text-ink">Parole da rivedere</h2>
            </div>
            <span className="chip">{mistakes.length} parole</span>
          </div>

          {mistakes.length ? (
            <ul className="mt-3 space-y-2">
              {mistakes.map((word) => (
                <li key={word.id} className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-lg text-ink">{word.en}</span>
                      <span className="text-sm text-teal-100/85">— {word.it}</span>
                    </div>
                    <SpeakButton text={word.en} />
                  </div>
                  {word.example ? (
                    <p className="mt-1 text-xs italic leading-relaxed text-muted">{word.example}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.06] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                <Icon name="check" className="h-4 w-4" />
                Nessuna risposta sbagliata
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Round pulito. Prova un&apos;altra modalità o aumenta i round per mettere alla prova la memoria della
                classe.
              </p>
            </div>
          )}
        </section>

        <section className="panel-solid p-5">
          <p className="eyebrow">Prossimo passo</p>
          <h2 className="mt-1 font-display text-2xl text-ink">Continua il viaggio</h2>
          <div className="mt-4 grid gap-2">
            {mistakes.length ? (
              <button
                type="button"
                className="btn-primary w-full justify-between"
                disabled={!canReplayWeak}
                onClick={() => startGame(summary.collectionId, summary.mode, mistakes.map((word) => word.id))}
              >
                <span className="flex items-center gap-2">
                  <Icon name="refresh" className="h-4 w-4" />
                  Ripeti le parole difficili
                </span>
                <span className="text-xs opacity-70">{mistakes.length}</span>
              </button>
            ) : null}
            <button
              type="button"
              className="btn-ghost w-full justify-between"
              onClick={() => startGame(summary.collectionId, summary.mode)}
            >
              <span className="flex items-center gap-2">
                <Icon name="play" className="h-4 w-4" />
                Rigioca {mode.name}
              </span>
              <Icon name="arrowRight" className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="btn-ghost w-full justify-between"
              onClick={() => navigate({ name: 'modes', id: summary.collectionId })}
            >
              <span className="flex items-center gap-2">
                <Icon name="grid" className="h-4 w-4" />
                Cambia modalità
              </span>
              <Icon name="arrowRight" className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="btn-quiet w-full justify-center"
              onClick={() => navigate({ name: 'territory', id: summary.collectionId })}
            >
              Torna al territorio
            </button>
          </div>
          {mistakes.length === 1 ? (
            <p className="mt-2 text-[11px] leading-relaxed text-muted/80">
              Con una sola parola difficile il ripasso mirato non è disponibile: rigioca il round completo.
            </p>
          ) : null}
          <p className="mt-4 text-[11px] leading-relaxed text-muted/70">
            I progressi sono già salvati in questo browser. Nessun account necessario.
          </p>
        </section>
      </div>
    </div>
  );
}
