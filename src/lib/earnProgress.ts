import { INITIAL_GROWTH_TASKS, GrowthTask, PendingUnstake } from '../data/earn';
import type { PassportStats } from '../types';

export const EARN_PROGRESS_VERSION = 1;

const DEVICE_ID_KEY = 'bdx_device_id';
const MIGRATED_FLAG = 'bdx_earn_migrated_to_wallet';

/** External social tasks: Claim enabled only after Go opens the link */
export const SOCIAL_GO_THEN_CLAIM = new Set([
  't_culture_node_engage',
  't_join_discord',
  't_join_telegram',
  't_follow_x',
]);

export type EarnProgressSnapshot = {
  version: number;
  builderXp: number;
  contributionsCount: number;
  completedTaskIds: string[];
  startedTaskIds: string[];
  discoveredIds: string[];
  stakedBuild: number;
  lpDeposits: Record<string, number>;
  pendingUnstake: PendingUnstake | null;
  simBalances: Record<string, number>;
  passport: PassportStats;
  completedQuestIds: string[];
  completedScoutIds: string[];
  arenaUserSide: 'a' | 'b' | null;
  hasCompletedFirstDiscovery: boolean;
  updatedAt: number;
};

export const DEFAULT_SIM_BALANCES: Record<string, number> = {
  BUILD: 1200,
  ETH: 1.84,
  POL: 320,
  SOL: 8.5,
  SENT: 100,
  AERO: 0,
  SPHERE: 0,
  LINK: 0,
};

export const DEFAULT_PASSPORT: PassportStats = {
  projectsDiscovered: 0,
  communitiesSupported: 0,
  researchQuestsCompleted: 0,
  builderReputation: 50,
  communityTrust: 50,
  openSourceImpact: 'Medium',
  projectsCreated: 0,
  previousContributions: 0,
  activeUsers: 0,
  openSourceContributions: 0,
  reputationAgeYears: 0,
  earlyCalls: 0,
  researchAccuracy: 70,
  scoutXp: 0,
};

export function createFreshProgress(): EarnProgressSnapshot {
  return {
    version: EARN_PROGRESS_VERSION,
    builderXp: 0,
    contributionsCount: 0,
    completedTaskIds: [],
    startedTaskIds: [],
    discoveredIds: [],
    stakedBuild: 0,
    lpDeposits: {},
    pendingUnstake: null,
    simBalances: { ...DEFAULT_SIM_BALANCES },
    passport: { ...DEFAULT_PASSPORT },
    completedQuestIds: [],
    completedScoutIds: [],
    arenaUserSide: null,
    hasCompletedFirstDiscovery: false,
    updatedAt: Date.now(),
  };
}

export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    return 'anonymous';
  }
}

export function earnStorageKey(walletPubkey: string | null): string {
  if (walletPubkey) return `bdx_earn_v1_wallet_${walletPubkey}`;
  return `bdx_earn_v1_device_${getOrCreateDeviceId()}`;
}

function isPendingUnstake(v: unknown): v is PendingUnstake {
  if (!v || typeof v !== 'object') return false;
  const o = v as PendingUnstake;
  return (
    typeof o.amount === 'number' &&
    typeof o.requestedAt === 'number' &&
    typeof o.unlockAt === 'number'
  );
}

export function loadEarnProgress(walletPubkey: string | null): EarnProgressSnapshot {
  const fresh = createFreshProgress();
  try {
    const key = earnStorageKey(walletPubkey);
    let raw = localStorage.getItem(key);

    // First wallet connect: migrate device progress once
    if (!raw && walletPubkey) {
      const deviceKey = `bdx_earn_v1_device_${getOrCreateDeviceId()}`;
      const deviceRaw = localStorage.getItem(deviceKey);
      const already = localStorage.getItem(`${MIGRATED_FLAG}_${walletPubkey}`);
      if (deviceRaw && !already) {
        raw = deviceRaw;
        localStorage.setItem(key, deviceRaw);
        localStorage.setItem(`${MIGRATED_FLAG}_${walletPubkey}`, '1');
      }
    }

    // Legacy first-discovery flag
    if (!raw) {
      try {
        if (localStorage.getItem('bdx_first_discovery') === '1') {
          fresh.hasCompletedFirstDiscovery = true;
          fresh.completedTaskIds = ['t_first_discovery'];
        }
      } catch {
        /* ignore */
      }
      return fresh;
    }

    const parsed = JSON.parse(raw) as Partial<EarnProgressSnapshot>;
    return {
      ...fresh,
      ...parsed,
      version: EARN_PROGRESS_VERSION,
      builderXp: Math.max(0, Number(parsed.builderXp) || 0),
      contributionsCount: Math.max(0, Number(parsed.contributionsCount) || 0),
      completedTaskIds: Array.isArray(parsed.completedTaskIds)
        ? parsed.completedTaskIds.filter((x) => typeof x === 'string')
        : [],
      startedTaskIds: Array.isArray(parsed.startedTaskIds)
        ? parsed.startedTaskIds.filter((x) => typeof x === 'string')
        : [],
      discoveredIds: Array.isArray(parsed.discoveredIds)
        ? parsed.discoveredIds.filter((x) => typeof x === 'string')
        : [],
      stakedBuild: Math.max(0, Number(parsed.stakedBuild) || 0),
      lpDeposits:
        parsed.lpDeposits && typeof parsed.lpDeposits === 'object'
          ? { ...parsed.lpDeposits }
          : {},
      pendingUnstake: isPendingUnstake(parsed.pendingUnstake)
        ? parsed.pendingUnstake
        : null,
      simBalances:
        parsed.simBalances && typeof parsed.simBalances === 'object'
          ? { ...DEFAULT_SIM_BALANCES, ...parsed.simBalances }
          : { ...DEFAULT_SIM_BALANCES },
      passport:
        parsed.passport && typeof parsed.passport === 'object'
          ? { ...DEFAULT_PASSPORT, ...parsed.passport }
          : { ...DEFAULT_PASSPORT },
      completedQuestIds: Array.isArray(parsed.completedQuestIds)
        ? parsed.completedQuestIds.filter((x) => typeof x === 'string')
        : [],
      completedScoutIds: Array.isArray(parsed.completedScoutIds)
        ? parsed.completedScoutIds.filter((x) => typeof x === 'string')
        : [],
      arenaUserSide:
        parsed.arenaUserSide === 'a' || parsed.arenaUserSide === 'b'
          ? parsed.arenaUserSide
          : null,
      hasCompletedFirstDiscovery: Boolean(parsed.hasCompletedFirstDiscovery),
      updatedAt: Number(parsed.updatedAt) || Date.now(),
    };
  } catch {
    return fresh;
  }
}

export function saveEarnProgress(
  walletPubkey: string | null,
  snapshot: EarnProgressSnapshot,
): void {
  try {
    const payload: EarnProgressSnapshot = {
      ...snapshot,
      version: EARN_PROGRESS_VERSION,
      updatedAt: Date.now(),
    };
    localStorage.setItem(earnStorageKey(walletPubkey), JSON.stringify(payload));
    if (snapshot.hasCompletedFirstDiscovery) {
      localStorage.setItem('bdx_first_discovery', '1');
    }
  } catch {
    /* quota / private mode */
  }
}

export function applyCompletedTasks(completedIds: string[]): GrowthTask[] {
  const done = new Set(completedIds);
  return INITIAL_GROWTH_TASKS.map((t) => ({
    ...t,
    completed: done.has(t.id),
  }));
}

export function applyCompletedQuests<T extends { id: string; completed: boolean }>(
  quests: T[],
  completedIds: string[],
): T[] {
  const done = new Set(completedIds);
  return quests.map((q) => ({ ...q, completed: done.has(q.id) || q.completed }));
}

/** Merge local + server: maxima / unions so progress never shrinks on sync */
export function mergeProgressSnapshots(
  local: EarnProgressSnapshot,
  remote: EarnProgressSnapshot,
): EarnProgressSnapshot {
  const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));
  const maxNum = (a: number, b: number) => Math.max(a || 0, b || 0);

  const passport: PassportStats = {
    projectsDiscovered: maxNum(
      local.passport.projectsDiscovered,
      remote.passport.projectsDiscovered,
    ),
    communitiesSupported: maxNum(
      local.passport.communitiesSupported,
      remote.passport.communitiesSupported,
    ),
    researchQuestsCompleted: maxNum(
      local.passport.researchQuestsCompleted,
      remote.passport.researchQuestsCompleted,
    ),
    builderReputation: maxNum(
      local.passport.builderReputation,
      remote.passport.builderReputation,
    ),
    communityTrust: maxNum(
      local.passport.communityTrust,
      remote.passport.communityTrust,
    ),
    openSourceImpact: local.passport.openSourceImpact,
    projectsCreated: maxNum(
      local.passport.projectsCreated,
      remote.passport.projectsCreated,
    ),
    previousContributions: maxNum(
      local.passport.previousContributions,
      remote.passport.previousContributions,
    ),
    activeUsers: maxNum(local.passport.activeUsers, remote.passport.activeUsers),
    openSourceContributions: maxNum(
      local.passport.openSourceContributions,
      remote.passport.openSourceContributions,
    ),
    reputationAgeYears: maxNum(
      local.passport.reputationAgeYears,
      remote.passport.reputationAgeYears,
    ),
    earlyCalls: maxNum(local.passport.earlyCalls || 0, remote.passport.earlyCalls || 0),
    researchAccuracy: maxNum(
      local.passport.researchAccuracy || 0,
      remote.passport.researchAccuracy || 0,
    ),
    scoutXp: maxNum(local.passport.scoutXp || 0, remote.passport.scoutXp || 0),
  };

  return {
    version: Math.max(local.version, remote.version),
    builderXp: maxNum(local.builderXp, remote.builderXp),
    contributionsCount: maxNum(local.contributionsCount, remote.contributionsCount),
    completedTaskIds: union(local.completedTaskIds, remote.completedTaskIds),
    startedTaskIds: union(local.startedTaskIds, remote.startedTaskIds),
    discoveredIds: union(local.discoveredIds, remote.discoveredIds),
    stakedBuild: maxNum(local.stakedBuild, remote.stakedBuild),
    lpDeposits: { ...remote.lpDeposits, ...local.lpDeposits },
    pendingUnstake: local.pendingUnstake || remote.pendingUnstake,
    simBalances: { ...remote.simBalances, ...local.simBalances },
    passport,
    completedQuestIds: union(local.completedQuestIds, remote.completedQuestIds),
    completedScoutIds: union(local.completedScoutIds, remote.completedScoutIds),
    arenaUserSide: local.arenaUserSide || remote.arenaUserSide,
    hasCompletedFirstDiscovery:
      local.hasCompletedFirstDiscovery || remote.hasCompletedFirstDiscovery,
    updatedAt: Date.now(),
  };
}

export function snapshotFromAppState(input: {
  builderXp: number;
  contributionsCount: number;
  completedTaskIds: string[];
  startedTaskIds: string[];
  discoveredIds: string[];
  stakedBuild: number;
  lpDeposits: Record<string, number>;
  pendingUnstake: PendingUnstake | null;
  simBalances: Record<string, number>;
  passport: PassportStats;
  completedQuestIds: string[];
  completedScoutIds: string[];
  arenaUserSide: 'a' | 'b' | null;
  hasCompletedFirstDiscovery: boolean;
}): EarnProgressSnapshot {
  return {
    version: EARN_PROGRESS_VERSION,
    ...input,
    updatedAt: Date.now(),
  };
}
