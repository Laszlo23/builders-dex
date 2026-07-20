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
    projectName: 'HyperSphere',
    projectId: 'p3',
    title: 'Infrastructure breakout',
    achievement: 'Public testnet v3 — light clients over committees',
  },
  {
    year: 2025,
    projectName: 'CreatorLink',
    projectId: 'p4',
    title: 'Category defining',
    achievement: 'Portable memberships crossed 100k creators',
  },
  {
    year: 2026,
    projectName: 'SentientAI',
    projectId: 'p1',
    title: 'Builder of the Season',
    achievement: 'Proof of Building™ cleared — still shipping in public',
  },
];

/** Prestige — lower than YC */
export const RECOGNITION_RATE = {
  applications: 4892,
  accepted: 127,
  ratePct: 2.59,
  comparison: 'Lower than Y Combinator.',
  line: 'People should dream of getting accepted — not just apply.',
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

export const HUMAN_FOUNDERS: Record<string, HumanFounder> = {
  p1: {
    builderId: 'b1',
    projectId: 'p1',
    name: 'Satoshi Dev',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    buildingYears: 4,
    previousFailures: 1,
    openSourceCommits: 1842,
    mission: 'Making inference as auditable as a blockchain transaction.',
  },
  p2: {
    builderId: 'b2',
    projectId: 'p2',
    name: 'Elena Rostova',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    buildingYears: 5,
    previousFailures: 2,
    openSourceCommits: 960,
    mission: 'Risk should be modular — not monolithic.',
  },
  p3: {
    builderId: 'b3',
    projectId: 'p3',
    name: 'Alex Rivera',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    buildingYears: 3,
    previousFailures: 2,
    openSourceCommits: 1284,
    mission: 'Making cross-chain communication disappear.',
  },
  p4: {
    builderId: 'b4',
    projectId: 'p4',
    name: 'Sophia Chen',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    buildingYears: 3,
    previousFailures: 1,
    openSourceCommits: 720,
    mission: 'Membership that travels with the fan — not the platform.',
  },
};

export type BuilderConversation = {
  id: string;
  projectId: string;
  founderName: string;
  question: string;
  answer: string;
};

export const BUILDER_CONVERSATIONS: Record<string, BuilderConversation[]> = {
  p1: [
    {
      id: 'c_p1_1',
      projectId: 'p1',
      founderName: 'Satoshi Dev',
      question: 'What was your biggest mistake?',
      answer:
        'Optimizing for elegance before users. The beautiful architecture nobody ran taught us more than any audit.',
    },
    {
      id: 'c_p1_2',
      projectId: 'p1',
      founderName: 'Satoshi Dev',
      question: 'Why Builders DEX?',
      answer:
        'Because reputation should compound across projects — not reset every launch.',
    },
  ],
  p3: [
    {
      id: 'c_p3_1',
      projectId: 'p3',
      founderName: 'Alex Rivera',
      question: 'What was your biggest mistake?',
      answer:
        'Shipping too early. Our first architecture completely failed — and the postmortem became our strongest asset.',
    },
    {
      id: 'c_p3_2',
      projectId: 'p3',
      founderName: 'Alex Rivera',
      question: 'What keeps you building?',
      answer:
        'The day cross-chain feels invisible. Until then, every latency number is a promise.',
    },
  ],
  p4: [
    {
      id: 'c_p4_1',
      projectId: 'p4',
      founderName: 'Sophia Chen',
      question: 'What was your biggest mistake?',
      answer:
        'Building for platforms instead of fans. The unlock was portable ownership.',
    },
  ],
  p2: [
    {
      id: 'c_p2_1',
      projectId: 'p2',
      founderName: 'Elena Rostova',
      question: 'What was your biggest mistake?',
      answer:
        'Trusting shared-pool risk. Watching cascades wipe users is why AeroLend exists.',
    },
  ],
};

export type CollabStatus = 'open' | 'matched' | 'recommended';

export type CollabNeed = {
  role: string;
  status: CollabStatus;
  matchPct?: number;
  recommendedName?: string;
};

export const COLLAB_NEEDS: Record<string, CollabNeed[]> = {
  p1: [
    { role: 'Senior Rust Engineer', status: 'open' },
    { role: 'UI Designer', status: 'matched', matchPct: 82 },
    { role: 'Growth Partner', status: 'recommended', recommendedName: 'Laszlo', matchPct: 91 },
  ],
  p3: [
    { role: 'Protocol Engineer', status: 'open' },
    { role: 'Researcher', status: 'matched', matchPct: 88 },
    { role: 'Mentor', status: 'recommended', recommendedName: 'Priya Nair', matchPct: 79 },
  ],
  p4: [
    { role: 'Community Lead', status: 'open' },
    { role: 'UI Designer', status: 'matched', matchPct: 74 },
    { role: 'Growth Partner', status: 'recommended', recommendedName: 'Marcus Hale', matchPct: 86 },
  ],
  p2: [
    { role: 'Smart Contract Auditor', status: 'open' },
    { role: 'Researcher', status: 'matched', matchPct: 90 },
  ],
};

export type VelocityBars = {
  commits: number;
  releases: number;
  users: number;
  retention: number;
  liquidity: number;
};

export const PROJECT_VELOCITY: Record<string, VelocityBars> = {
  p1: { commits: 92, releases: 78, users: 88, retention: 81, liquidity: 74 },
  p2: { commits: 70, releases: 65, users: 72, retention: 84, liquidity: 80 },
  p3: { commits: 95, releases: 88, users: 76, retention: 79, liquidity: 68 },
  p4: { commits: 72, releases: 70, users: 90, retention: 86, liquidity: 71 },
};

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

export const BUILDER_GENOMES: Record<string, BuilderGenome> = {
  p1: {
    innovation: 97,
    execution: 90,
    community: 88,
    transparency: 93,
    risk: 28,
    momentum: 91,
    founderResilience: 86,
    category: 'Verifiable AI Pioneer',
  },
  p2: {
    innovation: 82,
    execution: 88,
    community: 85,
    transparency: 90,
    risk: 35,
    momentum: 74,
    founderResilience: 92,
    category: 'Risk Architecture Builder',
  },
  p3: {
    innovation: 94,
    execution: 91,
    community: 78,
    transparency: 96,
    risk: 32,
    momentum: 94,
    founderResilience: 89,
    category: 'Infrastructure Pioneer',
  },
  p4: {
    innovation: 88,
    execution: 84,
    community: 94,
    transparency: 87,
    risk: 30,
    momentum: 82,
    founderResilience: 80,
    category: 'Creator Economy Architect',
  },
};

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
