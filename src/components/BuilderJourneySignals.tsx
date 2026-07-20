import React from 'react';
import { JourneyStep, BuilderSignal } from '../data/builderEconomy';

export function BuilderJourneyCard({
  projectName,
  steps,
}: {
  projectName: string;
  steps: JourneyStep[];
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-surface p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Builder Journey™
      </p>
      <h2 className="font-display mt-2 text-xl font-bold tracking-tight">{projectName}</h2>
      <p className="mt-1 text-sm text-steel">People invest in journeys — not charts.</p>

      <ol className="mt-6 space-y-0">
        {steps.map((step, i) => (
          <li key={step.id} className="flex gap-4">
            <div className="flex w-6 flex-col items-center">
              <span
                className={`mt-1 h-3 w-3 rounded-full border-2 ${
                  step.status === 'done'
                    ? 'border-accent bg-accent'
                    : step.status === 'current'
                      ? 'border-accent bg-ink shadow-[0_0_12px_rgba(200,232,104,0.55)]'
                      : 'border-white/20 bg-transparent'
                }`}
              />
              {i < steps.length - 1 && (
                <span
                  className={`my-1 w-px flex-1 min-h-[1.25rem] ${
                    step.status === 'done' ? 'bg-accent/50' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
            <div className="pb-5">
              <p
                className={`text-sm font-semibold ${
                  step.status === 'upcoming' ? 'text-steel' : 'text-white'
                }`}
              >
                {step.label}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-steel">
                {step.status === 'done'
                  ? 'Completed'
                  : step.status === 'current'
                    ? 'Now'
                    : 'Ahead'}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const TONE_DOT: Record<BuilderSignal['tone'], string> = {
  green: 'text-accent',
  yellow: 'text-accent/80',
  red: 'text-steel',
};

const TONE_MARK: Record<BuilderSignal['tone'], string> = {
  green: '●',
  yellow: '●',
  red: '●',
};

export function BuilderSignalsCard({ signals }: { signals: BuilderSignal[] }) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-surface/90 p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Builder Signals™
      </p>
      <h2 className="font-display mt-2 text-xl font-bold">What&apos;s moving now</h2>
      <ul className="mt-5 space-y-2.5">
        {signals.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-xl border border-white/8 bg-ink/40 px-3.5 py-2.5 text-sm"
          >
            <span className={`font-mono text-xs ${TONE_DOT[s.tone]}`}>{TONE_MARK[s.tone]}</span>
            <span className="text-white/85">{s.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
