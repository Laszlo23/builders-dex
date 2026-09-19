import React, { useMemo } from 'react';
import { catalogStoryBriefs, FOUNDER_EPISODES } from '../data/builderPlatform';
import type { Project } from '../types';
import BuilderNetflixCard from './BuilderNetflixCard';
import ComingSoonBanner from './ComingSoonBanner';
import { Clapperboard } from 'lucide-react';

type Props = {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
};

export default function BuilderStoriesView({ projects, onOpenProject }: Props) {
  const episodes = useMemo(() => {
    const filmed = FOUNDER_EPISODES;
    const briefs = catalogStoryBriefs(projects);
    return filmed.length > 0 ? [...filmed, ...briefs] : briefs;
  }, [projects]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-white sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          <Clapperboard className="h-3.5 w-3.5" />
          Builder Stories
        </p>
        <h1 className="font-display mt-2 text-2xl font-bold md:text-3xl">
          Invest in founders — not logos
        </h1>
        <p className="mt-2 text-sm text-steel">
          These are catalog story briefs from live projects — the founder’s own why, not a fake
          trailer. Recorded two-minute episodes land here when we film them.
        </p>
      </header>
      {FOUNDER_EPISODES.length === 0 && (
        <ComingSoonBanner
          title="Video episodes still filming"
          detail="Play opens the full Builder Story. We will not invent Netflix runtime or quotes."
        />
      )}
      {episodes.length === 0 ? (
        <ComingSoonBanner
          title="We're still working on this"
          detail="No catalog briefs yet. Explore and Terminal stay live."
        />
      ) : (
        <BuilderNetflixCard episodes={episodes} onOpenProject={onOpenProject} />
      )}
    </div>
  );
}
