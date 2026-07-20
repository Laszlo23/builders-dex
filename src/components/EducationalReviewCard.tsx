import React from 'react';
import { EducationalReview } from '../data/builderPlatform';
import { BookOpen, Clock } from 'lucide-react';

type Props = {
  projectName: string;
  review: EducationalReview;
  rejectionReasons?: string[];
};

export default function EducationalReviewCard({
  projectName,
  review,
  rejectionReasons = [],
}: Props) {
  return (
    <section className="mt-6 rounded-3xl border border-white/15 bg-white/[0.04] p-6 md:p-8">
      <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
        <BookOpen className="h-3.5 w-3.5" />
        Builder Review
      </p>
      <h2 className="font-display mt-2 text-xl font-bold">{projectName}</h2>
      <p className="mt-1 text-sm text-steel">
        Not a dead end — a curriculum. Rejection becomes motivation.
      </p>

      <div className="mt-5 inline-flex rounded-2xl border border-white/12 bg-ink/50 px-4 py-3">
        <div>
          <p className="font-mono text-[9px] uppercase text-steel">Current Score</p>
          <p className="font-display text-2xl font-bold text-white">{review.score}</p>
        </div>
      </div>

      {rejectionReasons.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-white/80">
          {rejectionReasons.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="text-steel">•</span> {r}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Improve</p>
        <ul className="mt-2 space-y-2">
          {review.improve.map((item) => (
            <li
              key={item}
              className="rounded-xl border border-accent/25 bg-accent/10 px-3 py-2.5 text-sm text-white"
            >
              • {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 inline-flex items-center gap-2 font-mono text-xs text-steel">
        <Clock className="h-3.5 w-3.5 text-accent" />
        Estimated Review: {review.estimatedDays} days
      </p>
    </section>
  );
}
