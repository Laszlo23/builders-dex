import React, { useEffect, useState } from 'react';
import {
  Brain,
  Coins,
  Layers,
  Share2,
  HelpCircle,
  ArrowLeft,
  Send,
  Sparkles,
  Github,
  Users,
  Calendar,
} from 'lucide-react';
import { Project, UserWallet, Builder } from '../types';
import ScoreBars, { BuilderScoreBadge, CurationBadges } from './ScoreBars';
import BuilderDnaCard from './BuilderDnaCard';
import ProofOfBuildingCard from './ProofOfBuildingCard';
import FounderPassportCard from './FounderPassportCard';
import ReputationUnlocksCard, { ReputationChipBadge } from './ReputationUnlocksCard';
import { dnaFromScore } from '../lib/builderDna';
import { proofOfBuildingFor } from '../lib/proofOfBuilding';
import { resolveTradeMint } from '../data/curatedTokens';
import { reputationChipFor } from '../lib/reputationRules';
import { storyChaptersFor, storyReadingMinutes } from '../lib/projectStory';
import ProjectSocialLinks from './ProjectSocialLinks';
import { journeyFor, signalsFor } from '../data/builderEconomy';
import { BuilderJourneyCard, BuilderSignalsCard } from './BuilderJourneySignals';
import BuilderPulseCard from './BuilderPulseCard';
import ProjectNeedsCard from './ProjectNeedsCard';
import { BUILDER_PULSE, PROJECT_NEEDS, LEGACY_PASSPORTS } from '../data/builderNetwork';
import {
  HUMAN_FOUNDERS,
  BUILDER_CONVERSATIONS,
  COLLAB_NEEDS,
  PROJECT_VELOCITY,
  BUILDER_GENOMES,
} from '../data/prideMovement';
import BuilderGenomeCard from './BuilderGenomeCard';
import ProjectVelocityCard from './ProjectVelocityCard';
import FounderHumanCard from './FounderHumanCard';
import CollaborationNeedsCard from './CollaborationNeedsCard';
import FeaturedStandardBadge from './FeaturedStandardBadge';
import { BUILDER_SCORE_UNLOCK } from '../lib/reputationRules';
import {
  DUAL_CONVICTION,
  PROJECT_REALITY,
  USED_BY,
  educationalReviewFor,
  episodesFor,
  milestonesFor,
  scoreTransparencyFor,
} from '../data/builderPlatform';
import ScoreTransparencyCard from './ScoreTransparencyCard';
import UsedByCard from './UsedByCard';
import ProjectRealityCard from './ProjectRealityCard';
import DualConvictionCard from './DualConvictionCard';
import BuilderMilestonesCard from './BuilderMilestonesCard';
import EducationalReviewCard from './EducationalReviewCard';
import BuilderNetflixCard from './BuilderNetflixCard';
import OptimizedImage from './OptimizedImage';

interface ProjectDetailViewProps {
  project: Project;
  wallet: UserWallet;
  onFund: (amount: number, receivedTokens: number) => void;
  onAddComment: (commentText: string) => void;
  onBack: () => void;
  onTrade: (mint?: string) => void;
  onAskIntelligence?: (prompt: string) => void;
  tradeableMintSet: Set<string>;
  builders: Builder[];
  setCurrentPath: (path: string) => void;
}

export default function ProjectDetailView({
  project,
  wallet,
  onFund,
  onAddComment,
  onBack,
  onTrade,
  onAskIntelligence,
  tradeableMintSet,
  builders,
  setCurrentPath,
}: ProjectDetailViewProps) {
  const [commentText, setCommentText] = useState('');
  const [supportAmount, setSupportAmount] = useState('');
  const [aiSummary, setAiSummary] = useState(project.aiAnalysis);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setAiSummary(project.aiAnalysis);
  }, [project.id]);

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

  const Icon = getIconComponent(project.logoUrl);
  const dna = dnaFromScore(project.builderScore, project);
  const proof = proofOfBuildingFor(project);
  const tradeMint = resolveTradeMint(project, tradeableMintSet);
  const repChip = reputationChipFor(project, proof);
  const founder =
    builders.find((b) => b.projectsCreated.includes(project.id)) ||
    builders.find((b) =>
      project.team.some((t) => t.name.toLowerCase() === b.name.toLowerCase())
    );
  const chapters = storyChaptersFor(project);
  const readMins = storyReadingMinutes(project);
  const journey = journeyFor(project);
  const signals = signalsFor(project.id);
  const scoreWhy = scoreTransparencyFor(project.id, project.builderScore.overall);
  const usedBy = USED_BY[project.id];
  const reality = PROJECT_REALITY[project.id];
  const dualConviction = DUAL_CONVICTION[project.id];
  const milestones = milestonesFor(project.id);
  const episodes = episodesFor(project.id);
  const eduReview = educationalReviewFor(project.id);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText('');
  };

  const handleSupport = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(supportAmount);
    if (!amount || amount <= 0) return;
    if (!wallet.connected) {
      alert('Connect your wallet to register support.');
      return;
    }
    onFund(amount, amount * 1000);
    setSupportAmount('');
    alert('Support recorded. Thank you for backing this builder.');
  };

  const runIntelligenceRefresh = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: project.name,
          tagline: project.tagline,
          description: project.description,
          category: project.category,
          chain: project.chain,
          goal: project.goal,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      setAiSummary({
        quality: data.quality,
        market: data.market,
        risk: data.risk,
        innovation: data.innovation,
        summary: data.summary,
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Intelligence refresh failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-white">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-2 font-mono text-xs text-steel hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        BACK TO EXPLORE
      </button>

      {/* Editorial story hero */}
      <article className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-surface shadow-[0_40px_100px_-50px_rgba(0,0,0,0.95)]">
        {project.coverImage && (
          <div className="relative h-52 sm:h-72 lg:h-80">
            <OptimizedImage
              src={project.coverImage}
              alt=""
              className="h-full w-full object-cover"
            sizes="100vw"
              priority
              />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-ink/55 to-ink/20" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
                Builder Story · {project.category}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
                  {project.name}
                </h1>
                <ProjectSocialLinks project={project} size="md" />
              </div>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                {project.tagline}
              </p>
              <p className="mt-3 font-mono text-[11px] text-steel">
                ${project.ticker} · {readMins} min read · {project.chain} · Founded{' '}
                {project.foundedYear}
              </p>
            </div>
          </div>
        )}

        {!project.coverImage && (
          <div className="p-6 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              Builder Story · {project.category}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-ink text-accent">
                <Icon className="h-7 w-7" />
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {project.name}
              </h1>
              <ProjectSocialLinks project={project} size="md" />
            </div>
            <p className="mt-3 max-w-2xl text-base text-white/85">{project.tagline}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 px-6 py-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <CurationBadges
              status={project.curation.status}
              builderVerified={project.curation.builderVerified}
            />
            <ReputationChipBadge chip={repChip} />
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[10px] text-steel">
              {project.journey}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {project.curation.status !== 'rejected' && (
              <BuilderScoreBadge overall={project.builderScore.overall} />
            )}
            {tradeMint && (
              <button
                type="button"
                onClick={() => onTrade(tradeMint)}
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-ink hover:bg-accent-bright"
              >
                Trade {project.ticker}
              </button>
            )}
            {onAskIntelligence && (
              <button
                type="button"
                onClick={() =>
                  onAskIntelligence(
                    `Why is ${project.name} interesting? Builder Score™ is ${project.builderScore.overall}/100. Development ${project.builderScore.development}, Community ${project.builderScore.community}, Innovation ${project.builderScore.innovation}. Journey: ${project.journey}. Summarize main strength and main risk.`
                  )
                }
                className="inline-flex items-center gap-2 rounded-full border border-accent/30 px-4 py-2.5 text-xs font-semibold text-accent hover:bg-accent/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ask Intelligence™
              </button>
            )}
          </div>
        </div>
      </article>

      {project.curation.status === 'rejected' && (
        <EducationalReviewCard
          projectName={project.name}
          review={eduReview}
          rejectionReasons={project.curation.rejectionReasons}
        />
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Editorial blog chapters */}
          <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.04] to-surface">
            <div className="border-b border-white/8 px-6 py-5 sm:px-10 sm:py-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                Long read
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                The story of {project.name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel">
                Vision, problem, and why this builder may deserve to win — written like a feature,
                not a ticker card.
              </p>
            </div>

            <div className="space-y-0 px-6 py-2 sm:px-10">
              {chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  className={`border-white/8 py-8 ${idx < chapters.length - 1 ? 'border-b' : ''}`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                    {String(idx + 1).padStart(2, '0')} · {ch.eyebrow}
                  </p>
                  <h3 className="font-display mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                    {ch.title}
                  </h3>
                  <div className="mt-4 space-y-4">
                    {ch.body.map((para) => (
                      <p
                        key={para.slice(0, 48)}
                        className="text-[15px] leading-[1.75] text-white/82 sm:text-base"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {project.whySelected && project.curation.status === 'curated' && (
              <blockquote className="mx-6 mb-8 border-l-2 border-accent/50 bg-accent/[0.06] px-5 py-4 sm:mx-10">
                <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                  Editorial note
                </p>
                <p className="mt-2 text-sm italic leading-relaxed text-white/90 sm:text-base">
                  &ldquo;{project.whySelected}&rdquo;
                </p>
              </blockquote>
            )}

            <div className="flex flex-wrap gap-4 border-t border-white/8 px-6 py-4 font-mono text-[11px] text-steel sm:px-10">
              <span className="inline-flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5" /> {project.githubRepo}
              </span>
              <span>{project.githubActivity.toLocaleString()} commits</span>
              <span>{project.chain}</span>
              {project.marketCapLabel && <span>{project.marketCapLabel}</span>}
            </div>
          </section>

          {project.curation.status !== 'rejected' && (
            <>
              {BUILDER_GENOMES[project.id] && (
                <BuilderGenomeCard
                  genome={BUILDER_GENOMES[project.id]}
                  projectName={project.name}
                />
              )}
              {HUMAN_FOUNDERS[project.id] && (
                <FounderHumanCard
                  founder={HUMAN_FOUNDERS[project.id]}
                  conversations={BUILDER_CONVERSATIONS[project.id]}
                />
              )}
              <BuilderNetflixCard
                episodes={episodes}
                onOpenProject={() => setCurrentPath('builder-stories')}
              />
              {reality && <ProjectRealityCard reality={reality} />}
              {usedBy && <UsedByCard data={usedBy} />}
              {dualConviction && <DualConvictionCard data={dualConviction} />}
              <BuilderMilestonesCard milestones={milestones} />
              <BuilderJourneyCard projectName={project.name} steps={journey} />
              <BuilderSignalsCard signals={signals} />
              {PROJECT_VELOCITY[project.id] && (
                <ProjectVelocityCard velocity={PROJECT_VELOCITY[project.id]} />
              )}
              {BUILDER_PULSE[project.id] && (
                <BuilderPulseCard pulse={BUILDER_PULSE[project.id]} />
              )}
              {COLLAB_NEEDS[project.id] ? (
                <CollaborationNeedsCard
                  projectName={project.name}
                  needs={COLLAB_NEEDS[project.id]}
                  onHelp={() => setCurrentPath('profile')}
                />
              ) : (
                PROJECT_NEEDS[project.id] && (
                  <ProjectNeedsCard
                    projectName={project.name}
                    roles={PROJECT_NEEDS[project.id].roles}
                    matchScore={PROJECT_NEEDS[project.id].matchScore}
                    onOfferHelp={() => setCurrentPath('profile')}
                  />
                )
              )}
              <BuilderDnaCard dna={dna} />
              <ProofOfBuildingCard proof={proof} />
              {founder && (
                <FounderPassportCard
                  founder={founder}
                  buildingSince={Math.min(project.foundedYear, 2021)}
                  previousProtocols={Math.max(founder.projectsCreated.length, 1)}
                  exits={founder.level >= 4 ? 1 : 0}
                  legacy={LEGACY_PASSPORTS[founder.id]}
                  onOpenRankings={() => setCurrentPath('builders')}
                />
              )}
              <ReputationUnlocksCard builderScore={project.builderScore.overall} mode="builder" />
              <FeaturedStandardBadge
                projectName={project.name}
                unlocked={
                  project.curation.status === 'curated' &&
                  project.builderScore.overall >= BUILDER_SCORE_UNLOCK
                }
              />
            </>
          )}

          {project.application && (
            <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                Application packet
              </p>
              <h2 className="font-display mt-2 text-xl font-bold">Hackathon-grade details</h2>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2 font-mono text-[11px]">
                {project.application.hackathonName && (
                  <div>
                    <dt className="text-steel">Hackathon / program</dt>
                    <dd className="mt-0.5 text-white">{project.application.hackathonName}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-steel">Funding</dt>
                  <dd className="mt-0.5 text-white">{project.application.fundingStatus}</dd>
                </div>
                <div>
                  <dt className="text-steel">Team size</dt>
                  <dd className="mt-0.5 text-white">{project.application.teamSize}</dd>
                </div>
                <div>
                  <dt className="text-steel">Contact</dt>
                  <dd className="mt-0.5 text-white">{project.application.contactEmail}</dd>
                </div>
              </dl>
              {project.application.tracks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.application.tracks.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-4 text-sm text-steel">{project.application.whyBuildersDex}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                {project.application.demoUrl && (
                  <a
                    href={project.application.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    Demo
                  </a>
                )}
                {project.application.pitchDeckUrl && (
                  <a
                    href={project.application.pitchDeckUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    Deck
                  </a>
                )}
                {project.application.videoUrl && (
                  <a
                    href={project.application.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    Video
                  </a>
                )}
              </div>
            </section>
          )}

          {project.curation.status !== 'rejected' && (
            <ScoreTransparencyCard data={scoreWhy} />
          )}

          {/* Score breakdown */}
          <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
            <h2 className="font-sans text-lg font-bold">Builder Score™ breakdown</h2>
            <p className="mt-1 text-xs text-steel">
              Development · Innovation · Community · Transparency · Product · Reputation · Liquidity
            </p>
            <div className="mt-6">
              <ScoreBars score={project.builderScore} mode="all" />
            </div>
          </section>

          {/* Roadmap */}
          <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              <h2 className="font-sans text-lg font-bold">Development progress</h2>
            </div>
            <div className="space-y-3">
              {project.roadmap.map((r) => (
                <div
                  key={`${r.phase}-${r.title}`}
                  className="rounded-xl border border-white/8 bg-ink/40 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {r.phase}: {r.title}
                    </p>
                    <span className="font-mono text-[10px] uppercase text-accent">{r.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-steel">{r.description}</p>
                  <p className="mt-1 font-mono text-[10px] text-steel/80">{r.date}</p>
                </div>
              ))}
            </div>
            {project.communityMilestones && project.communityMilestones.length > 0 && (
              <div className="mt-6">
                <h3 className="font-mono text-[11px] uppercase tracking-wider text-steel">
                  Community milestones
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {project.communityMilestones.map((m) => (
                    <li key={m} className="text-xs text-white/80">
                      · {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Team */}
          <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              <h2 className="font-sans text-lg font-bold">Team transparency</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {project.team.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-ink/40 p-3"
                >
                  <img
                    src={member.avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="font-mono text-[11px] text-steel">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Intelligence summary */}
          <section className="rounded-3xl border border-accent/20 bg-accent/5 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                  Builders Intelligence™
                </p>
                <h2 className="mt-1 font-sans text-lg font-bold">Research summary</h2>
              </div>
              <button
                type="button"
                onClick={runIntelligenceRefresh}
                disabled={analyzing}
                className="rounded-full border border-accent/30 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10 disabled:opacity-50"
              >
                {analyzing ? 'Refreshing…' : 'Refresh analysis'}
              </button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
              {aiSummary.summary}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[11px] sm:grid-cols-4">
              <div className="rounded-lg bg-ink/40 px-3 py-2">
                Quality <span className="text-accent">{aiSummary.quality}</span>
              </div>
              <div className="rounded-lg bg-ink/40 px-3 py-2">
                Market <span className="text-accent">{aiSummary.market}</span>
              </div>
              <div className="rounded-lg bg-ink/40 px-3 py-2">
                Risk <span className="text-accent">{aiSummary.risk}</span>
              </div>
              <div className="rounded-lg bg-ink/40 px-3 py-2">
                Innovation <span className="text-accent">{aiSummary.innovation}</span>
              </div>
            </div>
          </section>

          {/* Comments */}
          <section className="rounded-3xl border border-white/10 bg-surface p-6 md:p-8">
            <h2 className="font-sans text-lg font-bold">Community signal</h2>
            <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share structured feedback…"
                className="flex-1 rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm outline-none focus:border-accent/40"
              />
              <button
                type="submit"
                className="rounded-xl bg-accent px-3 text-ink hover:bg-accent-bright"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-4 space-y-3">
              {project.comments.length === 0 && (
                <p className="text-xs text-steel">No comments yet — be the first signal.</p>
              )}
              {project.comments.map((c) => (
                <div key={c.id} className="rounded-xl border border-white/5 bg-ink/30 p-3">
                  <p className="text-xs font-semibold text-white">
                    {c.author}{' '}
                    <span className="font-mono font-normal text-steel">{c.wallet}</span>
                  </p>
                  <p className="mt-1 text-sm text-steel">{c.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-surface p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-steel">Support</p>
            <p className="mt-2 text-xs leading-relaxed text-steel">
              Optional builder support (simulated). Trade remains the primary path for curated mints.
            </p>
            <form onSubmit={handleSupport} className="mt-4 space-y-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={supportAmount}
                onChange={(e) => setSupportAmount(e.target.value)}
                placeholder="Amount"
                className="w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 font-mono text-sm outline-none focus:border-accent/40"
              />
              <button
                type="submit"
                className="w-full rounded-xl border border-white/12 py-2.5 text-xs font-semibold text-white hover:border-accent/40"
              >
                Register support
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-surface p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-steel">Research quests</p>
            <ul className="mt-3 space-y-2">
              {project.quests.map((q) => (
                <li key={q.id} className="rounded-xl border border-white/5 bg-ink/40 px-3 py-2">
                  <p className="text-xs font-semibold text-white">{q.name}</p>
                  <p className="mt-0.5 text-[11px] text-steel">{q.description}</p>
                  <p className="mt-1 font-mono text-[10px] text-accent">+{q.xp} XP</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
