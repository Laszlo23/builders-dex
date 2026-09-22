export type GrowthTask = {
  id: string;
  title: string;
  description: string;
  xp: number;
  badge?: string;
  category: 'discovery' | 'liquidity' | 'social' | 'research' | 'staking';
  completed: boolean;
};

export {
  INITIAL_GROWTH_TASKS,
  GROWTH_TASK_ROUTES,
  GROWTH_TASK_EXTERNAL,
} from './growthTasks';

export const STAKER_PERKS = [
  { title: 'Fee dust', body: 'Parked Square TBAs share real fees when splitter volume exists. $BUILD has a Bankr address — zero volume still means zero fees.' },
  { title: 'Stall rights', body: 'Take a stall on inspected catalog launches. First stall is Aura Share.' },
  { title: 'Passport boost', body: '+15% XP on Discovery Quests and research tasks once a Square is parked.' },
  { title: 'Governance weight', body: 'DAO votes stay simulated until a live lock contract is named.' },
  { title: 'Intel priority', body: 'Higher rate limits on Builder Intelligence™ for parked Squares.' },
];

/** Unstake cooldown — 5–7 days; we use 7 days on-chain style lock */
export const UNSTAKE_COOLDOWN_DAYS = 7;
export const UNSTAKE_COOLDOWN_LABEL = '5–7 days';

export type PendingUnstake = {
  amount: number;
  requestedAt: number;
  unlockAt: number;
};

export function createUnstakeRequest(amount: number, now = Date.now()): PendingUnstake {
  const ms = UNSTAKE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return {
    amount,
    requestedAt: now,
    unlockAt: now + ms,
  };
}

export function unstakeReady(pending: PendingUnstake | null, now = Date.now()): boolean {
  return Boolean(pending && now >= pending.unlockAt);
}

export function cooldownRemainingMs(pending: PendingUnstake, now = Date.now()): number {
  return Math.max(0, pending.unlockAt - now);
}

export function formatCooldown(ms: number): string {
  if (ms <= 0) return 'Ready to claim';
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `${days}d ${hours}h remaining`;
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${mins}m remaining`;
}