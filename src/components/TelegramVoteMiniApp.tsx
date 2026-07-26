import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

type VoteItem = {
  id: number;
  ticker: string;
  name: string;
  chain?: string;
  mint: string | null;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  voteCount: number;
  status: string;
  chatTitle: string;
  voted: boolean;
  votesToTrending: number;
};

type TgWebApp = {
  initData: string;
  initDataUnsafe?: {
    user?: { id: number; username?: string; first_name?: string };
    chat?: { id: number; title?: string };
  };
  ready: () => void;
  expand: () => void;
  themeParams?: { bg_color?: string; text_color?: string; button_color?: string };
  MainButton?: { hide: () => void };
  HapticFeedback?: { impactOccurred: (style: string) => void };
  close?: () => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

function getTg(): TgWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

/**
 * Telegram Mini App — vote-only surface (not the full DEX).
 */
function readDeepLink(): { tokenId: number | null; chatId: number | null } {
  const q = new URLSearchParams(window.location.search);
  const tokenId = Number(q.get('token') || '');
  const chatId = Number(q.get('chat') || '');
  return {
    tokenId: Number.isFinite(tokenId) && tokenId > 0 ? tokenId : null,
    chatId: Number.isFinite(chatId) ? chatId : null,
  };
}

export default function TelegramVoteMiniApp() {
  const [items, setItems] = useState<VoteItem[]>([]);
  const [threshold, setThreshold] = useState(25);
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<number | null>(null);
  const [insideTg, setInsideTg] = useState(false);
  const [focusTokenId, setFocusTokenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const tg = getTg();
    const initData = tg?.initData || '';
    const headers: Record<string, string> = {};
    if (initData) headers['x-telegram-init-data'] = initData;
    const deep = readDeepLink();
    const qs =
      deep.chatId != null ? `?chat_id=${encodeURIComponent(String(deep.chatId))}` : '';

    const res = await fetch(`/api/telegram/miniapp/tokens${qs}`, { headers });
    if (!res.ok) throw new Error('Could not load tokens');
    const data = await res.json();
    let list: VoteItem[] = Array.isArray(data.items) ? data.items : [];
    if (deep.tokenId != null) {
      setFocusTokenId(deep.tokenId);
      list = [
        ...list.filter((t) => t.id === deep.tokenId),
        ...list.filter((t) => t.id !== deep.tokenId),
      ];
    }
    setItems(list);
    if (typeof data.threshold === 'number') setThreshold(data.threshold);
    if (data.user?.username) setUserLabel(`@${data.user.username}`);
    else if (data.user?.firstName) setUserLabel(data.user.firstName);
    else if (tg?.initDataUnsafe?.user?.username)
      setUserLabel(`@${tg.initDataUnsafe.user.username}`);
  }, []);

  useEffect(() => {
    const tg = getTg();
    if (tg) {
      setInsideTg(Boolean(tg.initData));
      try {
        tg.ready();
        tg.expand();
        tg.MainButton?.hide();
      } catch {
        /* ignore */
      }
    }

    let cancelled = false;
    (async () => {
      try {
        await load();
        if (!cancelled) setError(null);
      } catch {
        if (!cancelled) setError('Could not load voting list');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const onVote = async (tokenId: number) => {
    const tg = getTg();
    const initData = tg?.initData || '';
    if (!initData) {
      setError('Open this page from Telegram (BuildersDexBot → START) to vote.');
      return;
    }
    setVotingId(tokenId);
    setError(null);
    try {
      const res = await fetch('/api/telegram/miniapp/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, tokenId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'duplicate') {
          setError('You already voted for this token.');
        } else if (data.error === 'not_voting') {
          setError('Voting is not open for this token yet.');
        } else {
          setError(data.error || 'Vote failed');
        }
        return;
      }
      try {
        tg?.HapticFeedback?.impactOccurred('medium');
      } catch {
        /* ignore */
      }
      await load();
    } catch {
      setError('Vote failed — try again');
    } finally {
      setVotingId(null);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0b0f14] px-4 pb-10 pt-5 text-white">
      <header className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          Builders DEX · Vote
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
          Community token votes
        </h1>
        <p className="mt-1.5 text-sm text-white/55">
          Prefer voting in the group: tap <strong>▲ Upvote here</strong> on the bot’s vote
          post. This screen is the same vote via Mini App.
          {userLabel ? (
            <span className="mt-1 block font-mono text-[11px] text-accent/90">
              Signed in as {userLabel}
            </span>
          ) : null}
        </p>
        {!insideTg ? (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
            Not inside Telegram yet. Open{' '}
            <a
              href="https://t.me/buildersdexbot"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @buildersdexbot
            </a>{' '}
            and tap <strong>START</strong> (Menu) to vote with your Telegram account.
          </p>
        ) : null}
      </header>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-white/50">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading tokens…
        </div>
      ) : error && items.length === 0 ? (
        <p className="text-sm text-red-300/90">{error}</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center">
          <p className="text-sm text-white/55">
            No tokens open for voting yet. Group admins: /newtoken → /openvotes
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((t) => (
            <li
              key={t.id}
              className={`overflow-hidden rounded-2xl border bg-white/[0.03] ${
                focusTokenId === t.id
                  ? 'border-accent/50 ring-1 ring-accent/30'
                  : 'border-white/10'
              }`}
            >
              {t.bannerUrl ? (
                <div className="h-20 w-full overflow-hidden bg-white/5">
                  <img
                    src={t.bannerUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {t.logoUrl ? (
                    <img
                      src={t.logoUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/15"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20 font-mono text-xs text-accent">
                      ${t.ticker.slice(0, 3)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      ${t.ticker}{' '}
                      <span className="font-normal text-white/50">{t.name}</span>
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-white/40">
                      {t.chain || 'solana'} · {t.chatTitle} · {t.status}
                    </p>
                    {t.description ? (
                      <p className="mt-2 line-clamp-2 text-xs text-white/55">
                        {t.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="font-mono text-[11px] text-accent">
                    {t.voteCount}/{threshold} votes
                    {t.status === 'voting' && t.votesToTrending > 0
                      ? ` · ${t.votesToTrending} to trending`
                      : ''}
                  </div>
                  {t.voted ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-accent/35 px-3 py-1.5 font-mono text-[11px] text-accent">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Voted
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={votingId === t.id || !insideTg}
                      onClick={() => onVote(t.id)}
                      className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-ink disabled:opacity-40"
                    >
                      {votingId === t.id ? '…' : '▲ Upvote'}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && items.length > 0 ? (
        <p className="mt-4 text-center text-xs text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}

      <p className="mt-8 text-center font-mono text-[10px] text-white/30">
        Community signal — not curated for trade
      </p>
    </div>
  );
}
