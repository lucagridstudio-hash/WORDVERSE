import { useState } from 'react';
import { useApp } from '../state';
import { Modal } from './Modal';
import { Icon } from './Icon';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateTopicModal({ open, onClose }: Props) {
  const { collectionList, createCollection, navigate } = useApp();
  const [name, setName] = useState('');
  const [italian, setItalian] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setName('');
    setItalian('');
    setDescription('');
    setSource('');
    setError('');
  };

  const submit = () => {
    if (!name.trim()) {
      setError('Dai un nome al nuovo argomento.');
      return;
    }
    const id = createCollection(name, italian, description, source || undefined);
    reset();
    onClose();
    navigate({ name: 'editor', id });
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Nuovo argomento"
      subtitle="Crea una raccolta personale: le parole le inserisci tu, con la revisione che preferisci."
      footer={
        <>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Annulla
          </button>
          <button type="button" className="btn-primary" onClick={submit}>
            Crea e aggiungi parole
            <Icon name="arrowRight" className="h-4 w-4" />
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="topic-name">
            Nome del territorio / argomento
          </label>
          <input
            id="topic-name"
            className="field-lg"
            placeholder="Es. Space Exploration"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError('');
            }}
            autoFocus
          />
          {error ? <p className="mt-1.5 text-xs text-rose-300">{error}</p> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="topic-it">
              Nome in italiano
            </label>
            <input
              id="topic-it"
              className="field"
              placeholder="Es. Esplorazione spaziale"
              value={italian}
              onChange={(event) => setItalian(event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="topic-source">
              Parti da una raccolta esistente
            </label>
            <select
              id="topic-source"
              className="field"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            >
              <option value="">Elenco vuoto</option>
              {collectionList.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name} ({collection.words.length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="topic-desc">
            Descrizione breve
          </label>
          <textarea
            id="topic-desc"
            className="field min-h-[76px] resize-y"
            placeholder="Una frase che descrive la raccolta."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-muted">
          La generazione automatica di vocaboli non è disponibile senza un servizio esterno configurato. Qui la lista
          si costruisce a mano: nell&apos;editor puoi aggiungere parole una per una oppure incollare un intero elenco.
        </p>
      </div>
    </Modal>
  );
}
