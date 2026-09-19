import type { Builder, OpenSourceImpact, PassportLevel } from '../types';
import type { LiveBuilderScoreResult } from './builderScore';
import { INITIAL_BUILDERS } from '../data/projects';

export function levelFromOverall(n: number): PassportLevel {
  if (n >= 90) return 'Genesis Builder';
  if (n >= 80) return 'Visionary';
  if (n >= 70) return 'Core Builder';
  if (n >= 50) return 'Builder';
  return 'Rookie Builder';
}

function impactFromScore(n: number): OpenSourceImpact {
  if (n >= 90) return 'Exceptional';
  if (n >= 75) return 'High';
  if (n >= 50) return 'Medium';
  return 'Low';
}

export function applyLiveScoreToBuilder(
  builder: Builder,
  live: LiveBuilderScoreResult | null | undefined,
): Builder {
  if (!live) {
    return { ...builder, scoreMode: builder.scoreMode || 'seed' };
  }
  const overall = live.score.overall;
  return {
    ...builder,
    builderScore: overall,
    reputationLevel: levelFromOverall(overall),
    level: Math.max(1, Math.min(5, Math.round(overall / 20) || 1)),
    communityTrust: live.score.community,
    codeContribution: live.score.development,
    communityImpact: live.score.community,
    securityReputation: live.score.transparency,
    followers: live.github?.stars ?? builder.followers,
    contributionsCount: live.github?.forks ?? builder.contributionsCount,
    openSourceImpact: impactFromScore(overall),
    scoreMode: live.mode,
    githubRepo: live.githubRepo || builder.githubRepo,
    scoreComputedAt: live.computedAt,
  };
}

export function mergeCatalogWithLiveScores(
  scores: LiveBuilderScoreResult[],
  catalog: Builder[] = INITIAL_BUILDERS,
): Builder[] {
  const byProject = new Map(scores.map((s) => [s.projectId, s]));
  return catalog.map((builder) => {
    const projectId = builder.projectsCreated[0];
    return applyLiveScoreToBuilder(builder, projectId ? byProject.get(projectId) : null);
  });
}
