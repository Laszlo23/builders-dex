import React, { useState } from 'react';
import { Search, Brain, Coins, Layers, Share2, HelpCircle, ChevronRight } from 'lucide-react';
import { Project } from '../types';
import ScoreBars, { CurationBadges } from './ScoreBars';
import DepthCard from './DepthCard';
import { resolveTradeMint, getCuratedToken } from '../data/curatedTokens';
import { proofOfBuildingFor } from '../lib/proofOfBuilding';
import { reputationChipFor } from '../lib/reputationRules';
import { ReputationChipBadge } from './ReputationUnlocksCard';
import ProjectSocialLinks from './ProjectSocialLinks';
import { educationalReviewFor } from '../data/builderPlatform';
import OptimizedImage from './OptimizedImage';

interface ExploreViewProps {
  projects: Project[];
  onUpvote: (id: string) => void;
  setSelectedProjectId: (id: string) => void;
  setCurrentPath: (path: string) => void;
  onTrade: (mint?: string) => void;
  onOpenStory: (projectId: string) => void;
  onDiscover?: (id: string) => void;
  tradeableMintSet: Set<string>;
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
}: ExploreViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | 'AI + Web3' | 'DeFi' | 'Infrastructure' | 'Creator Economy'
  >('All');
  const [curatedOnly, setCuratedOnly] = useState(true);
  const [showRejected, setShowRejected] = useState(false);

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
    .sort((a, b) => b.builderScore.overall - a.builderScore.overall);

  const openProject = (id: string) => {
    onDiscover?.(id);
    onOpenStory(id);
  };

  return (
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
            Startup profiles with journey, selection rationale, and Builder Score™ — not hype cards.
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
        {(['All', 'AI + Web3', 'DeFi', 'Infrastructure', 'Creator Economy'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-1.5 font-mono text-[11px] transition ${
              selectedCategory === cat
                ? 'bg-accent text-ink'
                : 'border border-white/10 text-steel hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setShowRejected(false);
            setCuratedOnly((v) => !v);
          }}
          className={`rounded-full px-3 py-1.5 font-mono text-[11px] transition ${
            curatedOnly && !showRejected
              ? 'border border-accent/40 text-accent'
              : 'border border-white/10 text-steel'
          }`}
        >
          {curatedOnly ? 'Curated only' : 'Include pending'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowRejected((v) => !v);
            setCuratedOnly(true);
          }}
          className={`rounded-full px-3 py-1.5 font-mono text-[11px] transition ${
            showRejected
              ? 'border border-white/25 text-steel'
              : 'border border-white/10 text-steel'
          }`}
        >
          Why we rejected
        </button>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((p) => {
            const Icon = getIconComponent(p.logoUrl);
            const isRejected = p.curation.status === 'rejected';
            return (
              <DepthCard key={p.id} intensity="medium" className="flex h-full flex-col overflow-hidden p-0">
                {p.coverImage && (
                  <div className="relative h-36 overflow-hidden">
                    <OptimizedImage
                      src={p.coverImage}
                      alt=""
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
                            {p.builderScore.overall}
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
                          {p.builderScore.overall}
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
                        e.preventDefault();
                        e.stopPropagation();
                        onUpvote(p.id);
                      }}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-xs text-steel hover:border-accent/30 hover:text-accent"
                    >
                      ▲ {p.upvotes}
                    </button>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    {(() => {
                      const tradeMint = resolveTradeMint(p, tradeableMintSet);
                      if (!tradeMint) return null;
                      const tradeSymbol = getCuratedToken(tradeMint)?.symbol || p.ticker;
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onTrade(tradeMint);
                          }}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-ink hover:bg-accent-bright"
                        >
                          Trade {tradeSymbol}
                        </button>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openProject(p.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:border-accent/40 hover:text-accent"
                    >
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
  );
}
