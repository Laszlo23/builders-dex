import React from 'react';
import { BuilderScore, BuilderScoreDimension } from '../types';
import { SCORE_DIMENSIONS, scoreBarWidth, topScoreDimensions } from '../lib/builderScore';

type Props = {
  score: BuilderScore;
  /** Show only top N dims, or all when omitted / 'all' */
  mode?: 'top3' | 'all';
  compact?: boolean;
};

export default function ScoreBars({ score, mode = 'all', compact = false }: Props) {
  const dims =
    mode === 'top3'
      ? topScoreDimensions(score, 3)
      : SCORE_DIMENSIONS.map((d) => ({ ...d, value: score[d.key as BuilderScoreDimension] }));

  return (
    <div className={`space-y-${compact ? '1.5' : '2.5'}`}>
      {dims.map((d) => (
        <div key={d.key}>
          <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
            <span className="text-steel">{d.label}</span>
            <span className="text-accent">{d.value}</span>
          </div>
          <div
            className={`depth-score-track w-full overflow-hidden rounded-full ${compact ? 'h-1.5' : 'h-2'}`}
          >
            <div
              className="depth-score-fill h-full rounded-full transition-all duration-500"
              style={{ width: scoreBarWidth(d.value) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BuilderScoreBadge({ overall }: { overall: number }) {
  return (
    <div className="depth-badge inline-flex flex-col items-center px-4 py-3">
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
        Builder Score™
      </span>
      <span className="mt-1 font-mono text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
        {overall}
        <span className="text-base text-steel"> / 100</span>
      </span>
    </div>
  );
}

export function CurationBadges({
  status,
  builderVerified,
}: {
  status: 'pending' | 'reviewed' | 'curated' | 'rejected';
  builderVerified: boolean;
}) {
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] font-semibold text-steel">
        Not approved
      </span>
    );
  }

  const items = [
    status === 'curated' && 'Curated',
    (status === 'reviewed' || status === 'curated') && 'Reviewed',
    builderVerified && 'Builder Verified',
    status === 'pending' && 'Under Review',
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((label) => (
        <span
          key={label}
          className="inline-flex items-center gap-1 rounded-md border border-accent/25 bg-accent/5 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent"
        >
          ✓ {label}
        </span>
      ))}
    </div>
  );
}
