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

/** Builder Crystal Ball™ — spot winners before they are popular */
export const CRYSTAL_BALL_ALERTS: CrystalBallAlert[] = [
  {
    id: 'cb1',
    projectId: 'p3',
    projectName: 'HyperSphere',
    probability: 91,
    confidence: 'High',
    headline: 'Emerging Builder Alert',
    reasons: [
      'Rapid developer velocity',
      'Exceptional retention',
      'Healthy token distribution',
      'Community quality increasing',
    ],
  },
  {
    id: 'cb2',
    projectId: 'p1',
    projectName: 'SentientAI',
    probability: 88,
    confidence: 'High',
    headline: 'Rising AI Builder Signal',
    reasons: [
      'ZK sandbox shipping weekly',
      'Verified product usage compounding',
      'Founder reputation already Genesis-tier',
      'Scout consensus: quality before liquidity',
    ],
  },
  {
    id: 'cb3',
    projectId: 'p4',
    projectName: 'CreatorLink',
    probability: 76,
    confidence: 'Medium',
    headline: 'Early Discovery Window',
    reasons: [
      'Commit cadence above sector median',
      'Creator retention accelerating',
      'Open-source contributors joining',
    ],
  },
];

/** Live pulse keyed by project — feels like a heartbeat */
export const BUILDER_PULSE: Record<string, BuilderPulse> = {
  p1: {
    projectId: 'p1',
    lastCommit: '2 hours ago',
    lastDeploy: 'Yesterday',
    discordActivity: 'High',
    walletGrowthPct: 18,
    velocity: 'Accelerating',
    metrics: [
      { label: 'Last commit', value: '2 hours ago', tone: 'live' },
      { label: 'Deploy', value: 'Yesterday', tone: 'ok' },
      { label: 'Discord activity', value: 'High', tone: 'hot' },
      { label: 'New wallet growth', value: '+18%', tone: 'hot' },
      { label: 'Developer velocity', value: 'Accelerating', tone: 'live' },
    ],
  },
  p2: {
    projectId: 'p2',
    lastCommit: '5 hours ago',
    lastDeploy: '3 days ago',
    discordActivity: 'Medium',
    walletGrowthPct: 7,
    velocity: 'Steady',
    metrics: [
      { label: 'Last commit', value: '5 hours ago', tone: 'live' },
      { label: 'Deploy', value: '3 days ago', tone: 'ok' },
      { label: 'Discord activity', value: 'Medium', tone: 'ok' },
      { label: 'New wallet growth', value: '+7%', tone: 'ok' },
      { label: 'Developer velocity', value: 'Steady', tone: 'ok' },
    ],
  },
  p3: {
    projectId: 'p3',
    lastCommit: '47 minutes ago',
    lastDeploy: 'Today',
    discordActivity: 'Surging',
    walletGrowthPct: 24,
    velocity: 'Surging',
    metrics: [
      { label: 'Last commit', value: '47 minutes ago', tone: 'live' },
      { label: 'Deploy', value: 'Today', tone: 'hot' },
      { label: 'Discord activity', value: 'Surging', tone: 'hot' },
      { label: 'New wallet growth', value: '+24%', tone: 'hot' },
      { label: 'Developer velocity', value: 'Surging', tone: 'live' },
    ],
  },
  p4: {
    projectId: 'p4',
    lastCommit: '1 hour ago',
    lastDeploy: 'Yesterday',
    discordActivity: 'High',
    walletGrowthPct: 31,
    velocity: 'Accelerating',
    metrics: [
      { label: 'Last commit', value: '1 hour ago', tone: 'live' },
      { label: 'Deploy', value: 'Yesterday', tone: 'ok' },
      { label: 'Discord activity', value: 'High', tone: 'hot' },
      { label: 'New wallet growth', value: '+31%', tone: 'hot' },
      { label: 'Developer velocity', value: 'Accelerating', tone: 'live' },
    ],
  },
};

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

/** On-chain resumes — immutable career history (keyed by Builder.id) */
export const LEGACY_PASSPORTS: Record<string, LegacyPassport> = {
  b1: {
    builderId: 'b1',
    firstCommit: 'March 2025',
    peopleInspired: 12481,
    protocolsShipped: 3,
    openSourceHours: 1742,
    buildersMentored: 26,
    legacyRank: 'Genesis',
    career: [
      { year: 2025, title: 'Built first protocol', verified: true },
      { year: 2026, title: 'Reached 50,000 users', verified: true },
      { year: 2026, title: 'Builders DEX Verified', verified: true },
      { year: 2026, title: 'Mentoring next cohort', verified: true },
    ],
  },
  b2: {
    builderId: 'b2',
    firstCommit: 'November 2023',
    peopleInspired: 6400,
    protocolsShipped: 2,
    openSourceHours: 890,
    buildersMentored: 14,
    legacyRank: 'Core',
    career: [
      { year: 2023, title: 'Survived cascade liquidation — wrote the thesis', verified: true },
      { year: 2025, title: 'Shipped isolated risk markets', verified: true },
      { year: 2026, title: 'Double audit cleared', verified: true },
      { year: 2026, title: 'Entered Builder 100', verified: true },
    ],
  },
  b3: {
    builderId: 'b3',
    firstCommit: 'January 2024',
    peopleInspired: 8920,
    protocolsShipped: 2,
    openSourceHours: 1104,
    buildersMentored: 11,
    legacyRank: 'Core',
    career: [
      { year: 2024, title: 'Built first protocol', verified: true },
      { year: 2025, title: 'Public testnet v1', verified: true },
      { year: 2026, title: 'Reached 50,000 users on testnet', verified: true },
      { year: 2026, title: 'Mentored 18 builders', verified: true },
      { year: 2026, title: 'Open source contribution award', verified: true },
    ],
  },
  b4: {
    builderId: 'b4',
    firstCommit: 'August 2024',
    peopleInspired: 15600,
    protocolsShipped: 2,
    openSourceHours: 980,
    buildersMentored: 8,
    legacyRank: 'Rising',
    career: [
      { year: 2024, title: 'Creator memberships thesis published', verified: true },
      { year: 2025, title: 'First 10,000 fans on portable memberships', verified: true },
      { year: 2026, title: 'Completed fundraising with lock-ups', verified: true },
    ],
  },
};

/** Guest / user passport defaults when building their own legacy */
export const USER_LEGACY_DEFAULT: Omit<LegacyPassport, 'builderId'> = {
  firstCommit: 'July 2026',
  peopleInspired: 0,
  protocolsShipped: 0,
  openSourceHours: 12,
  buildersMentored: 0,
  legacyRank: 'Rookie',
  career: [
    { year: 2026, title: 'Joined Builders DEX', verified: true },
    { year: 2026, title: 'First Discovery completed', verified: false },
  ],
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

export const WEEKLY_AWARDS: WeeklyAward[] = [
  {
    id: 'wa1',
    title: 'Builder of the Week',
    winner: 'Alex Rivera',
    projectId: 'p3',
    note: 'Shipped Testnet v3 with public latency proofs.',
  },
  {
    id: 'wa2',
    title: 'Scout Call of the Week',
    winner: 'You (pending)',
    note: 'Submit a Scout mission before Friday lock.',
  },
  {
    id: 'wa3',
    title: 'Open Source Hours',
    winner: 'Satoshi Dev',
    projectId: 'p1',
    note: '+84 verified contribution hours this week.',
  },
];

export const ECOSYSTEM_ROLES = [
  { id: 'founder', label: 'Founders', count: 127 },
  { id: 'researcher', label: 'Researchers', count: 84 },
  { id: 'mentor', label: 'Mentors', count: 41 },
  { id: 'investor', label: 'Investors', count: 62 },
  { id: 'designer', label: 'Designers', count: 38 },
  { id: 'auditor', label: 'Auditors', count: 29 },
] as const;
