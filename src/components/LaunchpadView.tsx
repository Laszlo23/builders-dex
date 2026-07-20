import React from 'react';
import { Rocket, HeartHandshake, FilePlus2, ArrowRight, Users } from 'lucide-react';
import { Project } from '../types';
import { resolveTradeMint } from '../data/curatedTokens';
import DepthCard from './DepthCard';
import { proofOfBuildingFor } from '../lib/proofOfBuilding';
import { reputationChipFor } from '../lib/reputationRules';
import { ReputationChipBadge } from './ReputationUnlocksCard';

interface LaunchpadViewProps {
  projects: Project[];
  setSelectedProjectId: (id: string) => void;
  setCurrentPath: (path: string) => void;
  onTrade: (mint?: string) => void;
  onSupport?: (projectId: string) => void;
  tradeableMintSet: Set<string>;
}

const STAGES = [
  'Apply',
  'PoB review',
  'Network',
  'Raise',
  'Curated trade',
] as const;

export default function LaunchpadView({
  projects,
  setSelectedProjectId,
  setCurrentPath,
  onTrade,
  tradeableMintSet,
}: LaunchpadViewProps) {
  const raising = projects.filter(
    (p) => p.launchpadActive && p.curation.status !== 'rejected'
  );
  const pending = projects.filter((p) => p.curation.status === 'pending');
  const curated = projects.filter((p) => p.curation.status === 'curated');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-white sm:px-6 sm:py-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Builder Accelerator
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        From idea → recognized protocol
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-steel">
        Human review · AI analysis · Community discovery · Launch support · Liquidity support. You
        become where builders start — not where tokens dump.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        {STAGES.map((step, i) => (
          <React.Fragment key={step}>
            {i > 0 && <span className="text-steel/40">→</span>}
            <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-steel">
              {step}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: FilePlus2,
            title: 'Apply',
            body: 'Submit for Proof of Building™ review and Passport™ standing.',
            cta: 'Submit project',
            action: () => setCurrentPath('apply'),
          },
          {
            icon: Users,
            title: 'Get discovered',
            body: 'Scouts and Terminal™ surface early teams before the crowd.',
            cta: 'Open Terminal™',
            action: () => setCurrentPath('terminal'),
          },
          {
            icon: HeartHandshake,
            title: 'Support a raise',
            body: 'Back active accelerator cohorts from verified builders.',
            cta: 'Browse raises',
            action: () => {
              const el = document.getElementById('active-raises');
              el?.scrollIntoView({ behavior: 'smooth' });
            },
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <DepthCard key={card.title} intensity="soft" className="p-5">
              <Icon className="h-5 w-5 text-accent" />
              <h2 className="font-display mt-3 text-lg font-bold">{card.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-steel">{card.body}</p>
              <button
                type="button"
                onClick={card.action}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-bright"
              >
                {card.cta} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </DepthCard>
          );
        })}
      </div>

      <section id="active-raises" className="mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              Active raises
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold">Builders seeking support</h2>
          </div>
          <button
            type="button"
            onClick={() => setCurrentPath('apply')}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink hover:bg-accent-bright"
          >
            <Rocket className="h-3.5 w-3.5" />
            Join Accelerator
          </button>
        </div>

        {raising.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/12 px-4 py-10 text-center text-sm text-steel">
            No active raises right now — submit yours for review.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {raising.map((p) => {
              const pct = Math.min(100, Math.round((p.raised / Math.max(1, p.goal)) * 100));
              const tradeMint = resolveTradeMint(p, tradeableMintSet);
              const chip = reputationChipFor(p, proofOfBuildingFor(p));
              return (
                <article
                  key={p.id}
                  className="rounded-2xl border border-white/10 bg-surface/80 p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-sans text-lg font-semibold">{p.name}</h3>
                      <p className="font-mono text-[11px] text-steel">
                        ${p.ticker} · {p.category}
                      </p>
                    </div>
                    <ReputationChipBadge chip={chip} />
                  </div>
                  <p className="mt-3 text-sm text-steel">{p.tagline}</p>
                  <div className="mt-4">
                    <div className="flex justify-between font-mono text-[10px] text-steel">
                      <span>
                        ${p.raised.toLocaleString()} / ${p.goal.toLocaleString()}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setCurrentPath('project-detail');
                      }}
                      className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold hover:border-accent/40"
                    >
                      Story
                    </button>
                    {tradeMint && (
                      <button
                        type="button"
                        onClick={() => onTrade(tradeMint)}
                        className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-ink"
                      >
                        Trade
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Pending</p>
          <h2 className="font-display mt-1 text-xl font-bold">In review</h2>
          <ul className="mt-4 space-y-2">
            {pending.slice(0, 4).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setCurrentPath('project-detail');
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-ink/40 px-3 py-2.5 text-left hover:border-accent/30"
                >
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="font-mono text-[10px] text-steel">PoB review</span>
                </button>
              </li>
            ))}
            {pending.length === 0 && <p className="text-xs text-steel">Queue clear.</p>}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Curated</p>
          <h2 className="font-display mt-1 text-xl font-bold">Graduated to trade</h2>
          <ul className="mt-4 space-y-2">
            {curated.slice(0, 4).map((p) => {
              const tradeMint = resolveTradeMint(p, tradeableMintSet);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (tradeMint) onTrade(tradeMint);
                      else {
                        setSelectedProjectId(p.id);
                        setCurrentPath('project-detail');
                      }
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-ink/40 px-3 py-2.5 text-left hover:border-accent/30"
                  >
                    <span className="text-sm font-semibold">{p.name}</span>
                    <span className="font-mono text-[10px] text-accent">
                      {p.builderScore.overall}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
