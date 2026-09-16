import {
  ArenaMatch,
  GenesisRadarEntry,
  ScoutMission,
  ScoutProfile,
  TerminalSector,
} from '../types';

export const INITIAL_SCOUT_MISSIONS: ScoutMission[] = [
  {
    id: 'scout_ai',
    title: 'Call an early AI builder',
    description:
      'Pick a catalog AI project still early in the funnel. Thesis: why the team is real, what GitHub proves, and what could kill it.',
    focus: 'AI + Web3',
    rewardXp: 500,
    rewardLabel: '+Builder Reputation · Early Access',
    completed: false,
    suggestedProjectId: 'p1',
  },
  {
    id: 'scout_depin',
    title: 'Scout a DePIN / infra signal',
    description:
      'Identify verifiable commits and deployment footprint. Link evidence (repo, docs, explorer).',
    focus: 'DePIN / Infrastructure',
    rewardXp: 400,
    rewardLabel: '+Scout badge · Radar ping',
    completed: false,
    suggestedProjectId: 'p3',
  },
  {
    id: 'scout_infra',
    title: 'Map an infrastructure builder',
    description:
      'Document bridges, oracles, or messaging before the crowd. Timestamped thesis on Builder Scouts™.',
    focus: 'Infrastructure',
    rewardXp: 450,
    rewardLabel: '+Community Trust',
    completed: false,
    suggestedProjectId: 'p3',
  },
  {
    id: 'scout_rwa',
    title: 'Surface a reviewed DeFi / RWA-adjacent call',
    description:
      'Aave is under review — write why it should (or should not) enter Genesis next. Accuracy compounds on the ledger.',
    focus: 'DeFi / RWA',
    rewardXp: 350,
    rewardLabel: '+Genesis Radar credit',
    completed: false,
    suggestedProjectId: 'p2',
  },
];

/** Seed Scout showcase (Terminal shows live ledger first; seed fills empty board). */
export const SCOUT_LEADERBOARD: ScoutProfile[] = [
  {
    id: 'scout_laszlo',
    name: 'Laszlo',
    title: 'Genesis Scout',
    avatarUrl: 'https://unavatar.io/twitter/buildingcultu3',
    projectsDiscovered: 12,
    earlyCalls: 5,
    researchAccuracy: 0,
    scoutReputation: 92,
    focus: 'AI + Infrastructure',
  },
  {
    id: 'scout_field',
    name: 'Field Scout',
    title: 'Core Scout',
    projectsDiscovered: 7,
    earlyCalls: 2,
    researchAccuracy: 0,
    scoutReputation: 78,
    focus: 'DeFi',
  },
  {
    id: 'scout_rising',
    name: 'Rising Scout',
    title: 'Rising Scout',
    projectsDiscovered: 3,
    earlyCalls: 1,
    researchAccuracy: 0,
    scoutReputation: 61,
    focus: 'Creator Economy',
  },
];

/**
 * Under-evaluation pads for Genesis Radar™ — merge with live pending/reviewed catalog.
 * Names are pipeline labels, not tradeable projects.
 */
export const GENESIS_RADAR: GenesisRadarEntry[] = [
  {
    id: 'gr_pipeline_1',
    name: 'Pending Index intake',
    sector: 'Infrastructure',
    beforeLabel: 'Telegram / Apply',
    currentLabel: 'Private evaluation',
    status: 'Under Review',
    signal: 'Community signal → Index queue',
    progress: 72,
  },
  {
    id: 'gr_pipeline_2',
    name: 'Scout consensus window',
    sector: 'AI + Web3',
    beforeLabel: 'Early thesis',
    currentLabel: 'Awaiting PoB',
    status: 'Early Signal',
    signal: 'Needs timestamped Scout calls',
    progress: 48,
  },
];

export const TERMINAL_SECTORS: TerminalSector[] = [
  { name: 'AI Sector', changePct: 0 },
  { name: 'DePIN', changePct: 0 },
  { name: 'RWA', changePct: 0 },
  { name: 'Gaming', changePct: 0 },
  { name: 'Infrastructure', changePct: 0 },
  { name: 'Creator Economy', changePct: 0 },
];

export const ARENA_MATCH: ArenaMatch = {
  id: 'arena_ai_1',
  title: 'Genesis Builders Arena',
  a: { name: 'llama.cpp', projectId: 'p1', votes: 0 },
  b: { name: 'Wormhole', projectId: 'p3', votes: 0 },
  prize: 'Featured position · Community badge · Terminal spotlight',
};

export const TRUST_FLOW = [
  'Builders',
  'Passport',
  'Proof',
  'Scouts',
  'Intelligence',
  'Reputation Market',
  'Curated Trading',
] as const;

/** Bar of filled blocks for Genesis progress (10 units) */
export function progressBar(pct: number): string {
  const filled = Math.max(0, Math.min(10, Math.round(pct / 10)));
  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`;
}
