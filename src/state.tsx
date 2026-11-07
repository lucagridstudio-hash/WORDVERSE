import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ClassroomMode,
  Collection,
  GameSummary,
  ModeId,
  Progress,
  Session,
  Team,
  TerritoryDef,
  View,
  WordEntry,
} from './types';
import { customTheme, territories } from './data/territories';
import { modeById } from './data/modes';
import { pairCountFor, validEntries, xpFor } from './lib/questions';
import { levelFromXp, uid } from './lib/utils';

const STORAGE_KEY = 'wordverse.session.v1';

type Persisted = {
  collections: Record<string, Collection>;
  progress: Record<string, Progress>;
  teams: Team[];
  classroom: ClassroomMode;
  rounds: number;
  timer: boolean;
};

const makeSeedCollection = (territory: TerritoryDef): Collection => ({
  id: territory.id,
  name: territory.name,
  it: territory.it,
  description: territory.description,
  seedId: territory.id,
  theme: territory.theme,
  motif: territory.motif,
  words: territory.words.map((word) => ({ ...word })),
});

const seedCollections = (): Record<string, Collection> =>
  Object.fromEntries(territories.map((t) => [t.id, makeSeedCollection(t)]));

const emptyProgress = (): Progress => ({
  xp: 0,
  answered: 0,
  correct: 0,
  games: 0,
  bestStreak: 0,
  words: {},
});

const defaultTeams = (): Team[] => [
  { id: 'team-1', name: 'Squadra Blu', score: 0 },
  { id: 'team-2', name: 'Squadra Oro', score: 0 },
];

const loadPersisted = (): Partial<Persisted> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const withSeeds = (stored?: Record<string, Collection>): Record<string, Collection> => {
  const base = seedCollections();
  if (!stored) return base;
  for (const [id, collection] of Object.entries(stored)) {
    if (collection && Array.isArray(collection.words)) {
      base[id] = {
        ...collection,
        theme: collection.theme ?? customTheme,
        motif: collection.motif ?? 'custom',
      };
    }
  }
  return base;
};

export type CollectionStats = {
  mastered: number;
  total: number;
  pct: number;
  xp: number;
  level: number;
  levelPct: number;
  answered: number;
  accuracy: number;
};

type SessionPayload = {
  answered: number;
  correct: number;
  score: number;
  bestStreak: number;
  seconds: number;
  results: Array<{ id: string; correct: boolean }>;
};

type Api = {
  view: View;
  navigate: (view: View) => void;
  collections: Record<string, Collection>;
  collectionList: Collection[];
  getCollection: (id: string) => Collection | undefined;
  territoryOf: (id: string) => TerritoryDef | undefined;
  progress: Record<string, Progress>;
  statsFor: (id: string) => CollectionStats;
  totalXp: number;
  updateWord: (collectionId: string, wordId: string, patch: Partial<WordEntry>) => void;
  addWord: (collectionId: string, word: Omit<WordEntry, 'id'>) => void;
  deleteWord: (collectionId: string, wordId: string) => void;
  importWords: (collectionId: string, words: Array<Omit<WordEntry, 'id'>>) => number;
  resetCollection: (collectionId: string) => void;
  createCollection: (name: string, it: string, description: string, sourceId?: string) => string;
  deleteCollection: (collectionId: string) => void;
  classroom: ClassroomMode;
  setClassroom: (mode: ClassroomMode) => void;
  teams: Team[];
  setTeamCount: (count: number) => void;
  renameTeam: (id: string, name: string) => void;
  adjustTeam: (id: string, delta: number) => void;
  resetTeamScores: () => void;
  rounds: number;
  setRounds: (rounds: number) => void;
  timer: boolean;
  setTimer: (timer: boolean) => void;
  session: Session | null;
  startGame: (collectionId: string, mode: ModeId, focus?: string[]) => void;
  finishSession: (payload: SessionPayload) => void;
  exitGame: () => void;
  summary: GameSummary | null;
  resetAll: () => void;
};

const AppContext = createContext<Api | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const stored = useMemo(loadPersisted, []);

  const [collections, setCollections] = useState<Record<string, Collection>>(() =>
    withSeeds(stored.collections),
  );
  const [progress, setProgress] = useState<Record<string, Progress>>(() => stored.progress ?? {});
  const [teams, setTeams] = useState<Team[]>(() =>
    Array.isArray(stored.teams) && stored.teams.length >= 2 ? stored.teams : defaultTeams(),
  );
  const [classroom, setClassroom] = useState<ClassroomMode>(() =>
    stored.classroom === 'teams' ? 'teams' : 'individual',
  );
  const [rounds, setRounds] = useState<number>(() =>
    typeof stored.rounds === 'number' ? stored.rounds : 8,
  );
  const [timer, setTimer] = useState<boolean>(() => (typeof stored.timer === 'boolean' ? stored.timer : true));

  const [view, setView] = useState<View>({ name: 'map' });
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<GameSummary | null>(null);

  useEffect(() => {
    const payload: Persisted = { collections, progress, teams, classroom, rounds, timer };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* storage can be full or blocked; the session still works in memory */
    }
  }, [collections, progress, teams, classroom, rounds, timer]);

  const navigate = useCallback((next: View) => {
    setView(next);
    if (next.name !== 'game' && next.name !== 'results') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const getCollection = useCallback((id: string) => collections[id], [collections]);

  const territoryOf = useCallback(
    (id: string) => territories.find((t) => t.id === collections[id]?.seedId),
    [collections],
  );

  const statsFor = useCallback(
    (id: string): CollectionStats => {
      const collection = collections[id];
      const entry = progress[id];
      const words = validEntries(collection?.words ?? []);
      const mastered = words.filter((w) => {
        const stat = entry?.words?.[w.id];
        return Boolean(stat && stat.correct >= 2 && stat.correct > stat.wrong);
      }).length;
      const answered = entry?.answered ?? 0;
      return {
        mastered,
        total: words.length,
        pct: words.length ? Math.round((mastered / words.length) * 100) : 0,
        xp: entry?.xp ?? 0,
        level: levelFromXp(entry?.xp ?? 0),
        levelPct: ((entry?.xp ?? 0) % 400) / 4,
        answered,
        accuracy: answered ? Math.round(((entry?.correct ?? 0) / answered) * 100) : 0,
      };
    },
    [collections, progress],
  );

  const totalXp = useMemo(
    () => Object.values(progress).reduce((sum, entry) => sum + entry.xp, 0),
    [progress],
  );

  const updateWord = useCallback((collectionId: string, wordId: string, patch: Partial<WordEntry>) => {
    setCollections((prev) => {
      const collection = prev[collectionId];
      if (!collection) return prev;
      return {
        ...prev,
        [collectionId]: {
          ...collection,
          words: collection.words.map((word) => (word.id === wordId ? { ...word, ...patch } : word)),
        },
      };
    });
  }, []);

  const addWord = useCallback((collectionId: string, word: Omit<WordEntry, 'id'>) => {
    const entry: WordEntry = { ...word, id: uid(collectionId) };
    setCollections((prev) => {
      const collection = prev[collectionId];
      if (!collection) return prev;
      return { ...prev, [collectionId]: { ...collection, words: [...collection.words, entry] } };
    });
  }, []);

  const deleteWord = useCallback((collectionId: string, wordId: string) => {
    setCollections((prev) => {
      const collection = prev[collectionId];
      if (!collection) return prev;
      return {
        ...prev,
        [collectionId]: {
          ...collection,
          words: collection.words.filter((word) => word.id !== wordId),
        },
      };
    });
  }, []);

  const importWords = useCallback((collectionId: string, words: Array<Omit<WordEntry, 'id'>>) => {
    const entries: WordEntry[] = words.map((word) => ({ ...word, id: uid(collectionId) }));
    setCollections((prev) => {
      const collection = prev[collectionId];
      if (!collection) return prev;
      return { ...prev, [collectionId]: { ...collection, words: [...collection.words, ...entries] } };
    });
    return entries.length;
  }, []);

  const resetCollection = useCallback(
    (collectionId: string) => {
      setCollections((prev) => {
        const collection = prev[collectionId];
        if (!collection?.seedId) return prev;
        const seed = territories.find((t) => t.id === collection.seedId);
        if (!seed) return prev;
        return { ...prev, [collectionId]: { ...makeSeedCollection(seed), custom: collection.custom } };
      });
    },
    [],
  );

  const createCollection = useCallback(
    (name: string, it: string, description: string, sourceId?: string) => {
      const id = `custom-${uid('topic')}`;
      const source = sourceId ? collections[sourceId] : undefined;
      const sourceTerritory = sourceId ? territories.find((t) => t.id === sourceId) : undefined;
      const copied = source
        ? source.words.map((word) => ({ ...word, id: uid(id) }))
        : [];
      const collection: Collection = {
        id,
        name: name.trim() || 'Custom topic',
        it: it.trim() || 'Argomento personale',
        description:
          description.trim() || 'Raccolta creata manualmente: le parole sono quelle che hai inserito.',
        custom: true,
        theme: sourceTerritory?.theme ?? customTheme,
        motif: 'custom',
        words: copied,
      };
      setCollections((prev) => ({ ...prev, [id]: collection }));
      return id;
    },
    [collections],
  );

  const deleteCollection = useCallback((collectionId: string) => {
    setCollections((prev) => {
      if (!prev[collectionId]?.custom) return prev;
      const next = { ...prev };
      delete next[collectionId];
      return next;
    });
    setProgress((prev) => {
      const next = { ...prev };
      delete next[collectionId];
      return next;
    });
  }, []);

  const setTeamCount = useCallback((count: number) => {
    setTeams((prev) => {
      const target = Math.max(2, Math.min(4, count));
      if (target <= prev.length) return prev.slice(0, target);
      const additions: Team[] = [];
      const names = ['Squadra Verde', 'Squadra Viola'];
      for (let i = prev.length; i < target; i += 1) {
        additions.push({ id: uid('team'), name: names[i - 2] ?? `Squadra ${i + 1}`, score: 0 });
      }
      return [...prev, ...additions];
    });
  }, []);

  const renameTeam = useCallback((id: string, name: string) => {
    setTeams((prev) => prev.map((team) => (team.id === id ? { ...team, name } : team)));
  }, []);

  const adjustTeam = useCallback((id: string, delta: number) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === id ? { ...team, score: Math.max(0, team.score + delta) } : team)),
    );
  }, []);

  const resetTeamScores = useCallback(() => {
    setTeams((prev) => prev.map((team) => ({ ...team, score: 0 })));
  }, []);

  const startGame = useCallback(
    (collectionId: string, mode: ModeId, focus?: string[]) => {
      const collection = collections[collectionId];
      if (!collection) return;
      const focusList = focus?.length ? focus : null;
      const pool = validEntries(
        focusList ? collection.words.filter((word) => focusList.includes(word.id)) : collection.words,
      );
      if (!pool.length) return;
      const meta = modeById(mode);
      const pairs = mode === 'matching' || mode === 'memory';
      const roundCount = pairs
        ? pairCountFor(pool.length, rounds)
        : rounds === 0
          ? Math.min(pool.length, 20)
          : Math.min(rounds, pool.length);
      setSession({
        key: `${Date.now()}`,
        collectionId,
        collectionName: collection.name,
        mode,
        pool,
        rounds: mode === 'final' ? Math.min(10, Math.max(4, pool.length)) : roundCount,
        timer: meta.timer ? timer : false,
        teams: classroom === 'teams' ? teams.map((team) => ({ ...team })) : null,
        focus: focusList,
      });
      setSummary(null);
      setView({ name: 'game' });
      window.scrollTo({ top: 0 });
    },
    [classroom, collections, rounds, teams, timer],
  );

  const finishSession = useCallback(
    (payload: SessionPayload) => {
      if (!session) return;
      const xpGained = xpFor(payload.correct, payload.answered);
      setProgress((prev) => {
        const current = prev[session.collectionId] ?? emptyProgress();
        const words = { ...current.words };
        for (const result of payload.results) {
          const stat = words[result.id] ?? { correct: 0, wrong: 0 };
          words[result.id] = result.correct
            ? { ...stat, correct: stat.correct + 1 }
            : { ...stat, wrong: stat.wrong + 1 };
        }
        return {
          ...prev,
          [session.collectionId]: {
            xp: current.xp + xpGained,
            answered: current.answered + payload.answered,
            correct: current.correct + payload.correct,
            games: current.games + 1,
            bestStreak: Math.max(current.bestStreak, payload.bestStreak),
            words,
          },
        };
      });

      const mistakeIds = payload.results.filter((r) => !r.correct).map((r) => r.id);
      const mistakes = session.pool.filter((entry) => mistakeIds.includes(entry.id));

      setSummary({
        mode: session.mode,
        collectionId: session.collectionId,
        collectionName: session.collectionName,
        answered: payload.answered,
        correct: payload.correct,
        score: payload.score,
        bestStreak: payload.bestStreak,
        seconds: payload.seconds,
        mistakes,
        results: payload.results,
        teams: session.teams ? teams.map((team) => ({ ...team })) : null,
        focus: session.focus,
        xpGained,
      });
      setView({ name: 'results' });
      window.scrollTo({ top: 0 });
    },
    [session, teams],
  );

  const exitGame = useCallback(() => {
    setSession(null);
    setView(session ? { name: 'territory', id: session.collectionId } : { name: 'map' });
  }, [session]);

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setCollections(seedCollections());
    setProgress({});
    setTeams(defaultTeams());
    setClassroom('individual');
    setRounds(8);
    setTimer(true);
    setSession(null);
    setSummary(null);
    setView({ name: 'map' });
  }, []);

  const collectionList = useMemo(() => {
    const territoryIds = territories.map((t) => t.id);
    const customs = Object.values(collections)
      .filter((c) => c.custom)
      .sort((a, b) => a.name.localeCompare(b.name));
    return [
      ...territoryIds.map((id) => collections[id]).filter(Boolean),
      ...customs,
    ];
  }, [collections]);

  const value: Api = {
    view,
    navigate,
    collections,
    collectionList,
    getCollection,
    territoryOf,
    progress,
    statsFor,
    totalXp,
    updateWord,
    addWord,
    deleteWord,
    importWords,
    resetCollection,
    createCollection,
    deleteCollection,
    classroom,
    setClassroom,
    teams,
    setTeamCount,
    renameTeam,
    adjustTeam,
    resetTeamScores,
    rounds,
    setRounds,
    timer,
    setTimer,
    session,
    startGame,
    finishSession,
    exitGame,
    summary,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Api {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
