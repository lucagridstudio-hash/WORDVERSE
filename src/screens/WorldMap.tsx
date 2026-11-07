import { useState } from 'react';
import { useApp } from '../state';
import { territories } from '../data/territories';
import { modes } from '../data/modes';
import { IslandArt } from '../components/IslandArt';
import { Icon } from '../components/Icon';
import { CreateTopicModal } from '../components/CreateTopicModal';

const routes =
  'M120 285 C 200 285 280 285 360 285 C 440 285 520 285 600 285 C 700 285 780 285 850 285 C 880 200 800 110 720 99 C 640 99 560 99 480 99 C 400 99 320 99 240 99 C 220 200 230 380 220 471 C 300 471 380 471 470 471 C 560 471 640 471 720 471';

function CompassRose() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 opacity-40" aria-hidden="true">
      <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(154,171,198,0.25)" />
      <circle cx="60" cy="60" r="30" fill="none" stroke="rgba(154,171,198,0.16)" strokeDasharray="2 4" />
      <path d="M60 18l7 30-7 12-7-12 7-30z" fill="rgba(94,234,212,0.55)" />
      <path d="M60 102l7-30-7-12-7 12 7 30z" fill="rgba(154,171,198,0.25)" />
      <path d="M18 60l30 7 12-7-12-7-30 7z" fill="rgba(154,171,198,0.25)" />
      <path d="M102 60l-30 7-12-7 12-7 30 7z" fill="rgba(154,171,198,0.2)" />
      <circle cx="60" cy="60" r="3" fill="#e8b45c" />
    </svg>
  );
}

export function WorldMap() {
  const { navigate, collectionList, statsFor } = useApp();
  const [createOpen, setCreateOpen] = useState(false);

  const customCollections = collectionList.filter((collection) => collection.custom);
  const curatedWords = territories.reduce((sum, territory) => sum + territory.words.length, 0);

  return (
    <div className="screen">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow">English Vocabulary Expedition</p>
          <h1 className="mt-2 font-display text-[2.15rem] leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
            Esplora il mondo
            <span className="block text-teal-200/90">delle parole</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Dieci territori, sei modalità di gioco e un solo vocabolario attivo. Scegli dove portare la classe: ogni
            isola è già pronta per giocare.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="chip border-white/10">
            <Icon name="map" className="h-3.5 w-3.5 text-teal-300" />
            {territories.length} territori
          </div>
          <div className="chip border-white/10">
            <Icon name="grid" className="h-3.5 w-3.5 text-teal-300" />
            {modes.length} modalità
          </div>
          <div className="chip border-white/10">
            <Icon name="sparkles" className="h-3.5 w-3.5 text-gold-300" />
            {curatedWords} parole curate
          </div>
        </div>
      </div>

      <section
        className="relative mt-6 overflow-hidden rounded-[1.75rem] border border-white/10"
        aria-label="Mappa del mondo"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 0%, rgba(16,42,64,0.55) 0%, rgba(5,12,23,0.9) 55%, rgba(4,7,15,1) 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl animate-drift" />
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl animate-drift" />
        </div>

        {/* Desktop constellation map */}
        <div className="relative hidden min-h-[640px] w-full lg:block xl:min-h-[730px]">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1000 620"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g fill="none" stroke="rgba(140,190,240,0.10)" strokeWidth="1" vectorEffect="non-scaling-stroke">
              <ellipse cx="500" cy="320" rx="470" ry="300" />
              <ellipse cx="500" cy="320" rx="360" ry="226" />
              <ellipse cx="500" cy="320" rx="250" ry="150" />
              <ellipse cx="500" cy="320" rx="140" ry="80" />
            </g>
            <path
              d={routes}
              fill="none"
              stroke="rgba(94,234,212,0.20)"
              strokeWidth="1.2"
              strokeDasharray="3 10"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="absolute bottom-4 right-4">
            <CompassRose />
          </div>

          {territories.map((territory, index) => {
            const stats = statsFor(territory.id);
            const lowNode = territory.map.y > 55;
            return (
              <button
                key={territory.id}
                type="button"
                onClick={() => navigate({ name: 'territory', id: territory.id })}
                className="group absolute z-10 flex w-[172px] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center focus:outline-none xl:w-[196px]"
                style={{ left: `${territory.map.x}%`, top: `${territory.map.y}%` }}
                aria-label={`Apri il territorio ${territory.name}`}
              >
                <div className="island-lift relative">
                  <IslandArt
                    motif={territory.motif}
                    theme={territory.theme}
                    className="h-[124px] w-[124px] xl:h-[148px] xl:w-[148px]"
                  />
                  <span className="absolute left-0 top-1 rounded-full border border-white/10 bg-[#050b17]/85 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {stats.pct === 100 ? (
                    <span className="absolute right-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-gold-300/40 bg-gold-300/15 text-gold-200">
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                </div>

                <div className="mt-1 w-full px-1">
                  <p className="font-display text-[15px] leading-tight text-ink transition group-hover:text-white xl:text-[17px]">
                    {territory.name}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted/70">{territory.it}</p>
                  <div className="mx-auto mt-2 flex w-full max-w-[132px] items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${stats.pct}%`, background: territory.theme.accent }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-muted">{stats.pct}%</span>
                  </div>
                </div>

                <div
                  className={`pointer-events-none absolute left-1/2 z-30 w-60 -translate-x-1/2 rounded-2xl border border-white/12 bg-[#060d1a]/97 p-3 text-left opacity-0 shadow-lift transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 ${
                    lowNode ? 'bottom-full mb-1' : 'top-full mt-1'
                  }`}
                >
                  <p className="text-[11px] leading-relaxed text-ink/80">{territory.description}</p>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-muted/70">
                    {territory.words.length} parole · livello {stats.level}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Compact map for tablets and phones */}
        <div className="grid gap-2.5 p-3 sm:grid-cols-2 sm:p-4 lg:hidden">
          {territories.map((territory, index) => {
            const stats = statsFor(territory.id);
            return (
              <button
                key={territory.id}
                type="button"
                onClick={() => navigate({ name: 'territory', id: territory.id })}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                <IslandArt motif={territory.motif} theme={territory.theme} className="h-16 w-16 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base text-ink">{territory.name}</p>
                  <p className="truncate text-[10px] uppercase tracking-[0.16em] text-muted/70">{territory.it}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${stats.pct}%`, background: territory.theme.accent }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums text-muted">{stats.pct}%</span>
                  </div>
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-[10px] text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="panel-solid p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Raccolte personali</p>
              <h2 className="mt-1 font-display text-2xl text-ink">I tuoi argomenti</h2>
            </div>
            <button type="button" className="btn-ghost" onClick={() => setCreateOpen(true)}>
              <Icon name="plus" className="h-4 w-4" />
              Nuovo argomento
            </button>
          </div>

          {customCollections.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Qui compaiono le raccolte create da te. Puoi partire da un elenco vuoto o copiare le parole di un
              territorio e adattarle alla tua classe.
            </p>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {customCollections.map((collection) => {
                const stats = statsFor(collection.id);
                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => navigate({ name: 'territory', id: collection.id })}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-teal-300/40 hover:bg-white/[0.06]"
                  >
                    <IslandArt motif={collection.motif} theme={collection.theme} className="h-12 w-12 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base text-ink">{collection.name}</p>
                      <p className="text-[11px] text-muted">
                        {collection.words.length} parole · {stats.pct}% completato
                      </p>
                    </div>
                    <Icon name="arrowRight" className="h-4 w-4 shrink-0 text-muted" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="panel-solid flex flex-col justify-between p-5">
          <div>
            <p className="eyebrow">Sessione di classe</p>
            <h2 className="mt-1 font-display text-2xl text-ink">Pronto in pochi secondi</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink/75">
              <li className="flex items-start gap-2">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                Nessun account: apri, scegli, gioca.
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                Punteggi e parole difficili calcolati in automatico.
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                Interfaccia leggibile anche proiettata.
              </li>
            </ul>
          </div>
          <button
            type="button"
            className="btn-primary mt-5 w-full"
            onClick={() => navigate({ name: 'territory', id: territories[0].id })}
          >
            Inizia da Food &amp; Cooking
            <Icon name="arrowRight" className="h-4 w-4" />
          </button>
        </div>
      </section>

      <CreateTopicModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
