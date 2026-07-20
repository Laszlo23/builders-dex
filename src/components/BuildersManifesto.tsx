import React from 'react';
import { Check, Flame } from 'lucide-react';
import { MANIFESTO, BRAND_PHILOSOPHY } from '../data/brand';

type Props = {
  compact?: boolean;
};

export default function BuildersManifesto({ compact = false }: Props) {
  return (
    <section
      className={`relative overflow-hidden border border-accent/30 bg-gradient-to-br from-accent/[0.12] via-ink to-surface ${
        compact ? 'rounded-2xl p-5' : 'rounded-[1.75rem] p-6 sm:p-10'
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
      />
      <div className="relative flex items-center gap-2">
        <Flame className="h-4 w-4 text-accent" aria-hidden />
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-accent">
          {MANIFESTO.title}
        </p>
      </div>
      <p className="font-display mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
        {BRAND_PHILOSOPHY}
      </p>
      <ul className={`mt-6 space-y-3 ${compact ? 'text-sm' : 'text-sm sm:text-base'}`}>
        {MANIFESTO.lines.map((line) => (
          <li key={line} className="flex items-start gap-3 leading-relaxed text-white/85">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
