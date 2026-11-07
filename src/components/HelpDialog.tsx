import { useState } from 'react';
import { Modal } from './Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
};

const steps = [
  ['01', 'Scegli un territorio', 'Dieci mondi tematici, tutti disponibili da subito.'],
  ['02', 'Controlla il vocabolario', 'Ogni territorio ha una lista curata: puoi modificarla o crearne una tua.'],
  ['03', 'Scegli una modalità', 'Sei giochi diversi, tutti sulla stessa raccolta attiva.'],
  ['04', 'Gioca con la classe', 'Individuale a turni oppure squadre, con punti automatici.'],
  ['05', 'Leggi i risultati', 'Punteggio, precisione e parole da ripassare.'],
];

export function HelpDialog({ open, onClose, onReset }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <Modal
      open={open}
      onClose={() => {
        setConfirmReset(false);
        onClose();
      }}
      title="Come funziona WORDVERSE"
      subtitle="Un percorso unico: territorio → vocabolario → gioco → risultati."
      width="lg"
      footer={
        <>
          {confirmReset ? (
            <>
              <span className="mr-auto text-xs text-rose-200/80">
                Azzerare tutto? Vocabolari modificati, XP e squadre torneranno allo stato iniziale.
              </span>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setConfirmReset(false)}
              >
                Annulla
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  onReset();
                  setConfirmReset(false);
                  onClose();
                }}
              >
                Azzera tutto
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn-quiet mr-auto" onClick={() => setConfirmReset(true)}>
                Azzera progressi e vocabolari
              </button>
              <button type="button" className="btn-primary" onClick={onClose}>
                Inizia a esplorare
              </button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {steps.map(([index, title, description]) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg text-teal-300/90">{index}</span>
                <span className="text-sm font-semibold text-ink">{title}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-display text-lg text-ink">Alla lavagna</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
            <li>• Scegli <strong className="text-ink">Individuale</strong> per far rispondere uno studente alla volta.</li>
            <li>• Scegli <strong className="text-ink">Squadre</strong> per 2–4 squadre con nomi modificabili e punti automatici.</li>
            <li>• Durante la partita puoi mettere in pausa, mostrare la risposta e continuare quando la classe è pronta.</li>
            <li>• La modalità <strong className="text-ink">Prova finale</strong> mescola quiz, frasi e traduzione.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gold-300/20 bg-gold-300/[0.06] p-3 text-xs leading-relaxed text-gold-100/90">
          I vocabolari modificati, i progressi e le squadre restano salvati in questo browser. Se ricarichi la pagina
          durante una partita, la partita in corso si azzera: i progressi già ottenuti nelle partite concluse restano.
        </div>
      </div>
    </Modal>
  );
}
