import { useEffect, useState } from 'react';
import { INITIAL_BUILDERS } from '../data/projects';
import { TALENT_TOP7_FALLBACK, type TalentBuilder } from '../data/talentFarcaster';
import type { LiveBuilderScoreResult } from '../lib/builderScore';
import { mergeCatalogWithLiveScores } from '../lib/liveBuilders';
import type { Builder } from '../types';

export type LiveBuildersState = {
  builders: Builder[];
  talent: TalentBuilder[];
  talentSource: 'live' | 'curated';
  loading: boolean;
  error: string | null;
};

export function useLiveBuilders(): LiveBuildersState {
  const [builders, setBuilders] = useState<Builder[]>(INITIAL_BUILDERS);
  const [talent, setTalent] = useState<TalentBuilder[]>(TALENT_TOP7_FALLBACK);
  const [talentSource, setTalentSource] = useState<'live' | 'curated'>('curated');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ids = INITIAL_BUILDERS.flatMap((b) => b.projectsCreated).join(',');

    void Promise.all([
      fetch(`/api/builder-score?ids=${encodeURIComponent(ids)}`).then(async (res) => {
        if (!res.ok) throw new Error(`Score API ${res.status}`);
        return res.json() as Promise<{ scores?: LiveBuilderScoreResult[] }>;
      }),
      fetch('/api/talent/top-builders')
        .then(async (res) => {
          if (!res.ok) throw new Error(`Talent API ${res.status}`);
          return res.json() as Promise<{
            builders?: TalentBuilder[];
            source?: 'live' | 'curated';
          }>;
        })
        .catch(() => ({ builders: TALENT_TOP7_FALLBACK, source: 'curated' as const })),
    ])
      .then(([scoreData, talentData]) => {
        if (cancelled) return;
        if (Array.isArray(scoreData.scores) && scoreData.scores.length) {
          setBuilders(mergeCatalogWithLiveScores(scoreData.scores));
        }
        if (Array.isArray(talentData.builders) && talentData.builders.length) {
          setTalent(talentData.builders);
          setTalentSource(talentData.source === 'live' ? 'live' : 'curated');
        }
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Live builders failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { builders, talent, talentSource, loading, error };
}
