/**
 * Platform depth — transparent scores, graph, used-by, reality, Netflix, milestones, council.
 * People-first: Passport identity over tokens.
 */

import type { Project } from '../types';

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

/** Score transparency copy — empty; UI derives from live score only. */
export const SCORE_TRANSPARENCY: Record<string, ScoreTransparency> = {};

/** Public dependents — only cite when we have a real source; empty until verified. */
export const USED_BY: Record<string, UsedByBlock> = {};

export const PROJECT_REALITY: Record<string, ProjectReality> = {};

/** Recorded founder videos — empty until we publish an episode. Catalog briefs are separate. */
export const FOUNDER_EPISODES: FounderEpisode[] = [];

/** Real catalog narratives — not invented trailers. */
export function catalogStoryBriefs(projects: Project[]): FounderEpisode[] {
  return projects
    .filter((p) => Boolean(p.builderStory?.trim()) && p.curation.status !== 'rejected')
    .map((p) => {
      const lead = p.team[0];
      return {
        id: `brief-${p.id}`,
        founderName: lead?.name ?? p.name,
        projectId: p.id,
        projectName: p.name,
        avatarUrl: lead?.avatarUrl || '/brand-mark.webp',
        duration: 'Catalog brief',
        question: p.tagline,
        teaser: p.builderStory,
        coverImage: p.coverImage || '/campaign/hook-stories.webp',
      };
    });
}

/** Dual conviction % — empty until real community + AI votes exist. */
export const DUAL_CONVICTION: Record<string, DualConviction> = {};

export const MILESTONE_CATALOG: { key: MilestoneKey; label: string }[] = [
  { key: 'first_100_users', label: 'First 100 users' },
  { key: 'first_mainnet', label: 'First Mainnet' },
  { key: 'first_revenue', label: 'First Revenue' },
  { key: 'first_audit', label: 'First Audit' },
  { key: 'one_m_tx', label: '1M Transactions' },
  { key: 'first_enterprise', label: 'First Enterprise Customer' },
];

export const PROJECT_MILESTONES: Record<string, MilestoneKey[]> = {};

export const EDUCATIONAL_REVIEWS: Record<string, EducationalReview> = {};

export const BUILDER_GRAPH: { nodes: GraphNode[]; edges: GraphEdge[] } = {
  nodes: [
    { id: 'b_gg', label: 'Georgi Gerganov', kind: 'builder', meta: 'Genesis', builderId: 'b1' },
    { id: 'p_llama', label: 'llama.cpp', kind: 'project', meta: 'AI + Web3', projectId: 'p1' },
    { id: 'c1', label: 'ggml contributors', kind: 'contributor', meta: 'Active' },
    { id: 'oss1', label: 'ggml / llama.cpp', kind: 'opensource', meta: 'Public repos' },
    { id: 'b_wh', label: 'Wormhole Foundation', kind: 'builder', meta: 'Genesis', builderId: 'b3' },
    { id: 'p_wh', label: 'Wormhole', kind: 'project', meta: 'Infrastructure', projectId: 'p3' },
    { id: 'c2', label: 'Core maintainers', kind: 'contributor' },
    { id: 'oss2', label: 'wormhole monorepo', kind: 'opensource' },
    { id: 'b_mp', label: 'Metaplex Foundation', kind: 'builder', meta: 'Genesis', builderId: 'b4' },
    { id: 'p_mp', label: 'Metaplex', kind: 'project', meta: 'Creator infra', projectId: 'p4' },
    { id: 'oss3', label: 'Token Metadata', kind: 'opensource' },
  ],
  edges: [
    { from: 'b_gg', to: 'p_llama' },
    { from: 'p_llama', to: 'c1' },
    { from: 'p_llama', to: 'oss1' },
    { from: 'b_wh', to: 'p_wh' },
    { from: 'p_wh', to: 'c2' },
    { from: 'p_wh', to: 'oss2' },
    { from: 'b_mp', to: 'p_mp' },
    { from: 'p_mp', to: 'oss3' },
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
      lastRecalculated: 'Live',
      why: [
        {
          polarity: '+',
          text: 'Builder Score™ from public GitHub signals — open the repo to verify',
        },
      ],
    }
  );
}

export function episodesFor(projectId: string, project?: Project): FounderEpisode[] {
  const mine = FOUNDER_EPISODES.filter((e) => e.projectId === projectId);
  if (mine.length > 0) return mine;
  if (project?.builderStory) return catalogStoryBriefs([project]);
  return [];
}

export function educationalReviewFor(projectId: string): EducationalReview | null {
  return EDUCATIONAL_REVIEWS[projectId] ?? null;
}
