import React from 'react';
import { Rocket, HeartHandshake, FilePlus2, ArrowRight, Users, Stamp } from 'lucide-react';
import { Project, ShareRaise } from '../types';
import { resolveTradeMint } from '../data/curatedTokens';
import { openBaseTrade, resolveBaseTradeAddress } from '../data/crossChainRegistry';
import DepthCard from './DepthCard';
import { proofOfBuildingFor } from '../lib/proofOfBuilding';
import { BUILDER_SCORE_UNLOCK, reputationChipFor } from '../lib/reputationRules';
import { ReputationChipBadge } from './ReputationUnlocksCard';
import { useShareRaises } from '../hooks/useShareRaises';

interface LaunchpadViewProps {
  projects: Project[];
  setSelectedProjectId: (id: string) => void;
  setSelectedRaiseId: (id: string) => void;
  setCurrentPath: (path: string, state?: { projectId?: string; raiseId?: string }) => void;
  onTrade: (mint?: string) => void;
  onSupport?: (projectId: string) => void;
  tradeableMintSet: Set<string>;
}

const STAGES = [
  'Apply',
  'PoB review',
  'Network',
  'Share NFT',
  'Claim wins',
] as const;

function solLabel(lamports: number): string {
  return `${(lamports / 1e9).toLocaleString(undefined, { maximumFractionDigits: 3 })} SOL`;
}

function holderPct(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 1)}%`;
}

export default function LaunchpadView({
  projects,
  setSelectedProjectId,
  setSelectedRaiseId,
  setCurrentPath,
  onTrade,
  onSupport,
  tradeableMintSet,
}: LaunchpadViewProps) {
  const { raises } = useShareRaises();
  const pending = projects.filter(
    (p) => p.curation.status === 'pending' || p.curation.status === 'reviewed',
  );
  const curated = projects.filter((p) => p.curation.status === 'curated');
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const liveRaises = raises.filter(
    (r: ShareRaise) => r.status === 'live' && Boolean(r.raisePda) && !r.demo,
  );
  const draftRaises = raises.filter((r: ShareRaise) => r.status === 'draft');

  const openRaise = (raise: ShareRaise) => {
    setSelectedRaiseId(raise.id);
    setSelectedProjectId(raise.projectId);
    setCurrentPath('raise', { projectId: raise.projectId, raiseId: raise.id });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-white sm:px-6 sm:py-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Builder Accelerator · Share certificates
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Inspected first. Then you mint a share.
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-steel">
        Each certificate is an on-chain claim on deposited wins. Apply first. We inspect. Then you
        mint — one wallet, two Phantom prompts.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        {STAGES.map((step, i) => (
          <React.Fragment key={step}>
            {i > 0 && <span className="text-steel/40">→</span>}
            <span
              className={`whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[10px] ${
                step === 'Share NFT'
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-white/10 bg-white/[0.03] text-steel'
              }`}
            >
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
            body: 'Submit a packet. You show as in-review on Explore the same day.',
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
            title: 'Buy a share NFT',
            body: 'Mint a numbered certificate. Claim your % when wins hit the vault.',
            cta: 'Browse certificates',
            action: () => {
              document.getElementById('active-raises')?.scrollIntoView({ behavior: 'smooth' });
            },
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title}>
              <DepthCard intensity="soft" className="p-5">
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
            </div>
          );
        })}
      </div>

      <section id="active-raises" className="mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              Live certificates
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold">Share NFTs on inspected teams</h2>
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

        {liveRaises.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/12 px-4 py-10 text-center text-sm text-steel">
            Aura is the live canary. New teams apply first — mint opens after inspection.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {liveRaises.map((raise) => {
              const p = projectById.get(raise.projectId);
              const mintedPct = Math.min(
                100,
                Math.round((raise.sharesMinted / Math.max(1, raise.shareSupply)) * 100),
              );
              const inspected =
                raise.inspection.pobVerified &&
                raise.inspection.builderScore >= BUILDER_SCORE_UNLOCK &&
                (raise.status === 'live' || raise.status === 'filled');
              const chip = p
                ? reputationChipFor(p, proofOfBuildingFor(p))
                : { id: 'pending', label: 'Review', tone: 'cooling' as const };
              return (
                <article key={raise.id} className="share-cert-card p-5">
                  <div className="share-cert-foil" />
                  <div className="relative flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent/80">
                        Certificate series · {raise.shareSupply} shares
                      </p>
                      <h3 className="font-display mt-1 text-xl font-bold">
                        {p?.name || raise.projectId}
                      </h3>
                      <p className="font-mono text-[11px] text-steel">
                        {p ? `$${p.ticker}` : raise.projectId} · holder pool{' '}
                        {holderPct(raise.holderPoolBps)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {p && <ReputationChipBadge chip={chip} />}
                      {raise.demo && (
                        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-steel">
                          Demo
                        </span>
                      )}
                      {inspected ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                          <Stamp className="h-3 w-3" /> Inspected
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-steel">
                          {raise.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="relative mt-3 text-sm text-steel">
                    {p?.tagline || 'On-chain claim receipt on deposited proceeds.'}
                  </p>
                  <div className="relative mt-4">
                    <div className="flex justify-between font-mono text-[10px] text-steel">
                      <span>
                        {raise.sharesMinted} / {raise.shareSupply} minted ·{' '}
                        {solLabel(raise.priceLamports)} each
                      </span>
                      <span>{mintedPct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-accent" style={{ width: `${mintedPct}%` }} />
                    </div>
                  </div>
                  <div className="relative mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openRaise(raise)}
                      className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-ink"
                    >
                      Mint share
                    </button>
                    {p && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          if (onSupport) onSupport(p.id);
                          setCurrentPath('project-detail');
                        }}
                        className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold hover:border-accent/40"
                      >
                        Story
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
          <h2 className="font-display mt-1 text-xl font-bold">In review — no mint yet</h2>
          <ul className="mt-4 space-y-2">
            {draftRaises.map((raise) => {
              const p = projectById.get(raise.projectId);
              return (
                <li key={raise.id}>
                  <div className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-ink/40 px-3 py-2.5">
                    <span className="text-sm font-semibold">{p?.name || raise.projectId}</span>
                    <span className="font-mono text-[10px] text-steel">Raise draft</span>
                  </div>
                </li>
              );
            })}
            {pending.slice(0, 6).map((p) => (
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
                  <span className="font-mono text-[10px] text-steel">{p.curation.status}</span>
                </button>
              </li>
            ))}
            {pending.length === 0 && draftRaises.length === 0 && (
              <p className="text-xs text-steel">Queue clear — apply to join.</p>
            )}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Curated</p>
          <h2 className="font-display mt-1 text-xl font-bold">Graduated to trade</h2>
          <ul className="mt-4 space-y-2">
            {curated.slice(0, 4).map((p) => {
              const tradeMint = resolveTradeMint(p, tradeableMintSet);
              const baseAddr = resolveBaseTradeAddress(p);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (tradeMint) onTrade(tradeMint);
                      else if (baseAddr) openBaseTrade(baseAddr);
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
