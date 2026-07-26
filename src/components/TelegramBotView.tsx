import React, { useEffect, useState } from 'react';
import { ExternalLink, Link2, MessageCircle, Shield, CheckCircle2, Coins } from 'lucide-react';

type PlatformStatus = {
  configured: boolean;
  username: string | null;
  firstName: string | null;
  webhookUrl: string;
  deepLink: string | null;
};

type RegisteredBot = {
  id: string;
  username: string;
  firstName: string;
  label: string;
  webhookUrl: string;
  deepLink: string;
  createdAt: string;
};

type ProfileForm = {
  chatId: string;
  chain: string;
  ticker: string;
  name: string;
  mint: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  website: string;
  twitter: string;
  telegramUrl: string;
  discord: string;
  bigBuyUsd: string;
};

const CHAINS = [
  { id: 'solana', label: 'Solana' },
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'base', label: 'Base' },
  { id: 'bsc', label: 'BNB Chain' },
  { id: 'polygon', label: 'Polygon' },
  { id: 'arbitrum', label: 'Arbitrum' },
  { id: 'avalanche', label: 'Avalanche' },
  { id: 'optimism', label: 'Optimism' },
  { id: 'sui', label: 'Sui' },
  { id: 'ton', label: 'TON' },
] as const;

const emptyProfile: ProfileForm = {
  chatId: '',
  chain: 'solana',
  ticker: '',
  name: '',
  mint: '',
  description: '',
  logoUrl: '',
  bannerUrl: '',
  website: '',
  twitter: '',
  telegramUrl: '',
  discord: '',
  bigBuyUsd: '1000',
};

type Props = {
  setCurrentPath: (path: string) => void;
};

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-accent/40';

export default function TelegramBotView({ setCurrentPath }: Props) {
  const [platform, setPlatform] = useState<PlatformStatus | null>(null);
  const [registered, setRegistered] = useState<RegisteredBot[]>([]);
  const [threshold, setThreshold] = useState(25);
  const [commands, setCommands] = useState<string[]>([]);
  const [token, setToken] = useState('');
  const [label, setLabel] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [submittingBot, setSubmittingBot] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [success, setSuccess] = useState<RegisteredBot | null>(null);
  const [profileOk, setProfileOk] = useState<string | null>(null);

  const refresh = async () => {
    const res = await fetch('/api/telegram/bot-status');
    if (!res.ok) throw new Error('Could not load bot status');
    const data = await res.json();
    setPlatform(data.platform ?? null);
    setRegistered(Array.isArray(data.registered) ? data.registered : []);
    if (typeof data.threshold === 'number') setThreshold(data.threshold);
    if (Array.isArray(data.commands)) setCommands(data.commands);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
        if (!cancelled) setError(null);
      } catch {
        if (!cancelled) setError('Could not load Telegram bot status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (key: keyof ProfileForm, value: string) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const onRegisterBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBot(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/telegram/bots/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken.trim()
            ? { 'x-admin-token': adminToken.trim() }
            : {}),
        },
        body: JSON.stringify({
          token: token.trim(),
          label: label.trim(),
          adminToken: adminToken.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccess(data.bot);
      setToken('');
      await refresh();
    } catch (err: unknown) {
      setError(String((err as Error)?.message || 'Registration failed'));
    } finally {
      setSubmittingBot(false);
    }
  };

  const onSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setProfileError(null);
    setProfileOk(null);
    try {
      const res = await fetch('/api/telegram/tokens/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: profile.chatId.trim(),
          chain: profile.chain,
          ticker: profile.ticker.trim(),
          name: profile.name.trim(),
          mint: profile.mint.trim(),
          description: profile.description.trim(),
          logoUrl: profile.logoUrl.trim(),
          bannerUrl: profile.bannerUrl.trim(),
          website: profile.website.trim() || undefined,
          twitter: profile.twitter.trim() || undefined,
          telegramUrl: profile.telegramUrl.trim() || undefined,
          discord: profile.discord.trim() || undefined,
          bigBuyUsd: Number(profile.bigBuyUsd) || 1000,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      setProfileOk(
        data.message ||
          `$${data.profile?.ticker} created. Admin: /openvotes ${data.profile?.ticker}`,
      );
      setProfile((p) => ({ ...emptyProfile, chatId: p.chatId, bigBuyUsd: p.bigBuyUsd }));
    } catch (err: unknown) {
      setProfileError(String((err as Error)?.message || 'Submit failed'));
    } finally {
      setSubmittingProfile(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-10 text-white sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Telegram Token Bot
      </p>
      <h1 className="font-display mt-2 text-4xl font-bold tracking-tight">
        List a token & connect alerts
      </h1>
      <p className="mt-3 max-w-xl text-sm text-steel">
        Submit mint, logo, name, description, banner, and socials. At {threshold} unique Telegram
        votes the token hits Community Trending. The bot posts whale buys for that mint in your
        group.
      </p>

      {loading ? (
        <p className="mt-10 font-mono text-sm text-steel">Loading…</p>
      ) : (
        <>
          <section className="mt-10 border-b border-white/10 pb-10">
            <div className="flex items-start gap-3">
              <Coins className="mt-1 h-5 w-5 text-accent" />
              <div className="w-full">
                <h2 className="text-lg font-bold">Register token profile</h2>
                <p className="mt-1 text-sm text-white/55">
                  In your Telegram group, run <span className="font-mono text-accent">/chatid</span>{' '}
                  and paste it below. Or use <span className="font-mono">/newtoken</span> wizard in
                  chat.
                </p>

                <form onSubmit={onSubmitProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Telegram chat id *
                    </span>
                    <input
                      required
                      value={profile.chatId}
                      onChange={(e) => setField('chatId', e.target.value)}
                      placeholder="-1001234567890"
                      className={`${fieldClass} font-mono`}
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Blockchain *
                    </span>
                    <select
                      required
                      value={profile.chain}
                      onChange={(e) => setField('chain', e.target.value)}
                      className={fieldClass}
                    >
                      {CHAINS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Ticker *
                    </span>
                    <input
                      required
                      value={profile.ticker}
                      onChange={(e) => setField('ticker', e.target.value)}
                      placeholder="CULT"
                      maxLength={16}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Token name *
                    </span>
                    <input
                      required
                      value={profile.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="Culture Node"
                      maxLength={80}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Contract address *
                    </span>
                    <input
                      required
                      value={profile.mint}
                      onChange={(e) => setField('mint', e.target.value)}
                      placeholder="Token contract on the selected chain"
                      className={`${fieldClass} font-mono text-xs`}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Description *
                    </span>
                    <textarea
                      required
                      value={profile.description}
                      onChange={(e) => setField('description', e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="What the project builds…"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Logo URL * (https)
                    </span>
                    <input
                      required
                      type="url"
                      value={profile.logoUrl}
                      onChange={(e) => setField('logoUrl', e.target.value)}
                      placeholder="https://…"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Banner URL * (https)
                    </span>
                    <input
                      required
                      type="url"
                      value={profile.bannerUrl}
                      onChange={(e) => setField('bannerUrl', e.target.value)}
                      placeholder="https://…"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Website
                    </span>
                    <input
                      value={profile.website}
                      onChange={(e) => setField('website', e.target.value)}
                      placeholder="https://…"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      X / Twitter
                    </span>
                    <input
                      value={profile.twitter}
                      onChange={(e) => setField('twitter', e.target.value)}
                      placeholder="@handle or URL"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Telegram
                    </span>
                    <input
                      value={profile.telegramUrl}
                      onChange={(e) => setField('telegramUrl', e.target.value)}
                      placeholder="@group or t.me/…"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Discord
                    </span>
                    <input
                      value={profile.discord}
                      onChange={(e) => setField('discord', e.target.value)}
                      placeholder="invite or URL"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Big-buy alert threshold (USD)
                    </span>
                    <input
                      type="number"
                      min={100}
                      step={100}
                      value={profile.bigBuyUsd}
                      onChange={(e) => setField('bigBuyUsd', e.target.value)}
                      className={`${fieldClass} font-mono`}
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={submittingProfile}
                      className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-accent-bright disabled:opacity-40"
                    >
                      {submittingProfile ? 'Submitting…' : 'Submit token profile'}
                    </button>
                  </div>
                </form>
                {profileError ? (
                  <p className="mt-4 text-sm text-red-300/90" role="alert">
                    {profileError}
                  </p>
                ) : null}
                {profileOk ? (
                  <p className="mt-4 text-sm text-accent" role="status">
                    {profileOk}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="mt-10 border-b border-white/10 pb-10">
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-1 h-5 w-5 text-accent" />
              <div className="flex-1">
                <h2 className="text-lg font-bold">Official bot</h2>
                {platform?.configured ? (
                  <div className="mt-2 space-y-2 text-sm text-white/70">
                    <p className="flex items-center gap-2 text-accent">
                      <CheckCircle2 className="h-4 w-4" />
                      Connected
                      {platform.username ? (
                        <span className="font-mono text-white">@{platform.username}</span>
                      ) : null}
                    </p>
                    {platform.deepLink ? (
                      <a
                        href={platform.deepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-3 py-1.5 font-mono text-[11px] text-accent hover:bg-accent/10"
                      >
                        Open @{platform.username} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-steel">Platform bot not configured.</p>
                )}
              </div>
            </div>
          </section>

          <section className="mt-10 border-b border-white/10 pb-10">
            <div className="flex items-start gap-3">
              <Link2 className="mt-1 h-5 w-5 text-accent" />
              <div className="w-full">
                <h2 className="text-lg font-bold">Connect your own BotFather bot</h2>
                <form onSubmit={onRegisterBot} className="mt-6 space-y-4">
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Bot token
                    </span>
                    <input
                      type="password"
                      autoComplete="off"
                      required
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="123456789:AAH…"
                      className={`${fieldClass} font-mono`}
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Label (optional)
                    </span>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="My community bot"
                      maxLength={64}
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                      Admin token *
                    </span>
                    <input
                      type="password"
                      autoComplete="off"
                      required
                      value={adminToken}
                      onChange={(e) => setAdminToken(e.target.value)}
                      placeholder="TELEGRAM_ADMIN_TOKEN"
                      className={`${fieldClass} font-mono`}
                    />
                    <span className="mt-1 block text-[11px] text-steel">
                      Required — prevents open BotFather token registration.
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={submittingBot || !token.trim() || !adminToken.trim()}
                    className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-accent/40 disabled:opacity-40"
                  >
                    {submittingBot ? 'Connecting…' : 'Connect webhook'}
                  </button>
                </form>
                {error ? (
                  <p className="mt-4 text-sm text-red-300/90" role="alert">
                    {error}
                  </p>
                ) : null}
                {success ? (
                  <div className="mt-4 rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm">
                    <p className="font-bold text-accent">Webhook connected</p>
                    <p className="mt-1 text-white/70">
                      {success.username ? `@${success.username}` : success.firstName} is live.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="mt-10 border-b border-white/10 pb-10">
            <div className="flex items-start gap-3">
              <Shield className="mt-1 h-5 w-5 text-accent" />
              <div>
                <h2 className="text-lg font-bold">Group commands</h2>
                <ul className="mt-3 space-y-1 font-mono text-[12px] text-white/60">
                  {(commands.length
                    ? commands
                    : [
                        '/newtoken',
                        '/chatid',
                        '/openvotes TICKER',
                        '/upvote TICKER',
                        '/tokens',
                        '/status TICKER',
                      ]
                  ).map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setCurrentPath('explore')}
                  className="mt-4 font-mono text-[11px] text-accent hover:underline"
                >
                  View Community Trending →
                </button>
              </div>
            </div>
          </section>

          {registered.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-lg font-bold">Registered bots</h2>
              <ul className="mt-4 space-y-2">
                {registered.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm"
                  >
                    <p className="font-semibold text-white">
                      {b.username ? `@${b.username}` : b.firstName || b.label}
                    </p>
                    {b.deepLink ? (
                      <a
                        href={b.deepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-accent hover:underline"
                      >
                        Open
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
