import { ProofOfBuilding, Project } from '../types';

export type AccessTier = {
  featured: boolean;
  launchpad: boolean;
  investorVisibility: boolean;
  communityCampaigns: boolean;
  speakingOpportunities: boolean;
  verifiedBuilderBadge: boolean;
};

export type ScoutAccessTiers = {
  earlyDiscoveryRooms: boolean;
  privateResearchCalls: boolean;
  betaAccess: boolean;
  governanceVoting: boolean;
};

export type ReputationChip = {
  id: string;
  label: string;
  tone: 'priority' | 'ok' | 'cooling' | 'risk';
};

export const BUILDER_SCORE_UNLOCK = 90;
/** Premium unlocks at 95+ — VC / speaking / verified badge */
export const BUILDER_SCORE_PREMIUM = 95;
export const SCOUT_SCORE_UNLOCK = 90;

export function builderAccessFromScore(overall: number): AccessTier {
  const unlocked = overall >= BUILDER_SCORE_UNLOCK;
  const premium = overall >= BUILDER_SCORE_PREMIUM;
  return {
    featured: unlocked,
    launchpad: unlocked,
    investorVisibility: premium || unlocked,
    communityCampaigns: unlocked,
    speakingOpportunities: premium,
    verifiedBuilderBadge: premium,
  };
}

export function scoutAccessFromScore(scoutReputation: number): ScoutAccessTiers {
  const unlocked = scoutReputation >= SCOUT_SCORE_UNLOCK;
  return {
    earlyDiscoveryRooms: unlocked,
    privateResearchCalls: unlocked,
    betaAccess: unlocked,
    governanceVoting: unlocked,
  };
}

export function builderUnlockLabels(access: AccessTier): { label: string; unlocked: boolean }[] {
  return [
    { label: 'Featured homepage', unlocked: access.featured },
    { label: 'VC / investor visibility', unlocked: access.investorVisibility },
    { label: 'Accelerator invitation', unlocked: access.launchpad },
    { label: 'Speaking opportunities', unlocked: access.speakingOpportunities },
    { label: 'Verified Builder badge', unlocked: access.verifiedBuilderBadge },
    { label: 'Community campaigns', unlocked: access.communityCampaigns },
  ];
}

export function scoutUnlockLabels(
  access: ScoutAccessTiers
): { label: string; unlocked: boolean }[] {
  return [
    { label: 'Early access to projects', unlocked: access.earlyDiscoveryRooms },
    { label: 'Private research rooms', unlocked: access.privateResearchCalls },
    { label: 'Governance voting power', unlocked: access.governanceVoting },
    { label: 'Beta access', unlocked: access.betaAccess },
  ];
}

/** Soft listing health from Proof of Building freshness + strength */
export function reputationChipFor(
  project: Project,
  proof: ProofOfBuilding
): ReputationChip {
  const verified = proof.items.filter((i) => i.verified).length;
  const avgStrength =
    proof.items.reduce((s, i) => s + (i.strength ?? (i.verified ? 4 : 0)), 0) /
    Math.max(proof.items.length, 1);
  const cold =
    /week|day|days/i.test(proof.lastVerified) &&
    !/minute|hour/i.test(proof.lastVerified);

  if (project.curation.status === 'rejected') {
    return { id: 'rejected', label: 'Rejected', tone: 'risk' };
  }
  if (verified <= 2 || avgStrength < 1.5) {
    return { id: 'risk', label: 'At risk', tone: 'risk' };
  }
  if (cold || avgStrength < 3) {
    return { id: 'cooling', label: 'Cooling', tone: 'cooling' };
  }
  if (project.builderScore.overall >= BUILDER_SCORE_UNLOCK) {
    return { id: 'priority', label: 'Priority', tone: 'priority' };
  }
  return { id: 'ok', label: 'Verified', tone: 'ok' };
}

export function chipClass(tone: ReputationChip['tone']): string {
  switch (tone) {
    case 'priority':
      return 'border-accent/40 bg-accent/15 text-accent';
    case 'ok':
      return 'border-white/15 bg-white/[0.06] text-white/80';
    case 'cooling':
      return 'border-white/20 bg-white/[0.04] text-white/70';
    case 'risk':
      return 'border-white/25 bg-white/[0.06] text-steel';
    default: {
      const _exhaustive: never = tone;
      return _exhaustive;
    }
  }
}
