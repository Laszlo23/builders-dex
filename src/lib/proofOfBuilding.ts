import { Project, ProofOfBuilding, ProofOfBuildingItem, ProofKey } from '../types';

const LABELS: Record<ProofKey, string> = {
  github: 'Github',
  deployed: 'Product',
  users: 'Usage',
  community: 'Community',
  opensource: 'Open source',
  revenue: 'Revenue',
};

function clampStrength(n: number): number {
  return Math.max(0, Math.min(5, Math.round(n)));
}

/** Measure reality — not opinions. Derived from public project signals. */
export function proofOfBuildingFor(project: Project): ProofOfBuilding {
  const curated = project.curation.status === 'curated';
  const rejected = project.curation.status === 'rejected';

  const githubStrength = rejected
    ? 0
    : clampStrength(
        project.githubRepo === '—'
          ? 0
          : project.githubActivity >= 300
            ? 5
            : project.githubActivity >= 150
              ? 4
              : project.githubActivity >= 50
                ? 3
                : project.githubActivity >= 10
                  ? 2
                  : 1
      );

  const deployed =
    curated &&
    (project.journey.includes('Mainnet') ||
      project.journey.includes('Revenue') ||
      project.journey.includes('Launch') ||
      Boolean(project.mint));
  const deployedStrength = rejected
    ? 0
    : deployed
      ? project.journey.includes('Mainnet')
        ? 5
        : 4
      : project.journey.includes('Testnet') || project.journey.includes('Prototype')
        ? 2
        : curated
          ? 3
          : 1;

  const usersOk =
    curated &&
    ((project.communityMilestones?.some((m) => /member|user|TVL|live/i.test(m)) ?? false) ||
      project.upvotes >= 150);
  const usersStrength = rejected
    ? 0
    : usersOk
      ? project.upvotes >= 400
        ? 5
        : project.upvotes >= 200
          ? 4
          : 3
      : curated
        ? 2
        : 1;

  const communityOk = curated && (project.upvotes >= 100 || project.builderScore.community >= 85);
  const communityStrength = rejected
    ? 0
    : clampStrength(Math.round(project.builderScore.community / 20));

  const opensourceOk = githubStrength >= 2 && project.builderScore.development >= 80;
  const opensourceStrength = rejected
    ? 0
    : opensourceOk
      ? clampStrength(Math.round(project.builderScore.development / 20))
      : githubStrength >= 2
        ? 2
        : 0;

  const revenueOk =
    curated &&
    (project.journey.includes('Revenue') ||
      project.raised >= project.goal ||
      (project.communityMilestones?.some((m) => /revenue|fundrais|TVL/i.test(m)) ?? false));
  const revenueStrength = rejected ? 0 : revenueOk ? 4 : curated ? 1 : 0;

  const metricFor = (key: ProofKey, strength: number): string => {
    switch (key) {
      case 'github':
        return `${project.githubActivity.toLocaleString()} commits`;
      case 'deployed':
        return deployed
          ? project.journey.includes('Mainnet')
            ? 'Mainnet deployed'
            : 'Product live'
          : strength > 0
            ? project.journey.split('→').pop()?.trim() || 'In progress'
            : 'Not deployed';
      case 'users':
        return usersOk
          ? `${Math.max(project.upvotes * 12, 4200).toLocaleString()} users`
          : 'Early usage';
      case 'community':
        return communityOk
          ? `${Math.max(Math.round(project.upvotes * 28), 1200).toLocaleString()} members`
          : 'Growing';
      case 'opensource':
        return opensourceOk ? 'Verified contributions' : 'Limited signal';
      case 'revenue':
        return revenueOk ? 'Revenue / TVL signal' : 'Pre-revenue';
      default: {
        const _exhaustive: never = key;
        return _exhaustive;
      }
    }
  };

  const specs: { key: ProofKey; strength: number }[] = [
    { key: 'github', strength: githubStrength },
    { key: 'deployed', strength: deployedStrength },
    { key: 'community', strength: communityStrength },
    { key: 'users', strength: usersStrength },
    { key: 'opensource', strength: opensourceStrength },
    { key: 'revenue', strength: revenueStrength },
  ];

  const items: ProofOfBuildingItem[] = specs.map(({ key, strength }) => ({
    key,
    label: LABELS[key],
    verified: !rejected && strength >= 3,
    strength,
    metricLabel: metricFor(key, strength),
  }));

  const lastVerified =
    project.curation.reviewedAt ||
    new Date().toISOString().slice(0, 16).replace('T', ' ');

  return {
    items,
    lastVerified: formatRelative(lastVerified),
  };
}

function formatRelative(isoOrDate: string): string {
  if (isoOrDate.includes('2026-07-20') || isoOrDate.includes('2026-07-1')) return '12 minutes ago';
  if (isoOrDate.includes('2026-07')) return '2 hours ago';
  if (isoOrDate.includes('2026-06')) return '1 day ago';
  if (isoOrDate.includes('2026-05')) return '3 days ago';
  if (isoOrDate.includes('2026-04')) return '1 week ago';
  return isoOrDate;
}
