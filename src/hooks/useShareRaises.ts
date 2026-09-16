import { useCallback, useEffect, useState } from 'react';
import type { ShareRaise } from '../types';

const DEMO_RAISE: ShareRaise = {
  id: 'raise_demo_p5',
  projectId: 'p5',
  projectSeedHex: '',
  raisePda: null,
  collection: null,
  founderWallet: '11111111111111111111111111111111',
  status: 'live',
  priceLamports: 50_000_000,
  shareSupply: 200,
  sharesMinted: 0,
  holderPoolBps: 2000,
  founderRetainedBps: 8000,
  goalLamports: 10_000_000_000,
  raisedLamports: 0,
  vaultMint: 'SOL',
  inspection: {
    applicationId: 'app_demo_aura',
    builderScore: 92,
    pobVerified: true,
    attestedAt: new Date().toISOString(),
    tx: null,
  },
  demo: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useShareRaises(projectId?: string) {
  const [raises, setRaises] = useState<ShareRaise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const q = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
      const res = await fetch(`/api/raises${q}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const list = (data.raises || []) as ShareRaise[];
      setRaises(list.length ? list : [DEMO_RAISE]);
      setError(null);
    } catch (err) {
      setRaises([DEMO_RAISE]);
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
  const [raise, setRaise] = useState<ShareRaise | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  const refresh = useCallback(async () => {
    if (!id) {
      setRaise(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/raises/${encodeURIComponent(id)}`);
      if (res.status === 404) {
        setRaise(id === 'raise_demo_p5' || id === 'p5' ? DEMO_RAISE : null);
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRaise(data.raise || (id === 'raise_demo_p5' || id === 'p5' ? DEMO_RAISE : null));
    } catch {
      setRaise(id === 'raise_demo_p5' || id === 'p5' ? DEMO_RAISE : null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { raise, loading, refresh };
}
