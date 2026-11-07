import { useMemo, useState } from 'react';
import { useApp } from '../state';
import { IslandArt } from '../components/IslandArt';
import { Icon } from '../components/Icon';
import { ProgressRing } from '../components/ProgressRing';
import { SpeakButton } from '../components/SpeakButton';
import { posLabel } from '../data/territories';
import { validEntries } from '../lib/questions';

export function TerritoryScreen({ id }: { id: string }) {
  const { getCollection, statsFor, navigate, startGame, progress, deleteCollection } = useApp();
  const collection = getCollection(id);
  const [showAll, setShowAll] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const stats = statsFor(id);
  const words = useMemo(() => (collection ? validEntries(collection.words) : []), [collection]);
  const wordProgress = progress[id]?.words ?? {};

  const weakWords = useMemo(
    () =>
      words
        .filter((word) => {
          const stat = wordProgress[word.id];
          return Boolean(stat && stat.wrong > 0 && stat.wrong >= stat.correct);
        })
        .slice(0, 8),
    [words, wordProgress],
  );

  if (!collection) {
    return (
      <div className="screen">
        <div className="panel-solid mx-auto max-w-lg p-8 text-center">
          <h1 className="font-display text-2xl text-ink">Raccolta non trovata</h1>
          <p className="mt-2 text-sm text-muted">Il territorio potrebbe essere stato eliminato.</p>
          <button type="button" className="btn-primary mt-5" onClick={() => navigate({ name: 'map' })}>
            Torna alla mappa
          </button>
        </div>
      </div>
    );
  }

  const visible = showAll ? words : words.slice(0, 9);
  const canPlay = words.length >= 3;

  return (
    <div className="screen">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="btn-quiet" onClick={() => navigate({ name: 'map' })}>
          <Icon name="back" className="h-4 w-4" />
          Mappa del mondo
        </button>
        {collection.custom ? (
          confirmDelete ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="hidden text-rose-200/80 sm:inline">Eliminare questa raccolta?</span>
              <button type="button" className="btn-quiet text-rose-200" onClick={() => setConfirmDelete(false)}>
                Annulla
              </button>
              <button
                type="button"
                className="btn-danger px-3 py-2 text-xs"
                onClick={() => {
                  deleteCollection(collection.id);
                  navigate({ name: 'map' });
                }}
              >
                Elimina
              </button>
            </div>
          ) : (
            <button type="button" className="btn-quiet text-xs" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" className="h-4 w-4" />
              Elimina raccolta
            </button>
          )
        ) : null}
      </div>

      <section className="panel-solid mt-4 overflow-hidden">
        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[260px_1fr] lg:gap-10 lg:p-9">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background: `radial-gradient(70% 90% at 12% 20%, ${collection.theme.accent}22, transparent 70%)`,
            }}
          />
          <div className="relative flex items-center justify-center">
            <IslandArt motif={collection.motif} theme={collection.theme} className="h-48 w-48 sm:h-56 sm:w-56" />
          </div>

          <div className="relative">
            <p className="eyebrow">
              {collection.custom ? 'Raccolta personale' : 'Territorio'}
              <span className="ml-2 text-muted/60">{String(words.length).padStart(2, '0')} parole</span>
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">{collection.name}</h1>
            <p className="mt-1 text-sm uppercase tracking-[0.2em] text-muted/80">{collection.it}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/75 sm:text-base">{collection.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="stat">
                <p className="stat-label">Padronanza</p>
                <p className="stat-value">{stats.pct}%</p>
              </div>
              <div className="stat">
                <p className="stat-label">Parole solide</p>
                <p className="stat-value">
                  {stats.mastered}
                  <span className="text-sm text-muted">/{stats.total}</span>
                </p>
              </div>
              <div className="stat">
                <p className="stat-label">Livello</p>
                <p className="stat-value">{stats.level}</p>
              </div>
              <div className="stat">
                <p className="stat-label">Precisione</p>
                <p className="stat-value">{stats.answered ? `${stats.accuracy}%` : '—'}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${stats.levelPct}%`, background: `linear-gradient(90deg, ${collection.theme.accent}, #f2cd8a)` }}
                />
              </div>
              <span className="text-[11px] tabular-nums text-muted">{stats.xp} XP nel territorio</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary btn-lg"
                disabled={!canPlay}
                onClick={() => navigate({ name: 'modes', id: collection.id })}
              >
                <Icon name="play" className="h-4 w-4" />
                Scegli un gioco
              </button>
              <button type="button" className="btn-ghost btn-lg" onClick={() => navigate({ name: 'editor', id: collection.id })}>
                <Icon name="pencil" className="h-4 w-4" />
                Vocabolario
              </button>
              <button
                type="button"
                className="btn-gold btn-lg"
                disabled={!canPlay}
                onClick={() => startGame(collection.id, 'final')}
              >
                <Icon name="trophy" className="h-4 w-4" />
                Prova finale
              </button>
            </div>
            {!canPlay ? (
              <p className="mt-3 text-xs text-rose-200/80">
                Servono almeno 3 parole valide per giocare. Aggiungile dal vocabolario.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="panel-solid p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Vocabolario attivo</p>
              <h2 className="mt-1 font-display text-2xl text-ink">Le parole del territorio</h2>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-ghost px-3 py-2" onClick={() => navigate({ name: 'editor', id: collection.id })}>
                <Icon name="pencil" className="h-4 w-4" />
                Modifica
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((word) => {
              const stat = wordProgress[word.id];
              const review = Boolean(stat && stat.wrong > 0 && stat.wrong >= stat.correct);
              const solid = Boolean(stat && stat.correct >= 2 && stat.correct > stat.wrong);
              return (
                <article
                  key={word.id}
                  className="group relative rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-xl leading-tight text-ink">{word.en}</h3>
                      <p className="mt-0.5 text-sm text-teal-100/85">{word.it}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <SpeakButton text={word.en} />
                    </div>
                  </div>
                  {word.example ? (
                    <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-muted/85">{word.example}</p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="tag-pos">{posLabel[word.pos]}</span>
                    {review ? (
                      <span className="rounded-md bg-rose-400/10 px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-rose-200/90">
                        da rivedere
                      </span>
                    ) : solid ? (
                      <span className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-emerald-200/90">
                        solida
                      </span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          {words.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-6 text-center">
              <p className="text-sm text-muted">Questa raccolta è ancora vuota.</p>
              <button type="button" className="btn-primary mt-3" onClick={() => navigate({ name: 'editor', id: collection.id })}>
                <Icon name="plus" className="h-4 w-4" />
                Aggiungi le prime parole
              </button>
            </div>
          ) : null}

          {words.length > 9 ? (
            <button type="button" className="btn-quiet mt-3 w-full justify-center" onClick={() => setShowAll((value) => !value)}>
              {showAll ? 'Mostra meno' : `Mostra tutte le ${words.length} parole`}
              <Icon name="chevronDown" className={`h-4 w-4 transition ${showAll ? 'rotate-180' : ''}`} />
            </button>
          ) : null}
        </section>

        <div className="space-y-4">
          <section className="panel-solid p-5">
            <div className="flex items-center gap-2">
              <Icon name="target" className="h-4 w-4 text-rose-300" />
              <p className="eyebrow !text-rose-200/80">Parole da ripassare</p>
            </div>
            <h2 className="mt-1 font-display text-2xl text-ink">Ripetizione mirata</h2>
            {weakWords.length ? (
              <>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Queste parole hanno ricevuto più errori che risposte corrette. Un round rapido le rimette in gioco.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {weakWords.map((word) => (
                    <li key={word.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] px-3 py-2">
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-ink">{word.en}</span>
                        <span className="block truncate text-[11px] text-muted">{word.it}</span>
                      </span>
                      <SpeakButton text={word.en} />
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="btn-ghost mt-3 w-full justify-center"
                  onClick={() => startGame(collection.id, 'quiz', weakWords.map((word) => word.id))}
                >
                  <Icon name="refresh" className="h-4 w-4" />
                  Ripassa con il Quiz
                </button>
              </>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Nessuna parola da rivedere, per ora. Gioca un round: gli errori verranno raccolti qui e proposti di
                nuovo alla fine della partita.
              </p>
            )}
          </section>

          <section className="panel-solid p-5">
            <p className="eyebrow">Prossimo passo</p>
            <div className="mt-3 flex items-center gap-3">
              <ProgressRing value={stats.pct} size={64} color={collection.theme.accent}>
                <span className="text-xs font-semibold tabular-nums text-ink">{stats.pct}%</span>
              </ProgressRing>
              <div>
                <p className="text-sm text-ink">Completamento del territorio</p>
                <p className="text-xs text-muted">
                  {stats.mastered} di {stats.total} parole consolidate (2 risposte corrette).
                </p>
              </div>
            </div>
            <div className="divider my-4" />
            <button
              type="button"
              className="btn-gold w-full"
              disabled={!canPlay}
              onClick={() => startGame(collection.id, 'final')}
            >
              <Icon name="trophy" className="h-4 w-4" />
              Lancia la prova finale
            </button>
            <p className="mt-2 text-[11px] leading-relaxed text-muted/80">
              Dieci round misti con quiz, frasi e traduzione. Consigliata dal 40% di completamento.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
