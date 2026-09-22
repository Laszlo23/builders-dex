import type { ChainLaneId } from '../data/chainLanes';

const KEY = 'buildersdex.roomStamps';

export type RoomStamps = {
  solana: boolean;
  base: boolean;
  hood: boolean;
  squareId: number | null;
};

export function emptyStamps(): RoomStamps {
  return { solana: false, base: false, hood: false, squareId: null };
}

export function loadRoomStamps(): RoomStamps {
  if (typeof window === 'undefined') return emptyStamps();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyStamps();
    const parsed = JSON.parse(raw) as Partial<RoomStamps>;
    const squareId = Number(parsed.squareId);
    return {
      solana: Boolean(parsed.solana),
      base: Boolean(parsed.base),
      hood: Boolean(parsed.hood),
      squareId: Number.isFinite(squareId) && squareId > 0 ? squareId : null,
    };
  } catch {
    return emptyStamps();
  }
}

function save(next: RoomStamps): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('bdx-room-stamps'));
}

export function stampRoom(id: ChainLaneId): RoomStamps {
  const cur = loadRoomStamps();
  const next = { ...cur, [id]: true };
  save(next);
  return next;
}

export function stampSquare(tokenId: number): RoomStamps {
  const cur = loadRoomStamps();
  const id = Math.floor(tokenId);
  if (!Number.isFinite(id) || id <= 0) return cur;
  const next = { ...cur, hood: true, squareId: id };
  save(next);
  return next;
}

export function isTriRoom(stamps: RoomStamps): boolean {
  return stamps.solana && stamps.base && stamps.hood;
}

/** Extra daily signal from collected rooms / Square. */
export function roomStampBonus(stamps: RoomStamps): number {
  return (isTriRoom(stamps) ? 2 : 0) + (stamps.squareId ? 1 : 0);
}
