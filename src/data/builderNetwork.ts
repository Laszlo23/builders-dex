/**
 * Category leap data — Crystal Ball, Pulse, Needs, Legacy Resumes, daily return.
 * The professional network + reputation layer for Web3 builders.
 */

export type CrystalConfidence = 'High' | 'Medium' | 'Emerging';

export type CrystalBallAlert = {
  id: string;
  projectId: string;
  projectName: string;
  probability: number;
  confidence: CrystalConfidence;
  reasons: string[];
  headline: string;
};

export type BuilderPulseMetric = {
  label: string;
  value: string;
  tone?: 'live' | 'ok' | 'hot';
};

export type BuilderPulse = {
  projectId: string;
  lastCommit: string;
  lastDeploy: string;
  discordActivity: 'Low' | 'Medium' | 'High' | 'Surging';
  walletGrowthPct: number;
  velocity: 'Cooling' | 'Steady' | 'Accelerating' | 'Surging';
  metrics: BuilderPulseMetric[];
};

export type EcosystemRole =
  | 'Smart contract auditor'
  | 'UI designer'
  | 'Growth partner'
  | 'Mentor'
  | 'Researcher'
  | 'Investor liaison'
  | 'Protocol engineer'
  | 'Community lead';

export type ProjectNeed = {
  role: EcosystemRole;
  urgent?: boolean;
};

export type CareerMilestone = {
  year: number;
  title: string;
  verified: boolean;
};

export type LegacyPassport = {
  builderId: string;
  firstCommit: string;
  peopleInspired: number;
  protocolsShipped: number;
  openSourceHours: number;
  buildersMentored: number;
  legacyRank: 'Rookie' | 'Rising' | 'Core' | 'Genesis' | 'Hall of Fame';
  career: CareerMilestone[];
};

export type MorningReason = {
  id: string;
  label: string;
  detail: string;
  path: string;
};

export type WeeklyAward = {
  id: string;
  title: string;
  winner: string;
  projectId?: string;
  note: string;
};

/** Aspiration — the emotion layer */
export const ASPIRATION_LINES = [
  'Every legendary protocol starts as an unknown builder.',
  "Today's unknown builders become tomorrow's infrastructure.",
  "History doesn't remember hype. It remembers who built it.",
  "We don't discover tokens. We discover the people building the future.",
] as const;

export const NETWORK_POSITIONING =
  'The professional network and reputation layer for Web3 builders—with trading as one feature.';

/** Builder Crystal Ball™ — Genesis only; probability filled from live scores in UI when available. */
export const CRYSTAL_BALL_ALERTS: CrystalBallAlert[] = [
  {
    id: 'cb1',
    projectId: 'p1',
    projectName: 'llama.cpp',
    probability: 0,
    confidence: 'Medium',
    headline: 'Genesis Index — live score',
    reasons: [
      'Public repo with continuous releases',
      'Cited Builder Score™ pipeline',
      'Open inference — verify on GitHub',
    ],
  },
  {
    id: 'cb2',
    projectId: 'p3',
    projectName: 'Wormhole',
    probability: 0,
    confidence: 'Medium',
    headline: 'Genesis Index — infrastructure',
    reasons: [
      'Cross-chain messaging at production scale',
      'Open steward organization',
      'Verify claims via public monorepo',
    ],
  },
  {
    id: 'cb3',
    projectId: 'p4',
    projectName: 'Metaplex',
    probability: 0,
    confidence: 'Medium',
    headline: 'Genesis Index — creator infra',
    reasons: [
      'Token Metadata standard on Solana',
      'Foundation stewardship',
      'Open SDKs — verify on GitHub',
    ],
  },
];

/** Live pulse — empty until wired to GitHub / Discord APIs (no invented heartbeats). */
export const BUILDER_PULSE: Record<string, BuilderPulse> = {};

/** Who each project is looking for — living ecosystem */
export const PROJECT_NEEDS: Record<string, { roles: ProjectNeed[]; matchScore: number }> = {
  p1: {
    matchScore: 97,
    roles: [
      { role: 'Smart contract auditor', urgent: true },
      { role: 'UI designer' },
      { role: 'Growth partner', urgent: true },
    ],
  },
  p2: {
    matchScore: 89,
    roles: [
      { role: 'Researcher' },
      { role: 'Smart contract auditor', urgent: true },
      { role: 'Growth partner' },
    ],
  },
  p3: {
    matchScore: 91,
    roles: [
      { role: 'Protocol engineer', urgent: true },
      { role: 'Researcher' },
      { role: 'Mentor' },
    ],
  },
  p4: {
    matchScore: 88,
    roles: [
      { role: 'Community lead' },
      { role: 'UI designer', urgent: true },
      { role: 'Investor liaison' },
    ],
  },
};

/** On-chain resumes — empty until verified career data exists (no invented inspired counts). */
export const LEGACY_PASSPORTS: Record<string, LegacyPassport> = {};

/** Guest / user passport defaults when building their own legacy */
export const USER_LEGACY_DEFAULT: Omit<LegacyPassport, 'builderId'> = {
  firstCommit: '—',
  peopleInspired: 0,
  protocolsShipped: 0,
  openSourceHours: 0,
  buildersMentored: 0,
  legacyRank: 'Rookie',
  career: [],
};

/** Why open Builders DEX every morning */
export const MORNING_REASONS: MorningReason[] = [
  {
    id: 'mr1',
    label: 'New builders discovered',
    detail: 'Crystal Ball™ surfaces who is rising before the crowd.',
    path: 'terminal',
  },
  {
    id: 'mr2',
    label: 'Reputation changes',
    detail: 'War Room movers — who gained, who cooled, who entered Top 100.',
    path: 'terminal',
  },
  {
    id: 'mr3',
    label: 'AI alerts',
    detail: 'Emerging Builder Alerts with probability + reasoning.',
    path: 'terminal',
  },
  {
    id: 'mr4',
    label: 'Projects entering review',
    detail: 'Genesis Radar™ — who just crossed the quality threshold.',
    path: 'terminal',
  },
  {
    id: 'mr5',
    label: 'Builders asking for collaborators',
    detail: 'Needs matching — auditors, designers, growth partners.',
    path: 'explore',
  },
  {
    id: 'mr6',
    label: 'Live Build Feed™',
    detail: 'Commits, deploys, users — progress, not price.',
    path: 'terminal',
  },
  {
    id: 'mr8',
    label: 'Investor Mode',
    detail: 'Thesis filters — AI, score 90+, OSS required. Funds check every morning.',
    path: 'investor',
  },
];

/** Awards stay empty until scout / reputation ledgers produce real winners. */
export const WEEKLY_AWARDS: WeeklyAward[] = [];

/** Role counts — unknown until network census is real (do not invent headcount). */
export const ECOSYSTEM_ROLES = [
  { id: 'founder', label: 'Founders', count: 0 },
  { id: 'researcher', label: 'Researchers', count: 0 },
  { id: 'mentor', label: 'Mentors', count: 0 },
  { id: 'investor', label: 'Investors', count: 0 },
  { id: 'designer', label: 'Designers', count: 0 },
  { id: 'auditor', label: 'Auditors', count: 0 },
] as const;
