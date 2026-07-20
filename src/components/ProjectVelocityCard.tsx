import React from 'react';
import { VelocityBars } from '../data/prideMovement';

const ROWS: { key: keyof VelocityBars; label: string }[] = [
  { key: 'commits', label: 'Commits' },
  { key: 'releases', label: 'Releases' },
  { key: 'users', label: 'Users' },
  { key: 'retention', label: 'Retention' },
  { key: 'liquidity', label: 'Liquidity' },
];

function bar(n: number) {
  const filled = Math.round(n / 10);
  return '█'.repeat(Math.max(1, filled)) + '░'.repeat(Math.max(0, 10 - filled));
}

export default function ProjectVelocityCard({ velocity }: { velocity: VelocityBars }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Proof of Progress
      </p>
      <h2 className="font-display mt-1 text-xl font-bold">Project Velocity</h2>
      <p className="mt-1 text-sm text-steel">Measuring momentum — not speculation.</p>

      <ul className="mt-5 space-y-3 font-mono text-sm">
        {ROWS.map((r) => (
          <li key={r.key} className="flex flex-wrap items-center justify-between gap-2">
            <span className="w-24 text-steel">{r.label}</span>
            <span className="flex-1 tracking-widest text-accent">{bar(velocity[r.key])}</span>
            <span className="w-8 text-right text-white/80">{velocity[r.key]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
