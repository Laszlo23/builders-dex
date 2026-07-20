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
    title: 'Find an early-stage AI project',
    description: 'Submit structured analysis on a pre-curation AI + Web3 builder.',
    focus: 'AI + Web3',
    rewardXp: 500,
    rewardLabel: '+Builder Reputation · Early Access',
    completed: false,
  },
  {
    id: 'scout_depin',
    title: 'Scout a DePIN signal',
    description: 'Identify a hardware or network project with verifiable commits.',
    focus: 'DePIN',
    rewardXp: 400,
    rewardLabel: '+Scout badge · Radar ping',
    completed: false,
  },
  {
    id: 'scout_infra',
    title: 'Map an infrastructure builder',
    description: 'Document light-client, oracle, or messaging teams before listing.',
    focus: 'Infrastructure',
    rewardXp: 450,
    rewardLabel: '+Community Trust',
    completed: false,
  },
  {
    id: 'scout_rwa',
    title: 'Surface an RWA experiment',
    description: 'Find builders shipping real-world asset rails with transparency.',
    focus: 'RWA',
    rewardXp: 350,
    rewardLabel: '+Genesis Radar credit',
    completed: false,
  },
];

export const SCOUT_LEADERBOARD: ScoutProfile[] = [
  {
    id: 'scout_laszlo',
    name: 'Laszlo',
    title: 'Genesis Scout',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    projectsDiscovered: 27,
    earlyCalls: 8,
    researchAccuracy: 91,
    scoutReputation: 96,
    focus: 'AI + Infrastructure',
  },
  {
    id: 'scout_elena',
    name: 'Elena Rostova',
    title: 'Core Scout',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    projectsDiscovered: 19,
    earlyCalls: 5,
    researchAccuracy: 88,
    scoutReputation: 84,
    focus: 'DeFi',
  },
  {
    id: 'scout_alex',
    name: 'Alex Rivera',
    title: 'Field Scout',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    projectsDiscovered: 14,
    earlyCalls: 4,
    researchAccuracy: 82,
    scoutReputation: 78,
    focus: 'Creator Economy',
  },
  {
    id: 'scout_mia',
    name: 'Mia Chen',
    title: 'Rising Scout',
    projectsDiscovered: 9,
    earlyCalls: 2,
    researchAccuracy: 76,
    scoutReputation: 64,
    focus: 'DePIN',
  },
];

export const GENESIS_RADAR: GenesisRadarEntry[] = [
  {
    id: 'gr1',
    name: 'Nova Relay',
    sector: 'Infrastructure',
    beforeLabel: '$2.1M implied',
    currentLabel: 'Private evaluation',
    status: 'Under Review',
    signal: 'Light-client messaging · 3 scouts submitted',
    progress: 78,
  },
  {
    id: 'gr2',
    name: 'Kinetic Labs',
    sector: 'DePIN',
    beforeLabel: '$5M market cap',
    currentLabel: 'Entering Builder Network',
    status: 'Entering Network',
    signal: 'Hardware incentives live on testnet',
    progress: 88,
  },
  {
    id: 'gr3',
    name: 'Lumen Protocol',
    sector: 'AI + Web3',
    beforeLabel: 'Pre-token',
    currentLabel: 'Early signal',
    status: 'Early Signal',
    signal: 'ZK inference sandbox · open repo',
    progress: 62,
  },
  {
    id: 'gr4',
    name: 'Coral Runtime',
    sector: 'RWA',
    beforeLabel: '$1.4M raise',
    currentLabel: 'Private evaluation',
    status: 'Private Evaluation',
    signal: 'On-chain settlement proofs pending',
    progress: 54,
  },
  {
    id: 'gr5',
    name: 'Pulse Index',
    sector: 'DeFi',
    beforeLabel: 'Stealth',
    currentLabel: 'Under Review',
    status: 'Under Review',
    signal: 'Isolated risk markets · audit booked',
    progress: 71,
  },
];

export const TERMINAL_SECTORS: TerminalSector[] = [
  { name: 'AI Sector', changePct: 14 },
  { name: 'DePIN', changePct: 8 },
  { name: 'RWA', changePct: 5 },
  { name: 'Gaming', changePct: 8 },
  { name: 'Infrastructure', changePct: 9 },
  { name: 'Creator Economy', changePct: 6 },
];

export const ARENA_MATCH: ArenaMatch = {
  id: 'arena_ai_1',
  title: 'AI Builders Battle',
  a: { name: 'SentientAI', projectId: 'p1', votes: 1284 },
  b: { name: 'HyperSphere', projectId: 'p3', votes: 1102 },
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
