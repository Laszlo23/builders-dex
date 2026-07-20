import React from 'react';
import { BuilderPulse } from '../data/builderNetwork';

type Props = {
  pulse: BuilderPulse;
};

function toneClass(tone?: BuilderPulse['metrics'][0]['tone']) {
  switch (tone) {
    case 'live':
      return 'text-accent';
    case 'hot':
      return 'text-accent/90';
    case 'ok':
      return 'text-white';
    default:
      return 'text-white';
  }
}

export default function BuilderPulseCard({ pulse }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
      <div className="pointer-events-none absolute left-6 top-6 h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_12px_rgba(200,232,104,0.8)]" />
      <div className="flex flex-wrap items-end justify-between gap-3 pl-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Builder Pulse
          </p>
          <h2 className="font-display mt-2 text-xl font-bold">Live heartbeat</h2>
          <p className="mt-1 text-sm text-steel">
            Proof that updates itself — commits, deploys, community, wallets.
          </p>
        </div>
        <p className="font-mono text-[11px] text-accent">{pulse.velocity}</p>
      </div>

      <dl className="mt-6 grid gap-2 sm:grid-cols-2">
        {pulse.metrics.map((m) => (
          <div
            key={m.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-ink/50 px-3.5 py-3"
          >
            <dt className="font-mono text-[10px] uppercase tracking-wider text-steel">{m.label}</dt>
            <dd className={`font-mono text-sm font-semibold ${toneClass(m.tone)}`}>{m.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
