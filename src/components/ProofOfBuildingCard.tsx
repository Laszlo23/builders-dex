import React from 'react';
import { ProofOfBuilding } from '../types';

function Dots({ strength }: { strength: number }) {
  return (
    <span className="font-mono text-sm tracking-tight" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < strength ? 'text-accent' : 'text-white/20'}>
          ●
        </span>
      ))}
    </span>
  );
}

export default function ProofOfBuildingCard({ proof }: { proof: ProofOfBuilding }) {
  const verifiedCount = proof.items.filter((i) => i.verified).length;
  const fresh = /minute|hour/i.test(proof.lastVerified);

  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Proof of Building™
          </p>
          <h2 className="font-display mt-2 text-xl font-bold">Live verification timeline</h2>
          <p className="mt-1 text-sm text-steel">
            People trust what they can see — commits, deploys, community, usage.
          </p>
        </div>
        <p className="font-mono text-[11px] text-steel">
          {verifiedCount}/{proof.items.length} signals · Last verified{' '}
          <span className={fresh ? 'text-accent' : 'text-accent/90'}>{proof.lastVerified}</span>
        </p>
      </div>

      <ul className="mt-6 space-y-3">
        {proof.items.map((item) => (
          <li
            key={item.key}
            className={`flex flex-wrap items-center gap-3 rounded-xl border px-3.5 py-3 ${
              item.verified
                ? 'border-accent/20 bg-accent/[0.04]'
                : 'border-white/8 bg-ink/40'
            }`}
          >
            <span className="w-24 shrink-0 text-sm font-medium text-white/90">{item.label}</span>
            <Dots strength={item.strength} />
            <span className="min-w-0 flex-1 font-mono text-xs text-steel sm:text-right">
              {item.metricLabel}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
