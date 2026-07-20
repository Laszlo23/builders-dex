import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquareHeart,
  Headphones,
  Send,
  Sparkles,
  CheckCircle2,
  Star,
  Banknote,
  Loader2,
} from 'lucide-react';
import {
  FEEDBACK_CATEGORIES,
  SUPPORT_PRESETS,
  MONETIZATION_LEVERS,
  type FeedbackCategory,
} from '../data/support';

type Tab = 'feedback' | 'support' | 'sustain';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface FeedbackSupportViewProps {
  initialTab?: Tab;
  setCurrentPath: (path: string) => void;
}

export default function FeedbackSupportView({
  initialTab = 'feedback',
  setCurrentPath,
}: FeedbackSupportViewProps) {
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0c1018] via-[#0a0c10] to-[#07080A] px-6 py-10 sm:px-10">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #C8E868 0%, transparent 70%)' }}
        />
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C8E868]">
          Feedback · Support
        </p>
        <h1 className="font-display mt-3 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Tell us what to fix.
          <span className="mt-1 block text-white/45">Or talk to Support Agent.</span>
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/55">
          Builders DEX is built with builders. Ship feedback in under a minute — or ask the agent
          about trade, Earn, Passport, and listings.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {(
            [
              { id: 'feedback' as const, label: 'Feedback', icon: MessageSquareHeart },
              { id: 'support' as const, label: 'Support agent', icon: Headphones },
              { id: 'sustain' as const, label: 'How we earn', icon: Banknote },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                if (id === 'feedback' || id === 'support') setCurrentPath(id);
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === id
                  ? 'bg-[#C8E868] text-[#07080A]'
                  : 'border border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-8">
        {tab === 'feedback' && <FeedbackForm />}
        {tab === 'support' && <SupportAgent />}
        {tab === 'sustain' && <SustainPanel onAskSupport={() => setTab('support')} />}
      </div>
    </div>
  );
}

function FeedbackForm() {
  const [category, setCategory] = useState<FeedbackCategory>('product');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          rating: rating || undefined,
          message: message.trim(),
          email: email.trim() || undefined,
          path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setDone(true);
      setMessage('');
      setRating(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send feedback');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="pulse-card flex flex-col items-center rounded-2xl border border-[#C8E868]/30 bg-[#C8E868]/[0.06] px-8 py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-[#C8E868]" />
        <h2 className="font-display mt-4 text-2xl font-bold text-white">Got it. Thank you.</h2>
        <p className="mt-2 max-w-sm text-sm text-white/55">
          Your signal is logged. We read every note — bugs first, then product ideas.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-8 rounded-full border border-white/15 px-5 py-2 text-xs font-semibold text-white/80 hover:border-white/30"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="pulse-card overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0c10]"
    >
      <div className="border-b border-white/[0.06] px-6 py-5 sm:px-8">
        <h2 className="font-display text-xl font-bold text-white">Feedback pulse</h2>
        <p className="mt-1 text-sm text-white/45">One category. One rating. One clear note.</p>
      </div>

      <div className="space-y-8 px-6 py-8 sm:px-8">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            Category
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {FEEDBACK_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-xl px-3.5 py-2.5 text-left transition ${
                  category === c.id
                    ? 'bg-[#C8E868]/15 ring-1 ring-[#C8E868]/50'
                    : 'bg-white/[0.03] ring-1 ring-white/10 hover:ring-white/20'
                }`}
              >
                <span
                  className={`block text-xs font-semibold ${
                    category === c.id ? 'text-[#C8E868]' : 'text-white/80'
                  }`}
                >
                  {c.label}
                </span>
                <span className="block text-[10px] text-white/35">{c.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            How&apos;s the vibe?
          </label>
          <div className="mt-3 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hoverRating || rating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                  className="rounded-lg p-1.5 transition hover:scale-110"
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={`h-7 w-7 transition ${
                      active ? 'fill-[#C8E868] text-[#C8E868]' : 'text-white/20'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="fb-message"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40"
          >
            Your note
          </label>
          <textarea
            id="fb-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What felt broken, confusing, or brilliant? Be specific — we ship on clarity."
            className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#C8E868]/40 focus:outline-none focus:ring-1 focus:ring-[#C8E868]/30"
          />
        </div>

        <div>
          <label
            htmlFor="fb-email"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40"
          >
            Email (optional)
          </label>
          <input
            id="fb-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="If you want a reply"
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#C8E868]/40 focus:outline-none focus:ring-1 focus:ring-[#C8E868]/30"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C8E868] py-3.5 text-sm font-bold text-[#07080A] transition hover:brightness-110 disabled:opacity-40 sm:w-auto sm:px-10"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send feedback
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function SupportAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Hey — I'm **Support Agent** for Builders DEX.

I can help with:
• Trading & wallet connect
• Earn tasks, XP, daily wheel
• Passport™ & Builder Score™
• Listings / accelerator path
• Bugs & “where do I click?”

Ask anything. For product ideas, use the **Feedback** tab so the team gets a clean ticket.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: 'user' as const, content: text.trim() }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Support agent unavailable');
      setMessages([...next, { role: 'model', content: data.text }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Support failed');
      setMessages([
        ...next,
        {
          role: 'model',
          content:
            'I hit a snag reaching the model. Try again in a moment — or email **contact@buildersdex.app**. Common fixes: connect wallet for trades, refresh Earn after completing a task, check FAQ for THE STANDARD funnel.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pulse-card flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0c10]">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C8E868]/15">
          <Sparkles className="h-4 w-4 text-[#C8E868]" />
        </div>
        <div>
          <h2 className="font-display text-sm font-bold text-white">Support Agent</h2>
          <p className="text-[11px] text-white/40">Product help · not financial advice</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#C8E868] text-[#07080A]'
                  : 'border border-white/10 bg-white/[0.03] text-white/80'
              }`}
            >
              <MessageBody text={m.content} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C8E868]" />
            Agent thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-white/[0.06] px-4 py-3">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {SUPPORT_PRESETS.map((p) => (
            <button
              key={p.title}
              type="button"
              disabled={loading}
              onClick={() => send(p.prompt)}
              className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium text-white/55 hover:border-[#C8E868]/40 hover:text-[#C8E868] disabled:opacity-40"
            >
              {p.title}
            </button>
          ))}
        </div>
        {error && <p className="mb-2 text-[11px] text-amber-200/80">{error}</p>}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask support…"
            className="flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-[#C8E868]/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C8E868] text-[#07080A] disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBody({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function SustainPanel({ onAskSupport }: { onAskSupport: () => void }) {
  return (
    <div className="space-y-6">
      <div className="pulse-card rounded-2xl border border-white/[0.08] bg-[#0a0c10] px-6 py-8 sm:px-8">
        <h2 className="font-display text-xl font-bold text-white">How Builders DEX makes money</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
          Quality first — revenue that doesn&apos;t turn the Index into a pay-to-rank casino. Four
          levers that fit the brand:
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {MONETIZATION_LEVERS.map((m) => (
            <li
              key={m.title}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4"
            >
              <h3 className="text-sm font-semibold text-[#C8E868]">{m.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/45">{m.detail}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-white/35">
          Near-term: ship fee on curated swaps + paid accelerator reviews. Mid-term: Builder API for
          funds. Never sell Score placement.
        </p>
        <button
          type="button"
          onClick={onAskSupport}
          className="mt-6 text-xs font-semibold text-[#C8E868] hover:underline"
        >
          Ask Support Agent about fees →
        </button>
      </div>
    </div>
  );
}
