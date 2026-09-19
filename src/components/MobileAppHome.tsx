import React from 'react';
import { Activity, ArrowLeftRight, Sparkles, Wallet, Zap } from 'lucide-react';
import type { Project } from '../types';
import { GENESIS_PROJECT_IDS } from '../data/genesisBuilders';
import { BRAND_TAGLINE } from '../data/brand';
import { connectLabel } from '../lib/walletHost';
import { hostHint, useSmartWalletConnect } from '../hooks/useSmartWalletConnect';

type Props = {
  projects: Project[];
  setCurrentPath: (path: string) => void;
  onOpenStory: (projectId: string) => void;
  onStartFirstDiscovery?: () => void;
  onOpenWalletRoom: () => void;
};

const TILES = [
  { id: 'discover', label: 'Discover', hint: 'First signal', icon: Sparkles },
  { id: 'terminal', label: 'Radar', hint: 'Who is rising', icon: Activity },
  { id: 'swap', label: 'Trade', hint: 'Curated last', icon: ArrowLeftRight },
  { id: 'hoodstreet', label: 'Hood', hint: 'CCFF00 street', icon: Zap },
] as const;

export default function MobileAppHome({
  projects,
  setCurrentPath,
  onOpenStory,
  onStartFirstDiscovery,
  onOpenWalletRoom,
}: Props) {
  const { host, connectNow, connecting, connected, error } = useSmartWalletConnect();
  const featured =
    GENESIS_PROJECT_IDS.map((id) => projects.find((p) => p.id === id)).find(Boolean) ??
    projects[0];

  const onConnect = async () => {
    const result = await connectNow('auto');
    if (result === 'picker') onOpenWalletRoom();
  };

  const goTile = (id: (typeof TILES)[number]['id']) => {
    if (id === 'discover') {
      onStartFirstDiscovery?.();
      return;
    }
    setCurrentPath(id);
  };

  return (
    <section className="relative px-4 pb-6 pt-2 lg:hidden">
      <div className="relative z-10 mx-auto max-w-lg">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
          {host.inApp ? `In ${host.name}` : 'Builders DEX app'}
        </p>
        <h1 className="font-display mt-2 text-[2.15rem] font-extrabold leading-[0.9] tracking-tight">
          BUILDERS <span className="text-accent">DEX</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/80">{BRAND_TAGLINE}</p>
        <p className="mt-2 text-xs leading-relaxed text-steel">{hostHint(host)}</p>

        <button
          type="button"
          disabled={connecting}
          onClick={() => void onConnect()}
          className="btn-sheen mt-5 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-accent text-sm font-bold text-ink active:scale-[0.99] disabled:opacity-70"
        >
          <Wallet className="h-5 w-5" />
          {connecting ? 'Connecting…' : connectLabel(host, connected)}
        </button>
        {error && (
          <p className="mt-2 text-xs text-rose-200">{error}</p>
        )}
        <button
          type="button"
          onClick={onOpenWalletRoom}
          className="mt-2 w-full min-h-[44px] text-center font-mono text-[10px] uppercase tracking-[0.16em] text-steel"
        >
          Switch room · Solana · Base · Hood
        </button>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => goTile(tile.id)}
                className="flex min-h-[88px] flex-col items-start justify-between rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-left active:scale-[0.98]"
              >
                <Icon className="h-5 w-5 text-accent" />
                <span>
                  <span className="block text-sm font-semibold text-white">{tile.label}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-steel">{tile.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        {featured && (
          <button
            type="button"
            onClick={() => onOpenStory(featured.id)}
            className="mt-4 flex min-h-[64px] w-full items-center justify-between gap-3 rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-left active:scale-[0.99]"
          >
            <span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-accent">
                Today · Genesis
              </span>
              <span className="mt-1 block text-sm font-semibold text-white">{featured.name}</span>
            </span>
            <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-xs font-bold text-ink">
              {featured.builderScore.overall}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
