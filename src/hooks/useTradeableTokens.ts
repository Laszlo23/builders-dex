import { useEffect, useMemo, useState } from 'react';
import { CuratedToken, TOKEN_CATALOG } from '../data/curatedTokens';

type State = {
  tokens: CuratedToken[];
  mintSet: Set<string>;
  loading: boolean;
  error: string | null;
  flags: Record<string, boolean>;
};

const FALLBACK = TOKEN_CATALOG.filter((t) =>
  ['SOL', 'USDC', 'USDT', 'JUP'].includes(t.envKey)
);

const CACHE_KEY = 'bdx_tradeable_tokens_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

function readCache(): { tokens: CuratedToken[]; flags: Record<string, boolean> } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      at: number;
      tokens: CuratedToken[];
      flags: Record<string, boolean>;
    };
    if (!parsed?.at || Date.now() - parsed.at > CACHE_TTL_MS) return null;
    if (!Array.isArray(parsed.tokens) || !parsed.tokens.length) return null;
    return { tokens: parsed.tokens, flags: parsed.flags || {} };
  } catch {
    return null;
  }
}

function writeCache(tokens: CuratedToken[], flags: Record<string, boolean>) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), tokens, flags }));
  } catch {
    /* ignore quota */
  }
}

export function useTradeableTokens(): State {
  const cached = typeof sessionStorage !== 'undefined' ? readCache() : null;
  const [tokens, setTokens] = useState<CuratedToken[]>(cached?.tokens || FALLBACK);
  const [flags, setFlags] = useState<Record<string, boolean>>(cached?.flags || {});
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/tradeable-tokens')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load tradeable tokens');
        return res.json();
      })
      .then((data: { tokens?: CuratedToken[]; flags?: Record<string, boolean> }) => {
        if (cancelled) return;
        const list = Array.isArray(data.tokens) && data.tokens.length ? data.tokens : FALLBACK;
        const nextFlags = data.flags || {};
        setTokens(list);
        setFlags(nextFlags);
        writeCache(list, nextFlags);
        setError(null);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setTokens((prev) => (prev.length ? prev : FALLBACK));
        setError(e instanceof Error ? e.message : 'Token config error');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mintSet = useMemo(() => new Set(tokens.map((t) => t.mint)), [tokens]);

  return {
    tokens,
    mintSet,
    loading,
    error,
    flags,
  };
}

export function isMintTradeable(mint: string | undefined | null, mintSet: Set<string>): boolean {
  if (!mint) return false;
  return mintSet.has(mint);
}
