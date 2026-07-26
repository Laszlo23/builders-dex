import React from 'react';
import { Clock, ExternalLink, Radio } from 'lucide-react';
import type { LiveBuilderScoreResult, ScoreCitation } from '../lib/builderScore';
import { SCORE_VERSION } from '../lib/builderScore';

function statusClass(status: ScoreCitation['status']): string {
  switch (status) {
    case 'live':
      return 'border-accent/30 text-accent';
    case 'derived':
      return 'border-white/15 text-steel';
    case 'provisional':
      return 'border-amber-500/30 text-amber-200/90';
    case 'missing':
      return 'border-white/10 text-steel/70';
    default: {
      const _e: never = status;
      return _e;
    }
  }
}

function modeLabel(mode: LiveBuilderScoreResult['mode'] | 'seed'): string {
  switch (mode) {
    case 'live':
      return 'Live GitHub signals';
    case 'partial':
      return 'Partial — repo unresolved';
    case 'provisional':
      return 'Provisional — limited sources';
    case 'seed':
      return 'Seed catalog (loading…)';
    default: {
      const _e: never = mode;
      return _e;
    }
  }
}

type Props = {
  live: LiveBuilderScoreResult | null;
  loading?: boolean;
  mode: LiveBuilderScoreResult['mode'] | 'seed';
  overall: number;
};

export default function LiveScoreCitationsCard({
  live,
  loading,
  mode,
  overall,
}: Props) {
  const citations = live?.citations ?? [];

  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Builder Score™ · v{live?.version || SCORE_VERSION}
          </p>
          <h2 className="font-display mt-1 text-xl font-bold">
            {overall} <span className="text-steel">— Why?</span>
          </h2>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-steel">
            <Radio className="h-3.5 w-3.5 text-accent" />
            {modeLabel(mode)}
            {loading ? ' · refreshing…' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="inline-flex items-center gap-1.5 font-mono text-[10px] text-steel">
            <Clock className="h-3 w-3 text-accent" />
            {live?.computedAt
              ? `Computed ${new Date(live.computedAt).toLocaleString()}`
              : 'Computing…'}
          </p>
          <a
            href="/api/builder-score/methodology"
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-accent hover:underline"
          >
            Public methodology <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {live?.github && (
        <p className="mt-4 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 font-mono text-[11px] text-accent">
          Linked repo:{' '}
          <a
            href={live.github.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-accent-bright"
          >
            {live.github.fullName}
          </a>
          {' · '}
          {live.github.stars.toLocaleString()}★ · pushed{' '}
          {new Date(live.github.pushedAt).toLocaleDateString()}
        </p>
      )}

      <ul className="mt-5 space-y-2">
        {citations.length === 0 && (
          <li className="rounded-xl border border-white/8 bg-ink/40 px-3 py-2.5 text-sm text-steel">
            Fetching live citations…
          </li>
        )}
        {citations.map((c) => (
          <li
            key={c.id}
            className={`flex flex-wrap items-start justify-between gap-2 rounded-xl border bg-ink/40 px-3 py-2.5 text-sm ${statusClass(c.status)}`}
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-wider opacity-80">
                {c.status} · {c.dimension}
              </p>
              <p className="mt-0.5 font-semibold text-white/90">{c.label}</p>
              <p className="mt-0.5 text-xs text-white/70">{c.detail}</p>
            </div>
            {c.url && (
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 font-mono text-[10px] text-accent hover:underline"
              >
                Source
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
