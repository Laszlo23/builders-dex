import React, { useState } from 'react';
import { Trophy, CheckCircle2, BadgeCheck, ExternalLink, Loader2 } from 'lucide-react';
import { Builder, Project, Quest } from '../types';
import { getBuilder100 } from '../data/projects';
import { talentProfileUrl, type TalentBuilder } from '../data/talentFarcaster';
import type { NavState } from '../lib/routes';
import DepthCard from './DepthCard';
import BuilderCouncilCard from './BuilderCouncilCard';
import ComingSoonBanner from './ComingSoonBanner';

interface BuildersViewProps {
  builders: Builder[];
  talent: TalentBuilder[];
  talentSource: 'live' | 'curated';
  liveLoading: boolean;
  liveError: string | null;
  projects: Project[];
  quests: Quest[];
  onCompleteQuest: (questId: string) => void;
  onFollowBuilder: (builderId: string) => void;
  setSelectedProjectId: (id: string) => void;
  setCurrentPath: (path: string, state?: NavState) => void;
}

function modeLabel(mode?: Builder['scoreMode']): string {
  switch (mode) {
    case 'live':
      return 'Live GitHub';
    case 'partial':
      return 'Partial';
    case 'provisional':
      return 'Provisional';
    case 'seed':
    case undefined:
      return 'Cited';
    default: {
      const _never: never = mode;
      return _never;
    }
  }
}

export default function BuildersView({
  builders,
  talent,
  talentSource,
  liveLoading,
  liveError,
  projects,
  quests,
  onCompleteQuest,
  onFollowBuilder,
  setSelectedProjectId,
  setCurrentPath,
}: BuildersViewProps) {
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const wall = getBuilder100(builders, projects);
  const top = wall.slice(0, 25);
  const liveCount = builders.filter((b) => b.scoreMode === 'live' || b.scoreMode === 'partial').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-white/8 pb-6">
        <p className="page-kicker">The Wall of Builders</p>
        <h1 className="page-display mt-2 text-4xl font-extrabold sm:text-6xl">
          The Builder 100
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-steel">
          Live Builder Score™ from public GitHub, plus Talent Protocol identities. No invented
          followers. The wall grows as more repos and passports clear.
        </p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-accent">
          {liveLoading
            ? 'Fetching live scores…'
            : `${liveCount} catalog builders cited · Talent ${talentSource}`}
        </p>
      </div>

      {liveError && (
        <ComingSoonBanner
          title="Live sync is still warming up"
          detail="GitHub or Talent did not answer this pass. We keep real catalog identities on screen and retry on the next load — we do not invent scores."
        />
      )}

      <div className="mb-10">
        <BuilderCouncilCard onExplore={() => setCurrentPath('builder-graph')} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.05] to-surface shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
              <Trophy className="h-5 w-5 text-accent" />
              <h2 className="font-sans text-base font-bold">Hall of Fame</h2>
              {liveLoading && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
            </div>
            <div className="divide-y divide-white/5">
              {top.map((entry) => {
                const row = builders.find((b) => b.id === entry.builderId);
                return (
                  <div
                    key={entry.builderId}
                    className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
                  >
                    <span className="w-10 shrink-0 font-mono text-sm font-bold text-accent">
                      #{entry.rank}
                    </span>
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={`${entry.name} avatar`}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-ink font-mono text-[10px] text-steel">
                        {entry.rank}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{entry.name}</p>
                      <p className="truncate font-mono text-[10px] text-steel">
                        {entry.founder} · {entry.level}
                        {row?.githubRepo ? ` · ${row.githubRepo}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold">{Math.round(entry.score)}</p>
                      <p className="font-mono text-[9px] text-accent/80">
                        {modeLabel(row?.scoreMode)}
                      </p>
                    </div>
                    {entry.real && entry.projectId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(entry.projectId!);
                          setCurrentPath('project-detail', { projectId: entry.projectId });
                        }}
                        className="hidden min-h-[40px] rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-steel hover:border-accent/40 hover:text-accent active:scale-95 sm:inline"
                      >
                        Story
                      </button>
                    )}
                    {entry.real && (
                      <button
                        type="button"
                        onClick={() => {
                          if (followingMap[entry.builderId]) return;
                          setFollowingMap((m) => ({ ...m, [entry.builderId]: true }));
                          onFollowBuilder(entry.builderId);
                        }}
                        className={`min-h-[40px] rounded-lg px-3 py-2 font-mono text-xs active:scale-95 ${
                          followingMap[entry.builderId]
                            ? 'bg-accent/15 text-accent'
                            : 'border border-white/10 text-steel hover:text-white'
                        }`}
                      >
                        {followingMap[entry.builderId] ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="border-t border-white/5 px-5 py-3 font-mono text-[10px] text-steel">
              Showing {Math.min(25, wall.length)} catalog builders · scores from /api/builder-score
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/12 bg-surface/80">
            <div className="border-b border-white/5 px-5 py-4">
              <h2 className="font-sans text-base font-bold">Talent Protocol</h2>
              <p className="mt-1 font-mono text-[10px] text-steel">
                {talentSource === 'live'
                  ? 'Live Talent.app search'
                  : 'Public Talent.app profiles — we still work on the live key when it is off'}
              </p>
            </div>
            <ul className="divide-y divide-white/5">
              {talent.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <img
                    src={t.avatarUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.displayName}</p>
                    <p className="truncate font-mono text-[10px] text-steel">
                      @{t.handle}
                      {t.tagline ? ` · ${t.tagline}` : ''}
                    </p>
                  </div>
                  {typeof t.score === 'number' && (
                    <span className="font-mono text-xs text-accent">{Math.round(t.score)}</span>
                  )}
                  <a
                    href={talentProfileUrl(t)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-[10px] text-accent hover:border-accent/40"
                  >
                    Talent <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {builders
              .slice()
              .sort((a, b) => b.builderScore - a.builderScore)
              .slice(0, 4)
              .map((b) => (
                <DepthCard key={b.id} intensity="soft" className="p-5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                    Builder Passport™ · {modeLabel(b.scoreMode)}
                  </p>
                  <p className="mt-2 font-display text-lg font-bold">{b.name}</p>
                  <dl className="mt-3 space-y-1.5 font-mono text-[11px] text-steel">
                    <div className="flex justify-between">
                      <dt>Builder Level</dt>
                      <dd className="text-white">{b.reputationLevel}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Live overall</dt>
                      <dd className="text-accent">{Math.round(b.builderScore)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>GitHub stars</dt>
                      <dd className="text-white">{b.followers || '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Community (cited)</dt>
                      <dd className="text-accent">{Math.round(b.communityTrust)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Open Source Impact</dt>
                      <dd className="text-white">{b.openSourceImpact}</dd>
                    </div>
                  </dl>
                </DepthCard>
              ))}
          </div>
        </div>

        <div className="space-y-6">
          <DepthCard intensity="soft" className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-accent" />
              <h2 className="font-sans text-base font-bold">Discovery Quests</h2>
            </div>
            <p className="text-xs text-steel">
              Become a researcher. Earn XP, research badges, and Builder Reputation.
            </p>
            <ul className="mt-4 space-y-2">
              {quests.map((q) => (
                <li
                  key={q.id}
                  className={`rounded-xl border px-3 py-2.5 text-xs ${
                    q.completed ? 'border-accent/30 bg-accent/5' : 'border-white/8'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white">{q.name}</p>
                    {q.completed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCompleteQuest(q.id)}
                        className="shrink-0 font-mono text-[10px] text-accent hover:underline"
                      >
                        Claim
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-steel">{q.description}</p>
                  <p className="mt-1 font-mono text-[10px] text-accent">
                    +{q.xp} XP{q.badge ? ` · ${q.badge}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </DepthCard>
        </div>
      </div>
    </div>
  );
}
