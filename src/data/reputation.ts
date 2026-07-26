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

/** Live Scout leaderboard is `/api/scout/leaderboard` — no seed cosplay. */
export const SCOUT_LEADERBOARD: ScoutProfile[] = [];

/** Under-review radar is derived from catalog curation status — no fiction pads. */
export const GENESIS_RADAR: GenesisRadarEntry[] = [];

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
