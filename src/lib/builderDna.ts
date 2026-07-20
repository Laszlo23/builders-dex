import { BuilderDNA, BuilderScore, BuilderTypeLabel, Project } from '../types';

/** Map Builder Score™ → Builder DNA™ identity */
export function dnaFromScore(score: BuilderScore, project?: Project): BuilderDNA {
  const engineering = Math.round((score.development + score.productProgress) / 2);
  const vision = score.innovation;
  const execution = Math.round((score.productProgress + score.development + score.liquidityHealth) / 3);
  const community = score.community;
  const transparency = score.transparency;

  const dims: { key: BuilderTypeLabel; value: number }[] = [
    { key: 'The Engineer', value: engineering },
    { key: 'The Visionary', value: vision },
    { key: 'The Operator', value: execution },
    { key: 'The Community Architect', value: community },
    { key: 'The Researcher', value: Math.round((transparency + vision) / 2) },
  ];
  dims.sort((a, b) => b.value - a.value);
  const top = dims[0];
  const builderType: BuilderTypeLabel =
    score.overall < 55 ? 'Emerging Builder' : top.key;

  const strengthByType: Record<BuilderTypeLabel, string> = {
    'The Engineer': 'Shipping products',
    'The Visionary': 'Category-defining ideas',
    'The Operator': 'Execution under pressure',
    'The Community Architect': 'Growing trusted communities',
    'The Researcher': 'Verifiable depth',
    'Emerging Builder': 'Early momentum',
  };

  const riskByType: Record<BuilderTypeLabel, string> = {
    'The Engineer': 'Early adoption',
    'The Visionary': 'Execution lag',
    'The Operator': 'Narrative catch-up',
    'The Community Architect': 'Product depth',
    'The Researcher': 'Go-to-market speed',
    'Emerging Builder': 'Unproven track record',
  };

  // Light project-aware overrides
  let strength = strengthByType[builderType];
  let risk = riskByType[builderType];
  if (project?.category === 'AI + Web3' && builderType === 'The Engineer') {
    strength = 'Verifiable ML systems';
    risk = 'Hardware synchronization';
  }
  if (project?.journey?.includes('Testnet') && !project.journey.includes('Mainnet')) {
    risk = 'Pre-mainnet adoption';
  }

  return {
    engineering,
    vision,
    execution,
    community,
    transparency,
    builderType,
    strength,
    risk,
  };
}
