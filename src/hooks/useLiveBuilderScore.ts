import { useEffect, useState } from 'react';
import type { BuilderScore } from '../types';
import type { LiveBuilderScoreResult } from '../lib/builderScore';

export type LiveScoreState = {
  loading: boolean;
  error: string | null;
  live: LiveBuilderScoreResult | null;
  /** Prefer live score when present */
  score: BuilderScore;
  mode: LiveBuilderScoreResult['mode'] | 'seed';
};

export function useLiveBuilderScore(
  projectId: string,
  seedScore: BuilderScore,
): LiveScoreState {
  const [live, setLive] = useState<LiveBuilderScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetch(`/api/builder-score?projectId=${encodeURIComponent(projectId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Score API ${res.status}`);
        return res.json() as Promise<LiveBuilderScoreResult>;
      })
      .then((data) => {
        if (cancelled) return;
        setLive(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Score fetch failed');
        setLive(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return {
    loading,
    error,
    live,
    score: live?.score ?? seedScore,
    mode: live?.mode ?? 'seed',
  };
}

/** Batch-fetch live overall scores for Explore / Landing cards */
export function useLiveScoreMap(projectIds: string[]) {
  const key = projectIds.slice().sort().join(',');
  const [map, setMap] = useState<
    Record<string, { overall: number; mode: string }>
  >({});

  useEffect(() => {
    if (!projectIds.length) return;
    let cancelled = false;
    const ids = projectIds.slice(0, 24).join(',');
    void fetch(`/api/builder-score?ids=${encodeURIComponent(ids)}`)
      .then((r) => r.json())
      .then((data: { scores?: LiveBuilderScoreResult[] }) => {
        if (cancelled || !data.scores) return;
        const next: Record<string, { overall: number; mode: string }> = {};
        for (const s of data.scores) {
          next[s.projectId] = { overall: s.score.overall, mode: s.mode };
        }
        setMap(next);
      })
      .catch(() => {
        /* keep seed */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key encodes ids
  }, [key]);

  return map;
}
