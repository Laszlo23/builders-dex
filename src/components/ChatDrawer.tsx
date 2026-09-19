import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Radio,
  Newspaper,
  MessageCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { CHAT_NEWS, STREAM_TICKS, type FeedItem } from '../data/chatFeed';
import { SUPPORT_PRESETS } from '../data/support';

type Tab = 'chat' | 'stream' | 'news';

type ToolUsed = { tool: string; label: string; detail: string };

type ChatMessage = { role: 'user' | 'model'; content: string; toolsUsed?: ToolUsed[] };

const LIVE_BUILD_PRESET = {
  title: 'Live build',
  prompt:
    'Live build: list catalog builders and pull live Builder Score™ with GitHub citations for the top matches. Brief overall, top citation, curation status, and main risk.',
};

function wantsLiveBuild(text: string): boolean {
  return /live\s*(build|score|builder)|builder\s*score|radar|catalog|genesis|scout ledger|telegram trend|llama\.?cpp|wormhole|metaplex|aave|get_builder_score|list_catalog|github citation/i.test(
    text,
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  displayName: string;
};

export default function ChatDrawer({ open, onClose, displayName }: Props) {
  const [tab, setTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: `Hey${displayName && displayName !== 'Guest' ? ` **${displayName}**` : ''} — Support Agent here.

Ask about Trade, Earn, Passport™, or listings. Say **live build** for live Builder Score™ citations. Flip to **Stream** for pulse or **News** for headlines.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamItems, setStreamItems] = useState<FeedItem[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, tab]);

  /* Live stream — append a tick every few seconds while drawer open */
  useEffect(() => {
    if (!open) return;
    let i = 0;
    const seed = STREAM_TICKS.slice(0, 3).map((t, idx) => ({
      ...t,
      id: `s-seed-${idx}`,
      at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
    setStreamItems(seed);

    const id = window.setInterval(() => {
      const tick = STREAM_TICKS[i % STREAM_TICKS.length];
      i += 1;
      setStreamItems((prev) => {
        const next: FeedItem = {
          ...tick,
          id: `s-${Date.now()}-${i}`,
          at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        return [...prev.slice(-40), next];
      });
    }, 4200);

    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (tab === 'stream') {
      streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamItems, tab]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const live = wantsLiveBuild(text);
    const next = [...messages, { role: 'user' as const, content: text.trim() }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutMs = live ? 90_000 : 45_000;
      const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(live ? '/api/ai/chat' : '/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          displayName: displayName !== 'Guest' ? displayName : undefined,
        }),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat unavailable');
      const toolsUsed = Array.isArray(data.toolsUsed) ? (data.toolsUsed as ToolUsed[]) : [];
      setMessages([
        ...next,
        {
          role: 'model',
          content: String(data.text || ''),
          toolsUsed: live ? toolsUsed : undefined,
        },
      ]);
    } catch (err: unknown) {
      const timedOut = err instanceof Error && err.name === 'AbortError';
      setMessages([
        ...next,
        {
          role: 'model',
          content: timedOut
            ? 'Live build timed out. Try **live build** again in a moment.'
            : 'Couldn’t reach the agent. Try again shortly — or open **Feedback** / email contact@buildingcultureid.space.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop — fully inert when closed so it never steals card clicks */}
      <button
        type="button"
        aria-label="Close chat"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`fixed inset-0 z-[110] bg-ink/60 backdrop-blur-[2px] transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-label="Builders DEX chat"
        className={`fixed inset-y-0 right-0 z-[120] flex w-full max-w-md flex-col border-l border-accent/20 bg-ink/95 shadow-[-24px_0_80px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'pointer-events-none invisible translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">Live desk</p>
            <p className="truncate font-sans text-sm font-bold text-white">
              {displayName}
              <span className="ml-2 font-mono text-[10px] font-normal text-steel">online</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-steel hover:border-accent/40 hover:text-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex gap-1 border-b border-white/8 px-3 py-2">
          {(
            [
              { id: 'chat' as const, label: 'Chat', icon: MessageCircle },
              { id: 'stream' as const, label: 'Stream', icon: Radio },
              { id: 'news' as const, label: 'News', icon: Newspaper },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition ${
                tab === id
                  ? 'bg-accent/15 text-accent'
                  : 'text-steel hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'chat' && (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={`max-w-[92%] space-y-2 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'ml-auto bg-accent/20 text-white'
                      : 'mr-auto border border-white/10 bg-white/[0.03] text-white/85'
                  }`}
                >
                  <ChatMarkdown text={m.content} />
                  {m.toolsUsed && m.toolsUsed.length > 0 && (
                    <ul className="space-y-1 border-t border-white/8 pt-2">
                      {m.toolsUsed.map((t, ti) => (
                        <li
                          key={`${t.tool}-${ti}`}
                          className="font-mono text-[10px] text-accent/90"
                        >
                          {t.label}
                          <span className="text-steel"> · {t.detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {loading && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-steel">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                  {wantsLiveBuild(messages.at(-1)?.content || '')
                    ? 'Calling live tools…'
                    : 'Agent typing…'}
                </div>
              )}
              <div ref={endRef} />
            </div>
            <div className="border-t border-white/10 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              <div className="mb-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => send(LIVE_BUILD_PRESET.prompt)}
                  className="rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 font-mono text-[9px] text-accent hover:bg-accent/20"
                >
                  {LIVE_BUILD_PRESET.title}
                </button>
                {SUPPORT_PRESETS.slice(0, 2).map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => send(p.prompt)}
                    className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[9px] text-steel hover:border-accent/35 hover:text-accent"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask live build or Support Agent…"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-accent px-3 text-ink disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        )}

        {tab === 'stream' && (
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Live pulse stream
            </p>
            <ul className="space-y-2">
              {streamItems.map((item) => (
                <FeedRow key={item.id} item={item} />
              ))}
            </ul>
            <div ref={streamEndRef} />
          </div>
        )}

        {tab === 'news' && (
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Desk news
            </p>
            <ul className="space-y-2">
              {CHAT_NEWS.map((item) => (
                <FeedRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
        )}
      </aside>
    </>
  );
}

function FeedRow({ item }: { item: FeedItem }) {
  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="font-sans text-xs font-semibold text-white">{item.title}</p>
        <span className="shrink-0 font-mono text-[9px] text-steel">{item.at}</span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-white/55">{item.body}</p>
      {item.href && (
        <span className="mt-1.5 inline-flex items-center gap-1 font-mono text-[9px] text-accent">
          Open <ExternalLink className="h-2.5 w-2.5" />
        </span>
      )}
    </>
  );

  const className =
    'block rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 transition hover:border-accent/30';

  if (item.href) {
    return (
      <li>
        <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
          {inner}
        </a>
      </li>
    );
  }
  return <li className={className}>{inner}</li>;
}

function ChatMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-accent">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

/** Floating opener — sits above mobile nav */
export function ChatFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-[4.75rem] right-4 z-[100] flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent text-ink shadow-[0_12px_40px_-10px_rgba(200,232,104,0.55)] transition hover:bg-accent-bright active:scale-95 lg:bottom-6 lg:h-12 lg:w-12"
      aria-label="Open chat"
    >
      <Sparkles className="h-5 w-5" />
    </button>
  );
}
