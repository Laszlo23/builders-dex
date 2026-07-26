import type { BuilderScoreDimension } from '../../types';

/** Public methodology version — bump when weights or signal definitions change */
export const SCORE_VERSION = '2026.07.1';

export const SCORE_WEIGHTS: Record<BuilderScoreDimension, number> = {
  development: 0.18,
  innovation: 0.16,
  community: 0.14,
  transparency: 0.12,
  productProgress: 0.14,
  builderReputation: 0.14,
  liquidityHealth: 0.12,
};

export const SCORE_DIMENSION_DOCS: Record<
  BuilderScoreDimension,
  { label: string; summary: string; signals: string[] }
> = {
  development: {
    label: 'Development',
    summary: 'Recent shipping velocity from public source control.',
    signals: [
      'Days since last GitHub push',
      'Repository size / fork graph',
      'Open issue load vs stars',
      'Declared commit history when live stats unavailable',
    ],
  },
  innovation: {
    label: 'Innovation',
    summary: 'Technical novelty proxies from topics, stack, and category.',
    signals: [
      'GitHub topics / description keywords (ZK, AI, agent, …)',
      'Primary language and stack diversity',
      'Category fit (AI, infra, DeFi primitives)',
    ],
  },
  community: {
    label: 'Community',
    summary: 'Public social graph and engagement around the builder.',
    signals: [
      'GitHub stars, forks, watchers',
      'Linked Discord / Telegram / X',
      'On-platform upvotes (secondary)',
    ],
  },
  transparency: {
    label: 'Transparency',
    summary: 'How inspectable the builder is.',
    signals: [
      'Public GitHub repository resolves',
      'Website + social links present',
      'Team roster published',
      'Builder-verified / curated status',
    ],
  },
  productProgress: {
    label: 'Product Progress',
    summary: 'Journey stage and shipped surface area.',
    signals: [
      'Journey keywords (Prototype → Testnet → Mainnet → Revenue)',
      'Roadmap phase completion',
      'Mint / deployable artifact present',
    ],
  },
  builderReputation: {
    label: 'Builder Reputation',
    summary: 'Identity and track-record proxies.',
    signals: [
      'Curation status (curated / reviewed / pending / rejected)',
      'Repository age',
      'Team size',
      'GitHub activity when configured',
      'Catalog curation status',
      'Community Telegram votes (separate lane)',
    ],
  },
  liquidityHealth: {
    label: 'Liquidity Health',
    summary: 'Market readiness — not a price prediction.',
    signals: [
      'Liquidity lock flag',
      'Allowlisted mint present',
      'Market cap band label when disclosed',
    ],
  },
};

export const METHODOLOGY_SUMMARY = [
  'Builder Score™ is a weighted 0–100 composite across seven dimensions.',
  'Live mode prefers public GitHub repository signals; missing sources lower the score and are cited as missing.',
  'Provisional mode is used when the linked repo cannot be verified — seed catalog fields are labeled provisional, never as live proof.',
  'Scores are recomputed server-side and cached briefly; methodology version is always returned with the payload.',
  'This is a reputation layer, not financial advice. Trade allowlisting is a separate, stricter gate.',
];
