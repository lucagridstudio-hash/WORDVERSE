import { useMemo, useState } from 'react';
import { useApp } from '../state';
import { Icon } from '../components/Icon';
import { SpeakButton } from '../components/SpeakButton';
import { findWordInSentence } from '../lib/utils';
import { clozeReady, validEntries } from '../lib/questions';
import type { Pos } from '../types';

const POS_OPTIONS: Array<{ value: Pos; label: string }> = [
  { value: 'noun', label: 'Sostantivo' },
  { value: 'verb', label: 'Verbo' },
  { value: 'adjective', label: 'Aggettivo' },
  { value: 'adverb', label: 'Avverbio' },
];

type ParsedRow = { en: string; it: string; example?: string };

const parseImport = (raw: string): ParsedRow[] => {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      let body = line;
      let example: string | undefined;
      const pipe = body.indexOf('|');
      if (pipe >= 0) {
        example = body.slice(pipe + 1).trim() || undefined;
        body = body.slice(0, pipe).trim();
      }
      const separator = body.includes('=') ? '=' : body.includes('\t') ? '\t' : body.includes(';') ? ';' : ',';
      const parts = body.split(separator);
      const en = (parts[0] ?? '').trim();
      const it = parts.slice(1).join(separator).trim();
      return { en, it, example };
    })
    .filter((row) => row.en && row.it);
};

export function EditorScreen({ id }: { id: string }) {
  const { getCollection, updateWord, addWord, deleteWord, importWords, resetCollection, navigate } = useApp();
  const collection = getCollection(id);
  const [search, setSearch] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const words = collection?.words ?? [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return words;
    return words.filter(
      (word) =>
        word.en.toLowerCase().includes(query) ||
        word.it.toLowerCase().includes(query) ||
        (word.example ?? '').toLowerCase().includes(query),
    );
  }, [words, search]);

  const validCount = validEntries(words).length;

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

  const handleImport = () => {
    const rows = parseImport(importText);
    if (!rows.length) {
      setImportMessage('Nessuna riga valida. Usa il formato: inglese = italiano | frase di esempio.');
      return;
    }
    const added = importWords(
      collection.id,
      rows.map((row) => ({ en: row.en, it: row.it, pos: 'noun' as Pos, example: row.example })),
    );
    setImportText('');
    setImportMessage(`${added} parole aggiunte. Controlla parti del discorso e frasi.`);
  };

  return (
    <div className="screen">
      <button type="button" className="btn-quiet" onClick={() => navigate({ name: 'territory', id: collection.id })}>
        <Icon name="back" className="h-4 w-4" />
        {collection.name}
      </button>

      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Vocabolario attivo</p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">Editor del vocabolario</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Tutte le modifiche sono immediate e valgono per ogni modalità di gioco. Le righe con campi vuoti vengono
            ignorate dalle partite.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="chip border-white/10">
            {validCount} parole valide
            {words.length !== validCount ? <span className="text-rose-200/80">· {words.length - validCount} incomplete</span> : null}
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setImportOpen((value) => !value);
              setImportMessage('');
            }}
          >
            <Icon name="grid" className="h-4 w-4" />
            Incolla elenco
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => addWord(collection.id, { en: '', it: '', pos: 'noun', example: '' })}
          >
            <Icon name="plus" className="h-4 w-4" />
            Aggiungi parola
          </button>
        </div>
      </div>

      {importOpen ? (
        <section className="panel-solid mt-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink">Importa un elenco</h2>
              <p className="text-xs text-muted">
                Una riga per parola: <code className="text-teal-200">bread = pane | I buy bread every morning.</code>
              </p>
            </div>
            <button type="button" className="btn-quiet" onClick={() => setImportOpen(false)} aria-label="Chiudi importazione">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
          <textarea
            className="field mt-3 min-h-[140px] font-mono text-[13px]"
            placeholder={'apple = mela | I eat an apple every day.\nkitchen = cucina\nhungry = affamato'}
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" className="btn-primary" onClick={handleImport}>
              <Icon name="plus" className="h-4 w-4" />
              Aggiungi all&apos;elenco
            </button>
            <button type="button" className="btn-quiet" onClick={() => setImportText('')}>
              Svuota
            </button>
            {importMessage ? <span className="text-xs text-teal-200/90">{importMessage}</span> : null}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted/80">
            La parte del discorso viene impostata su «sostantivo»: correggila nelle righe se serve. Le frasi di esempio
            devono contenere la parola inglese per abilitare la modalità Parola mancante.
          </p>
        </section>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="field pl-9"
            placeholder="Cerca parola, traduzione o frase"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <span className="text-xs text-muted">
          {filtered.length} {filtered.length === 1 ? 'riga' : 'righe'}
        </span>
        {collection.seedId ? (
          confirmReset ? (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-rose-200/80">Ripristinare l&apos;elenco originale?</span>
              <button type="button" className="btn-quiet text-xs" onClick={() => setConfirmReset(false)}>
                Annulla
              </button>
              <button
                type="button"
                className="btn-danger px-3 py-2 text-xs"
                onClick={() => {
                  resetCollection(collection.id);
                  setConfirmReset(false);
                }}
              >
                Ripristina
              </button>
            </div>
          ) : (
            <button type="button" className="btn-quiet ml-auto text-xs" onClick={() => setConfirmReset(true)}>
              <Icon name="refresh" className="h-3.5 w-3.5" />
              Ripristina originali
            </button>
          )
        ) : null}
      </div>

      <section className="mt-3 space-y-2">
        {filtered.map((word) => {
          const missingFields = !word.en.trim() || !word.it.trim();
          const exampleMismatch = Boolean(word.example && word.example.trim() && !findWordInSentence(word.example, word.en));
          return (
            <div
              key={word.id}
              className={`panel-solid p-3 sm:p-4 ${missingFields ? 'border-rose-400/30' : ''}`}
            >
              <div className="grid gap-2 lg:grid-cols-[1fr_1fr_150px_1.5fr_190px_40px] lg:items-start">
                <div>
                  <label className="label lg:hidden">Inglese</label>
                  <div className="flex items-center gap-1">
                    <input
                      className="field"
                      placeholder="English word"
                      value={word.en}
                      onChange={(event) => updateWord(collection.id, word.id, { en: event.target.value })}
                    />
                    <SpeakButton text={word.en} />
                  </div>
                  {word.example && clozeReady(word) ? (
                    <p className="mt-1 hidden text-[10px] uppercase tracking-wider text-emerald-300/70 lg:block">
                      frase verificata
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="label lg:hidden">Italiano</label>
                  <input
                    className="field"
                    placeholder="Traduzione italiana"
                    value={word.it}
                    onChange={(event) => updateWord(collection.id, word.id, { it: event.target.value })}
                  />
                </div>

                <div>
                  <label className="label lg:hidden">Tipo</label>
                  <select
                    className="field"
                    value={word.pos}
                    onChange={(event) => updateWord(collection.id, word.id, { pos: event.target.value as Pos })}
                  >
                    {POS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label lg:hidden">Frase di esempio</label>
                  <input
                    className="field"
                    placeholder="Frase di esempio (contenente la parola)"
                    value={word.example ?? ''}
                    onChange={(event) => updateWord(collection.id, word.id, { example: event.target.value })}
                  />
                  {exampleMismatch ? (
                    <p className="mt-1 text-[10px] leading-snug text-amber-200/80">
                      La frase non contiene «{word.en || 'la parola'}»: non sarà usata in Parola mancante.
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="label lg:hidden">Varianti accettate</label>
                  <input
                    className="field"
                    placeholder="Varianti (separate da virgola)"
                    value={(word.variants ?? []).join(', ')}
                    onChange={(event) => {
                      const variants = event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean);
                      updateWord(collection.id, word.id, { variants: variants.length ? variants : undefined });
                    }}
                  />
                </div>

                <div className="flex items-center justify-end lg:pt-0.5">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-muted transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200"
                    onClick={() => deleteWord(collection.id, word.id)}
                    aria-label={`Elimina ${word.en || 'parola'}`}
                    title="Elimina parola"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {words.length === 0 ? (
          <div className="panel-solid p-8 text-center">
            <h2 className="font-display text-xl text-ink">Elenco vuoto</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              Aggiungi le parole una per una, oppure incolla un elenco completo. Servono almeno 3 parole per iniziare a
              giocare.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={() => addWord(collection.id, { en: '', it: '', pos: 'noun', example: '' })}
              >
                <Icon name="plus" className="h-4 w-4" />
                Aggiungi parola
              </button>
              <button type="button" className="btn-ghost" onClick={() => setImportOpen(true)}>
                Incolla elenco
              </button>
            </div>
          </div>
        ) : null}

        {filtered.length === 0 && words.length > 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-muted">
            Nessun risultato per «{search}».
          </p>
        ) : null}
      </section>

      <div className="sticky bottom-3 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#060d1a]/90 p-3 backdrop-blur">
        <p className="text-xs text-muted">
          {validCount} parole pronte · le modifiche sono salvate automaticamente in questo browser.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => addWord(collection.id, { en: '', it: '', pos: 'noun', example: '' })}
          >
            <Icon name="plus" className="h-4 w-4" />
            Aggiungi
          </button>
          <button type="button" className="btn-primary" onClick={() => navigate({ name: 'territory', id: collection.id })}>
            Fatto
            <Icon name="check" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
