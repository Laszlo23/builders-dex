import React from 'react';
import { FOUNDER_EPISODES } from '../data/builderPlatform';
import BuilderNetflixCard from './BuilderNetflixCard';
import { Clapperboard } from 'lucide-react';

type Props = {
  onOpenProject: (projectId: string) => void;
};

export default function BuilderStoriesView({ onOpenProject }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-white sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          <Clapperboard className="h-3.5 w-3.5" />
          Builder Netflix
        </p>
        <h1 className="font-display mt-2 text-2xl font-bold md:text-3xl">
          Invest in founders — not logos
        </h1>
        <p className="mt-2 text-sm text-steel">
          Two-minute stories: why they built, what almost made them quit, biggest
          mistake, what&apos;s next.
        </p>
      </header>
      <BuilderNetflixCard episodes={FOUNDER_EPISODES} onOpenProject={onOpenProject} />
    </div>
  );
}
