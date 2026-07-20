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

export type LpPool = {
  id: string;
  name: string;
  pair: string;
  apr: number;
  tvl: number;
  risk: 'Low' | 'Medium' | 'High';
  curated: boolean;
};

export const LP_POOLS: LpPool[] = [
  { id: 'lp_sol_usdc', name: 'SOL–USDC', pair: 'SOL / USDC', apr: 18.4, tvl: 2_450_000, risk: 'Low', curated: true },
  { id: 'lp_sent_usdc', name: 'SENT–USDC', pair: 'SENT / USDC', apr: 42.1, tvl: 380_000, risk: 'Medium', curated: true },
  { id: 'lp_sphere_sol', name: 'SPHERE–SOL', pair: 'SPHERE / SOL', apr: 55.0, tvl: 210_000, risk: 'High', curated: true },
  { id: 'lp_link_usdc', name: 'LINK–USDC', pair: 'LINK / USDC', apr: 31.2, tvl: 520_000, risk: 'Medium', curated: true },
];

export const STAKER_PERKS = [
  { title: 'Fee rebate', body: 'Up to 25% lower spot fees on curated swaps.' },
  { title: 'Early access', body: 'See Builder Stories 24h before public Explore.' },
  { title: 'Passport boost', body: '+15% XP on Discovery Quests and research tasks.' },
  { title: 'Governance weight', body: '1.5× voting power in protocol proposals.' },
  { title: 'Intel priority', body: 'Higher rate limits on Builder Intelligence™.' },
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