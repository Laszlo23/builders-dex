import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  FilePlus2,
  Layers,
  Sparkles,
  Activity,
  ShieldCheck,
  Fingerprint,
  Network,
  Dna,
  Users,
  GitBranch,
  Compass,
  XCircle,
  BookOpen,
  Trophy,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { Project, Builder } from '../types';
import { BUILDERS_INDEX, getBuilder100 } from '../data/projects';
import { CuratedToken, getCuratedToken, resolveTradeMint } from '../data/curatedTokens';
import VideoBackground from './VideoBackground';
import ScoreBars, { BuilderScoreBadge, CurationBadges } from './ScoreBars';
import DepthCard from './DepthCard';
import ParallaxBand from './ParallaxBand';
import ProjectSocialLinks from './ProjectSocialLinks';
import BuildersManifesto from './BuildersManifesto';
import { BuildFeedCard, BuilderSeasonCard } from './BuildFeedConvictions';
import { BUILD_FEED } from '../data/builderEconomy';
import { BRAND_CATEGORY, BRAND_PHILOSOPHY, BRAND_MISSION_RALLY } from '../data/brand';
import AspirationNetworkSection from './AspirationNetworkSection';
import CrystalBallCard from './CrystalBallCard';
import RecognitionRateCard from './RecognitionRateCard';
import BuilderArchiveCard from './BuilderArchiveCard';
import TalentBuilderSlider from './TalentBuilderSlider';
import FarcasterAppsFeed from './FarcasterAppsFeed';
import BuilderGraphPrideBand from './BuilderGraphPrideBand';
import EducationalReviewCard from './EducationalReviewCard';
import { educationalReviewFor } from '../data/builderPlatform';
import OptimizedImage from './OptimizedImage';

interface LandingViewProps {
  setCurrentPath: (path: string) => void;
  projects: Project[];
  builders: Builder[];
  setSelectedProjectId: (id: string) => void;
  onTrade: (mint?: string) => void;
  onOpenStory: (projectId: string) => void;
  tradeableMintSet: Set<string>;
  tradeableTokens: CuratedToken[];
  onStartFirstDiscovery?: () => void;
}

const HERO_PILLARS: { icon: LucideIcon; label: string }[] = [
  { icon: ShieldCheck, label: 'Proof of Building™' },
  { icon: Dna, label: 'Builder Genome™' },
  { icon: Network, label: 'Builder Graph™' },
  { icon: Fingerprint, label: 'Passport™' },
];

const STEPS: { step: string; icon: LucideIcon; title: string; body: string }[] = [
  {
    step: '01',
    icon: Users,
    title: 'Builders enter',
    body: 'Thousands submit. No shortcuts into the reputation graph.',
  },
  {
    step: '02',
    icon: ShieldCheck,
    title: 'Proof of Building™',
    body: 'We verify commits, deploys, users, and open-source — not promises.',
  },
  {
    step: '03',
    icon: Fingerprint,
    title: 'DNA™ + Passport™',
    body: 'Identity and reputation compound for founders and scouts.',
  },
  {
    step: '04',
    icon: Compass,
    title: 'Discovery → trading',
    body: 'Trade is the final step — after trust is earned.',
  },
];

function SectionEyebrow({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </p>
  );
}

export default function LandingView({
  setCurrentPath,
  projects,
  builders,
  setSelectedProjectId,
  onTrade,
  onOpenStory,
  tradeableMintSet,
  tradeableTokens,
  onStartFirstDiscovery,
}: LandingViewProps) {
  const featured = [...projects]
    .filter((p) => p.curation.status === 'curated')
    .sort((a, b) => b.builderScore.overall - a.builderScore.overall)
    .slice(0, 3);

  const wall = getBuilder100(builders, projects).slice(0, 10);
  const rejected = projects.filter((p) => p.curation.status === 'rejected').slice(0, 2);

  return (
    <div className="relative text-white">
      {/* 1 — HERO: one composition */}
      <section className="relative flex min-h-[calc(100svh-4.5rem)] flex-col justify-center overflow-hidden px-4 pb-20 pt-10">
        <VideoBackground intensity="hero" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(200,232,104,0.12),transparent_55%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="depth-float relative mb-6"
          >
            <div className="absolute inset-0 scale-150 rounded-full bg-accent/20 blur-3xl" />
            <OptimizedImage
              src="/brand-mark.png"
              alt="Builders DEX"
              width={80}
              height={80}
              priority
              className="relative h-16 w-16 rounded-[1.1rem] border border-accent/45 object-cover shadow-[0_20px_50px_-14px_rgba(0,0,0,0.85),0_0_50px_-10px_rgba(200,232,104,0.4)] sm:h-20 sm:w-20"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.7 }}
            className="font-sans brand-glow text-[clamp(2rem,6.5vw,3.5rem)] font-bold leading-[0.95] tracking-tight"
          >
            BUILDERS{' '}
            <span className="text-accent">DEX</span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-5 max-w-2xl font-sans text-base font-medium tracking-tight text-white/90 sm:text-xl"
          >
            {BRAND_MISSION_RALLY}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-accent"
          >
            {BRAND_PHILOSOPHY}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={() =>
                onStartFirstDiscovery ? onStartFirstDiscovery() : setCurrentPath('explore')
              }
              className="btn-sheen inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink shadow-[0_16px_36px_-12px_rgba(200,232,104,0.45)] transition hover:bg-accent-bright"
            >
              <Sparkles className="h-4 w-4" />
              Your First Discovery
            </button>
            <button
              type="button"
              onClick={() => setCurrentPath('terminal')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-accent/50 hover:text-accent"
            >
              <Activity className="h-4 w-4" />
              Open Terminal™
            </button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 grid w-full max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4"
          >
            {HERO_PILLARS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-black/25 px-2.5 py-3 backdrop-blur-md"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-mono text-[8px] uppercase tracking-wider text-white/65">
                  {label}
                </span>
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* 2 — Manifesto */}
      <section className="relative z-10 border-b border-white/5 bg-ink px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <BuildersManifesto />
        </div>
      </section>

      {/* 3 — Prestige (one job) */}
      <section className="border-b border-white/5 bg-ink px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <RecognitionRateCard onApply={() => setCurrentPath('apply')} />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPath('investor')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs font-bold text-white hover:border-accent/50 hover:text-accent"
            >
              <Briefcase className="h-3.5 w-3.5" />
              Investor Mode
            </button>
            <button
              type="button"
              onClick={() => setCurrentPath('apply')}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-bold text-ink hover:bg-accent-bright"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              Apply for recognition
            </button>
          </div>
        </div>
      </section>

      {/* 4 — How it works (icons) */}
      <section className="relative border-b border-white/5 bg-ink px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionEyebrow icon={GitBranch}>The standard path</SectionEyebrow>
          <h2 className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            From noise to trusted trading
          </h2>
          <p className="mt-3 max-w-xl text-sm text-steel">
            One job per step. Reputation first. Trading last.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/15 text-accent">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-5 font-mono text-xs text-accent">{s.step}</p>
                  <h3 className="mt-2 font-display text-base font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel">{s.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 — Mission rally + daily icons */}
      <AspirationNetworkSection setCurrentPath={setCurrentPath} aspirationIndex={0} />

      {/* 6 — Crystal Ball */}
      <section className="border-b border-white/5 bg-ink px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <CrystalBallCard compact onOpenProject={(id) => onOpenStory(id)} />
        </div>
      </section>

      {/* Live rail — seamless infinite loop */}
      {tradeableTokens.length > 0 && (
        <div className="relative z-10 border-y border-white/8 bg-ink/80 py-3 backdrop-blur-md">
          <div className="ticker-mask overflow-hidden">
            <div className="animate-marquee flex w-max">
              {[0, 1].map((dup) => (
                <div
                  key={dup}
                  className="flex shrink-0 items-center gap-8 px-4"
                  aria-hidden={dup === 1}
                >
                  {tradeableTokens.map((t) => (
                    <button
                      key={`${dup}-${t.symbol}`}
                      type="button"
                      onClick={() => onTrade(t.mint)}
                      tabIndex={dup === 0 ? 0 : -1}
                      className="flex shrink-0 items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 hover:border-accent/40"
                    >
                      {t.logoURI ? (
                        <img src={t.logoURI} alt="" className="h-5 w-5 rounded-full" />
                      ) : (
                        <span className="h-5 w-5 rounded-full bg-accent/20" />
                      )}
                      <span className="font-mono text-xs font-medium text-white">{t.symbol}</span>
                      <span className="font-mono text-[10px] text-accent">LIVE</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ParallaxBand
        image="/parallax/index.jpg"
        eyebrow="Builders Index™"
        title="Solana Innovation Market"
        subtitle="A living quality index for the builders shaping the next era of Solana."
        heightClass="min-h-[42vh]"
      />

      {/* Index pulse */}
      <section className="relative border-b border-white/5 bg-ink px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <SectionEyebrow icon={Activity}>Market terminal</SectionEyebrow>
          <h2 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-[1.75rem]">Builders Index™</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Activity,
                n: BUILDERS_INDEX.health.toFixed(1),
                label: 'Market health',
              },
              {
                icon: Layers,
                n: BUILDERS_INDEX.projectsTracked.toLocaleString(),
                label: 'Projects tracked',
              },
              {
                icon: Trophy,
                n: String(BUILDERS_INDEX.projectsApproved),
                label: 'Approved',
              },
              {
                icon: ShieldCheck,
                n: BUILDERS_INDEX.qualityThreshold,
                label: 'Quality threshold',
              },
            ].map((row, i) => {
              const Icon = row.icon;
              return (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-surface/80 px-5 py-5"
                >
                  <Icon className="h-4 w-4 text-accent" aria-hidden />
                  <p className="font-display mt-3 text-xl font-bold text-accent sm:text-2xl">
                    {row.n}
                  </p>
                  <p className="mt-1 text-xs text-steel">{row.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="relative border-b border-white/5 bg-ink px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <SectionEyebrow icon={BookOpen}>Builder Stories</SectionEyebrow>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Startup profiles, not ticker cards
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPath('explore')}
              className="hidden items-center gap-1 font-mono text-xs text-steel hover:text-accent sm:inline-flex"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid gap-8 sm:gap-10 lg:grid-cols-3 lg:gap-12">
            {featured.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <DepthCard
                  intensity="soft"
                  className="flex h-full flex-col overflow-hidden p-0"
                >
                  {p.coverImage && (
                    <div
                      className="relative h-36 cursor-pointer overflow-hidden sm:h-40"
                      onClick={() => onOpenStory(p.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onOpenStory(p.id);
                      }}
                      role="link"
                      tabIndex={0}
                    >
                      <OptimizedImage
                        src={p.coverImage}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                          {p.category}
                        </p>
                        <CurationBadges
                          status={p.curation.status}
                          builderVerified={p.curation.builderVerified}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6 pt-4">
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenStory(p.id)}
                        className="font-display text-left text-xl font-bold uppercase tracking-tight hover:text-accent"
                      >
                        {p.name}
                      </button>
                      <ProjectSocialLinks project={p} size="sm" />
                    </div>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">{p.tagline}</p>
                    <p className="mt-4 border-l-2 border-accent/40 pl-3 text-xs italic leading-relaxed text-white/75">
                      &ldquo;{p.whySelected}&rdquo;
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
                      <BuilderScoreBadge overall={p.builderScore.overall} />
                      <div className="min-w-0 flex-1">
                        <ScoreBars score={p.builderScore} mode="top3" compact />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onOpenStory(p.id);
                        }}
                        className="relative z-20 flex-1 rounded-xl border border-accent/35 bg-accent/10 py-2.5 text-xs font-semibold text-accent backdrop-blur-sm hover:bg-accent/20"
                      >
                        Read story
                      </button>
                      {(() => {
                        const tradeMint = resolveTradeMint(p, tradeableMintSet);
                        if (!tradeMint) return null;
                        const tradeSymbol = getCuratedToken(tradeMint)?.symbol || p.ticker;
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTrade(tradeMint);
                            }}
                            className="btn-sheen flex-1 rounded-xl bg-accent py-2.5 text-xs font-bold text-ink hover:bg-accent-bright"
                          >
                            Trade {tradeSymbol}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </DepthCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TalentBuilderSlider />

      <section className="relative border-b border-white/5 bg-ink px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <BuildFeedCard items={BUILD_FEED} onOpenProject={(id) => onOpenStory(id)} />
          <BuilderSeasonCard onOpenWinner={(id) => onOpenStory(id)} />
        </div>
      </section>

      <section className="border-b border-white/5 bg-ink px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <FarcasterAppsFeed />
        </div>
      </section>

      {/* History — shipped milestones only */}
      <section className="border-b border-white/5 bg-ink px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <BuilderArchiveCard onOpenProject={(id) => onOpenStory(id)} />
        </div>
      </section>

      <BuilderGraphPrideBand
        onApply={() => setCurrentPath('apply')}
        onOpenGraph={() => setCurrentPath('builder-graph')}
      />

      <ParallaxBand
        image="/parallax/wall.jpg"
        eyebrow="Hall of Fame"
        title="The Builder 100"
        subtitle="The top builders pushing Solana forward. Climb the wall."
        heightClass="min-h-[44vh]"
      >
        <button
          type="button"
          onClick={() => setCurrentPath('builders')}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:bg-accent-bright"
        >
          <Trophy className="h-4 w-4" />
          Open the wall <ArrowRight className="h-4 w-4" />
        </button>
      </ParallaxBand>

      <section className="relative border-b border-white/5 bg-ink px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <SectionEyebrow icon={Trophy}>Leaderboard</SectionEyebrow>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Top of the wall
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPath('builders')}
              className="hidden items-center gap-1 font-mono text-xs text-steel hover:text-accent sm:inline-flex"
            >
              Full ranking <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-surface/70">
            {wall.map((entry) => (
              <button
                key={entry.builderId}
                type="button"
                onClick={() => {
                  if (entry.projectId) {
                    setSelectedProjectId(entry.projectId);
                    setCurrentPath('project-detail');
                  } else {
                    setCurrentPath('builders');
                  }
                }}
                className="flex w-full items-center gap-4 border-b border-white/5 px-4 py-3.5 text-left transition hover:bg-white/[0.03] last:border-0 sm:px-6"
              >
                <span className="w-10 font-mono text-sm text-accent">#{entry.rank}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-semibold">{entry.name}</p>
                  <p className="truncate font-mono text-[10px] text-steel">
                    {entry.founder} · {entry.level}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-white">{entry.score}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {rejected.length > 0 && (
        <section className="relative border-b border-white/5 bg-ink px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <SectionEyebrow icon={XCircle}>Builder Review</SectionEyebrow>
            <h2 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Rejection becomes motivation
            </h2>
            <p className="mt-2 max-w-xl text-sm text-steel">
              Score, what to improve, and when to re-apply — not a dead end.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {rejected.map((p) => (
                <EducationalReviewCard
                  key={p.id}
                  projectName={p.name}
                  review={educationalReviewFor(p.id)}
                  rejectionReasons={p.curation.rejectionReasons}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative bg-ink px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/10 via-surface to-ink p-8">
            <SectionEyebrow icon={Sparkles}>Builder Intelligence™</SectionEyebrow>
            <h2 className="font-display mt-2 text-xl font-bold tracking-tight sm:text-2xl">
              Research before you trade
            </h2>
            <p className="mt-3 text-sm text-steel">
              Ask for promising AI projects under $10M market cap — scores, reasons, risks.
            </p>
            <button
              type="button"
              onClick={() => setCurrentPath('ai')}
              className="btn-sheen mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink hover:bg-accent-bright"
            >
              <Sparkles className="h-4 w-4" />
              Open Intelligence™
            </button>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/12">
            <OptimizedImage
              src="/campaign/hook-reputation.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
             sizes="(max-width: 768px) 100vw, 50vw" />
            <div className="absolute inset-0 bg-ink/70 backdrop-blur-[2px]" />
            <div className="relative p-8">
              <SectionEyebrow icon={Layers}>Unruggable meme drop</SectionEyebrow>
              <h2 className="font-display mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                Share the standard
              </h2>
              <p className="mt-3 text-sm text-white/75">
                UNRUGGABLE. No more zero. We DYOR&apos;d it — copy-paste posts + winner creatives.
              </p>
              <button
                type="button"
                onClick={() => setCurrentPath('campaign')}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-6 py-3 text-sm font-bold text-accent hover:bg-accent/20"
              >
                Open meme kit <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <p className="mt-12 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-steel">
          Builders DEX — {BRAND_CATEGORY}
        </p>
      </section>
    </div>
  );
}
