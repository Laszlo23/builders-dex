import { BuilderScore, BuilderScoreDimension, PassportLevel, ProjectAIAnalysis } from '../types';

export const SCORE_DIMENSIONS: { key: BuilderScoreDimension; label: string }[] = [
  { key: 'development', label: 'Development' },
  { key: 'innovation', label: 'Innovation' },
  { key: 'community', label: 'Community' },
  { key: 'transparency', label: 'Transparency' },
  { key: 'productProgress', label: 'Product Progress' },
  { key: 'builderReputation', label: 'Builder Reputation' },
  { key: 'liquidityHealth', label: 'Liquidity Health' },
];

const WEIGHTS: Record<BuilderScoreDimension, number> = {
  development: 0.18,
  innovation: 0.16,
  community: 0.14,
  transparency: 0.12,
  productProgress: 0.14,
  builderReputation: 0.14,
  liquidityHealth: 0.12,
};

export function computeOverallScore(dims: Omit<BuilderScore, 'overall'>): number {
  const total = SCORE_DIMENSIONS.reduce(
    (sum, d) => sum + dims[d.key] * WEIGHTS[d.key],
    0
  );
  return Math.round(Math.min(100, Math.max(0, total)));
}

export function makeBuilderScore(partial: Omit<BuilderScore, 'overall'>): BuilderScore {
  return {
    ...partial,
    overall: computeOverallScore(partial),
  };
}

/** Map legacy AI analysis into a draft Builder Score™ */
export function scoreFromAiAnalysis(ai: ProjectAIAnalysis): BuilderScore {
  const riskInverted = Math.max(0, 100 - ai.risk);
  return makeBuilderScore({
    development: ai.quality,
    innovation: ai.innovation,
    community: Math.round((ai.market + ai.quality) / 2),
    transparency: Math.round((ai.quality + riskInverted) / 2),
    productProgress: Math.round((ai.quality + ai.market) / 2),
    builderReputation: Math.round((ai.quality + ai.innovation) / 2),
    liquidityHealth: riskInverted,
  });
}

export function getPassportLevel(xp: number): PassportLevel {
  if (xp >= 5000) return 'Genesis Builder';
  if (xp >= 3500) return 'Visionary';
  if (xp >= 2000) return 'Core Builder';
  if (xp >= 1000) return 'Builder';
  return 'Rookie Builder';
}

export function topScoreDimensions(
  score: BuilderScore,
  count = 3
): { key: BuilderScoreDimension; label: string; value: number }[] {
  return SCORE_DIMENSIONS.map((d) => ({ ...d, value: score[d.key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

export function scoreBarWidth(value: number): string {
  return `${Math.min(100, Math.max(0, value))}%`;
}
