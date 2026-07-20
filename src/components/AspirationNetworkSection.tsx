import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Radar,
  Bell,
  Users,
  Rss,
  Briefcase,
  Trophy,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import {
  ASPIRATION_LINES,
  MORNING_REASONS,
  NETWORK_POSITIONING,
} from '../data/builderNetwork';

type Props = {
  setCurrentPath: (path: string) => void;
  aspirationIndex?: number;
};

const REASON_ICONS: LucideIcon[] = [
  Sparkles,
  Trophy,
  Bell,
  Radar,
  Users,
  Rss,
  Briefcase,
  Briefcase,
];

/** Lean mission + icon morning strip — no card dump */
export default function AspirationNetworkSection({
  setCurrentPath,
  aspirationIndex = 0,
}: Props) {
  const line = ASPIRATION_LINES[aspirationIndex % ASPIRATION_LINES.length];

  return (
    <>
      <section className="relative border-y border-white/5 bg-ink px-4 py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'url(/campaign/story.webp), url(/campaign/story.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/88 to-ink" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,232,104,0.12),transparent_55%)]" />
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <Sparkles className="mx-auto h-6 w-6 text-accent" aria-hidden />
          <p className="font-mono mt-4 text-[11px] uppercase tracking-[0.32em] text-accent">
            The rally cry
          </p>
          <p className="font-display mt-6 text-2xl font-bold leading-[1.2] tracking-tight text-white sm:text-3xl">
            {line}
          </p>
          <p className="mx-auto mt-6 max-w-md text-sm text-steel">{NETWORK_POSITIONING}</p>
        </motion.blockquote>
      </section>

      <section className="border-b border-white/5 bg-ink px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                Daily return
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Open it every morning
              </h2>
              <p className="mt-2 max-w-lg text-sm text-steel">
                Not to trade — to see who is rising.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPath('terminal')}
              className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-4 py-2 text-xs font-bold text-accent hover:bg-accent/20"
            >
              Open Terminal™ <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MORNING_REASONS.slice(0, 8).map((r, i) => {
              const Icon = REASON_ICONS[i] ?? Sparkles;
              return (
                <motion.button
                  key={r.id}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setCurrentPath(r.path)}
                  className="group flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-accent/40 hover:bg-accent/[0.06]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent transition group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold leading-snug text-white">{r.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
