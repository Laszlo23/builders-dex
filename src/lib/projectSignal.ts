import { getPassportLevel } from './builderScore';

export type SignalSide = 'up' | 'down';

export type SignalSnapshot = {
  day: string;
  spent: number;
  votes: Record<string, SignalSide>;
  extraUp: Record<string, number>;
  extraDown: Record<string, number>;
  /** One project stamped as today's call. Resets at 00:00 UTC. */
  callId: string | null;
};

export const CALL_COST = 2;

const PREFIX = 'bdx_signal_v1_';

export function utcDay(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

/** Daily signal budget. Rookie 5 → Genesis 12, plus room/Square bonus. */
export function signalAllowance(xp: number, bonus = 0): number {
  const level = getPassportLevel(xp);
  let base = 5;
  switch (level) {
    case 'Genesis Builder':
      base = 12;
      break;
    case 'Visionary':
      base = 11;
      break;
    case 'Core Builder':
      base = 9;
      break;
    case 'Builder':
      base = 7;
      break;
    case 'Rookie Builder':
      base = 5;
      break;
    default: {
      const _never: never = level;
      return _never;
    }
  }
  return base + Math.max(0, Math.floor(bonus));
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
  return { day, spent: 0, votes: {}, extraUp: {}, extraDown: {}, callId: null };
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
      callId: typeof parsed.callId === 'string' ? parsed.callId : null,
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

export function signalRemaining(snap: SignalSnapshot, xp: number, bonus = 0): number {
  return Math.max(0, signalAllowance(xp, bonus) - snap.spent);
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
  bonus = 0,
):
  | { ok: true; next: SignalSnapshot; flipped: boolean }
  | { ok: false; reason: string; next: SignalSnapshot } {
  const fresh = snap.day === utcDay() ? snap : { ...snap, day: utcDay(), spent: 0, callId: null };
  const current = fresh.votes[projectId];
  if (current === side) {
    return { ok: false, reason: 'Already cast', next: fresh };
  }
  if (signalRemaining(fresh, xp, bonus) < 1) {
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
      callId: fresh.callId,
    },
  };
}

export function applyDailyCall(
  snap: SignalSnapshot,
  projectId: string,
  xp: number,
  bonus = 0,
):
  | { ok: true; next: SignalSnapshot }
  | { ok: false; reason: string; next: SignalSnapshot } {
  const fresh = snap.day === utcDay() ? snap : { ...snap, day: utcDay(), spent: 0, callId: null };
  if (fresh.callId === projectId) {
    return { ok: false, reason: 'This is already todays call', next: fresh };
  }
  if (fresh.callId) {
    return { ok: false, reason: 'You already stamped a call today', next: fresh };
  }
  if (signalRemaining(fresh, xp, bonus) < CALL_COST) {
    return { ok: false, reason: `Need ${CALL_COST} signal to stamp a call`, next: fresh };
  }
  return {
    ok: true,
    next: { ...fresh, spent: fresh.spent + CALL_COST, callId: projectId },
  };
}

export type HeatRow = {
  id: string;
  heat: number;
  up: number;
  down: number;
  called: boolean;
};

export function heatForProjects(
  projects: { id: string; upvotes: number }[],
  snap: SignalSnapshot,
): HeatRow[] {
  return projects
    .map((p) => {
      const shown = displayedVotes(p.id, p.upvotes, snap);
      const called = snap.callId === p.id;
      return {
        id: p.id,
        up: shown.up,
        down: shown.down,
        called,
        heat: shown.up * 2 - shown.down * 3 + (called ? 24 : 0) + (shown.mine === 'up' ? 2 : 0),
      };
    })
    .sort((a, b) => b.heat - a.heat || b.up - a.up);
}
