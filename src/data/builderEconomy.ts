import { Project } from '../types';

export type JourneyStepStatus = 'done' | 'current' | 'upcoming';

export type JourneyStep = {
  id: string;
  label: string;
  status: JourneyStepStatus;
};

export type BuilderSignalTone = 'green' | 'yellow' | 'red';

export type BuilderSignal = {
  id: string;
  tone: BuilderSignalTone;
  label: string;
};

export type BuildFeedItem = {
  id: string;
  when: string;
  projectId?: string;
  projectName: string;
  event: string;
};

export type ConvictionLevel = 1 | 2 | 3 | 4 | 5;

export type Conviction = {
  id: string;
  projectId: string;
  projectName: string;
  level: ConvictionLevel;
  label: 'Strong Conviction' | 'Medium' | 'Exploring';
  reason: string;
};

export type BuilderSeason = {
  id: string;
  name: string;
  theme: string;
  applications: number;
  accepted: number;
  winnerName: string;
  winnerProjectId: string;
  closesInDays: number;
  status: 'live' | 'closed';
};

/** Derive a living Builder Journey™ from project fields */
export function journeyFor(project: Project): JourneyStep[] {
  const journey = project.journey.toLowerCase();
  const curated = project.curation.status === 'curated';
  const tradeable = Boolean(project.mint) && curated;
  const mainnet = /mainnet|revenue|launch/i.test(project.journey);
  const testnet = /testnet/i.test(project.journey) || (!mainnet && curated);
  const users = project.upvotes >= 100 || curated;
  const users1k = project.upvotes >= 250 || (curated && project.builderScore.community >= 88);
  const commits = project.githubActivity > 0 && project.githubRepo !== '—';

  const mark = (done: boolean, current: boolean): JourneyStepStatus =>
    done ? 'done' : current ? 'current' : 'upcoming';

  const steps: { id: string; label: string; done: boolean }[] = [
    { id: 'idea', label: 'Idea', done: true },
    { id: 'commit', label: 'First Commit', done: commits },
    { id: 'testnet', label: 'First Testnet', done: testnet || mainnet },
    { id: 'users100', label: '100 Users', done: users },
    { id: 'users1k', label: '1,000 Users', done: users1k },
    { id: 'mainnet', label: 'Mainnet', done: mainnet },
    { id: 'verified', label: 'Builders DEX Verified', done: curated },
    { id: 'tradeable', label: 'Tradeable', done: tradeable },
  ];

  let foundCurrent = false;
  return steps.map((s) => {
    if (s.done) return { id: s.id, label: s.label, status: 'done' as const };
    if (!foundCurrent) {
      foundCurrent = true;
      return { id: s.id, label: s.label, status: 'current' as const };
    }
    return { id: s.id, label: s.label, status: 'upcoming' as const };
  });
}

export const BUILDER_SIGNALS: Record<string, BuilderSignal[]> = {
  p1: [
    { id: 's1', tone: 'green', label: 'Hiring engineers' },
    { id: 's2', tone: 'green', label: 'Shipping weekly' },
    { id: 's3', tone: 'green', label: 'Community accelerating' },
    { id: 's4', tone: 'green', label: 'Mainnet next month' },
    { id: 's5', tone: 'yellow', label: 'New tokenomics proposal' },
  ],
  p2: [
    { id: 's1', tone: 'green', label: 'Shipping weekly' },
    { id: 's2', tone: 'yellow', label: 'Liquidity design review' },
    { id: 's3', tone: 'green', label: 'Founder AMA tomorrow' },
  ],
  p3: [
    { id: 's1', tone: 'green', label: 'Community accelerating' },
    { id: 's2', tone: 'green', label: 'Testnet v3 live' },
    { id: 's3', tone: 'yellow', label: 'Audit in progress' },
  ],
  p4: [
    { id: 's1', tone: 'green', label: 'Reached growth milestone' },
    { id: 's2', tone: 'green', label: 'Shipping weekly' },
    { id: 's3', tone: 'yellow', label: 'Creator economy season focus' },
  ],
};

export function signalsFor(projectId: string): BuilderSignal[] {
  return (
    BUILDER_SIGNALS[projectId] || [
      { id: 'd1', tone: 'green', label: 'Building in public' },
      { id: 'd2', tone: 'yellow', label: 'Awaiting next signal' },
    ]
  );
}

export const BUILD_FEED: BuildFeedItem[] = [
  {
    id: 'f1',
    when: '14 minutes ago',
    projectId: 'p1',
    projectName: 'SentientAI',
    event: 'Merged 12 pull requests',
  },
  {
    id: 'f2',
    when: '2 hours ago',
    projectId: 'p4',
    projectName: 'CreatorLink',
    event: 'Reached 100,000 users',
  },
  {
    id: 'f3',
    when: 'Yesterday',
    projectId: 'p3',
    projectName: 'HyperSphere',
    event: 'Released Testnet v3',
  },
  {
    id: 'f4',
    when: 'Today',
    projectName: 'Nova Relay',
    event: 'Passed Builder Review',
  },
  {
    id: 'f5',
    when: 'Today',
    projectId: 'p2',
    projectName: 'AeroLend',
    event: 'Published founder AMA notes',
  },
];

export const INITIAL_CONVICTIONS: Conviction[] = [
  {
    id: 'c1',
    projectId: 'p1',
    projectName: 'SentientAI',
    level: 5,
    label: 'Strong Conviction',
    reason: 'Founder execution.',
  },
  {
    id: 'c2',
    projectId: 'p4',
    projectName: 'CreatorLink',
    level: 3,
    label: 'Medium',
    reason: 'Growing quickly.',
  },
];

export const CURRENT_SEASON: BuilderSeason = {
  id: 'spring-2026',
  name: 'SPRING 2026',
  theme: 'The AI Builder Season',
  applications: 1283,
  accepted: 41,
  winnerName: 'SentientAI',
  winnerProjectId: 'p1',
  closesInDays: 18,
  status: 'live',
};

export const FIRST_DISCOVERY_COPY = {
  title: 'Welcome.',
  lines: [
    'You are not here to chase pumps.',
    'You are here to discover builders before the world does.',
    "Let's find your first builder.",
  ],
  cta: 'Start First Discovery',
} as const;
