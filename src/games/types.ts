import type { Team, WordEntry } from '../types';

export type GameProps = {
  /** Words this round should draw from (already validated). */
  pool: WordEntry[];
  /** Every valid word of the active collection, used for distractors. */
  all: WordEntry[];
  /** Question/pair count computed by the session. */
  rounds: number;
  timer: boolean;
  paused: boolean;
  teams: Team[] | null;
  activeTeamName: string | null;
  onAnswer: (entry: WordEntry, correct: boolean, options?: { speed?: number }) => number;
  onComplete: () => void;
};
