import { useCallback, useEffect, useState } from 'react';
import type { ShareRaise } from '../types';
import { isLiveAuraRaiseId, liveAuraRaise } from '../data/liveShareRaise';

async function readJson(res: Response): Promise<unknown | null> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function mergeLive(list: ShareRaise[]): ShareRaise[] {
  const live = liveAuraRaise();
  const withoutDemo = list.filter((item) => !item.demo && item.id !== live.id);
  const fromApi = list.find((item) => item.id === live.id && item.raisePda);
  return [fromApi || live, ...withoutDemo];
}

export function useShareRaises(projectId?: string) {
  const [raises, setRaises] = useState<ShareRaise[]>(() => mergeLive([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const q = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
      const res = await fetch(`/api/raises${q}`);
      const data = res.ok ? ((await readJson(res)) as { raises?: ShareRaise[] } | null) : null;
      const list = data?.raises || [];
      setRaises(mergeLive(list));
      setError(null);
    } catch (err) {
      setRaises(mergeLive([]));
      setError(err instanceof Error ? err.message : 'Failed to load raises');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { raises, loading, error, refresh };
}

export function useShareRaise(id: string | null) {
  const [raise, setRaise] = useState<ShareRaise | null>(() =>
    isLiveAuraRaiseId(id) ? liveAuraRaise() : null,
  );
  const [loading, setLoading] = useState(Boolean(id) && !isLiveAuraRaiseId(id));

  const refresh = useCallback(async () => {
    if (!id) {
      setRaise(null);
      setLoading(false);
      return;
    }
    if (isLiveAuraRaiseId(id)) {
      setRaise(liveAuraRaise());
      setLoading(false);
    }
    try {
      const res = await fetch(`/api/raises/${encodeURIComponent(id)}`);
      const data = res.ok ? ((await readJson(res)) as { raise?: ShareRaise } | null) : null;
      if (data?.raise?.raisePda) {
        const live = liveAuraRaise();
        setRaise(
          isLiveAuraRaiseId(id) || isLiveAuraRaiseId(data.raise.id)
            ? {
                ...data.raise,
                ...live,
                sharesMinted: data.raise.sharesMinted ?? live.sharesMinted,
                raisedLamports: data.raise.raisedLamports ?? live.raisedLamports,
                inspection: {
                  ...live.inspection,
                  ...data.raise.inspection,
                  pobVerified: true,
                  builderScore: Math.max(
                    data.raise.inspection?.builderScore || 0,
                    live.inspection.builderScore,
                  ),
                },
              }
            : data.raise,
        );
        return;
      }
      const listRes = await fetch(`/api/raises?projectId=${encodeURIComponent(id)}`);
      const listData = listRes.ok
        ? ((await readJson(listRes)) as { raises?: ShareRaise[] } | null)
        : null;
      const list = listData?.raises || [];
      const live = list.find((item) => item.status === 'live' && item.raisePda) || list[0];
      if (live?.raisePda) {
        setRaise(live);
        return;
      }
      setRaise(isLiveAuraRaiseId(id) ? liveAuraRaise() : null);
    } catch {
      setRaise(isLiveAuraRaiseId(id) ? liveAuraRaise() : null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { raise, loading, refresh };
}
