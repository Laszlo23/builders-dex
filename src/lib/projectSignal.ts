import { getPassportLevel } from './builderScore';

export type SignalSide = 'up' | 'down';

export type SignalSnapshot = {
  day: string;
  spent: number;
  votes: Record<string, SignalSide>;
  extraUp: Record<string, number>;
  extraDown: Record<string, number>;
};

const PREFIX = 'bdx_signal_v1_';

export function utcDay(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

/** Daily signal budget. Rookie 5 → Genesis 12. */
export function signalAllowance(xp: number): number {
  const level = getPassportLevel(xp);
  switch (level) {
    case 'Genesis Builder':
      return 12;
    case 'Visionary':
      return 11;
    case 'Core Builder':
      return 9;
    case 'Builder':
      return 7;
    case 'Rookie Builder':
      return 5;
    default: {
      const _never: never = level;
      return _never;
    }
  }
}

export function signalOwnerKey(wallet: string | null | undefined): string {
  if (wallet) return `wallet_${wallet}`;
  if (typeof window === 'undefined') return 'device_ssr';
  let id = window.localStorage.getItem('bdx_device_id');
  if (!id) {
    id = `d_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem('bdx_device_id', id);
  }
  return `device_${id}`;
}

function emptySnap(day = utcDay()): SignalSnapshot {
  return { day, spent: 0, votes: {}, extraUp: {}, extraDown: {} };
}

export function loadSignal(ownerKey: string): SignalSnapshot {
  if (typeof window === 'undefined') return emptySnap();
  try {
    const raw = window.localStorage.getItem(PREFIX + ownerKey);
    if (!raw) return emptySnap();
    const parsed = JSON.parse(raw) as Partial<SignalSnapshot>;
    const day = typeof parsed.day === 'string' ? parsed.day : utcDay();
    const snap: SignalSnapshot = {
      day,
      spent: Math.max(0, Number(parsed.spent) || 0),
      votes: parsed.votes && typeof parsed.votes === 'object' ? parsed.votes : {},
      extraUp: parsed.extraUp && typeof parsed.extraUp === 'object' ? parsed.extraUp : {},
      extraDown: parsed.extraDown && typeof parsed.extraDown === 'object' ? parsed.extraDown : {},
    };
    if (snap.day !== utcDay()) {
      return { ...emptySnap(), votes: snap.votes, extraUp: snap.extraUp, extraDown: snap.extraDown };
    }
    return snap;
  } catch {
    return emptySnap();
  }
}

export function saveSignal(ownerKey: string, snap: SignalSnapshot): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PREFIX + ownerKey, JSON.stringify(snap));
}

export function signalRemaining(snap: SignalSnapshot, xp: number): number {
  return Math.max(0, signalAllowance(xp) - snap.spent);
}

export function displayedVotes(
  projectId: string,
  catalogUp: number,
  snap: SignalSnapshot,
): { up: number; down: number; mine: SignalSide | null } {
  return {
    up: catalogUp + (snap.extraUp[projectId] || 0),
    down: snap.extraDown[projectId] || 0,
    mine: snap.votes[projectId] ?? null,
  };
}

export function applySignalVote(
  snap: SignalSnapshot,
  projectId: string,
  side: SignalSide,
  xp: number,
):
  | { ok: true; next: SignalSnapshot; flipped: boolean }
  | { ok: false; reason: string; next: SignalSnapshot } {
  const fresh = snap.day === utcDay() ? snap : { ...snap, day: utcDay(), spent: 0 };
  const current = fresh.votes[projectId];
  if (current === side) {
    return { ok: false, reason: 'Already cast', next: fresh };
  }
  if (signalRemaining(fresh, xp) < 1) {
    return { ok: false, reason: 'No signal left today — resets at 00:00 UTC', next: fresh };
  }

  const extraUp = { ...fresh.extraUp };
  const extraDown = { ...fresh.extraDown };
  if (current === 'up') extraUp[projectId] = Math.max(0, (extraUp[projectId] || 0) - 1);
  if (current === 'down') extraDown[projectId] = Math.max(0, (extraDown[projectId] || 0) - 1);
  if (side === 'up') extraUp[projectId] = (extraUp[projectId] || 0) + 1;
  else extraDown[projectId] = (extraDown[projectId] || 0) + 1;

  return {
    ok: true,
    flipped: Boolean(current),
    next: {
      ...fresh,
      spent: fresh.spent + 1,
      votes: { ...fresh.votes, [projectId]: side },
      extraUp,
      extraDown,
    },
  };
}
