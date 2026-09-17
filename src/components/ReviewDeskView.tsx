import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, ShieldAlert, Stamp, XCircle } from 'lucide-react';

const TOKEN_KEY = 'bdx_admin_token';

type InboxItem = {
  id: string;
  createdAt?: string;
  reviewStatus?: string;
  reviewNotes?: string;
  projectId?: string;
  listingStatus?: string;
  payload?: {
    name?: string;
    ticker?: string;
    problem?: string;
    description?: string;
    contactEmail?: string;
    whyBuildersDex?: string;
    wallet?: string;
    githubRepo?: string;
    demoUrl?: string;
    category?: string;
    chain?: string;
  };
};

function loadToken(): string {
  if (typeof window === 'undefined') return '';
  const q = new URLSearchParams(window.location.search).get('token');
  if (q) {
    sessionStorage.setItem(TOKEN_KEY, q);
    return q;
  }
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

export default function ReviewDeskView() {
  const [token, setToken] = useState(loadToken);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const pending = useMemo(
    () => items.filter((i) => !i.reviewStatus || i.reviewStatus === 'pending'),
    [items],
  );

  const load = async (adminToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/applications', {
        headers: { 'x-admin-token': adminToken },
      });
      const body = (await response.json()) as { error?: string; items?: InboxItem[] };
      if (!response.ok) throw new Error(body.error || 'Unauthorized');
      setItems(body.items || []);
      sessionStorage.setItem(TOKEN_KEY, adminToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inbox');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void load(token);
  }, [token]);

  const act = async (id: string, action: 'approved' | 'rejected' | 'curate') => {
    setBusyId(id);
    setError(null);
    try {
      const path =
        action === 'curate'
          ? `/api/applications/${id}/curate`
          : `/api/applications/${id}/review`;
      const response = await fetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify(
          action === 'curate'
            ? {}
            : { status: action, reviewNotes: notes[id] || undefined },
        ),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || 'Action failed');
      await load(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-white">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Ops</p>
        <h1 className="font-display mt-2 text-3xl font-bold">Review desk</h1>
        <p className="mt-2 text-sm text-steel">
          Paste the admin token. Approved teams show on Explore as in-review; Curate puts them on
          the public catalog. Share mint stays a separate on-chain step.
        </p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const value = String(new FormData(e.currentTarget).get('token') || '').trim();
            if (value) setToken(value);
          }}
        >
          <input
            name="token"
            type="password"
            autoComplete="off"
            placeholder="Admin token"
            className="w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm outline-none focus:border-accent/40"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-ink"
          >
            Open inbox
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-white sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Ops</p>
      <h1 className="font-display mt-2 text-3xl font-bold">Application inbox</h1>
      <p className="mt-2 max-w-xl text-sm text-steel">
        {pending.length} waiting. Approve = listed as reviewed + raise draft. Curate = public
        Explore. Mint still needs an on-chain raise.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => void load(token)}
          className="rounded-full border border-white/12 px-3 py-1.5 text-xs"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem(TOKEN_KEY);
            setToken('');
            setItems([]);
          }}
          className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-steel"
        >
          Sign out
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-amber-200/90">{error}</p>}
      {loading && (
        <p className="mt-6 inline-flex items-center gap-2 text-sm text-steel">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading
        </p>
      )}
      <ul className="mt-6 space-y-4">
        {items.map((item) => {
          const p = item.payload || {};
          const reviewed = item.reviewStatus && item.reviewStatus !== 'pending';
          return (
            <li key={item.id} className="rounded-2xl border border-white/10 bg-surface/80 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    {p.name || 'Untitled'}{' '}
                    <span className="font-mono text-sm text-steel">${p.ticker}</span>
                  </h2>
                  <p className="font-mono text-[10px] text-steel">{item.id}</p>
                </div>
                <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-steel">
                  {item.listingStatus || item.reviewStatus || 'pending'}
                </span>
              </div>
              <p className="mt-3 text-sm text-steel">{p.problem || p.description}</p>
              <p className="mt-2 text-xs text-steel">
                {p.category} · {p.chain || 'Solana'} · {p.contactEmail}
              </p>
              {p.whyBuildersDex && (
                <p className="mt-2 text-xs text-white/80">Why DEX: {p.whyBuildersDex}</p>
              )}
              {p.wallet && (
                <p className="mt-1 break-all font-mono text-[10px] text-steel">{p.wallet}</p>
              )}
              {p.demoUrl && (
                <a
                  href={p.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-accent"
                >
                  Demo
                </a>
              )}
              {!reviewed && (
                <textarea
                  className="mt-3 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-xs outline-none"
                  rows={2}
                  placeholder="Review notes (optional)"
                  value={notes[item.id] || ''}
                  onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                />
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {!reviewed && (
                  <>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void act(item.id, 'approved')}
                      className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-50"
                    >
                      {busyId === item.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void act(item.id, 'rejected')}
                      className="inline-flex items-center gap-1 rounded-full border border-red-400/30 px-3 py-1.5 text-xs text-red-200 disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </>
                )}
                {item.reviewStatus === 'approved' && item.listingStatus !== 'curated' && (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void act(item.id, 'curate')}
                    className="inline-flex items-center gap-1 rounded-full border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent disabled:opacity-50"
                  >
                    <Stamp className="h-3.5 w-3.5" /> Curate on Explore
                  </button>
                )}
                {item.listingStatus === 'curated' && (
                  <p className="inline-flex items-center gap-1 text-xs text-accent">
                    <Stamp className="h-3.5 w-3.5" /> Live on catalog
                  </p>
                )}
                {item.reviewStatus === 'rejected' && (
                  <p className="inline-flex items-center gap-1 text-xs text-amber-200/90">
                    <ShieldAlert className="h-3.5 w-3.5" /> Rejected
                  </p>
                )}
              </div>
            </li>
          );
        })}
        {!loading && items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-white/12 px-4 py-10 text-center text-sm text-steel">
            Inbox empty.
          </li>
        )}
      </ul>
    </div>
  );
}
