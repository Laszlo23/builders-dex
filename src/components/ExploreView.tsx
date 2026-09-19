import React, { useState } from 'react';
import { Search, Brain, Coins, Layers, Share2, HelpCircle, ChevronRight } from 'lucide-react';
import { Project } from '../types';
import ScoreBars, { CurationBadges } from './ScoreBars';
import DepthCard from './DepthCard';
import { resolveTradeMint, getCuratedToken } from '../data/curatedTokens';
import { openBaseTrade, resolveBaseTradeAddress } from '../data/crossChainRegistry';
import { hoodAssetForProject, openHoodMint, resolveHoodAssetAddress } from '../data/hoodChain';
import { BRAND_MULTICHAIN } from '../data/brand';
import { proofOfBuildingFor } from '../lib/proofOfBuilding';
import { reputationChipFor } from '../lib/reputationRules';
import { ReputationChipBadge } from './ReputationUnlocksCard';
import ProjectSocialLinks from './ProjectSocialLinks';
import { educationalReviewFor } from '../data/builderPlatform';
import OptimizedImage from './OptimizedImage';
import CommunityTrendingSection from './CommunityTrendingSection';
import { useLiveScoreMap } from '../hooks/useLiveBuilderScore';
import { shareProject } from '../lib/shareHelper';
import ShareSuccessToast from './ShareSuccessToast';
import type { ShareActionResult } from './ShareCampaignView';

interface ExploreViewProps {
  projects: Project[];
  onUpvote: (id: string) => void;
  setSelectedProjectId: (id: string) => void;
  setCurrentPath: (path: string) => void;
  onTrade: (mint?: string) => void;
  onOpenStory: (projectId: string) => void;
  onDiscover?: (id: string) => void;
  tradeableMintSet: Set<string>;
  onShareReward?: (channel?: string) => ShareActionResult | void;
}

export default function ExploreView({
  projects,
  onUpvote,
  setSelectedProjectId,
  setCurrentPath,
  onTrade,
  onOpenStory,
  onDiscover,
  tradeableMintSet,
  onShareReward,
}: ExploreViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | 'AI + Web3' | 'DeFi' | 'Infrastructure' | 'Creator Economy'
  >('All');
  const [curatedOnly, setCuratedOnly] = useState(true);
  const [showRejected, setShowRejected] = useState(false);
  const [lane, setLane] = useState<'curated' | 'community'>('curated');
  const liveScores = useLiveScoreMap(projects.map((p) => p.id));
  const pendingCount = projects.filter(
    (p) => p.curation.status === 'pending' || p.curation.status === 'reviewed',
  ).length;
  const [showShareToast, setShowShareToast] = useState(false);
  const [shareToastMeta, setShareToastMeta] = useState({
    xp: 0,
    remaining: 0,
    capped: false,
  });

  const scoreFor = (p: Project) =>
    liveScores[p.id]?.overall ?? p.builderScore.overall;

  const getIconComponent = (logoName: string) => {
    switch (logoName) {
      case 'Brain':
        return Brain;
      case 'Coins':
        return Coins;
      case 'Layers':
        return Layers;
      case 'Share2':
        return Share2;
      default:
        return HelpCircle;
    }
  };

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      if (showRejected) return matchesSearch && matchesCat && p.curation.status === 'rejected';
      if (curatedOnly) {
        return matchesSearch && matchesCat && p.curation.status === 'curated';
      }
      return matchesSearch && matchesCat && p.curation.status !== 'rejected';
    })
    .sort((a, b) => scoreFor(b) - scoreFor(a));

  const openProject = (id: string) => {
    onDiscover?.(id);
    onOpenStory(id);
  };

  const handleShare = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await shareProject(project);
    if (success) {
      const result = onShareReward?.();
      setShareToastMeta({
        xp: result?.xp ?? 0,
        remaining: result?.remaining ?? 0,
        capped: result?.capped ?? false,
      });
      setShowShareToast(true);
    }
  };

  return (
    <>
      <ShareSuccessToast
        show={showShareToast}
        onDismiss={() => setShowShareToast(false)}
        xp={shareToastMeta.xp}
        remaining={shareToastMeta.remaining}
        capped={shareToastMeta.capped}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 border-b border-white/[0.08] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Builder Stories
          </p>
              <h1 className="section-title font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                Discover curated builders
              </h1>
          <p className="mt-2 max-w-xl text-sm text-steel">
            Startup profiles with journey, selection rationale, and live Builder Score™
            (GitHub-cited) — not hype cards.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-steel" />
          <input
            type="text"
            placeholder="Search name, ticker, thesis…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-surface/80 pl-9 pr-4 py-2.5 text-xs text-white shadow-[0_12px_32px_-16px_rgba(0,0,0,0.7)] outline-none backdrop-blur-md placeholder:text-steel focus:border-accent/40"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setLane('curated');
            setShowRejected(false);
          }}
          className={`min-h-[44px] rounded-full px-4 py-2.5 font-mono text-[11px] transition active:scale-95 ${
            lane === 'curated'
              ? 'bg-accent text-ink'
              : 'border border-white/10 text-steel hover:border-white/20 hover:text-white'
          }`}
        >
          Curated
        </button>
        <button
          type="button"
          onClick={() => {
            setLane('community');
            setShowRejected(false);
          }}
          className={`min-h-[44px] rounded-full px-4 py-2.5 font-mono text-[11px] transition active:scale-95 ${
            lane === 'community'
              ? 'bg-accent text-ink'
              : 'border border-white/10 text-steel hover:border-white/20 hover:text-white'
          }`}
        >
          Community Trending
        </button>
        {lane === 'curated' &&
          (['All', 'AI + Web3', 'DeFi', 'Infrastructure', 'Creator Economy'] as const).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setShowRejected(false);
                }}
                className={`min-h-[44px] rounded-full px-4 py-2.5 font-mono text-[11px] transition active:scale-95 ${
                  selectedCategory === cat && !showRejected
                    ? 'border border-accent/40 text-accent'
                    : 'border border-white/10 text-steel hover:border-white/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ),
          )}
        {lane === 'curated' && (
          <>
            <button
              type="button"
              onClick={() => {
                setShowRejected(false);
                setCuratedOnly((v) => !v);
              }}
              className={`min-h-[44px] rounded-full px-4 py-2.5 font-mono text-[11px] transition active:scale-95 ${
                curatedOnly && !showRejected
                  ? 'border border-accent/40 text-accent'
                  : 'border border-white/10 text-steel hover:border-white/20 hover:text-white'
              }`}
            >
              {curatedOnly
                ? pendingCount > 0
                  ? `Curated only · ${pendingCount} in review`
                  : 'Curated only'
                : 'Include pending'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRejected((v) => !v);
                setCuratedOnly(true);
              }}
              className={`min-h-[44px] rounded-full px-4 py-2.5 font-mono text-[11px] transition active:scale-95 ${
                showRejected
                  ? 'border border-accent/40 bg-accent/5 text-accent'
                  : 'border border-white/10 text-steel hover:border-white/20 hover:text-white'
              }`}
            >
              Why we rejected
            </button>
          </>
        )}
      </div>

      {lane === 'curated' && !showRejected && (
        <div className="mt-8">
          <div className="mb-6 rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-accent/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                Featured Partner
              </span>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="mb-2 font-display text-2xl font-bold text-white">
                  Aura OS — AI Company OS
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-steel">
                  Own a company. Let AI make money. Built with Building Culture ecosystem — fair launch on Base, $29/mo or $299/yr. Real business validation from 1,000+ Vienna shops.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPath('aura')}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-mono text-xs font-bold text-ink transition hover:bg-accent-bright active:scale-95"
                  >
                    $AURA Live
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href="https://aibusiness.fun"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-accent/10 px-4 py-2.5 font-mono text-xs font-semibold text-accent transition hover:bg-accent/20 active:scale-95"
                  >
                    Visit aibusiness.fun
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId('p5');
                      openProject('p5');
                    }}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 font-mono text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/5 active:scale-95"
                  >
                    View Full Story
                  </button>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-accent/10">
                  <Layers className="h-12 w-12 text-accent" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#CCFF00]">
              {BRAND_MULTICHAIN} · Robinhood Chain
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-white">HoodStreet on 4663</h3>
            <p className="mt-2 text-sm text-steel">
              CCFF00 founding Squares, My Neon wallets, Cubes ETH mint. Same 0x as Base. Hop a
              test amount, arrive with gas, then open the street.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCurrentPath('hoodstreet')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#CCFF00] px-4 py-2.5 font-mono text-xs font-bold text-ink"
              >
                HoodStreet
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPath('ccff00')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#CCFF00]/40 px-4 py-2.5 font-mono text-xs font-semibold text-[#CCFF00]"
              >
                CCFF00 Wallet
              </button>
              <button
                type="button"
                onClick={() => setCurrentPath('hood')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 font-mono text-xs font-semibold text-white"
              >
                Honest hop
              </button>
              <button
                type="button"
                onClick={() => setCurrentPath('cubes')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 font-mono text-xs font-semibold text-white"
              >
                Live phases
              </button>
            </div>
          </div>
        </div>
      )}

      {lane === 'community' ? (
        <div className="mt-8">
          <CommunityTrendingSection compact onTrade={onTrade} />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((p) => {
            const Icon = getIconComponent(p.logoUrl);
            const isRejected = p.curation.status === 'rejected';
            return (
              <DepthCard key={p.id} intensity="medium" className="flex h-full flex-col overflow-hidden p-0 [&>*]:pointer-events-auto">
                {p.coverImage && (
                  <div className="relative h-36 overflow-hidden">
                    <OptimizedImage
                      src={p.coverImage}
                      alt={`${p.name} project cover`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                    {!isRejected && (
                      <div className="absolute right-3 top-3 score-ring">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-ink/90 backdrop-blur-sm">
                          <span className="font-mono text-[7px] uppercase tracking-wider text-accent">
                            Score
                          </span>
                          <span className="font-mono text-base font-bold leading-none text-white">
                            {scoreFor(p)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-accent shadow-[0_8px_18px_-8px_rgba(0,0,0,0.7)] backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-base font-bold uppercase tracking-tight">
                          {p.name}
                        </h2>
                        <ProjectSocialLinks project={p} size="sm" />
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-steel">
                        ${p.ticker}
                      </p>
                    </div>
                  </div>
                  {!p.coverImage && !isRejected && (
                    <div className="score-ring shrink-0">
                      <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-ink/90 backdrop-blur-sm">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-accent">
                          Score
                        </span>
                        <span className="font-mono text-lg font-bold leading-none text-white">
                          {scoreFor(p)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-white/75">{p.tagline}</p>

                {isRejected ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-mono text-[10px] uppercase text-accent">Builder Review</p>
                      <p className="font-display text-lg font-bold">
                        {educationalReviewFor(p.id).score}
                      </p>
                    </div>
                    <p className="font-mono text-[10px] uppercase text-steel">Improve</p>
                    <ul className="space-y-1.5">
                      {educationalReviewFor(p.id).improve.map((item) => (
                        <li key={item} className="flex gap-2 text-xs text-white/80">
                          <span className="text-accent">•</span> {item}
                        </li>
                      ))}
                    </ul>
                    <p className="font-mono text-[10px] text-steel">
                      Est. review: {educationalReviewFor(p.id).estimatedDays} days
                    </p>
                  </div>
                ) : (
                  <>
                    <dl className="mt-4 grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 backdrop-blur-sm">
                        <dt className="text-steel">Founded</dt>
                        <dd className="mt-0.5 text-white">{p.foundedYear}</dd>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 backdrop-blur-sm">
                        <dt className="text-steel">Journey</dt>
                        <dd className="mt-0.5 truncate text-white">{p.journey}</dd>
                      </div>
                    </dl>
                    <p className="mt-3 border-l-2 border-accent/35 pl-3 text-xs italic leading-relaxed text-white/65">
                      Why selected: &ldquo;{p.whySelected}&rdquo;
                    </p>
                    <div className="mt-4">
                      <ScoreBars score={p.builderScore} mode="top3" compact />
                    </div>
                  </>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <CurationBadges
                    status={p.curation.status}
                    builderVerified={p.curation.builderVerified}
                  />
                  {!isRejected && (
                    <ReputationChipBadge chip={reputationChipFor(p, proofOfBuildingFor(p))} />
                  )}
                </div>

                {/* Above mobile bottom nav (z-50) so CTAs remain clickable */}
                <div className="relative z-[60] mt-5 flex items-center justify-between gap-2 border-t border-white/8 pt-4">
                  {!isRejected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpvote(p.id);
                      }}
className="min-h-[44px] rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-steel transition hover:border-accent/30 hover:text-accent active:scale-95"                    >
                      ▲ {p.upvotes}
                    </button>
                  )}
                  {!isRejected && (
                    <button
                      type="button"
                      onClick={(e) => handleShare(p, e)}
                      className="min-h-[44px] rounded-lg border border-accent/25 bg-accent/5 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/10 active:scale-95"
                      title="Share discovery"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    {(() => {
                      if (isRejected) return null;
                      const tradeMint = resolveTradeMint(p, tradeableMintSet);
                      const baseAddr = resolveBaseTradeAddress(p);
                      const hoodAddr = resolveHoodAssetAddress(p);
                      const hoodAsset = hoodAssetForProject(p.id);
                      if (!tradeMint && !baseAddr && !hoodAddr) {
                        return (
                          <span className="text-[10px] italic text-steel" title="No tradeable token linked or approved">
                            No trade
                          </span>
                        );
                      }
                      if (hoodAddr) {
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openHoodMint(p.id);
                            }}
                            className="min-h-[44px] rounded-lg bg-accent px-4 py-2 text-xs font-bold text-ink transition hover:bg-accent-bright active:scale-95"
                          >
                            {hoodAsset?.kind === 'nft' ? `Mint ${p.ticker}` : `Open ${p.ticker}`}
                          </button>
                        );
                      }
                      const tradeSymbol = tradeMint
                        ? getCuratedToken(tradeMint)?.symbol || p.ticker
                        : p.ticker;
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (tradeMint) onTrade(tradeMint);
                            else if (baseAddr) openBaseTrade(baseAddr);
                          }}
className="min-h-[44px] rounded-lg bg-accent px-4 py-2 text-xs font-bold text-ink transition hover:bg-accent-bright active:scale-95"                        >
                          Trade {tradeSymbol}
                        </button>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openProject(p.id);
                      }}
className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition hover:border-accent/40 hover:text-accent active:scale-95"                    >
                      {isRejected ? 'Review' : 'Read story'} <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                </div>
              </DepthCard>
            );
          })}
        </div>
      ) : (
        <div className="mt-16 rounded-2xl border border-dashed border-white/10 py-12 text-center">
          <p className="font-mono text-sm text-steel">No projects match your filters.</p>
        </div>
      )}
      </div>
    </>
  );
}
