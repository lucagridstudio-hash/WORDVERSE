import type { Pos, WordEntry } from '../types';

export const shuffle = <T,>(input: readonly T[]): T[] => {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const sample = <T,>(input: readonly T[], count: number): T[] =>
  shuffle(input).slice(0, Math.max(0, count));

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const uid = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const stripDiacritics = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Lowercase, trim, collapse spaces, drop punctuation. Used for typed answers. */
export const normalizeAnswer = (input: string) =>
  stripDiacritics(input)
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Hand-verified answer forms: the canonical word, its variants, and article/to forms. */
export const acceptedAnswers = (entry: WordEntry): string[] => {
  const base = [entry.en, ...(entry.variants ?? [])].map(normalizeAnswer).filter(Boolean);
  const out = new Set<string>();
  for (const form of base) {
    out.add(form);
    if (entry.pos === 'verb') {
      out.add(form.startsWith('to ') ? form.slice(3) : `to ${form}`);
    } else if (entry.pos === 'noun') {
      out.add(`the ${form}`);
      out.add(`a ${form}`);
      out.add(`an ${form}`);
    }
  }
  return [...out];
};

export const isAnswerCorrect = (input: string, entry: WordEntry) =>
  acceptedAnswers(entry).includes(normalizeAnswer(input));

export const posAbbr = (pos: Pos) => (pos === 'noun' ? 'n' : pos === 'verb' ? 'v' : pos === 'adjective' ? 'adj' : 'adv');

export const formatClock = (seconds: number) => {
  const safe = Math.max(0, Math.round(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export type WordLocation = { start: number; end: number; text: string };

/** Finds a whole-word occurrence of `word` inside `sentence` (case insensitive). */
export const findWordInSentence = (sentence: string, word: string): WordLocation | null => {
  const clean = word.trim();
  if (!clean) return null;
  const re = new RegExp(`(^|[^A-Za-z])(${escapeRegExp(clean)})(?=[^A-Za-z]|$)`, 'i');
  const match = re.exec(sentence);
  if (!match) return null;
  const start = (match.index ?? 0) + match[1].length;
  return { start, end: start + match[2].length, text: match[2] };
};

export const canSpeak =
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

export const speak = (text: string) => {
  if (!canSpeak) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch {
    /* speech is a bonus; the game works without it */
  }
};

export const levelFromXp = (xp: number) => Math.floor(xp / 400) + 1;
export const levelCeiling = (xp: number) => Math.ceil((xp + 1) / 400) * 400;
export const levelFloor = (xp: number) => Math.floor(xp / 400) * 400;

export const pct = (value: number, total: number) =>
  total <= 0 ? 0 : Math.round((value / total) * 100);

export const plural = (count: number, one: string, many: string) =>
  count === 1 ? one : many;
