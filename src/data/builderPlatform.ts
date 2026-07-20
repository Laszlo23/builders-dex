/**
 * Platform depth — transparent scores, graph, used-by, reality, Netflix, milestones, council.
 * People-first: Passport identity over tokens.
 */

export type ScoreSignal = { polarity: '+' | '-'; text: string };

export type ScoreTransparency = {
  projectId: string;
  overall: number;
  why: ScoreSignal[];
  lastRecalculated: string;
};

export type GraphNodeKind =
  | 'builder'
  | 'project'
  | 'contributor'
  | 'auditor'
  | 'investor'
  | 'opensource'
  | 'protocol';

export type GraphNode = {
  id: string;
  label: string;
  kind: GraphNodeKind;
  meta?: string;
  projectId?: string;
  builderId?: string;
};

export type GraphEdge = { from: string; to: string };

export type UsedByBlock = {
  names: string[];
  buildersCount: number;
  dependentProjects: number;
};

export type ProjectReality = {
  challenge: string;
  nextMilestone: string;
  needs: string[];
};

export type FounderEpisode = {
  id: string;
  founderName: string;
  projectId: string;
  projectName: string;
  avatarUrl: string;
  duration: string;
  question: string;
  teaser: string;
  /** Placeholder — UI plays as story card until real video */
  coverImage: string;
};

export type DualConviction = {
  communityPct: number;
  aiPct: number;
};

export type MilestoneKey =
  | 'first_100_users'
  | 'first_mainnet'
  | 'first_revenue'
  | 'first_audit'
  | 'one_m_tx'
  | 'first_enterprise';

export type BuilderMilestone = {
  key: MilestoneKey;
  label: string;
  unlocked: boolean;
};

export type EducationalReview = {
  score: number;
  improve: string[];
  estimatedDays: number;
};

export type CouncilRole = {
  id: string;
  title: string;
  requirement: string;
  description: string;
};

export const SCORE_TRANSPARENCY: Record<string, ScoreTransparency> = {
  p1: {
    projectId: 'p1',
    overall: 92,
    lastRecalculated: '12 minutes ago',
    why: [
      { polarity: '+', text: 'GitHub commits increased 34% this month' },
      { polarity: '+', text: 'Weekly releases for 18 weeks' },
      { polarity: '+', text: 'TVL growing steadily' },
      { polarity: '+', text: '14 contributors' },
      { polarity: '-', text: 'Documentation incomplete' },
    ],
  },
  p2: {
    projectId: 'p2',
    overall: 89,
    lastRecalculated: '28 minutes ago',
    why: [
      { polarity: '+', text: 'Double audit cleared' },
      { polarity: '+', text: 'Isolated risk markets shipping' },
      { polarity: '+', text: 'Founder postmortem published' },
      { polarity: '-', text: 'TVL still early' },
    ],
  },
  p3: {
    projectId: 'p3',
    overall: 87,
    lastRecalculated: '8 minutes ago',
    why: [
      { polarity: '+', text: 'Testnet latency improving weekly' },
      { polarity: '+', text: 'Public postmortems' },
      { polarity: '+', text: '12 active contributors' },
      { polarity: '-', text: 'Mainnet not yet live' },
    ],
  },
  p4: {
    projectId: 'p4',
    overall: 91,
    lastRecalculated: '41 minutes ago',
    why: [
      { polarity: '+', text: 'Creator retention accelerating' },
      { polarity: '+', text: 'Fundraising with lock-ups complete' },
      { polarity: '+', text: 'Open-source SDKs adopted' },
      { polarity: '-', text: 'Enterprise pipeline thin' },
    ],
  },
};

export const USED_BY: Record<string, UsedByBlock> = {
  p1: {
    names: ['Helius', 'Jupiter', 'Drift'],
    buildersCount: 84,
    dependentProjects: 42,
  },
  p3: {
    names: ['Jito', 'Tensor', 'Phantom'],
    buildersCount: 61,
    dependentProjects: 28,
  },
  p4: {
    names: ['Magic Eden', 'Crossmint'],
    buildersCount: 47,
    dependentProjects: 19,
  },
  p2: {
    names: ['Kamino', 'Marginfi'],
    buildersCount: 33,
    dependentProjects: 15,
  },
};

export const PROJECT_REALITY: Record<string, ProjectReality> = {
  p1: {
    challenge: 'Scaling validator / inference costs',
    nextMilestone: 'Hardware incentive mainnet — Q4',
    needs: ['Rust Engineer', 'Protocol Designer'],
  },
  p2: {
    challenge: 'Bootstrapping isolated market liquidity',
    nextMilestone: 'First $10M TVL across risk tiers',
    needs: ['Smart Contract Auditor', 'Growth Partner'],
  },
  p3: {
    challenge: 'Light-client sync under adversarial load',
    nextMilestone: 'Mainnet Q4',
    needs: ['Rust Engineer', 'Protocol Designer', 'Researcher'],
  },
  p4: {
    challenge: 'Portable membership UX across wallets',
    nextMilestone: '100k creators on portable passes',
    needs: ['UI Designer', 'Community Lead'],
  },
};

export const FOUNDER_EPISODES: FounderEpisode[] = [
  {
    id: 'ep1',
    founderName: 'Alex Rivera',
    projectId: 'p3',
    projectName: 'HyperSphere',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    duration: '2:04',
    question: 'What almost made you quit?',
    teaser: 'Our first architecture completely failed — and the postmortem became the product.',
    coverImage: '/projects/hypersphere.jpg',
  },
  {
    id: 'ep2',
    founderName: 'Satoshi Dev',
    projectId: 'p1',
    projectName: 'SentientAI',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    duration: '1:58',
    question: 'Why did you build this?',
    teaser: 'Inference should be as auditable as a blockchain transaction.',
    coverImage: '/projects/sentient.jpg',
  },
  {
    id: 'ep3',
    founderName: 'Sophia Chen',
    projectId: 'p4',
    projectName: 'CreatorLink',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    duration: '2:11',
    question: 'Biggest mistake?',
    teaser: 'Building for platforms instead of fans. Portable ownership was the unlock.',
    coverImage: '/projects/creatorlink.jpg',
  },
  {
    id: 'ep4',
    founderName: 'Elena Rostova',
    projectId: 'p2',
    projectName: 'AeroLend',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    duration: '2:07',
    question: 'What are you building next?',
    teaser: 'Risk that cannot cascade — modular markets for the next decade.',
    coverImage: '/projects/aerolend.jpg',
  },
];

export const DUAL_CONVICTION: Record<string, DualConviction> = {
  p1: { communityPct: 92, aiPct: 89 },
  p2: { communityPct: 86, aiPct: 88 },
  p3: { communityPct: 91, aiPct: 87 },
  p4: { communityPct: 94, aiPct: 90 },
};

export const MILESTONE_CATALOG: { key: MilestoneKey; label: string }[] = [
  { key: 'first_100_users', label: 'First 100 users' },
  { key: 'first_mainnet', label: 'First Mainnet' },
  { key: 'first_revenue', label: 'First Revenue' },
  { key: 'first_audit', label: 'First Audit' },
  { key: 'one_m_tx', label: '1M Transactions' },
  { key: 'first_enterprise', label: 'First Enterprise Customer' },
];

export const PROJECT_MILESTONES: Record<string, MilestoneKey[]> = {
  p1: ['first_100_users', 'first_mainnet', 'first_audit', 'one_m_tx'],
  p2: ['first_100_users', 'first_audit'],
  p3: ['first_100_users', 'first_audit'],
  p4: ['first_100_users', 'first_revenue', 'first_audit'],
};

export const EDUCATIONAL_REVIEWS: Record<string, EducationalReview> = {
  p5: {
    score: 64,
    improve: ['Ship documentation', 'Publish roadmap', 'Increase code activity'],
    estimatedDays: 14,
  },
  p6: {
    score: 58,
    improve: ['Reveal team identity', 'Show product usage', 'Open a public repo'],
    estimatedDays: 21,
  },
};

export const BUILDER_GRAPH: { nodes: GraphNode[]; edges: GraphEdge[] } = {
  nodes: [
    { id: 'b_alex', label: 'Alex Rivera', kind: 'builder', meta: 'Core Builder', builderId: 'b3' },
    { id: 'p_hyper', label: 'HyperSphere', kind: 'project', meta: 'Infrastructure', projectId: 'p3' },
    { id: 'c1', label: '12 contributors', kind: 'contributor', meta: 'Active' },
    { id: 'a1', label: 'OtterSec', kind: 'auditor', meta: 'Audit in progress' },
    { id: 'i1', label: 'Early funds', kind: 'investor', meta: 'Scout watchlist' },
    { id: 'oss1', label: 'Light-client repos', kind: 'opensource', meta: '1,104 OSS hours' },
    { id: 'proto1', label: '14 chains (roadmap)', kind: 'protocol', meta: 'Consumers' },
    { id: 'b_sat', label: 'Satoshi Dev', kind: 'builder', meta: 'Genesis', builderId: 'b1' },
    { id: 'p_sent', label: 'SentientAI', kind: 'project', meta: 'AI + Web3', projectId: 'p1' },
    { id: 'c2', label: '14 contributors', kind: 'contributor' },
    { id: 'a2', label: 'Double audit', kind: 'auditor', meta: 'Scheduled' },
    { id: 'i2', label: 'Builder Network', kind: 'investor' },
    { id: 'oss2', label: 'ZK sandbox', kind: 'opensource' },
    { id: 'proto2', label: 'Helius · Jupiter · Drift', kind: 'protocol', meta: 'Used by' },
  ],
  edges: [
    { from: 'b_alex', to: 'p_hyper' },
    { from: 'p_hyper', to: 'c1' },
    { from: 'p_hyper', to: 'a1' },
    { from: 'p_hyper', to: 'i1' },
    { from: 'p_hyper', to: 'oss1' },
    { from: 'oss1', to: 'proto1' },
    { from: 'b_sat', to: 'p_sent' },
    { from: 'p_sent', to: 'c2' },
    { from: 'p_sent', to: 'a2' },
    { from: 'p_sent', to: 'i2' },
    { from: 'p_sent', to: 'oss2' },
    { from: 'oss2', to: 'proto2' },
  ],
};

export const COUNCIL_ROLES: CouncilRole[] = [
  {
    id: 'mentor',
    title: 'Mentor new builders',
    requirement: 'Top 25 · Genesis or Visionary',
    description: 'Guide Rookie Builders through First Discovery and Scout missions.',
  },
  {
    id: 'judge',
    title: 'Judge Builder Seasons',
    requirement: 'Hall of Fame · Season invite',
    description: 'Score season contenders on Proof of Building™ — not hype.',
  },
  {
    id: 'curate',
    title: 'Curate new applicants',
    requirement: 'Scout Reputation 90+',
    description: 'Review applications before they hit Genesis Radar™.',
  },
  {
    id: 'ama',
    title: 'Host founder AMAs',
    requirement: 'Featured builder',
    description: 'Live Builder Conversations™ for the network.',
  },
  {
    id: 'master',
    title: 'Master Builder status',
    requirement: '#1–10 sustained 90 days',
    description: 'Invitation-only recognition beyond the wall.',
  },
  {
    id: 'council',
    title: 'Builder Council',
    requirement: 'Master Builder · invite',
    description: 'Set the standard. Shape seasons, rejection education, and API schema.',
  },
];

export function milestonesFor(projectId: string): BuilderMilestone[] {
  const unlocked = new Set(PROJECT_MILESTONES[projectId] || []);
  return MILESTONE_CATALOG.map((m) => ({
    ...m,
    unlocked: unlocked.has(m.key),
  }));
}

export function scoreTransparencyFor(
  projectId: string,
  overall: number
): ScoreTransparency {
  return (
    SCORE_TRANSPARENCY[projectId] || {
      projectId,
      overall,
      lastRecalculated: 'Just now',
      why: [
        { polarity: '+', text: 'Builder Score™ dimensions recalculated from live signals' },
        { polarity: '-', text: 'Limited public proof — add documentation' },
      ],
    }
  );
}

export function episodesFor(projectId: string): typeof FOUNDER_EPISODES {
  const mine = FOUNDER_EPISODES.filter((e) => e.projectId === projectId);
  return mine.length > 0 ? mine : FOUNDER_EPISODES.slice(0, 2);
}

export function educationalReviewFor(projectId: string): EducationalReview {
  return (
    EDUCATIONAL_REVIEWS[projectId] || {
      score: 64,
      improve: ['Ship documentation', 'Publish roadmap', 'Increase code activity'],
      estimatedDays: 14,
    }
  );
}
