import React, { useEffect, useState } from 'react';
import {
  Download,
  Sparkles,
  BadgeCheck,
  Pencil,
  Save,
  FilePlus2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  UserWallet,
  Quest,
  SwapTransaction,
  PassportStats,
  UserProfile,
  UserSocials,
  Project,
} from '../types';
import { CurationBadges } from './ScoreBars';
import ProjectSubmitForm from './ProjectSubmitForm';
import ReputationUnlocksCard from './ReputationUnlocksCard';
import OnChainResumeCard from './OnChainResumeCard';
import { USER_LEGACY_DEFAULT } from '../data/builderNetwork';

const EMPTY_SOCIALS: UserSocials = {
  x: '',
  farcaster: '',
  linkedin: '',
  github: '',
  discord: '',
  telegram: '',
  tiktok: '',
  paragraph: '',
  website: '',
  email: '',
};

const SOCIAL_FIELDS: { key: keyof UserSocials; label: string }[] = [
  { key: 'x', label: 'X / Twitter' },
  { key: 'farcaster', label: 'Farcaster username' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'github', label: 'GitHub' },
  { key: 'discord', label: 'Discord' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'paragraph', label: 'Paragraph / blog' },
  { key: 'website', label: 'Website' },
  { key: 'email', label: 'Email' },
];

type NeynarResult = {
  score: number | null;
  username?: string;
  displayName?: string;
  fid?: number;
  pfpUrl?: string;
  source?: string;
  error?: string;
};

interface ProfileViewProps {
  wallet: UserWallet;
  builderXp: number;
  builderLevelName: string;
  contributionsCount: number;
  passport: PassportStats;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  myProjects: Project[];
  onSubmitProject: (
    project: Omit<Project, 'id' | 'rating' | 'upvotes' | 'comments' | 'tokenPriceHistory'>
  ) => void;
  quests?: Quest[];
  transactions?: SwapTransaction[];
  onOpenIntelligence?: () => void;
  onOpenTerminal?: () => void;
  onOpenLaunchpad?: () => void;
  setSelectedProjectId: (id: string) => void;
  setCurrentPath: (path: string) => void;
  connectWallet: () => void;
}

export default function ProfileView({
  wallet,
  builderXp,
  builderLevelName,
  contributionsCount,
  passport,
  profile,
  onSaveProfile,
  myProjects,
  onSubmitProject,
  quests = [],
  transactions = [],
  onOpenIntelligence,
  onOpenTerminal,
  onOpenLaunchpad,
  setSelectedProjectId,
  setCurrentPath,
  connectWallet,
}: ProfileViewProps) {
  const [editing, setEditing] = useState(!profile.displayName);
  const [draft, setDraft] = useState<UserProfile>({
    ...profile,
    socials: { ...EMPTY_SOCIALS, ...profile.socials },
  });
  const [showSubmit, setShowSubmit] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [neynarLoading, setNeynarLoading] = useState(false);
  const [neynar, setNeynar] = useState<NeynarResult | null>(null);

  useEffect(() => {
    setDraft({
      ...profile,
      socials: { ...EMPTY_SOCIALS, ...profile.socials },
    });
  }, [profile]);

  const displayName =
    profile.displayName || (wallet.connected ? wallet.address : 'Guest Researcher');
  const socials = { ...EMPTY_SOCIALS, ...profile.socials };

  const saveProfile = () => {
    const next = {
      ...draft,
      displayName: draft.displayName.trim() || displayName,
      socials: { ...EMPTY_SOCIALS, ...draft.socials },
    };
    onSaveProfile(next);
    setEditing(false);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  const fetchNeynarScore = async () => {
    const username = (draft.socials?.farcaster || profile.socials?.farcaster || '')
      .replace(/^@/, '')
      .trim();
    if (!username) {
      setNeynar({ score: null, error: 'Add a Farcaster username in your profile first.' });
      setEditing(true);
      return;
    }
    setNeynarLoading(true);
    setNeynar(null);
    try {
      const res = await fetch(
        `/api/neynar/score?username=${encodeURIComponent(username)}`
      );
      const data = (await res.json()) as NeynarResult;
      setNeynar(data);
      if (data.pfpUrl && !draft.avatarUrl) {
        setDraft((d) => ({ ...d, avatarUrl: data.pfpUrl || d.avatarUrl }));
      }
      if (data.displayName && !draft.displayName) {
        setDraft((d) => ({ ...d, displayName: data.displayName || d.displayName }));
      }
    } catch {
      setNeynar({ score: null, error: 'Could not reach Neynar. Try again.' });
    } finally {
      setNeynarLoading(false);
    }
  };

  const handleExportCSV = () => {
    const rows: string[][] = [
      ['BUILDERS DEX — BUILDER PASSPORT™'],
      ['Display Name', profile.displayName],
      ['Level', builderLevelName],
      ['XP', String(builderXp)],
      ['Bio', profile.bio],
      ['Neynar Score', neynar?.score != null ? String(neynar.score) : ''],
      ...SOCIAL_FIELDS.map((f) => [f.label, socials[f.key]]),
      ['Address', wallet.connected ? wallet.address : 'UNCONNECTED'],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `builder_passport_${wallet.address || 'anon'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fieldClass =
    'w-full rounded-xl border border-white/12 bg-ink/80 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-steel/70 focus:border-accent/50 focus:ring-1 focus:ring-accent/20';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-white sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Builder Passport™
          </p>
          <h1 className="section-title font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Your pulse identity
          </h1>
          <p className="mt-2 max-w-xl text-sm text-steel">
            Edit your profile anytime. Link Farcaster to pull your Neynar score onto your Passport™.
          </p>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setDraft({
                ...profile,
                socials: { ...EMPTY_SOCIALS, ...profile.socials },
              });
              setEditing(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2.5 text-xs font-semibold text-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setDraft({
                  ...profile,
                  socials: { ...EMPTY_SOCIALS, ...profile.socials },
                });
                setEditing(false);
              }}
              className="rounded-full border border-white/12 px-4 py-2 text-xs text-steel"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveProfile}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-ink"
            >
              <Save className="h-3.5 w-3.5" />
              Save passport
            </button>
          </div>
        )}
      </div>

      {savedFlash && (
        <p className="mt-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm text-accent">
          Passport saved — changes persist on this device.
        </p>
      )}

      <div className="pulse-card mt-8 overflow-hidden rounded-3xl border border-accent/35 bg-gradient-to-br from-accent/15 via-surface to-ink">
        <div className="border-b border-white/10 px-6 py-4 sm:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
            Builder Passport
          </p>
        </div>
        <div className="p-6 sm:p-8">
          {editing ? (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase text-steel">
                  Display name
                </span>
                <input
                  value={draft.displayName}
                  onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
                  placeholder="Your builder name"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase text-steel">Bio</span>
                <textarea
                  value={draft.bio}
                  onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                  placeholder="What are you building?"
                  rows={3}
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase text-steel">
                  Avatar URL
                </span>
                <input
                  value={draft.avatarUrl}
                  onChange={(e) => setDraft({ ...draft, avatarUrl: e.target.value })}
                  placeholder="https://…"
                  className={fieldClass}
                />
              </label>
              <p className="pt-2 font-mono text-[10px] uppercase tracking-wider text-accent">
                Linked socials
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SOCIAL_FIELDS.map((f) => (
                  <label key={f.key} className="block">
                    <span className="mb-1 block font-mono text-[9px] uppercase text-steel">
                      {f.label}
                    </span>
                    <input
                      value={draft.socials?.[f.key] || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          socials: {
                            ...EMPTY_SOCIALS,
                            ...draft.socials,
                            [f.key]: e.target.value,
                          },
                        })
                      }
                      placeholder={f.key === 'farcaster' ? 'username (no @)' : f.label}
                      className={fieldClass}
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={saveProfile}
                className="mt-2 w-full rounded-full bg-accent py-3 text-sm font-bold text-ink sm:w-auto sm:px-8"
              >
                Save passport
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start gap-5">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 font-mono text-lg text-accent">
                    {(displayName[0] || 'B').toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-3xl font-bold">{displayName}</p>
                  <p className="mt-2 inline-flex rounded-full border border-accent/40 bg-accent/15 px-3 py-1 font-mono text-xs text-accent">
                    {builderLevelName}
                  </p>
                  {profile.bio && <p className="mt-3 text-sm text-white/85">{profile.bio}</p>}
                  <p className="mt-2 font-mono text-[11px] text-steel">
                    XP <span className="text-accent">{builderXp.toLocaleString()}</span> · Scout{' '}
                    <span className="text-accent">{passport.scoutXp ?? 0}</span> · Trust{' '}
                    <span className="text-accent">{passport.communityTrust}</span>
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {SOCIAL_FIELDS.filter((f) => socials[f.key]).map((f) => (
                  <a
                    key={f.key}
                    href={
                      socials[f.key].startsWith('http') || socials[f.key].includes('@')
                        ? socials[f.key].startsWith('http')
                          ? socials[f.key]
                          : `mailto:${socials[f.key]}`
                        : f.key === 'farcaster'
                          ? `https://warpcast.com/${socials[f.key].replace(/^@/, '')}`
                          : `https://${socials[f.key]}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-white/85 hover:border-accent/40 hover:text-accent"
                  >
                    {f.label} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
                {!SOCIAL_FIELDS.some((f) => socials[f.key]) && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-xs text-accent hover:underline"
                  >
                    No socials yet — edit profile to add X & Farcaster →
                  </button>
                )}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: 'First Commit', value: USER_LEGACY_DEFAULT.firstCommit },
                  {
                    label: 'People Inspired',
                    value: Math.max(
                      passport.projectsDiscovered * 40,
                      passport.activeUsers ?? 0
                    ).toLocaleString(),
                  },
                  {
                    label: 'Protocols Shipped',
                    value: String(passport.projectsCreated),
                  },
                  {
                    label: 'Open Source Hours',
                    value: String(
                      (passport.openSourceContributions ?? contributionsCount) * 4 ||
                        USER_LEGACY_DEFAULT.openSourceHours
                    ),
                  },
                  {
                    label: 'Builders Mentored',
                    value: String(Math.floor(passport.previousContributions / 5)),
                  },
                  {
                    label: 'Legacy Rank',
                    value: builderLevelName.includes('Genesis')
                      ? 'Genesis'
                      : builderLevelName.includes('Visionary')
                        ? 'Core'
                        : 'Rookie',
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-white/10 bg-ink/50 px-3 py-3"
                  >
                    <p className="font-mono text-[10px] uppercase text-steel">{s.label}</p>
                    <p className="mt-1 font-display text-lg font-bold text-accent sm:text-xl">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <section className="pulse-card mt-6 rounded-3xl border border-white/12 bg-surface/90 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              Neynar Score
            </p>
            <h2 className="font-display mt-1 text-xl font-bold">Farcaster quality signal</h2>
            <p className="mt-1 max-w-md text-xs text-steel">
              Pull your Neynar user score (0–1) from your linked Farcaster username.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchNeynarScore}
            disabled={neynarLoading}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-ink disabled:opacity-60"
          >
            {neynarLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {neynarLoading ? 'Fetching…' : 'Get Neynar score'}
          </button>
        </div>
        {neynar && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-ink/50 px-4 py-4">
            {neynar.error ? (
              <p className="text-sm text-steel">{neynar.error}</p>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                {neynar.pfpUrl && (
                  <img
                    src={neynar.pfpUrl}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                )}
                <div>
                  <p className="font-mono text-[10px] uppercase text-steel">Score</p>
                  <p className="font-display text-3xl font-bold text-accent">
                    {neynar.score != null ? neynar.score.toFixed(2) : '—'}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {neynar.displayName || neynar.username}
                    {neynar.username && (
                      <span className="ml-2 font-mono text-xs text-steel">
                        @{neynar.username}
                      </span>
                    )}
                  </p>
                  {neynar.fid != null && (
                    <p className="mt-0.5 font-mono text-[10px] text-steel">FID {neynar.fid}</p>
                  )}
                  {neynar.source === 'demo' && (
                    <p className="mt-1 text-[11px] text-steel">
                      Demo score — set NEYNAR_API_KEY for live data.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="mt-8">
        <OnChainResumeCard
          name={displayName}
          legacy={{
            builderId: 'user',
            ...USER_LEGACY_DEFAULT,
            peopleInspired: Math.max(
              passport.projectsDiscovered * 40,
              passport.activeUsers ?? 0
            ),
            protocolsShipped: passport.projectsCreated,
            openSourceHours:
              (passport.openSourceContributions ?? contributionsCount) * 4 ||
              USER_LEGACY_DEFAULT.openSourceHours,
            buildersMentored: Math.floor(passport.previousContributions / 5),
            legacyRank: builderLevelName.includes('Genesis')
              ? 'Genesis'
              : builderLevelName.includes('Visionary') || builderLevelName.includes('Core')
                ? 'Core'
                : 'Rookie',
            career: [
              { year: 2026, title: 'Joined Builders DEX', verified: true },
              {
                year: 2026,
                title: `${passport.projectsDiscovered} builders discovered`,
                verified: passport.projectsDiscovered > 0,
              },
              {
                year: 2026,
                title: `${passport.researchQuestsCompleted} research quests completed`,
                verified: passport.researchQuestsCompleted > 0,
              },
              {
                year: 2026,
                title: `Scout XP ${passport.scoutXp ?? 0}`,
                verified: (passport.scoutXp ?? 0) > 0,
              },
            ],
          }}
        />
      </div>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-surface/80 p-5 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Scout Profile
          </p>
          <h2 className="font-display mt-1 text-xl font-bold">Builder Scouts™</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="rounded-xl border border-white/8 bg-ink/50 px-3 py-2.5">
              <dt className="text-steel">Projects Discovered</dt>
              <dd className="mt-1 text-lg text-white">{passport.projectsDiscovered}</dd>
            </div>
            <div className="rounded-xl border border-white/8 bg-ink/50 px-3 py-2.5">
              <dt className="text-steel">Early Calls</dt>
              <dd className="mt-1 text-lg text-white">{passport.earlyCalls || 0}</dd>
            </div>
            <div className="rounded-xl border border-white/8 bg-ink/50 px-3 py-2.5">
              <dt className="text-steel">Research Accuracy</dt>
              <dd className="mt-1 text-lg text-white">{passport.researchAccuracy || 70}%</dd>
            </div>
            <div className="rounded-xl border border-white/8 bg-ink/50 px-3 py-2.5">
              <dt className="text-steel">Scout Reputation</dt>
              <dd className="mt-1 text-lg text-accent">
                {Math.min(
                  100,
                  Math.round((passport.scoutXp || 0) / 20 + passport.builderReputation / 2)
                )}
              </dd>
            </div>
          </dl>
          {onOpenTerminal && (
            <button
              type="button"
              onClick={onOpenTerminal}
              className="mt-4 text-xs font-semibold text-accent hover:underline"
            >
              Open Scout missions →
            </button>
          )}
        </article>
        <ReputationUnlocksCard
          builderScore={passport.builderReputation}
          scoutReputation={Math.min(
            100,
            Math.round((passport.scoutXp || 0) / 20 + passport.builderReputation / 2)
          )}
          mode="both"
        />
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              Submit for approval
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold">Hackathon-grade application</h2>
          </div>
          <div className="flex gap-2">
            {onOpenLaunchpad && (
              <button
                type="button"
                onClick={onOpenLaunchpad}
                className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-steel"
              >
                Accelerator
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowSubmit((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink"
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              {showSubmit ? 'Close' : 'New application'}
            </button>
          </div>
        </div>

        {showSubmit && (
          <div className="mt-5 rounded-3xl border border-white/10 bg-surface/80 p-5 sm:p-6">
            <ProjectSubmitForm
              founderName={displayName}
              avatarUrl={profile.avatarUrl}
              defaultSocials={socials}
              walletConnected={wallet.connected}
              onConnect={connectWallet}
              onSubmit={(p) => {
                onSubmitProject(p);
                setShowSubmit(false);
                alert('Full application submitted. Track it on Accelerator under review.');
              }}
            />
          </div>
        )}

        <ul className="mt-5 space-y-2">
          {myProjects.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-white/12 px-4 py-8 text-center text-sm text-steel">
              No applications yet.
            </li>
          ) : (
            myProjects.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface/70 px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="font-mono text-[10px] text-steel">
                    ${p.ticker}
                    {p.application?.hackathonName ? ` · ${p.application.hackathonName}` : ''}
                  </p>
                  <div className="mt-1.5">
                    <CurationBadges
                      status={p.curation.status}
                      builderVerified={p.curation.builderVerified}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setCurrentPath('project-detail');
                  }}
                  className="text-xs font-semibold text-accent"
                >
                  View →
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        {onOpenTerminal && (
          <button
            type="button"
            onClick={onOpenTerminal}
            className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink"
          >
            Terminal™
          </button>
        )}
        {onOpenIntelligence && (
          <button
            type="button"
            onClick={onOpenIntelligence}
            className="inline-flex items-center gap-2 rounded-full border border-accent/30 px-4 py-2 text-xs font-semibold text-accent"
          >
            <Sparkles className="h-3.5 w-3.5" /> Intelligence™
          </button>
        )}
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-xs text-steel"
        >
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-surface p-6">
          <h2 className="font-display text-lg font-bold">Quests</h2>
          <ul className="mt-4 space-y-2">
            {quests.map((q) => (
              <li
                key={q.id}
                className={`rounded-xl border px-3 py-2.5 text-xs ${
                  q.completed
                    ? 'border-accent/30 bg-accent/5 text-accent'
                    : 'border-white/8 text-steel'
                }`}
              >
                <div className="flex justify-between gap-2">
                  <p className="font-semibold text-white">{q.name}</p>
                  {q.badge && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                      <BadgeCheck className="h-3 w-3" />
                      {q.badge}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-white/10 bg-surface p-6">
          <h2 className="font-display text-lg font-bold">Recent swaps</h2>
          <ul className="mt-4 space-y-2">
            {transactions.length === 0 ? (
              <li className="text-xs text-steel">No swaps yet.</li>
            ) : (
              transactions.slice(0, 6).map((tx) => (
                <li
                  key={tx.id}
                  className="rounded-xl border border-white/8 px-3 py-2 font-mono text-[11px] text-steel"
                >
                  {tx.fromToken} → {tx.toToken}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
