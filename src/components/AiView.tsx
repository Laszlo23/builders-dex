import React, { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Brain, ShieldAlert, Cpu, Link2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
  toolsUsed?: { tool: string; label: string; detail: string }[];
}

interface AiViewProps {
  onAddXp: (xpAmt: number) => void;
  onIntelUsed?: () => void;
  initialPrompt?: string | null;
  onPromptConsumed?: () => void;
  onOpenTerminal?: () => void;
}

export default function AiView({
  onAddXp,
  onIntelUsed,
  initialPrompt,
  onPromptConsumed,
  onOpenTerminal,
}: AiViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `I am **Builder Intelligence™** — a tool-using research analyst.

I call live tools before answering:
• Catalog + live Builder Score™ (GitHub citations)
• Daily Radar™ movers
• Scout ledger + Telegram clears

Ask like a researcher. I will not invent projects.`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const bootstrapped = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const presets = [
    {
      title: 'Live AI builders',
      prompt:
        'Use tools to list catalog projects in AI, then pull live Builder Score™ for each match. Brief: overall, top citation, curation status, main risk.',
    },
    {
      title: "Today's Radar",
      prompt:
        'Call get_daily_radar and summarize rising/falling movers, sector pulse, and any Telegram clears. Cite the tool.',
    },
    {
      title: 'Scout ledger',
      prompt:
        'List recent Scout calls and the Scout leaderboard from tools. Who called early and on which project?',
    },
    {
      title: 'Why reject?',
      prompt:
        'From the catalog tool, list rejected projects with rejection reasons. Contrast with a curated Genesis project using live score.',
    },
  ];

  async function handleSendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);
    setConfigError(false);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reach Builder Intelligence™');
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: data.text,
          toolsUsed: Array.isArray(data.toolsUsed) ? data.toolsUsed : [],
        },
      ]);
      onAddXp(100);
      onIntelUsed?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setConfigError(msg.includes('GEMINI_API_KEY') || msg.includes('Secrets'));
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialPrompt && !bootstrapped.current) {
      bootstrapped.current = true;
      void handleSendMessage(initialPrompt);
      onPromptConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once per prompt
  }, [initialPrompt]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col px-4 py-10 text-white sm:px-6">
      <div className="mb-6 border-b border-white/8 pb-4">
        <h1 className="font-display flex items-center gap-2 text-3xl font-bold tracking-tight sm:text-4xl">
          <Sparkles className="h-7 w-7 text-accent" />
          Builder Intelligence™
        </h1>
        <p className="mt-2 text-sm text-steel">
          Tool-using analyst — scores, radar, scouts, and Telegram clears with citations.
        </p>
        {onOpenTerminal && (
          <button
            type="button"
            onClick={onOpenTerminal}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
          >
            Open Radar (Terminal) →
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-6 lg:flex-row">
        <div className="relative flex min-h-[420px] flex-1 flex-col justify-between rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.04] to-surface p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]">
          <div className="mb-4 max-h-[480px] flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 text-sm ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role !== 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                    <Brain className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] space-y-2 rounded-xl border px-4 py-3 ${
                    m.role === 'user'
                      ? 'border-white/10 bg-ink text-white'
                      : 'border-accent/15 bg-ink/60 text-white/90'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.content}</div>
                  {m.toolsUsed && m.toolsUsed.length > 0 && (
                    <ul className="space-y-1 border-t border-white/8 pt-2">
                      {m.toolsUsed.map((t, i) => (
                        <li
                          key={`${t.tool}-${i}`}
                          className="flex items-start gap-1.5 font-mono text-[10px] text-accent/90"
                        >
                          <Link2 className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>
                            {t.label}
                            <span className="text-steel"> · {t.detail}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3 font-mono text-sm text-steel">
                <Cpu className="h-4 w-4 animate-spin text-accent" />
                Calling live tools…
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-xl border border-white/20 bg-white/[0.04] p-4 font-mono text-xs text-steel">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-bold">Request failed</p>
                  <p className="mt-1">{errorMessage}</p>
                  {configError && (
                    <p className="mt-2 text-steel">
                      Set a valid GEMINI_API_KEY in your environment.
                    </p>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage(inputText);
            }}
            className="flex gap-2 border-t border-white/5 pt-3"
          >
            <input
              type="text"
              placeholder='Ask: "Pull live scores for AI builders…"'
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-ink px-4 py-2.5 text-xs text-white outline-none focus:border-accent/40"
            />
            <button
              type="submit"
              disabled={loading || !inputText}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-ink hover:bg-accent-bright disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="w-full space-y-3 lg:w-72">
          <div className="rounded-3xl border border-white/10 bg-surface p-5">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-steel">
              Tool presets
            </h3>
            <div className="mt-3 space-y-2">
              {presets.map((t) => (
                <button
                  key={t.title}
                  type="button"
                  onClick={() => void handleSendMessage(t.prompt)}
                  className="w-full rounded-2xl border border-white/8 bg-ink/40 p-3 text-left transition hover:border-accent/30"
                >
                  <h4 className="text-xs font-bold text-white">{t.title}</h4>
                  <p className="mt-0.5 line-clamp-2 font-mono text-[10px] text-steel">
                    {t.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-accent/20 bg-accent/5 p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
              Loop
            </p>
            <p className="mt-2 text-xs leading-relaxed text-steel">
              Radar → Builders → Scout → Trade. Analyst cites live tools — not seed fiction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
