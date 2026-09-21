import {
  FIRST_STALL_PROJECT_ID,
  SQUARE_LOOP_MAX_PER_WALLET,
  SQUARE_LOOP_UNPARK_DAYS,
  type SquareLoopPhase,
} from '../data/squareLoop';

export const SQUARE_LOOP_STORAGE_KEY = 'bdx_square_loop_v1';

export type SquareLoopEntry = {
  tokenId: number;
  phase: SquareLoopPhase;
  activatedAt: number | null;
  parkedAt: number | null;
  stallProjectId: string | null;
  unparkUnlockAt: number | null;
  updatedAt: number;
};

export type SquareLoopStore = {
  squares: Record<string, SquareLoopEntry>;
};

function emptyStore(): SquareLoopStore {
  return { squares: {} };
}

function asPhase(value: unknown): SquareLoopPhase {
  if (value === 'dormant' || value === 'activated' || value === 'parked' || value === 'stalled') {
    return value;
  }
  return 'dormant';
}

function asEntry(raw: unknown, tokenId: number): SquareLoopEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = Number(row.tokenId ?? tokenId);
  if (!Number.isInteger(id) || id < 0) return null;
  return {
    tokenId: id,
    phase: asPhase(row.phase),
    activatedAt: typeof row.activatedAt === 'number' ? row.activatedAt : null,
    parkedAt: typeof row.parkedAt === 'number' ? row.parkedAt : null,
    stallProjectId: typeof row.stallProjectId === 'string' ? row.stallProjectId : null,
    unparkUnlockAt: typeof row.unparkUnlockAt === 'number' ? row.unparkUnlockAt : null,
    updatedAt: typeof row.updatedAt === 'number' ? row.updatedAt : Date.now(),
  };
}

export function loadSquareLoopStore(): SquareLoopStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = window.localStorage.getItem(SQUARE_LOOP_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as { squares?: Record<string, unknown> };
    const squares: Record<string, SquareLoopEntry> = {};
    for (const [key, value] of Object.entries(parsed.squares || {})) {
      const entry = asEntry(value, Number(key));
      if (entry) squares[String(entry.tokenId)] = entry;
    }
    return { squares };
  } catch {
    return emptyStore();
  }
}

export function saveSquareLoopStore(store: SquareLoopStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SQUARE_LOOP_STORAGE_KEY, JSON.stringify(store));
}

export function squareLoopEntry(
  store: SquareLoopStore,
  tokenId: number | null,
): SquareLoopEntry | null {
  if (tokenId == null) return null;
  return store.squares[String(tokenId)] ?? dormantEntry(tokenId);
}

export function dormantEntry(tokenId: number): SquareLoopEntry {
  return {
    tokenId,
    phase: 'dormant',
    activatedAt: null,
    parkedAt: null,
    stallProjectId: null,
    unparkUnlockAt: null,
    updatedAt: Date.now(),
  };
}

function parkedCount(store: SquareLoopStore): number {
  return Object.values(store.squares).filter(
    (row) => row.phase === 'parked' || row.phase === 'stalled',
  ).length;
}

export function mutateSquareLoop(
  store: SquareLoopStore,
  tokenId: number,
  verb: 'activate' | 'park' | 'stall' | 'unpark-request' | 'unpark' | 'exit-stall',
  now = Date.now(),
): SquareLoopStore {
  const current = squareLoopEntry(store, tokenId) ?? dormantEntry(tokenId);
  const next = { ...current, updatedAt: now };

  switch (verb) {
    case 'activate':
      if (next.phase !== 'dormant') break;
      next.phase = 'activated';
      next.activatedAt = now;
      break;
    case 'park':
      if (next.phase !== 'activated') break;
      if (parkedCount(store) >= SQUARE_LOOP_MAX_PER_WALLET) {
        throw new Error(`Park cap is ${SQUARE_LOOP_MAX_PER_WALLET} Squares.`);
      }
      next.phase = 'parked';
      next.parkedAt = now;
      next.unparkUnlockAt = null;
      break;
    case 'stall':
      if (next.phase !== 'parked') break;
      next.phase = 'stalled';
      next.stallProjectId = FIRST_STALL_PROJECT_ID;
      break;
    case 'exit-stall':
      if (next.phase !== 'stalled') break;
      next.phase = 'parked';
      next.stallProjectId = null;
      break;
    case 'unpark-request':
      if (next.phase !== 'parked' && next.phase !== 'stalled') break;
      if (next.phase === 'stalled') {
        next.phase = 'parked';
        next.stallProjectId = null;
      }
      next.unparkUnlockAt = now + SQUARE_LOOP_UNPARK_DAYS * 86_400_000;
      break;
    case 'unpark':
      if (!next.unparkUnlockAt || now < next.unparkUnlockAt) {
        throw new Error('Unpark is still cooling down.');
      }
      next.phase = 'activated';
      next.parkedAt = null;
      next.stallProjectId = null;
      next.unparkUnlockAt = null;
      break;
    default: {
      const _exhaustive: never = verb;
      return _exhaustive;
    }
  }

  return {
    squares: {
      ...store.squares,
      [String(tokenId)]: next,
    },
  };
}

export function listedSquareLoop(store: SquareLoopStore): SquareLoopEntry[] {
  return Object.values(store.squares)
    .filter((row) => row.phase !== 'dormant')
    .sort((a, b) => a.tokenId - b.tokenId);
}
