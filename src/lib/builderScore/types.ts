import type { BuilderScore, BuilderScoreDimension } from '../../types';
import { SCORE_VERSION } from './methodology';

export type CitationStatus = 'live' | 'derived' | 'missing' | 'provisional';

export type ScoreCitation = {
  id: string;
  dimension: BuilderScoreDimension | 'overall';
  label: string;
  detail: string;
  url?: string;
  status: CitationStatus;
};

export type GithubRepoSignals = {
  fullName: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  sizeKb: number;
  language: string | null;
  topics: string[];
  createdAt: string;
  pushedAt: string;
  archived: boolean;
  license: string | null;
};

export type ProjectScoreInputs = {
  projectId: string;
  name: string;
  githubRepo: string;
  githubActivity: number;
  upvotes: number;
  journey: string;
  category: string;
  curationStatus: 'pending' | 'reviewed' | 'curated' | 'rejected';
  builderVerified: boolean;
  teamSize: number;
  hasWebsite: boolean;
  hasTwitter: boolean;
  hasDiscord: boolean;
  hasTelegram: boolean;
  roadmapCompleted: number;
  roadmapTotal: number;
  hasMint: boolean;
  liquidityLocked: boolean;
  marketCapLabel?: string;
  rejectionReasons?: string[];
};

export type LiveBuilderScoreResult = {
  version: typeof SCORE_VERSION | string;
  computedAt: string;
  projectId: string;
  name: string;
  githubRepo: string | null;
  score: BuilderScore;
  mode: 'live' | 'partial' | 'provisional';
  citations: ScoreCitation[];
  github: GithubRepoSignals | null;
  cacheTtlSec: number;
};
