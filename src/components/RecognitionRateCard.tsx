import React from 'react';
import { motion } from 'motion/react';
import { Award, FileStack, BadgeCheck, Percent } from 'lucide-react';
import { RECOGNITION_RATE } from '../data/prideMovement';

type Props = {
  onApply?: () => void;
};

export default function RecognitionRateCard({ onApply }: Props) {
  const rows = [
    {
      icon: FileStack,
      label: 'Applications',
      value: RECOGNITION_RATE.applications.toLocaleString(),
    },
    {
      icon: BadgeCheck,
      label: 'Accepted',
      value: RECOGNITION_RATE.accepted.toLocaleString(),
    },
    {
      icon: Percent,
      label: 'Recognition',
      value: `${RECOGNITION_RATE.ratePct}%`,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-b from-accent/[0.12] to-ink px-5 py-10 sm:px-10">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-accent" aria-hidden />
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">Prestige</p>
      </div>
      <h2 className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        Recognition Rate
      </h2>
      <p className="mt-3 max-w-xl text-sm text-steel">{RECOGNITION_RATE.line}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {rows.map((row, i) => {
          const Icon = row.icon;
          return (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-white/10 bg-ink/60 px-5 py-6 text-center"
            >
              <Icon className="mx-auto h-5 w-5 text-accent" aria-hidden />
              <p className="font-mono mt-3 text-[10px] uppercase tracking-wider text-steel">
                {row.label}
              </p>
              <p className="font-display mt-2 text-2xl font-bold text-accent sm:text-3xl">
                {row.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-8 text-center font-mono text-sm text-accent">
        {RECOGNITION_RATE.comparison}
      </p>

      {onApply && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onApply}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:bg-accent-bright"
          >
            <Award className="h-4 w-4" />
            Dream of getting accepted →
          </button>
        </div>
      )}
    </section>
  );
}
