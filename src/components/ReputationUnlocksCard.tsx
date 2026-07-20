import React from 'react';
import {
  builderAccessFromScore,
  builderUnlockLabels,
  scoutAccessFromScore,
  scoutUnlockLabels,
} from '../lib/reputationRules';

type Props = {
  builderScore: number;
  scoutReputation?: number;
  mode?: 'builder' | 'scout' | 'both';
};

export default function ReputationUnlocksCard({
  builderScore,
  scoutReputation = 0,
  mode = 'builder',
}: Props) {
  const builderAccess = builderAccessFromScore(builderScore);
  const scoutAccess = scoutAccessFromScore(scoutReputation);
  const builderRows = builderUnlockLabels(builderAccess);
  const scoutRows = scoutUnlockLabels(scoutAccess);

  return (
    <section className="rounded-3xl border border-white/10 bg-surface/80 p-5 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Reputation as an asset
      </p>
      <h2 className="font-display mt-1 text-lg font-bold">Score unlocks opportunities</h2>
      <p className="mt-1 text-xs text-steel">
        Reputation is not just a number — it unlocks placement, rooms, speaking, and capital access.
      </p>

      {(mode === 'builder' || mode === 'both') && (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase text-steel">Builder Score</p>
            <p className="font-mono text-sm text-accent">{builderScore}/100</p>
          </div>
          <ul className="mt-2 space-y-1.5">
            {builderRows.map((row) => (
              <li
                key={row.label}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                  row.unlocked
                    ? 'border-accent/25 bg-accent/5 text-white'
                    : 'border-white/8 text-steel'
                }`}
              >
                <span className="font-mono">{row.unlocked ? '✓' : '○'}</span>
                {row.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(mode === 'scout' || mode === 'both') && (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase text-steel">Scout Reputation</p>
            <p className="font-mono text-sm text-accent">{scoutReputation}/100</p>
          </div>
          <ul className="mt-2 space-y-1.5">
            {scoutRows.map((row) => (
              <li
                key={row.label}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                  row.unlocked
                    ? 'border-accent/25 bg-accent/5 text-white'
                    : 'border-white/8 text-steel'
                }`}
              >
                <span className="font-mono">{row.unlocked ? '✓' : '○'}</span>
                {row.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function ReputationChipBadge({ chip }: { chip: { label: string; tone: string } }) {
  const toneClass =
    chip.tone === 'priority'
      ? 'border-accent/40 bg-accent/15 text-accent'
      : chip.tone === 'cooling'
        ? 'border-accent/30 bg-accent/10 text-accent/90'
        : chip.tone === 'risk'
          ? 'border-white/25 bg-white/[0.06] text-steel'
          : 'border-white/15 bg-white/[0.06] text-white/80';

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${toneClass}`}
    >
      {chip.label}
    </span>
  );
}
