/**
 * Pride + obsession layer — aspiration, archive, prestige, humans, investors, genome.
 * Goal: founders put "Featured on Builders DEX" in their bios.
 */

export const MISSION_RALLY = [
  'Every legendary protocol starts as an unknown builder.',
  "Today's unknown builders become tomorrow's infrastructure.",
  "History doesn't remember hype. It remembers who built it.",
] as const;

export const PRIDE_CTA =
  'I want to build something worthy of being featured here.';

export const FEATURED_BADGE_LINE = '🏆 Featured on Builders DEX';

export const OWNED_WORDS = [
  'Proof of Building™',
  'Builder Score™',
  'Builder Passport™',
  'Builder DNA™',
  'Builder Intelligence™',
  'Builder Graph™',
  'Builder Genome™',
] as const;

/** The moat word */
export const BUILDER_GRAPH_LINE =
  'Builder Graph™ — every builder, every project, every contribution, every relationship. One living graph.';

export type ArchiveEntry = {
  year: number;
  projectName: string;
  projectId?: string;
  title: string;
  achievement: string;
};

export const BUILDER_ARCHIVE: ArchiveEntry[] = [
  {
    year: 2024,
    projectName: 'Wormhole',
    projectId: 'p3',
    title: 'Infrastructure breakout',
    achievement: 'Cross-chain messaging at global scale',
  },
  {
    year: 2025,
    projectName: 'Metaplex',
    projectId: 'p4',
    title: 'Category defining',
    achievement: 'Token Metadata standard for Solana creators',
  },
  {
    year: 2026,
    projectName: 'llama.cpp',
    projectId: 'p1',
    title: 'Genesis Index',
    achievement: 'Live Builder Score™ — open inference still shipping in public',
  },
];

/** Prestige — Genesis Index honesty (not a fake funnel) */
export const RECOGNITION_RATE = {
  applications: 4,
  accepted: 3,
  ratePct: 75,
  comparison: 'Genesis Index — live-scored, not mass listing.',
  line: 'Four case-study projects in the catalog. Three cleared Genesis with live Builder Score™ citations. Trading stays empty until Proof clears.',
};

export type HumanFounder = {
  builderId: string;
  projectId: string;
  name: string;
  avatarUrl: string;
  buildingYears: number;
  previousFailures: number;
  openSourceCommits: number;
  mission: string;
};

/** Real org/people cards — no invented commit/failure counts. */
export const HUMAN_FOUNDERS: Record<string, HumanFounder> = {
  p1: {
    builderId: 'b1',
    projectId: 'p1',
    name: 'Georgi Gerganov',
    avatarUrl: 'https://unavatar.io/github/ggerganov',
    buildingYears: 0,
    previousFailures: 0,
    openSourceCommits: 0,
    mission: 'Local-first LLM inference anyone can run and audit. Verify on GitHub.',
  },
  p2: {
    builderId: 'b2',
    projectId: 'p2',
    name: 'Aave Labs',
    avatarUrl: 'https://unavatar.io/twitter/aave',
    buildingYears: 0,
    previousFailures: 0,
    openSourceCommits: 0,
    mission: 'Liquidity markets that stay open-source and risk-aware. Verify on GitHub.',
  },
  p3: {
    builderId: 'b3',
    projectId: 'p3',
    name: 'Wormhole Foundation',
    avatarUrl: 'https://unavatar.io/twitter/wormhole',
    buildingYears: 0,
    previousFailures: 0,
    openSourceCommits: 0,
    mission: 'Make cross-chain messaging disappear into the stack. Verify on GitHub.',
  },
  p4: {
    builderId: 'b4',
    projectId: 'p4',
    name: 'Metaplex Foundation',
    avatarUrl: 'https://unavatar.io/twitter/metaplex',
    buildingYears: 0,
    previousFailures: 0,
    openSourceCommits: 0,
    mission: 'Creator ownership standards that travel with the fan. Verify on GitHub.',
  },
};

export type BuilderConversation = {
  id: string;
  projectId: string;
  founderName: string;
  question: string;
  answer: string;
};

/** No fabricated founder Q&A — only show when real interviews exist. */
export const BUILDER_CONVERSATIONS: Record<string, BuilderConversation[]> = {};

export type CollabStatus = 'open' | 'matched' | 'recommended';

export type CollabNeed = {
  role: string;
  status: CollabStatus;
  matchPct?: number;
  recommendedName?: string;
};

/** Open roles only — no invented recommended people. */
export const COLLAB_NEEDS: Record<string, CollabNeed[]> = {
  p1: [
    { role: 'Senior Rust Engineer', status: 'open' },
    { role: 'UI Designer', status: 'open' },
    { role: 'Growth Partner', status: 'open' },
  ],
  p3: [
    { role: 'Protocol Engineer', status: 'open' },
    { role: 'Researcher', status: 'open' },
    { role: 'Mentor', status: 'open' },
  ],
  p4: [
    { role: 'Community Lead', status: 'open' },
    { role: 'UI Designer', status: 'open' },
    { role: 'Growth Partner', status: 'open' },
  ],
  p2: [
    { role: 'Smart Contract Auditor', status: 'open' },
    { role: 'Researcher', status: 'open' },
  ],
};

export type VelocityBars = {
  commits: number;
  releases: number;
  users: number;
  retention: number;
  liquidity: number;
};

/** Velocity bars — empty until live telemetry exists. */
export const PROJECT_VELOCITY: Record<string, VelocityBars> = {};

export type BuilderGenome = {
  innovation: number;
  execution: number;
  community: number;
  transparency: number;
  risk: number;
  momentum: number;
  founderResilience: number;
  category: string;
};

/** Genome — empty until derived from live Builder Score™ only. */
export const BUILDER_GENOMES: Record<string, BuilderGenome> = {};

export type InvestorFilters = {
  categories: Array<'AI + Web3' | 'DeFi' | 'Infrastructure' | 'Creator Economy' | 'All'>;
  maxMarketCapM: number;
  minBuilderScore: number;
  revenueGrowing: boolean;
  openSourceRequired: boolean;
};

export const DEFAULT_INVESTOR_FILTERS: InvestorFilters = {
  categories: ['AI + Web3'],
  maxMarketCapM: 20,
  minBuilderScore: 90,
  revenueGrowing: true,
  openSourceRequired: true,
};
