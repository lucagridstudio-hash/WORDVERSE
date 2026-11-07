import type { ModeId } from '../types';

export type ModeMeta = {
  id: ModeId;
  index: string;
  name: string;
  it: string;
  tagline: string;
  description: string;
  accent: string;
  timer: boolean;
  rules: string[];
};

export const modes: ModeMeta[] = [
  {
    id: 'quiz',
    index: '01',
    name: 'Quick Quiz',
    it: 'Quiz rapido',
    tagline: 'Quattro risposte, una sola corretta',
    description: 'Una domanda alla volta, con countdown e feedback immediato. Il modo più diretto per scaldare la classe.',
    accent: '#2dd4bf',
    timer: true,
    rules: ['Scegli tra quattro opzioni', '20 secondi per risposta', 'Bonus velocità e serie'],
  },
  {
    id: 'matching',
    index: '02',
    name: 'Word Matching',
    it: 'Abbinamenti',
    tagline: 'Collega parole e traduzioni',
    description: 'Due colonne di carte da abbinare. Perfetto per una sfida a squadre sulla lavagna.',
    accent: '#a5b4fc',
    timer: false,
    rules: ['Seleziona una parola e la sua traduzione', 'Le coppie corrette si illuminano', 'Conta le mosse e il tempo'],
  },
  {
    id: 'missing',
    index: '03',
    name: 'Missing Word',
    it: 'Parola mancante',
    tagline: 'Completa la frase',
    description: 'Una frase inglese con una parola nascosta e quattro possibilità. Solo frasi verificate.',
    accent: '#f0c36b',
    timer: true,
    rules: ['Leggi la frase con attenzione', 'Scegli la parola che completa il senso', 'Nessuna frase inventata'],
  },
  {
    id: 'scramble',
    index: '04',
    name: 'Word Scramble',
    it: 'Lettere in disordine',
    tagline: 'Ricostruisci la parola',
    description: 'Le lettere sono mescolate: ricomponi la parola inglese toccando le tessere.',
    accent: '#fb7185',
    timer: false,
    rules: ['Tocca le lettere per costruire la parola', 'Tocca una lettera inserita per rimuoverla', 'Puoi azzerare e riprovare'],
  },
  {
    id: 'memory',
    index: '05',
    name: 'Memory Challenge',
    it: 'Memory',
    tagline: 'Trova le coppie nascoste',
    description: 'Carte coperte, memoria e un po’ di fortuna. Ogni coppia unisce inglese e italiano.',
    accent: '#c084fc',
    timer: false,
    rules: ['Gira due carte alla volta', 'Inglese e italiano devono coincidere', 'Meno mosse, più punti'],
  },
  {
    id: 'translation',
    index: '06',
    name: 'Translation Challenge',
    it: 'Traduzione',
    tagline: 'Scrivi la traduzione',
    description: 'Nessun suggerimento: la classe scrive la parola inglese. Ortografia sotto esame.',
    accent: '#60a5fa',
    timer: true,
    rules: ['Leggi la parola italiana', 'Scrivi la traduzione inglese', 'Maiuscole e spazi non contano'],
  },
  {
    id: 'final',
    index: '★',
    name: 'Final Challenge',
    it: 'Prova finale',
    tagline: 'Il percorso conclusivo del territorio',
    description: 'Dieci round misti — quiz, frasi e traduzione — per chiudere il territorio con una sfida completa.',
    accent: '#f2cd8a',
    timer: true,
    rules: ['Round misti a difficoltà crescente', 'Il punteggio conta doppio per la classe', 'Consigliata dopo il 40% del vocabolario'],
  },
];

export const modeById = (id: ModeId): ModeMeta =>
  modes.find((m) => m.id === id) ?? modes[0];

export const playableModes = modes.filter((m) => m.id !== 'final');
