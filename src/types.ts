export type Pos = 'noun' | 'verb' | 'adjective' | 'adverb';

export type WordEntry = {
  id: string;
  en: string;
  it: string;
  pos: Pos;
  /** An English sentence that contains the word verbatim. Used for the Missing Word mode. */
  example?: string;
  /** Accepted alternative spellings/translations for typed answers (hand-verified only). */
  variants?: string[];
};

export type MotifKey =
  | 'food'
  | 'art'
  | 'fun'
  | 'tech'
  | 'work'
  | 'places'
  | 'sports'
  | 'travel'
  | 'nature'
  | 'home'
  | 'custom';

export type TerritoryTheme = {
  /** Deep base colour of the landmass */
  deep: string;
  /** Mid tone of the landmass */
  mid: string;
  /** Glowing accent for the motif, label and map marker */
  accent: string;
};

export type TerritoryDef = {
  id: string;
  name: string;
  it: string;
  description: string;
  theme: TerritoryTheme;
  motif: MotifKey;
  map: { x: number; y: number };
  words: WordEntry[];
};

export type ModeId = 'quiz' | 'matching' | 'missing' | 'scramble' | 'memory' | 'translation' | 'final';

export type Collection = {
  id: string;
  name: string;
  it: string;
  description: string;
  custom?: boolean;
  /** Cloned from this territory (used to restore the original list) */
  seedId?: string;
  theme: TerritoryTheme;
  motif: MotifKey;
  words: WordEntry[];
};

export type WordStat = { correct: number; wrong: number };

export type Progress = {
  xp: number;
  answered: number;
  correct: number;
  games: number;
  bestStreak: number;
  words: Record<string, WordStat>;
};

export type Team = { id: string; name: string; score: number };

export type ClassroomMode = 'individual' | 'teams';

export type Session = {
  key: string;
  collectionId: string;
  collectionName: string;
  mode: ModeId;
  pool: WordEntry[];
  rounds: number;
  timer: boolean;
  teams: Team[] | null;
  focus: string[] | null;
};

export type GameSummary = {
  mode: ModeId;
  collectionId: string;
  collectionName: string;
  answered: number;
  correct: number;
  score: number;
  bestStreak: number;
  seconds: number;
  mistakes: WordEntry[];
  results: Array<{ id: string; correct: boolean }>;
  teams: Team[] | null;
  focus: string[] | null;
  xpGained: number;
};

export type View =
  | { name: 'map' }
  | { name: 'territory'; id: string }
  | { name: 'editor'; id: string }
  | { name: 'modes'; id: string }
  | { name: 'game' }
  | { name: 'results' };
