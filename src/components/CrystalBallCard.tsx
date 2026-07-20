import React from 'react';
import { motion } from 'motion/react';
import { CrystalBallAlert, CRYSTAL_BALL_ALERTS } from '../data/builderNetwork';

type Props = {
  alerts?: CrystalBallAlert[];
  onOpenProject?: (projectId: string) => void;
  compact?: boolean;
};

export default function CrystalBallCard({
  alerts = CRYSTAL_BALL_ALERTS,
  onOpenProject,
  compact = false,
}: Props) {
  const featured = alerts[0];
  const rest = alerts.slice(1, compact ? 1 : 3);

  if (!featured) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/[0.12] via-surface to-ink p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          Builder Crystal Ball™
        </p>
        <h2 className="font-display mt-1 text-xl font-bold tracking-tight sm:text-2xl">
          Spot builders before they become popular
        </h2>
        <p className="mt-1 max-w-lg text-xs text-steel sm:text-sm">
          People won&apos;t visit for trading — they&apos;ll visit to discover tomorrow&apos;s winners.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 rounded-2xl border border-white/12 bg-ink/60 p-4 sm:p-5"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {featured.headline}
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-steel">Probability of becoming a Top 100 project</p>
              <p className="font-display mt-1 text-3xl font-bold text-white sm:text-4xl">
                {featured.probability}
                <span className="text-xl text-accent">%</span>
              </p>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-center">
              <p className="font-mono text-[9px] uppercase text-accent">Confidence</p>
              <p className="mt-0.5 text-sm font-semibold text-white">{featured.confidence}</p>
            </div>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-steel">
            Reasoning
          </p>
          <ul className="mt-2 space-y-1.5">
            {featured.reasons.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-white/85">
                <span className="text-accent">•</span>
                {r}
              </li>
            ))}
          </ul>
          {onOpenProject && (
            <button
              type="button"
              onClick={() => onOpenProject(featured.projectId)}
              className="mt-4 text-xs font-semibold text-accent hover:underline"
            >
              Open {featured.projectName} story →
            </button>
          )}
        </motion.div>

        {!compact && rest.length > 0 && (
          <ul className="mt-3 space-y-2">
            {rest.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onOpenProject?.(a.projectId)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-left hover:border-accent/30"
                >
                  <span className="text-sm font-semibold">{a.projectName}</span>
                  <span className="font-mono text-xs text-accent">{a.probability}% · {a.confidence}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
