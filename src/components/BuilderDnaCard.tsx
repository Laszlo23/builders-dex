import React from 'react';
import { BuilderDNA } from '../types';
import { scoreBarWidth } from '../lib/builderScore';

const DIMS: { key: keyof Pick<BuilderDNA, 'engineering' | 'vision' | 'execution' | 'community' | 'transparency'>; label: string }[] = [
  { key: 'engineering', label: 'Engineering' },
  { key: 'vision', label: 'Vision' },
  { key: 'execution', label: 'Execution' },
  { key: 'community', label: 'Community' },
  { key: 'transparency', label: 'Transparency' },
];

export default function BuilderDnaCard({ dna }: { dna: BuilderDNA }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Builder DNA™
      </p>
      <h2 className="font-display mt-2 text-xl font-bold">Unique builder identity</h2>
      <p className="mt-1 text-sm text-steel">
        Not just a score — a living profile of how this team builds.
      </p>

      <div className="mt-6 space-y-3">
        {DIMS.map((d) => (
          <div key={d.key}>
            <div className="mb-1 flex items-center justify-between font-mono text-[11px]">
              <span className="uppercase tracking-wider text-steel">{d.label}</span>
              <span className="text-accent">{dna[d.key]}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-sm bg-white/[0.06]">
              <div
                className="h-full rounded-sm bg-gradient-to-r from-accent/80 to-accent"
                style={{ width: scoreBarWidth(dna[d.key]) }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3">
          <p className="font-mono text-[10px] uppercase text-accent">Builder Type</p>
          <p className="mt-1 font-sans text-sm font-semibold text-white">{dna.builderType}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink/40 px-4 py-3">
          <p className="font-mono text-[10px] uppercase text-steel">Strength</p>
          <p className="mt-1 text-sm text-white/90">{dna.strength}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink/40 px-4 py-3">
          <p className="font-mono text-[10px] uppercase text-steel">Risk</p>
          <p className="mt-1 text-sm text-white/90">{dna.risk}</p>
        </div>
      </div>
    </section>
  );
}
