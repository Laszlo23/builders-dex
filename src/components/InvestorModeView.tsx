import React, { useMemo, useState } from 'react';
import { Project } from '../types';
import { DEFAULT_INVESTOR_FILTERS } from '../data/prideMovement';

type Props = {
  projects: Project[];
  onOpenStory: (projectId: string) => void;
  setCurrentPath: (path: string) => void;
};

function parseCapM(label?: string): number | null {
  if (!label) return null;
  const m = label.match(/([\d.]+)\s*M/i);
  return m ? parseFloat(m[1]) : null;
}

export default function InvestorModeView({ projects, onOpenStory, setCurrentPath }: Props) {
  const [category, setCategory] = useState<string>('AI + Web3');
  const [maxCap, setMaxCap] = useState(DEFAULT_INVESTOR_FILTERS.maxMarketCapM);
  const [minScore, setMinScore] = useState(DEFAULT_INVESTOR_FILTERS.minBuilderScore);
  const [revenueGrowing, setRevenueGrowing] = useState(true);
  const [ossRequired, setOssRequired] = useState(true);

  const matches = useMemo(() => {
    return projects
      .filter((p) => p.curation.status === 'curated')
      .filter((p) => category === 'All' || p.category === category)
      .filter((p) => p.builderScore.overall >= minScore)
      .filter((p) => {
        const cap = parseCapM(p.marketCapLabel);
        if (cap == null) return true;
        return cap < maxCap;
      })
      .filter((p) => !ossRequired || p.githubActivity > 50)
      .filter((p) => {
        if (!revenueGrowing) return true;
        return (p.reputationDelta ?? 0) >= 0 && p.builderScore.productProgress >= 70;
      })
      .sort((a, b) => b.builderScore.overall - a.builderScore.overall);
  }, [projects, category, maxCap, minScore, revenueGrowing, ossRequired]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-white sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Investor Mode</p>
      <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        Don&apos;t miss what&apos;s happening here
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-steel">
        Funds check Builders DEX every morning — filter by thesis, score, and proof. Trading is
        optional; discovery is the product.
      </p>

      <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-surface/80 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-xs">
          <span className="font-mono text-[10px] uppercase text-steel">Looking for</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/12 bg-ink px-3 py-2.5 text-sm outline-none focus:border-accent/40"
          >
            {['All', 'AI + Web3', 'DeFi', 'Infrastructure', 'Creator Economy'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs">
          <span className="font-mono text-[10px] uppercase text-steel">
            Market Cap &lt; ${maxCap}M
          </span>
          <input
            type="range"
            min={5}
            max={100}
            value={maxCap}
            onChange={(e) => setMaxCap(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-accent,#C8E868)]"
          />
        </label>
        <label className="block text-xs">
          <span className="font-mono text-[10px] uppercase text-steel">
            Builder Score {minScore}+
          </span>
          <input
            type="range"
            min={60}
            max={98}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-accent,#C8E868)]"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={revenueGrowing}
            onChange={(e) => setRevenueGrowing(e.target.checked)}
            className="accent-[var(--color-accent,#C8E868)]"
          />
          Revenue / product growing
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={ossRequired}
            onChange={(e) => setOssRequired(e.target.checked)}
            className="accent-[var(--color-accent,#C8E868)]"
          />
          Open Source required
        </label>
      </div>

      <p className="mt-6 font-mono text-xs text-accent">
        {matches.length} builders match your thesis
      </p>

      <ul className="mt-4 space-y-3">
        {matches.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onOpenStory(p.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink/50 px-4 py-4 text-left hover:border-accent/35"
            >
              <div>
                <p className="font-display text-lg font-bold">{p.name}</p>
                <p className="mt-0.5 text-xs text-steel">
                  {p.category} · {p.marketCapLabel || 'Early'} · {p.githubActivity} commits
                </p>
              </div>
              <p className="font-mono text-sm text-accent">{p.builderScore.overall} score</p>
            </button>
          </li>
        ))}
        {matches.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/15 py-10 text-center text-sm text-steel">
            No matches — loosen filters or open Explore.
          </p>
        )}
      </ul>

      <button
        type="button"
        onClick={() => setCurrentPath('terminal')}
        className="mt-8 text-xs font-semibold text-accent hover:underline"
      >
        Also check morning Terminal™ →
      </button>
    </div>
  );
}
