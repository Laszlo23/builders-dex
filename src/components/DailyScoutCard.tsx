import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Project } from '../types';

type DailyScoutCardProps = {
  project: Project;
  streak: number;
  onMakeCall: () => void;
};

export default function DailyScoutCard({
  project,
  streak,
  onMakeCall,
}: DailyScoutCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-6 shadow-[0_20px_50px_-20px_rgba(200,232,104,0.25)]">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
      
      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
              Today's Scout Call
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span className="font-mono text-[10px] font-bold text-accent">
                {streak} day{streak !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <h3 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          {project.name}
        </h3>
        
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          {project.tagline}
        </p>

        <div className="mt-3 flex items-center gap-3 font-mono text-xs text-steel">
          <span>Score: {project.builderScore.overall}</span>
          <span>·</span>
          <span>{project.category}</span>
        </div>

        <button
          type="button"
          onClick={onMakeCall}
          className="btn-sheen mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink shadow-[0_12px_24px_-8px_rgba(200,232,104,0.4)] transition hover:bg-accent-bright active:scale-95 min-h-[52px]"
        >
          <Sparkles className="h-4 w-4" />
          Make today's call
        </button>

        <p className="mt-3 font-mono text-[9px] uppercase tracking-wider text-steel">
          First open today +25 XP on this device. Then Terminal — Publish to put it on the tape.
        </p>
      </div>
    </div>
  );
}
