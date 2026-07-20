import React from 'react';
import { ScoreTransparency } from '../data/builderPlatform';
import { Clock } from 'lucide-react';

export default function ScoreTransparencyCard({ data }: { data: ScoreTransparency }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Builder Score™
          </p>
          <h2 className="font-display mt-1 text-xl font-bold">
            {data.overall} <span className="text-steel">— Why?</span>
          </h2>
          <p className="mt-1 text-sm text-steel">
            Transparent signals — not an arbitrary number.
          </p>
        </div>
        <p className="inline-flex items-center gap-1.5 font-mono text-[10px] text-steel">
          <Clock className="h-3 w-3 text-accent" />
          Last recalculated: {data.lastRecalculated}
        </p>
      </div>
      <ul className="mt-5 space-y-2">
        {data.why.map((s) => (
          <li
            key={s.text}
            className="flex gap-2 rounded-xl border border-white/8 bg-ink/40 px-3 py-2.5 text-sm"
          >
            <span className={s.polarity === '+' ? 'text-accent' : 'text-steel'}>
              {s.polarity}
            </span>
            <span className="text-white/85">{s.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
