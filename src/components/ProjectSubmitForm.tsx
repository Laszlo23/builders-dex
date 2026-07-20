import React, { useState } from 'react';
import { Project, ProjectAIAnalysis, ProjectApplication, UserSocials } from '../types';
import { scoreFromAiAnalysis } from '../lib/builderScore';

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

const TRACK_OPTIONS = [
  'AI + Web3',
  'DeFi',
  'DePIN',
  'Infrastructure',
  'RWA',
  'Gaming',
  'Consumer',
  'Security',
];

type SubmitPayload = Omit<Project, 'id' | 'rating' | 'upvotes' | 'comments' | 'tokenPriceHistory'>;

interface ProjectSubmitFormProps {
  founderName: string;
  avatarUrl?: string;
  defaultSocials?: Partial<UserSocials>;
  walletConnected: boolean;
  onConnect: () => void;
  onSubmit: (project: SubmitPayload) => void;
  compact?: boolean;
}

export default function ProjectSubmitForm({
  founderName,
  avatarUrl,
  defaultSocials,
  walletConnected,
  onConnect,
  onSubmit,
  compact,
}: ProjectSubmitFormProps) {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [tagline, setTagline] = useState('');
  const [problem, setProblem] = useState('');
  const [description, setDescription] = useState('');
  const [builderStory, setBuilderStory] = useState('');
  const [category, setCategory] = useState<
    'AI + Web3' | 'DeFi' | 'Infrastructure' | 'Creator Economy'
  >('AI + Web3');
  const [githubRepo, setGithubRepo] = useState('');
  const [journey, setJourney] = useState('Prototype → Review');
  const [goal, setGoal] = useState('100000');
  const [app, setApp] = useState<ProjectApplication>({
    contactEmail: defaultSocials?.email || '',
    demoUrl: '',
    pitchDeckUrl: '',
    videoUrl: '',
    whitepaperUrl: '',
    hackathonName: '',
    tracks: [],
    techStack: [],
    lookingFor: [],
    teamSize: 2,
    fundingStatus: 'Bootstrapped',
    previousLaunches: '',
    whyBuildersDex: '',
    socials: { ...EMPTY_SOCIALS, ...defaultSocials },
  });
  const [techInput, setTechInput] = useState('');
  const [lookingInput, setLookingInput] = useState('');

  const toggleTrack = (t: string) => {
    setApp((a) => ({
      ...a,
      tracks: a.tracks.includes(t) ? a.tracks.filter((x) => x !== t) : [...a.tracks, t],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected) {
      onConnect();
      return;
    }
    if (!name || !ticker || !problem || !description || !app.contactEmail || !app.whyBuildersDex) {
      alert(
        'Required: name, ticker, problem, description, contact email, and why Builders DEX.'
      );
      return;
    }

    const finalAi: ProjectAIAnalysis = {
      quality: 72,
      market: 68,
      risk: 38,
      innovation: 74,
      summary: 'Hackathon-grade packet received. Awaiting Proof of Building™ review.',
    };

    const application: ProjectApplication = {
      ...app,
      techStack: techInput
        ? [...app.techStack, ...techInput.split(',').map((s) => s.trim()).filter(Boolean)]
        : app.techStack,
      lookingFor: lookingInput
        ? [...app.lookingFor, ...lookingInput.split(',').map((s) => s.trim()).filter(Boolean)]
        : app.lookingFor,
    };

    onSubmit({
      name: name.trim(),
      ticker: ticker.trim().toUpperCase(),
      tagline: tagline.trim() || `${category} builder applying for curation.`,
      description: description.trim(),
      problem: problem.trim(),
      builderStory:
        builderStory.trim() ||
        `${founderName} submitted a full application packet for Builders DEX review.`,
      foundedYear: new Date().getFullYear(),
      journey,
      whySelected: 'Pending curation review.',
      logoUrl:
        category === 'AI + Web3'
          ? 'Brain'
          : category === 'DeFi'
            ? 'Coins'
            : category === 'Infrastructure'
              ? 'Layers'
              : 'Share2',
      category,
      chain: 'Solana',
      githubRepo: githubRepo.trim() || 'pending-review/repo',
      githubActivity: 0,
      roadmap: [
        {
          phase: 'Phase 1',
          title: 'Curation Review',
          description: 'Full packet under Builders DEX quality standard.',
          date: 'Q3 2026',
          status: 'in-progress',
        },
      ],
      team: [
        {
          name: founderName,
          role: 'Founder',
          avatarUrl:
            avatarUrl ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        },
      ],
      raised: 0,
      goal: parseFloat(goal) || 100000,
      tokenPrice: 0.05,
      quests: [],
      socials: {
        twitter: application.socials.x,
        website: application.socials.website,
        telegram: application.socials.telegram,
        discord: application.socials.discord,
      },
      launchpadActive: true,
      liquidityLocked: false,
      aiAnalysis: finalAi,
      builderScore: scoreFromAiAnalysis(finalAi),
      curation: { status: 'pending', builderVerified: false },
      application,
    });
  };

  const field =
    'w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40';

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${compact ? '' : ''}`}>
      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Basics</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={field} placeholder="Project name *" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={field} placeholder="Ticker *" value={ticker} onChange={(e) => setTicker(e.target.value)} />
        </div>
        <input className={field} placeholder="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
        <textarea className={field} rows={2} placeholder="Problem statement *" value={problem} onChange={(e) => setProblem(e.target.value)} />
        <textarea className={field} rows={3} placeholder="Product description *" value={description} onChange={(e) => setDescription(e.target.value)} />
        <textarea className={field} rows={2} placeholder="Builder story / founding narrative" value={builderStory} onChange={(e) => setBuilderStory(e.target.value)} />
        <div className="grid gap-3 sm:grid-cols-3">
          <select className={field} value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
            <option value="AI + Web3">AI + Web3</option>
            <option value="DeFi">DeFi</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Creator Economy">Creator Economy</option>
          </select>
          <input className={field} placeholder="GitHub org/repo" value={githubRepo} onChange={(e) => setGithubRepo(e.target.value)} />
          <input className={field} placeholder="Raise goal USD" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>
        <input className={field} placeholder="Journey (e.g. Prototype → Testnet)" value={journey} onChange={(e) => setJourney(e.target.value)} />
      </section>

      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
          Hackathon-grade packet
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={field}
            placeholder="Contact email *"
            value={app.contactEmail}
            onChange={(e) => setApp({ ...app, contactEmail: e.target.value })}
          />
          <input
            className={field}
            placeholder="Hackathon / accelerator name"
            value={app.hackathonName}
            onChange={(e) => setApp({ ...app, hackathonName: e.target.value })}
          />
          <input
            className={field}
            placeholder="Demo URL"
            value={app.demoUrl}
            onChange={(e) => setApp({ ...app, demoUrl: e.target.value })}
          />
          <input
            className={field}
            placeholder="Pitch deck URL"
            value={app.pitchDeckUrl}
            onChange={(e) => setApp({ ...app, pitchDeckUrl: e.target.value })}
          />
          <input
            className={field}
            placeholder="Demo video URL"
            value={app.videoUrl}
            onChange={(e) => setApp({ ...app, videoUrl: e.target.value })}
          />
          <input
            className={field}
            placeholder="Whitepaper / docs URL"
            value={app.whitepaperUrl}
            onChange={(e) => setApp({ ...app, whitepaperUrl: e.target.value })}
          />
        </div>
        <div>
          <p className="mb-2 text-[11px] text-steel">Tracks</p>
          <div className="flex flex-wrap gap-2">
            {TRACK_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTrack(t)}
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] ${
                  app.tracks.includes(t)
                    ? 'bg-accent text-ink'
                    : 'border border-white/12 text-steel'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <input
          className={field}
          placeholder="Tech stack (comma-separated)"
          value={techInput}
          onChange={(e) => setTechInput(e.target.value)}
        />
        <input
          className={field}
          placeholder="Looking for (investors, audits, design…)"
          value={lookingInput}
          onChange={(e) => setLookingInput(e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            min={1}
            className={field}
            placeholder="Team size"
            value={app.teamSize}
            onChange={(e) => setApp({ ...app, teamSize: Number(e.target.value) || 1 })}
          />
          <select
            className={field}
            value={app.fundingStatus}
            onChange={(e) => setApp({ ...app, fundingStatus: e.target.value })}
          >
            <option>Bootstrapped</option>
            <option>Pre-seed</option>
            <option>Seed</option>
            <option>Grant-funded</option>
            <option>Revenue</option>
          </select>
        </div>
        <textarea
          className={field}
          rows={2}
          placeholder="Previous launches / hackathon wins"
          value={app.previousLaunches}
          onChange={(e) => setApp({ ...app, previousLaunches: e.target.value })}
        />
        <textarea
          className={field}
          rows={2}
          placeholder="Why Builders DEX? *"
          value={app.whyBuildersDex}
          onChange={(e) => setApp({ ...app, whyBuildersDex: e.target.value })}
        />
      </section>

      <section className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
          Project socials
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ['x', 'X / Twitter'],
              ['farcaster', 'Farcaster'],
              ['github', 'GitHub'],
              ['discord', 'Discord'],
              ['telegram', 'Telegram'],
              ['linkedin', 'LinkedIn'],
              ['website', 'Website'],
            ] as const
          ).map(([key, label]) => (
            <input
              key={key}
              className={field}
              placeholder={label}
              value={app.socials[key] || ''}
              onChange={(e) =>
                setApp({ ...app, socials: { ...app.socials, [key]: e.target.value } })
              }
            />
          ))}
        </div>
      </section>

      <button
        type="submit"
        className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-ink hover:bg-accent-bright"
      >
        Submit full application
      </button>
      <p className="text-center font-mono text-[10px] text-steel">
        Same bar as a serious hackathon submission — we review for Proof of Building™.
      </p>
    </form>
  );
}
