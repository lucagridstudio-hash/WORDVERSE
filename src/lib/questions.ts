import type { WordEntry } from '../types';
import {
  acceptedAnswers,
  findWordInSentence,
  normalizeAnswer,
  shuffle,
} from './utils';

export type QuizQuestion = {
  entry: WordEntry;
  direction: 'it-en' | 'en-it';
  prompt: string;
  answer: string;
  options: string[];
};

export type MissingQuestion = {
  entry: WordEntry;
  before: string;
  after: string;
  options: string[];
};

export type ScrambleQuestion = {
  entry: WordEntry;
  letters: string[];
};

export const validEntries = (words: WordEntry[]) =>
  words.filter((w) => w.en.trim().length > 0 && w.it.trim().length > 0);

export const clozeReady = (entry: WordEntry) =>
  Boolean(entry.example && findWordInSentence(entry.example, entry.en));

const uniqueOptions = (answer: string, candidates: string[], limit = 3) => {
  const answerKey = normalizeAnswer(answer);
  const picked: string[] = [];
  for (const candidate of candidates) {
    const key = normalizeAnswer(candidate);
    if (!key || key === answerKey) continue;
    if (picked.some((p) => normalizeAnswer(p) === key)) continue;
    picked.push(candidate);
    if (picked.length === limit) break;
  }
  return picked;
};

/** Multiple choice in both directions. Distractors prefer the same part of speech. */
export function buildQuiz(pool: WordEntry[], all: WordEntry[], count: number): QuizQuestion[] {
  const source = shuffle(validEntries(pool)).slice(0, Math.max(0, count));
  const valid = validEntries(all);
  return source.map((entry) => {
    const direction: QuizQuestion['direction'] = Math.random() < 0.55 ? 'it-en' : 'en-it';
    const prompt = direction === 'it-en' ? entry.it : entry.en;
    const answer = direction === 'it-en' ? entry.en : entry.it;
    const samePos = valid.filter((w) => w.id !== entry.id && w.pos === entry.pos);
    const rest = valid.filter((w) => w.id !== entry.id && w.pos !== entry.pos);
    const candidates = [...shuffle(samePos), ...shuffle(rest)].map((w) =>
      direction === 'it-en' ? w.en : w.it,
    );
    return {
      entry,
      direction,
      prompt,
      answer,
      options: shuffle([answer, ...uniqueOptions(answer, candidates)]),
    };
  });
}

/** Verified cloze sentences only. Distractors never appear in the sentence. */
export function buildMissing(pool: WordEntry[], all: WordEntry[], count: number): MissingQuestion[] {
  const valid = validEntries(all);
  const source = shuffle(pool.filter(clozeReady)).slice(0, Math.max(0, count));
  return source.map((entry) => {
    const sentence = entry.example as string;
    const location = findWordInSentence(sentence, entry.en) as { start: number; end: number };
    const before = sentence.slice(0, location.start);
    const after = sentence.slice(location.end);
    const accepted = acceptedAnswers(entry);
    const samePos = valid.filter((w) => w.id !== entry.id && w.pos === entry.pos);
    const rest = valid.filter((w) => w.id !== entry.id && w.pos !== entry.pos);
    const candidates: string[] = [];
    for (const candidate of [...shuffle(samePos), ...shuffle(rest)]) {
      if (findWordInSentence(sentence, candidate.en)) continue;
      if (accepted.includes(normalizeAnswer(candidate.en))) continue;
      if (candidate.it === entry.it) continue;
      candidates.push(candidate.en);
    }
    return {
      entry,
      before,
      after,
      options: shuffle([entry.en, ...uniqueOptions(entry.en, candidates)]),
    };
  });
}

/** Single alphabetic words only: they are the ones that can be rebuilt from tiles. */
export function buildScramble(pool: WordEntry[], count: number): ScrambleQuestion[] {
  const source = shuffle(
    pool.filter((w) => /^[A-Za-z]{3,12}$/.test(w.en.trim())),
  ).slice(0, Math.max(0, count));
  return source.map((entry) => {
    const word = entry.en.trim();
    const original = word.toLowerCase();
    let letters = shuffle(word.toUpperCase().split(''));
    let guard = 0;
    while (letters.join('').toLowerCase() === original && guard < 40) {
      letters = shuffle(word.toUpperCase().split(''));
      guard += 1;
    }
    return { entry, letters };
  });
}

export const pointsFor = (streak: number, speedRatio?: number) =>
  100 + Math.min(streak, 8) * 10 + (speedRatio !== undefined ? Math.round(speedRatio * 60) : 0);

export const xpFor = (correct: number, answered: number) =>
  correct * 10 + (answered > 0 && correct === answered ? 30 : 0);

export const pairCountFor = (wordCount: number, rounds: number) => {
  const target = rounds === 0 ? 8 : rounds >= 12 ? 8 : 6;
  return Math.max(2, Math.min(target, Math.floor(wordCount)));
};
