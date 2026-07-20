import React from 'react';
import { DualConviction } from '../data/builderPlatform';
import { Users, Sparkles } from 'lucide-react';

export default function DualConvictionCard({ data }: { data: DualConviction }) {
  const diff = data.communityPct - data.aiPct;
  const diffLabel = diff > 0 ? `+${diff}%` : `${diff}%`;

  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Predict the future
      </p>
      <h2 className="font-display mt-1 text-xl font-bold">Conviction</h2>
      <p className="mt-1 text-sm text-steel">Humans and AI both contribute.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-4">
          <p className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase text-accent">
            <Users className="h-3 w-3" /> Community
          </p>
          <p className="font-display mt-1 text-2xl font-bold">{data.communityPct}%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink/50 px-4 py-4">
          <p className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase text-steel">
            <Sparkles className="h-3 w-3 text-accent" /> AI
          </p>
          <p className="font-display mt-1 text-2xl font-bold">{data.aiPct}%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink/50 px-4 py-4">
          <p className="font-mono text-[9px] uppercase text-steel">Difference</p>
          <p className="font-display mt-1 text-2xl font-bold text-accent">{diffLabel}</p>
        </div>
      </div>
    </section>
  );
}
