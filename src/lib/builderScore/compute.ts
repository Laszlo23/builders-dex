import type { BuilderScore, BuilderScoreDimension } from '../../types';
import { SCORE_WEIGHTS } from './methodology';
import type {
  GithubRepoSignals,
  LiveBuilderScoreResult,
  ProjectScoreInputs,
  ScoreCitation,
} from './types';
import { SCORE_VERSION } from './methodology';

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.round(Math.min(hi, Math.max(lo, n)));
}

function daysSince(iso: string, now = Date.now()): number {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return 999;
  return Math.max(0, (now - t) / (24 * 60 * 60 * 1000));
}

function logScale(n: number, mid: number, cap = 100): number {
  if (n <= 0) return 0;
  return clamp((Math.log10(1 + n) / Math.log10(1 + mid)) * cap);
}

const INNOVATION_KEYWORDS = [
  'zk',
  'zero-knowledge',
  'ai',
  'agent',
  'llm',
  'ml',
  'fhe',
  'rollup',
  'intent',
  'modular',
  'restaking',
  'account abstraction',
  'depin',
];

function makeScore(dims: Omit<BuilderScore, 'overall'>): BuilderScore {
  const overall = clamp(
    SCORE_WEIGHTS.development * dims.development +
      SCORE_WEIGHTS.innovation * dims.innovation +
      SCORE_WEIGHTS.community * dims.community +
      SCORE_WEIGHTS.transparency * dims.transparency +
      SCORE_WEIGHTS.productProgress * dims.productProgress +
      SCORE_WEIGHTS.builderReputation * dims.builderReputation +
      SCORE_WEIGHTS.liquidityHealth * dims.liquidityHealth,
  );
  return { ...dims, overall };
}

function journeyScore(journey: string): number {
  const j = journey.toLowerCase();
  if (j.includes('revenue')) return 92;
  if (j.includes('mainnet')) return 88;
  if (j.includes('launch')) return 78;
  if (j.includes('testnet')) return 62;
  if (j.includes('prototype') || j.includes('idea')) return 40;
  return 55;
}

/**
 * Pure Builder Score™ compute — same function on server for every project.
 * Prefer live GitHub signals; fall back to declared catalog fields as provisional.
 */
export function computeLiveBuilderScore(
  input: ProjectScoreInputs,
  github: GithubRepoSignals | null,
): LiveBuilderScoreResult {
  const citations: ScoreCitation[] = [];
  const repoUrl = github?.htmlUrl
    ? github.htmlUrl
    : input.githubRepo && input.githubRepo !== '—'
      ? `https://github.com/${input.githubRepo}`
      : undefined;

  let development = 20;
  let innovation = 35;
  let community = 25;
  let transparency = 30;
  let productProgress = journeyScore(input.journey);
  let builderReputation = 40;
  let liquidityHealth = 25;

  if (github && !github.archived) {
    const pushDays = daysSince(github.pushedAt);
    const ageDays = daysSince(github.createdAt);
    const pushScore =
      pushDays <= 7 ? 48 : pushDays <= 30 ? 36 : pushDays <= 90 ? 24 : pushDays <= 180 ? 12 : 4;
    const starScore = logScale(github.stars, 5000, 28);
    const forkScore = logScale(github.forks, 800, 12);
    const issuePenalty =
      github.stars > 50 && github.openIssues / Math.max(github.stars, 1) > 0.4 ? 8 : 0;
    development = clamp(pushScore + starScore + forkScore + 8 - issuePenalty);

    citations.push({
      id: 'gh-push',
      dimension: 'development',
      label: 'Last push',
      detail: `${Math.floor(pushDays)}d ago · ${github.fullName}`,
      url: repoUrl,
      status: 'live',
    });
    citations.push({
      id: 'gh-stars',
      dimension: 'community',
      label: 'GitHub stars',
      detail: `${github.stars.toLocaleString()} stars · ${github.forks.toLocaleString()} forks`,
      url: repoUrl,
      status: 'live',
    });

    const blob = `${github.description || ''} ${github.topics.join(' ')} ${github.language || ''} ${input.category}`.toLowerCase();
    const hits = INNOVATION_KEYWORDS.filter((k) => blob.includes(k)).length;
    const topicBoost = Math.min(24, github.topics.length * 4);
    innovation = clamp(38 + hits * 10 + topicBoost + (github.language ? 6 : 0));
    citations.push({
      id: 'gh-topics',
      dimension: 'innovation',
      label: 'Topics / stack',
      detail:
        hits > 0 || github.topics.length
          ? `${github.language || 'n/a'} · ${hits} novelty keywords · ${github.topics.slice(0, 4).join(', ') || 'no topics'}`
          : 'Limited topic signal on repository',
      url: repoUrl,
      status: hits > 0 || github.topics.length ? 'live' : 'missing',
    });

    community = clamp(
      logScale(github.stars, 8000, 45) +
        logScale(github.forks, 1000, 20) +
        logScale(github.watchers, 2000, 10) +
        (input.hasDiscord ? 8 : 0) +
        (input.hasTwitter ? 6 : 0) +
        (input.hasTelegram ? 5 : 0) +
        Math.min(12, input.upvotes / 40),
    );

    transparency = clamp(
      40 +
        18 + // public repo resolved
        (input.hasWebsite ? 12 : 0) +
        (input.hasTwitter ? 6 : 0) +
        (input.teamSize >= 2 ? 10 : input.teamSize === 1 ? 5 : 0) +
        (input.builderVerified ? 10 : 0) +
        (github.license ? 6 : 0),
    );
    citations.push({
      id: 'gh-public',
      dimension: 'transparency',
      label: 'Public repository',
      detail: `Verified ${github.fullName}${github.license ? ` · ${github.license}` : ''}`,
      url: repoUrl,
      status: 'live',
    });

    const ageBoost = ageDays > 365 ? 12 : ageDays > 180 ? 8 : ageDays > 60 ? 4 : 0;
    builderReputation = clamp(
      (input.curationStatus === 'curated'
        ? 62
        : input.curationStatus === 'reviewed'
          ? 48
          : input.curationStatus === 'rejected'
            ? 12
            : 36) +
        (input.builderVerified ? 14 : 0) +
        Math.min(12, input.teamSize * 3) +
        ageBoost,
    );
    citations.push({
      id: 'repo-age',
      dimension: 'builderReputation',
      label: 'Repository age',
      detail: `${Math.floor(ageDays)} days since created`,
      url: repoUrl,
      status: 'live',
    });
  } else if (input.githubRepo && input.githubRepo !== '—') {
    development = clamp(18 + Math.min(40, input.githubActivity / 8));
    citations.push({
      id: 'gh-missing',
      dimension: 'development',
      label: 'GitHub unresolved',
      detail: `Could not verify ${input.githubRepo} — using provisional catalog activity (${input.githubActivity} commits declared)`,
      url: repoUrl,
      status: 'provisional',
    });
    community = clamp(
      20 +
        Math.min(20, input.upvotes / 25) +
        (input.hasDiscord ? 10 : 0) +
        (input.hasTwitter ? 8 : 0) +
        (input.hasTelegram ? 6 : 0),
    );
    transparency = clamp(
      22 +
        (input.hasWebsite ? 12 : 0) +
        (input.hasTwitter ? 6 : 0) +
        (input.teamSize >= 2 ? 8 : 0) +
        (input.builderVerified ? 8 : 0),
    );
  } else {
    development = 8;
    citations.push({
      id: 'gh-none',
      dimension: 'development',
      label: 'No public repo',
      detail: 'No GitHub repository linked — development score capped',
      status: 'missing',
    });
    community = clamp(
      15 +
        Math.min(15, input.upvotes / 30) +
        (input.hasDiscord ? 10 : 0) +
        (input.hasTwitter ? 8 : 0),
    );
    transparency = clamp(
      12 + (input.hasWebsite ? 10 : 0) + (input.teamSize >= 1 ? 5 : 0),
    );
  }

  const roadmapRatio =
    input.roadmapTotal > 0 ? input.roadmapCompleted / input.roadmapTotal : 0;
  productProgress = clamp(
    journeyScore(input.journey) * 0.7 +
      roadmapRatio * 25 +
      (input.hasMint ? 10 : 0),
  );
  citations.push({
    id: 'journey',
    dimension: 'productProgress',
    label: 'Journey / roadmap',
    detail: `${input.journey} · ${input.roadmapCompleted}/${input.roadmapTotal} roadmap phases done${input.hasMint ? ' · mint present' : ''}`,
    status: 'derived',
  });

  if (!github) {
    builderReputation = clamp(
      (input.curationStatus === 'curated'
        ? 55
        : input.curationStatus === 'reviewed'
          ? 42
          : input.curationStatus === 'rejected'
            ? 10
            : 30) +
        (input.builderVerified ? 12 : 0) +
        Math.min(10, input.teamSize * 3),
    );
  }

  citations.push({
    id: 'curation',
    dimension: 'builderReputation',
    label: 'Curation status',
    detail: `${input.curationStatus}${input.builderVerified ? ' · builder verified' : ''}`,
    status: 'derived',
  });

  liquidityHealth = clamp(
    (input.liquidityLocked ? 35 : 10) +
      (input.hasMint ? 30 : 5) +
      (input.marketCapLabel ? 20 : 0) +
      (input.curationStatus === 'curated' ? 15 : 0),
  );
  citations.push({
    id: 'liquidity',
    dimension: 'liquidityHealth',
    label: 'Market readiness',
    detail: [
      input.liquidityLocked ? 'liquidity lock flagged' : 'no lock flag',
      input.hasMint ? 'mint set' : 'no mint',
      input.marketCapLabel || 'no market band',
    ].join(' · '),
    status: input.hasMint || input.liquidityLocked ? 'derived' : 'missing',
  });

  if (input.curationStatus === 'rejected') {
    development = Math.min(development, 25);
    community = Math.min(community, 30);
    builderReputation = Math.min(builderReputation, 18);
    liquidityHealth = Math.min(liquidityHealth, 20);
    citations.push({
      id: 'rejected',
      dimension: 'overall',
      label: 'Not approved',
      detail: (input.rejectionReasons || ['Failed curation']).join('; '),
      status: 'derived',
    });
  }

  const socialBits = [
    input.hasWebsite && 'website',
    input.hasTwitter && 'X',
    input.hasDiscord && 'Discord',
    input.hasTelegram && 'Telegram',
  ].filter(Boolean);
  citations.push({
    id: 'socials',
    dimension: 'community',
    label: 'Social links',
    detail: socialBits.length ? socialBits.join(' · ') : 'No social links on profile',
    status: socialBits.length ? 'derived' : 'missing',
  });

  const score = makeScore({
    development,
    innovation,
    community,
    transparency,
    productProgress,
    builderReputation,
    liquidityHealth,
  });

  const mode: LiveBuilderScoreResult['mode'] = github
    ? 'live'
    : input.githubRepo && input.githubRepo !== '—'
      ? 'partial'
      : 'provisional';

  citations.unshift({
    id: 'version',
    dimension: 'overall',
    label: `Methodology ${SCORE_VERSION}`,
    detail: `Mode: ${mode} · overall ${score.overall}/100`,
    status: mode === 'live' ? 'live' : mode === 'partial' ? 'provisional' : 'provisional',
  });

  return {
    version: SCORE_VERSION,
    computedAt: new Date().toISOString(),
    projectId: input.projectId,
    name: input.name,
    githubRepo: github?.fullName || (input.githubRepo !== '—' ? input.githubRepo : null),
    score,
    mode,
    citations,
    github,
    cacheTtlSec: 2700,
  };
}

export function projectToScoreInputs(project: {
  id: string;
  name: string;
  githubRepo: string;
  githubActivity: number;
  upvotes: number;
  journey: string;
  category: string;
  curation: {
    status: ProjectScoreInputs['curationStatus'];
    builderVerified: boolean;
    rejectionReasons?: string[];
  };
  team: unknown[];
  socials?: { website?: string; twitter?: string; discord?: string; telegram?: string };
  roadmap: { status: string }[];
  mint?: string;
  liquidityLocked: boolean;
  marketCapLabel?: string;
}): ProjectScoreInputs {
  return {
    projectId: project.id,
    name: project.name,
    githubRepo: project.githubRepo,
    githubActivity: project.githubActivity,
    upvotes: project.upvotes,
    journey: project.journey,
    category: project.category,
    curationStatus: project.curation.status,
    builderVerified: project.curation.builderVerified,
    teamSize: project.team.length,
    hasWebsite: Boolean(project.socials?.website),
    hasTwitter: Boolean(project.socials?.twitter),
    hasDiscord: Boolean(project.socials?.discord),
    hasTelegram: Boolean(project.socials?.telegram),
    roadmapCompleted: project.roadmap.filter((r) => r.status === 'completed').length,
    roadmapTotal: project.roadmap.length,
    hasMint: Boolean(project.mint),
    liquidityLocked: project.liquidityLocked,
    marketCapLabel: project.marketCapLabel,
    rejectionReasons: project.curation.rejectionReasons,
  };
}

export function parseGithubRepo(raw: string): { owner: string; repo: string } | null {
  const s = raw.trim();
  if (!s || s === '—') return null;
  const urlMatch = s.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (urlMatch) {
    return { owner: urlMatch[1]!, repo: urlMatch[2]!.replace(/\.git$/, '') };
  }
  const parts = s.replace(/^\/+/, '').split('/');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  }
  return null;
}

export type { BuilderScoreDimension };
