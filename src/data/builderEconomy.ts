import { resolveTradeMint } from './curatedTokens';
import { resolveBaseTradeAddress } from './crossChainRegistry';
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
  const tradeable =
    curated && Boolean(resolveTradeMint(project) || resolveBaseTradeAddress(project));
  const mainnet = /mainnet|revenue|launch/i.test(project.journey);
  const testnet = /testnet/i.test(project.journey);
  const users = project.upvotes >= 100;
  const users1k = project.upvotes >= 1000;
  const commits = project.githubRepo !== '—' && project.githubRepo.trim().length > 0;

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

/** Live shipping theater only — empty until GitHub / radar events exist. */
export const BUILDER_SIGNALS: Record<string, BuilderSignal[]> = {};

export function signalsFor(projectId: string): BuilderSignal[] {
  return BUILDER_SIGNALS[projectId] || [];
}

/** Build Feed — empty until events come from GitHub / radar (no staged theater). */
export const BUILD_FEED: BuildFeedItem[] = [];

/** Convictions start empty — the visitor writes their own. */
export const INITIAL_CONVICTIONS: Conviction[] = [];

export const CURRENT_SEASON: BuilderSeason = {
  id: 'none',
  name: 'No live season',
  theme: 'A Builder Season opens when we run a public vote with a published rule set.',
  applications: 0,
  accepted: 0,
  winnerName: '',
  winnerProjectId: '',
  closesInDays: 0,
  status: 'closed',
};

export const FIRST_DISCOVERY_COPY = {
  title: 'You made it.',
  lines: [
    'This is not another pump feed.',
    'You are entering the reputation layer — Proof of Building™ first.',
    'Pick one builder. Earn XP. Start your streak.',
  ],
  cta: 'Start First Discovery',
} as const;
