/**
 * Daily share signal rewards — dopamine taps with a hard daily ceiling.
 * Client-local (device). Complements one-shot growth tasks t_share / t_share_x.
 */

const STORAGE_KEY = 'bdx_daily_share_v1';

export const SHARE_XP_PER_PUSH = 40;
export const SHARE_MAX_PER_DAY = 5; // 5 × 40 = 200 XP / day max

export type DailyShareState = {
  dayKey: string;
  count: number;
};

export type ShareRewardResult = {
  awarded: boolean;
  xp: number;
  count: number;
  remaining: number;
  capped: boolean;
  dayKey: string;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readState(): DailyShareState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dayKey: todayKey(), count: 0 };
    const parsed = JSON.parse(raw) as DailyShareState;
    if (!parsed?.dayKey || typeof parsed.count !== 'number') {
      return { dayKey: todayKey(), count: 0 };
    }
    if (parsed.dayKey !== todayKey()) return { dayKey: todayKey(), count: 0 };
    return { dayKey: parsed.dayKey, count: Math.max(0, parsed.count) };
  } catch {
    return { dayKey: todayKey(), count: 0 };
  }
}

function writeState(state: DailyShareState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function getDailyShareStatus(): {
  count: number;
  remaining: number;
  max: number;
  xpPerPush: number;
  dayKey: string;
} {
  const s = readState();
  return {
    count: s.count,
    remaining: Math.max(0, SHARE_MAX_PER_DAY - s.count),
    max: SHARE_MAX_PER_DAY,
    xpPerPush: SHARE_XP_PER_PUSH,
    dayKey: s.dayKey,
  };
}

/** Call after a successful share / copy / native share. Idempotent per push. */
export function claimDailyShareReward(): ShareRewardResult {
  const s = readState();
  if (s.count >= SHARE_MAX_PER_DAY) {
    return {
      awarded: false,
      xp: 0,
      count: s.count,
      remaining: 0,
      capped: true,
      dayKey: s.dayKey,
    };
  }
  const next = { dayKey: s.dayKey, count: s.count + 1 };
  writeState(next);
  return {
    awarded: true,
    xp: SHARE_XP_PER_PUSH,
    count: next.count,
    remaining: Math.max(0, SHARE_MAX_PER_DAY - next.count),
    capped: next.count >= SHARE_MAX_PER_DAY,
    dayKey: next.dayKey,
  };
}
