import React, { useMemo, useState } from 'react';
import { Radar, Crosshair, Swords, Activity, Trophy, Rss } from 'lucide-react';
import { Project, ScoutMission, ScoutProfile } from '../types';
import {
  ARENA_MATCH,
  GENESIS_RADAR,
  SCOUT_LEADERBOARD,
  TERMINAL_SECTORS,
  TRUST_FLOW,
  progressBar,
} from '../data/reputation';
import { BRAND_TAGLINE, BRAND_CATEGORY, BRAND_PHILOSOPHY } from '../data/brand';
import DailyIntelligenceCard from './DailyIntelligenceCard';
import CrystalBallCard from './CrystalBallCard';
import {
  BuildFeedCard,
  ConvictionsCard,
  BuilderSeasonCard,
} from './BuildFeedConvictions';
import { BUILD_FEED, Conviction } from '../data/builderEconomy';
import BuildersManifesto from './BuildersManifesto';
import { WEEKLY_AWARDS } from '../data/builderNetwork';

interface TerminalViewProps {
  projects: Project[];
  scoutMissions: ScoutMission[];
  onCompleteScout: (id: string, analysis: string) => void;
  onVoteArena: (side: 'a' | 'b') => void;
  arenaVotes: { a: number; b: number; userSide?: 'a' | 'b' };
  setSelectedProjectId: (id: string) => void;
  setCurrentPath: (path: string) => void;
  scoutXp: number;
  watchlistUpdates: number;
  userScout: ScoutProfile;
  convictions: Conviction[];
}

function ProgressVisual({ pct }: { pct: number }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
        <span className="tracking-widest text-accent">{progressBar(pct)}</span>
        <span className="text-white">{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TerminalView({
  projects,
  scoutMissions,
  onCompleteScout,
  onVoteArena,
  arenaVotes,
  setSelectedProjectId,
  setCurrentPath,
  scoutXp,
  watchlistUpdates,
  userScout,
  convictions,
}: TerminalViewProps) {
  const [tab, setTab] = useState<'terminal' | 'radar' | 'scouts' | 'arena' | 'feed'>('terminal');
  const [analysisDraft, setAnalysisDraft] = useState<Record<string, string>>({});
  const [activeMission, setActiveMission] = useState<string | null>(null);

  const rising = useMemo(
    () =>
      [...projects]
        .filter((p) => p.curation.status === 'curated' && (p.reputationDelta ?? 0) > 0)
        .sort((a, b) => (b.reputationDelta ?? 0) - (a.reputationDelta ?? 0))
        .slice(0, 3),
    [projects]
  );

  const falling = useMemo(
    () =>
      [...projects]
        .filter((p) => (p.reputationDelta ?? 0) < 0)
        .sort((a, b) => (a.reputationDelta ?? 0) - (b.reputationDelta ?? 0))
        .slice(0, 3),
    [projects]
  );

  const radarEntries = useMemo(() => {
    const fromProjects = projects
      .filter((p) => p.curation.status === 'pending' || p.curation.status === 'reviewed')
      .map((p) => ({
        id: `proj_${p.id}`,
        name: p.name,
        sector: p.category,
        beforeLabel: 'Under evaluation',
        currentLabel: 'Not yet approved',
        status: 'Under Review' as const,
        signal: 'Private until verification complete',
        progress: Math.min(92, Math.max(40, p.builderScore.overall - 8)),
        projectId: p.id,
      }));
    return [...fromProjects, ...GENESIS_RADAR].slice(0, 8);
  }, [projects]);

  const totalArena = arenaVotes.a + arenaVotes.b || 1;

  const submitMission = (id: string) => {
    const text = (analysisDraft[id] || '').trim();
    if (text.length < 24) {
      alert('Write at least a short analysis (24+ characters) before submitting.');
      return;
    }
    onCompleteScout(id, text);
    setActiveMission(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-white sm:px-6 sm:py-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Builder Terminal™
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Builder intelligence network
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-steel">
        {BRAND_TAGLINE} {BRAND_CATEGORY}
      </p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        {BRAND_PHILOSOPHY}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        {TRUST_FLOW.map((step, i) => (
          <React.Fragment key={step}>
            {i > 0 && <span className="text-steel/40">→</span>}
            <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-steel">
              {step}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            { id: 'terminal' as const, label: 'War Room', icon: Activity },
            { id: 'feed' as const, label: 'Build Feed™', icon: Rss },
            { id: 'radar' as const, label: 'Genesis Radar™', icon: Radar },
            { id: 'scouts' as const, label: 'Builder Scouts™', icon: Crosshair },
            { id: 'arena' as const, label: 'Builder Arena', icon: Swords },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                tab === t.id
                  ? 'bg-accent text-ink'
                  : 'border border-white/12 text-steel hover:border-accent/40 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'terminal' && (
        <div className="mt-8 space-y-6">
          <DailyIntelligenceCard
            watchlistUpdates={watchlistUpdates}
            onOpenIntelligence={() => setCurrentPath('ai')}
          />

          <CrystalBallCard
            onOpenProject={(id) => {
              setSelectedProjectId(id);
              setCurrentPath('project-detail');
            }}
          />

          <section className="rounded-3xl border border-white/10 bg-surface/80 p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
              Weekly Builder Awards
            </p>
            <h2 className="font-display mt-1 text-xl font-bold">Come back for the ceremony</h2>
            <ul className="mt-4 space-y-2">
              {WEEKLY_AWARDS.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/8 bg-ink/40 px-3 py-2.5"
                >
                  <div>
                    <p className="font-mono text-[9px] uppercase text-accent">{a.title}</p>
                    <p className="text-sm font-semibold">{a.winner}</p>
                    <p className="text-xs text-steel">{a.note}</p>
                  </div>
                  {a.projectId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(a.projectId!);
                        setCurrentPath('project-detail');
                      }}
                      className="text-xs text-accent hover:underline"
                    >
                      Open →
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-surface/80 p-5 sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                Builder Market
              </p>
              <h2 className="font-display mt-1 text-xl font-bold">Rising</h2>
              <ol className="mt-4 space-y-2">
                {rising.map((p, i) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setCurrentPath('project-detail');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-ink/40 px-3 py-2.5 text-left hover:border-accent/30"
                    >
                      <span className="font-mono text-xs text-steel">#{i + 1}</span>
                      <span className="flex-1 text-sm font-semibold">{p.name}</span>
                      <span className="font-mono text-xs text-accent">
                        +{p.reputationDelta} reputation
                      </span>
                    </button>
                  </li>
                ))}
                {rising.length === 0 && (
                  <p className="text-xs text-steel">No rising movers today.</p>
                )}
              </ol>

              <h2 className="font-display mt-6 text-xl font-bold text-steel">Falling</h2>
              <ol className="mt-4 space-y-2">
                {falling.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setCurrentPath('project-detail');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-ink/40 px-3 py-2.5 text-left hover:border-white/20"
                    >
                      <span className="flex-1 text-sm font-semibold">{p.name}</span>
                      <span className="font-mono text-xs text-steel">
                        {p.reputationDelta} reputation
                      </span>
                    </button>
                  </li>
                ))}
                {falling.length === 0 && (
                  <p className="text-xs text-steel">No falling movers today.</p>
                )}
              </ol>
            </section>

            <section className="rounded-3xl border border-white/10 bg-surface/80 p-5 sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Market</p>
              <h2 className="font-display mt-1 text-xl font-bold">Sector pulse</h2>
              <div className="mt-5 space-y-2">
                {TERMINAL_SECTORS.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between rounded-xl border border-white/8 bg-ink/40 px-4 py-3"
                  >
                    <span className="text-sm font-medium">{s.name}</span>
                    <span
                      className={`font-mono text-sm font-semibold ${
                        s.changePct >= 0 ? 'text-accent' : 'text-steel'
                      }`}
                    >
                      {s.changePct >= 0 ? '+' : ''}
                      {s.changePct}%
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <BuildersManifesto compact />
        </div>
      )}

      {tab === 'feed' && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <BuildFeedCard
            items={BUILD_FEED}
            onOpenProject={(id) => {
              setSelectedProjectId(id);
              setCurrentPath('project-detail');
            }}
          />
          <div className="space-y-6">
            <ConvictionsCard
              convictions={convictions}
              onOpenProject={(id) => {
                setSelectedProjectId(id);
                setCurrentPath('project-detail');
              }}
            />
            <BuilderSeasonCard
              onOpenWinner={(id) => {
                setSelectedProjectId(id);
                setCurrentPath('project-detail');
              }}
            />
          </div>
        </div>
      )}

      {tab === 'radar' && (
        <section className="mt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                Under evaluation
              </p>
              <h2 className="font-display mt-1 text-2xl font-bold">Genesis Radar™</h2>
              <p className="mt-1 text-sm text-steel">
                Not yet approved. Potential future builders — private until verification complete.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {radarEntries.map((g) => (
              <article
                key={g.id}
                className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-surface/90 p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-sans text-lg font-semibold">{g.name}</h3>
                    <p className="font-mono text-[11px] text-steel">{g.sector}</p>
                  </div>
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase text-accent">
                    {g.status}
                  </span>
                </div>
                <ProgressVisual pct={g.progress} />
                <p className="mt-3 text-xs leading-relaxed text-steel">{g.signal}</p>
                {'projectId' in g && g.projectId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(g.projectId!);
                      setCurrentPath('project-detail');
                    }}
                    className="mt-3 text-xs font-semibold text-accent hover:underline"
                  >
                    Open story →
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'scouts' && (
        <section className="mt-8 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                Scout economy
              </p>
              <h2 className="font-display mt-1 text-2xl font-bold">Builder Scouts™</h2>
              <p className="mt-1 text-sm text-steel">
                Discover builders early. Research, verify, write — earn reputation that unlocks rooms.
              </p>
            </div>
            <p className="font-mono text-sm text-accent">Scout XP · {scoutXp}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <article className="rounded-2xl border border-accent/25 bg-accent/[0.06] p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                Your Scout Profile
              </p>
              <h3 className="font-display mt-2 text-xl font-bold">{userScout.name}</h3>
              <p className="text-sm text-steel">{userScout.title}</p>
              <dl className="mt-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-steel">Projects Discovered</dt>
                  <dd>{userScout.projectsDiscovered}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-steel">Early Calls</dt>
                  <dd>{userScout.earlyCalls}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-steel">Research Accuracy</dt>
                  <dd>{userScout.researchAccuracy}%</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-steel">Scout Reputation</dt>
                  <dd className="text-accent">{userScout.scoutReputation}</dd>
                </div>
              </dl>
            </article>

            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-steel">
                Leaderboard
              </p>
              <ul className="space-y-2">
                {SCOUT_LEADERBOARD.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-ink/40 px-3 py-2.5"
                  >
                    <span className="w-6 font-mono text-xs text-steel">#{i + 1}</span>
                    {s.avatarUrl ? (
                      <img src={s.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 font-mono text-[10px]">
                        {s.name.slice(0, 2)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="font-mono text-[10px] text-steel">
                        {s.title} · {s.projectsDiscovered} discovered
                      </p>
                    </div>
                    <span className="font-mono text-xs text-accent">{s.scoutReputation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="space-y-3">
            {scoutMissions.map((m) => (
              <li key={m.id} className="rounded-2xl border border-white/10 bg-surface/80 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase text-accent">Scout Mission</p>
                    <h3 className="mt-1 font-sans text-lg font-semibold">{m.title}</h3>
                    <p className="mt-1 text-sm text-steel">{m.description}</p>
                    <p className="mt-2 font-mono text-[11px] text-white/70">Focus · {m.focus}</p>
                    <p className="mt-1 font-mono text-[11px] text-accent">
                      +{m.rewardXp} Scout XP · {m.rewardLabel}
                    </p>
                    {!m.completed && activeMission === m.id && (
                      <div className="mt-4">
                        <label className="font-mono text-[10px] uppercase text-steel">
                          Your analysis
                        </label>
                        <textarea
                          value={analysisDraft[m.id] || ''}
                          onChange={(e) =>
                            setAnalysisDraft((prev) => ({ ...prev, [m.id]: e.target.value }))
                          }
                          rows={4}
                          placeholder="What did you verify? Commits, team, product signal, risks…"
                          className="mt-1.5 w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => submitMission(m.id)}
                            className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink hover:bg-accent-bright"
                          >
                            Submit analysis
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveMission(null)}
                            className="rounded-full border border-white/12 px-4 py-2 text-xs text-steel hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {m.completed ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] text-accent">
                      <Trophy className="h-3.5 w-3.5" /> Completed
                    </span>
                  ) : activeMission !== m.id ? (
                    <button
                      type="button"
                      onClick={() => setActiveMission(m.id)}
                      className="shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink hover:bg-accent-bright"
                    >
                      Start analysis
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'arena' && (
        <section className="mt-8 rounded-3xl border border-white/10 bg-surface/80 p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
            Builder Arena
          </p>
          <h2 className="font-display mt-1 text-2xl font-bold">{ARENA_MATCH.title}</h2>
          <p className="mt-1 text-sm text-steel">Community votes. Winner gets {ARENA_MATCH.prize}.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <button
              type="button"
              disabled={Boolean(arenaVotes.userSide)}
              onClick={() => onVoteArena('a')}
              className={`rounded-2xl border p-5 text-left transition ${
                arenaVotes.userSide === 'a'
                  ? 'border-accent/50 bg-accent/15'
                  : 'border-white/10 bg-ink/40 hover:border-accent/35'
              } disabled:opacity-80`}
            >
              <p className="font-display text-xl font-bold">{ARENA_MATCH.a.name}</p>
              <p className="mt-2 font-mono text-sm text-accent">{arenaVotes.a} votes</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${(arenaVotes.a / totalArena) * 100}%` }}
                />
              </div>
            </button>
            <p className="text-center font-mono text-xs uppercase text-steel">vs</p>
            <button
              type="button"
              disabled={Boolean(arenaVotes.userSide)}
              onClick={() => onVoteArena('b')}
              className={`rounded-2xl border p-5 text-left transition ${
                arenaVotes.userSide === 'b'
                  ? 'border-accent/50 bg-accent/15'
                  : 'border-white/10 bg-ink/40 hover:border-accent/35'
              } disabled:opacity-80`}
            >
              <p className="font-display text-xl font-bold">{ARENA_MATCH.b.name}</p>
              <p className="mt-2 font-mono text-sm text-accent">{arenaVotes.b} votes</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${(arenaVotes.b / totalArena) * 100}%` }}
                />
              </div>
            </button>
          </div>
          {arenaVotes.userSide && (
            <p className="mt-4 text-center font-mono text-xs text-accent">
              Vote locked · thanks Scout
            </p>
          )}
        </section>
      )}
    </div>
  );
}
