import React from 'react';
import { BuilderGenome } from '../data/prideMovement';
import { scoreBarWidth } from '../lib/builderScore';

const BARS: { key: keyof Omit<BuilderGenome, 'category'>; label: string; invert?: boolean }[] = [
  { key: 'innovation', label: 'Innovation' },
  { key: 'execution', label: 'Execution' },
  { key: 'community', label: 'Community' },
  { key: 'transparency', label: 'Transparency' },
  { key: 'risk', label: 'Risk', invert: true },
  { key: 'momentum', label: 'Momentum' },
  { key: 'founderResilience', label: 'Founder Resilience' },
];

type Props = {
  genome: BuilderGenome;
  projectName: string;
};

/** Stage-demo feature — how a project builds, not its price */
export default function BuilderGenomeCard({ genome, projectName }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-accent/35 bg-gradient-to-br from-accent/[0.14] via-surface to-ink p-6 md:p-8">
      <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
      <div className="relative">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          Builder Genome™
        </p>
        <h2 className="font-display mt-1 text-2xl font-bold tracking-tight">
          How {projectName} builds
        </h2>
        <p className="mt-1 max-w-lg text-sm text-steel">
          Not its price — its personality. Open any project and instantly understand the
          builders.
        </p>

        <div className="mt-6 space-y-3">
          {BARS.map((b) => {
            const raw = genome[b.key];
            const display = b.invert ? Math.max(0, 100 - raw) : raw;
            return (
              <div key={b.key}>
                <div className="mb-1 flex items-center justify-between font-mono text-[11px]">
                  <span className="uppercase tracking-wider text-steel">{b.label}</span>
                  <span className={b.invert ? 'text-accent/90' : 'text-accent'}>
                    {b.invert ? raw : raw}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-sm bg-white/[0.06] font-mono text-[10px] leading-3 tracking-widest text-accent/40">
                  <div
                    className={`h-full rounded-sm ${
                      b.invert
                        ? 'bg-gradient-to-r from-accent/50 to-accent/30'
                        : 'bg-gradient-to-r from-accent/70 to-accent'
                    }`}
                    style={{ width: scoreBarWidth(b.invert ? raw : display) }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 inline-flex rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-accent">Category</p>
            <p className="mt-0.5 font-display text-lg font-bold text-white">{genome.category}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
