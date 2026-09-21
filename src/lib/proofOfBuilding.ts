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

function hasPublicRepo(project: Project): boolean {
  return Boolean(project.githubRepo && project.githubRepo !== '—');
}

/** Measure what we can cite — never invent commit/user counts. */
export function proofOfBuildingFor(project: Project): ProofOfBuilding {
  const rejected = project.curation.status === 'rejected';
  const liveStars = project.githubActivity > 0;

  const githubStrength = rejected
    ? 0
    : clampStrength(
        !hasPublicRepo(project)
          ? 0
          : liveStars
            ? project.githubActivity >= 10_000
              ? 5
              : project.githubActivity >= 1000
                ? 4
                : project.githubActivity >= 100
                  ? 3
                  : 2
            : 1,
      );

  const mainnet = /mainnet/i.test(project.journey);
  const productLive =
    Boolean(project.mint) ||
    Boolean(project.baseTokenAddress) ||
    Boolean(project.hoodTokenAddress) ||
    mainnet;
  const deployedStrength = rejected
    ? 0
    : productLive
      ? 4
      : /testnet|prototype|hoodstreet live/i.test(project.journey)
        ? 2
        : hasPublicRepo(project)
          ? 1
          : 0;

  const usersStrength = rejected ? 0 : 0;
  const communityStrength = rejected
    ? 0
    : clampStrength(project.upvotes > 0 ? Math.min(5, Math.round(project.upvotes / 50)) : 0);
  const opensourceStrength = githubStrength;
  const revenueOk = /revenue/i.test(project.journey);
  const revenueStrength = rejected ? 0 : revenueOk ? 2 : 0;

  const metricFor = (key: ProofKey, strength: number): string => {
    switch (key) {
      case 'github':
        if (!hasPublicRepo(project)) return 'No public repo cited';
        if (liveStars) return `${project.githubActivity.toLocaleString()} GitHub stars (live)`;
        return `${project.githubRepo} — awaiting live count`;
      case 'deployed':
        if (productLive) {
          if (project.hoodTokenAddress) return 'On-chain address cited';
          if (project.baseTokenAddress) return 'Base token address cited';
          if (project.mint) return 'Mint cited';
          return mainnet ? 'Journey cites mainnet' : 'Product address cited';
        }
        return strength > 0 ? 'Public repo / early product' : 'Not proven on-chain here';
      case 'users':
        return 'No independent user count on this page';
      case 'community':
        return project.upvotes > 0
          ? `${project.upvotes.toLocaleString()} on-site upvotes`
          : 'No on-site vote count yet';
      case 'opensource':
        return hasPublicRepo(project) ? 'Public GitHub cited' : 'No public repo';
      case 'revenue':
        return revenueOk
          ? 'Journey cites revenue — not a verified P&L'
          : 'No revenue proof on this page';
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

  const lastVerified = project.curation.reviewedAt || '';

  return {
    items,
    lastVerified: lastVerified ? formatRelative(lastVerified) : 'Not timestamped',
  };
}

function formatRelative(isoOrDate: string): string {
  const raw = isoOrDate.trim();
  const t = Date.parse(raw.length <= 10 ? `${raw}T00:00:00Z` : raw);
  if (Number.isNaN(t)) return raw;
  const days = Math.round((Date.now() - t) / 86_400_000);
  if (days <= 0) return raw.slice(0, 10);
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  if (days < 365) {
    const mo = Math.max(1, Math.round(days / 30));
    return `${mo} mo ago`;
  }
  const yr = Math.max(1, Math.round(days / 365));
  return `${yr} yr ago`;
}
