import React, { useEffect, useRef, useState } from 'react';
import {
  Wallet,
  ArrowLeftRight,
  Layers,
  Home,
  User,
  FilePlus2,
  ChevronDown,
  Sparkles,
  Share2,
  Coins,
  MoreHorizontal,
  Activity,
  Rocket,
  BookOpen,
  Users,
  Headphones,
  MessageSquareHeart,
  Eye,
  Map,
  ScrollText,
  Bot,
  Zap,
  Box,
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNetwork } from '../providers/NetworkProvider';
import { HOOD_LANE_ROUTES, type ChainLaneId } from '../data/chainLanes';
import { connectLabel } from '../lib/walletHost';
import { useSmartWalletConnect } from '../hooks/useSmartWalletConnect';
import OpenInWalletBar from './OpenInWalletBar';

interface NavbarProps {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  builderXp: number;
  builderLevelName: string;
  walletLabel?: string;
  walletDomain?: string | null;
  evmLabel?: string | null;
  room: ChainLaneId;
  signalLeft: number;
  signalMax: number;
  onOpenWalletRoom: () => void;
}

const DESKTOP_NAV = [
  { id: 'terminal', label: 'Radar', icon: Activity },
  { id: 'builders', label: 'Builders', icon: Layers },
  { id: 'swap', label: 'Trade', icon: ArrowLeftRight },
  { id: 'hoodstreet', label: 'Hood', icon: Zap },
] as const;

const MORE_GROUPS = [
  {
    title: 'Rooms',
    items: [
      { id: 'aura', label: '$AURA · Base', icon: Zap },
      { id: 'hood', label: 'On Hood', icon: ArrowLeftRight },
      { id: 'ccff00', label: 'CCFF00 Wallet', icon: Wallet },
      { id: 'cubes', label: 'Cubes Live', icon: Box },
      { id: 'launchpad', label: 'Accelerator', icon: Rocket },
    ],
  },
  {
    title: 'Build',
    items: [
      { id: 'explore', label: 'Stories', icon: Layers },
      { id: 'ai', label: 'Analyst', icon: Sparkles },
      { id: 'profile', label: 'Passport™', icon: User },
      { id: 'apply', label: 'Apply', icon: FilePlus2 },
      { id: 'investor', label: 'Investor', icon: Sparkles },
    ],
  },
  {
    title: 'Site',
    items: [
      { id: 'landing', label: 'Home', icon: Home },
      { id: 'blog', label: 'Blog', icon: BookOpen },
      { id: 'team', label: 'Team', icon: Users },
      { id: 'vision', label: 'Vision', icon: Eye },
      { id: 'support', label: 'Support', icon: Headphones },
    ],
  },
  {
    title: 'Labs',
    items: [
      { id: 'earn', label: 'Earn (sim)', icon: Coins },
      { id: 'dao', label: 'DAO (sim)', icon: Users },
      { id: 'campaign', label: 'Share kit', icon: Share2 },
      { id: 'telegram-bot', label: 'Telegram', icon: Bot },
      { id: 'feedback', label: 'Feedback', icon: MessageSquareHeart },
      { id: 'roadmap', label: 'Roadmap', icon: Map },
      { id: 'manifesto', label: 'Manifest', icon: ScrollText },
    ],
  },
] as const;

const MORE_IDS = new Set(MORE_GROUPS.flatMap((g) => g.items.map((i) => i.id)));
const PRIMARY_MOBILE = new Set(['landing', 'terminal', 'builders', 'swap', 'hoodstreet']);

const MOBILE_NAV = [
  { id: 'landing', label: 'Home', icon: Home },
  { id: 'terminal', label: 'Radar', icon: Activity },
  { id: 'builders', label: 'Builders', icon: Layers },
  { id: 'swap', label: 'Trade', icon: ArrowLeftRight },
  { id: 'hoodstreet', label: 'Hood', icon: Zap },
  { id: 'more', label: 'More', icon: MoreHorizontal },
] as const;

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export default function Navbar({
  currentPath,
  setCurrentPath,
  builderXp,
  builderLevelName,
  walletLabel,
  walletDomain,
  evmLabel,
  room,
  signalLeft,
  signalMax,
  onOpenWalletRoom,
}: NavbarProps) {
  const { publicKey, connected, disconnect } = useWallet();
  const { host, connectNow, connecting } = useSmartWalletConnect();
  const { network } = useNetwork();
  const [walletOpen, setWalletOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);
  const shownName =
    walletLabel ||
    (publicKey ? truncateAddress(publicKey.toBase58()) : 'Connect');

  const activeDesktop =
    currentPath === 'project-detail' || currentPath === 'explore'
      ? 'builders'
      : HOOD_LANE_ROUTES.has(currentPath)
        ? 'hoodstreet'
        : DESKTOP_NAV.some((n) => n.id === currentPath)
          ? currentPath
          : null;

  const mobileActiveId =
    currentPath === 'project-detail' || currentPath === 'explore'
      ? 'builders'
      : HOOD_LANE_ROUTES.has(currentPath)
        ? 'hoodstreet'
        : currentPath;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (walletRef.current && !walletRef.current.contains(t)) setWalletOpen(false);
      const inMore =
        moreRef.current?.contains(t) ||
        mobileSheetRef.current?.contains(t) ||
        (t instanceof Element && t.closest('[data-more-toggle]'));
      if (!inMore) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [currentPath]);

  return (
    <header className="sticky top-0 z-50 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4">
        <div className="nav-shell relative flex h-14 items-center justify-between gap-3 rounded-2xl px-2.5 backdrop-blur-2xl sm:h-16 sm:px-4">
          {/* Logo — left */}
          <button
            type="button"
            onClick={() => setCurrentPath('landing')}
            className="relative z-10 flex shrink-0 items-center gap-2"
            aria-label="Builders DEX home"
          >
            <img
              src="/brand-mark.webp"
              alt="Builders DEX"
              width={44}
              height={44}
              className="h-8 w-8 rounded-lg border border-accent/25 object-cover sm:h-11 sm:w-11"
              decoding="async"
              fetchPriority="high"
            />
            <span className="hidden font-display text-[13px] font-extrabold tracking-tight text-white sm:inline sm:text-[15px]">
              BUILDERS <span className="text-accent">DEX</span>
            </span>
          </button>

          {/* Desktop nav — centered */}
          <nav
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 lg:flex"
            aria-label="Primary"
          >
            {DESKTOP_NAV.map((item) => {
              const Icon = item.icon;
              const active = activeDesktop === item.id;
              const hood = item.id === 'hoodstreet';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentPath(item.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium tracking-tight transition ${
                    active && hood
                      ? 'bg-[#CCFF00]/15 text-[#CCFF00] shadow-[0_0_22px_rgba(204,255,0,0.28)]'
                      : active
                        ? 'bg-accent/10 text-accent'
                        : hood
                          ? 'text-[#CCFF00]/70 hover:bg-[#CCFF00]/10 hover:text-[#CCFF00]'
                          : 'text-steel hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                </button>
              );
            })}

            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition ${
                  moreOpen || MORE_IDS.has(currentPath)
                    ? 'bg-accent/10 text-accent'
                    : 'text-steel hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <MoreHorizontal className="h-3.5 w-3.5 shrink-0" />
                More
                <ChevronDown className={`h-3.5 w-3.5 transition ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-2 max-h-[min(70vh,28rem)] w-60 -translate-x-1/2 overflow-y-auto rounded-xl border border-white/10 bg-surface/95 py-1 shadow-2xl backdrop-blur-xl">
                  {MORE_GROUPS.map((group) => (
                    <div key={group.title} className="border-b border-white/8 py-1 last:border-b-0">
                      <p className="px-3 pt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-steel">
                        {group.title}
                      </p>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setCurrentPath(item.id);
                              setMoreOpen(false);
                            }}
                            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition hover:bg-white/[0.04] ${
                              currentPath === item.id ? 'text-accent' : 'text-white/85'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5 text-steel" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  <div className="px-3 py-2 font-mono text-[10px] text-steel">
                    {builderLevelName} · {builderXp} XP · {signalLeft}/{signalMax} signal
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-2">
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-steel sm:inline">
              {signalLeft}/{signalMax}
            </span>
            <button
              type="button"
              onClick={onOpenWalletRoom}
              className={`hidden items-center rounded-lg border px-2 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest sm:inline-flex ${
                room === 'hood'
                  ? 'border-[#CCFF00]/40 bg-[#CCFF00]/10 text-[#CCFF00]'
                  : room === 'base'
                    ? 'border-sky-400/40 bg-sky-400/10 text-sky-200'
                    : 'border-white/10 bg-white/[0.04] text-steel'
              }`}
            >
              {room === 'hood' ? 'Hood 4663' : room === 'base' ? 'Base' : `Sol ${network === 'mainnet' ? 'main' : 'dev'}`}
            </button>

            {connected && publicKey ? (
              <div className="relative" ref={walletRef}>
                <button
                  type="button"
                  onClick={() => setWalletOpen((v) => !v)}
                  className="flex max-w-[10.5rem] items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-white hover:border-accent/30 sm:max-w-[14rem]"
                  title={publicKey.toBase58()}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="truncate font-sans font-semibold tracking-tight">
                    {shownName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-steel" />
                </button>
                {walletOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/10 bg-surface/95 p-2 shadow-2xl backdrop-blur-xl">
                    <div className="mb-1 flex items-center justify-between border-b border-white/8 px-2 pb-2">
                      <span className="font-mono text-[10px] uppercase text-steel">Wallets</span>
                      <button
                        type="button"
                        onClick={() => {
                          setWalletOpen(false);
                          onOpenWalletRoom();
                        }}
                        className="rounded px-2 py-0.5 font-mono text-[10px] font-semibold text-accent"
                      >
                        Switch room
                      </button>
                    </div>
                    {walletDomain && (
                      <p className="px-2 py-1 font-mono text-[10px] text-accent">{walletDomain}</p>
                    )}
                    <p className="break-all px-2 py-1.5 font-mono text-[10px] text-steel">
                      Sol {publicKey.toBase58()}
                    </p>
                    {evmLabel && (
                      <p className="px-2 py-1 font-mono text-[10px] text-[#CCFF00]">EVM {evmLabel}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPath('profile');
                        setWalletOpen(false);
                      }}
                      className="w-full rounded-lg px-2 py-2 text-left text-xs text-white/80 hover:bg-white/[0.04]"
                    >
                      Passport™
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void disconnect();
                        setWalletOpen(false);
                      }}
                      className="w-full rounded-lg px-2 py-2 text-left text-xs text-steel hover:bg-white/[0.05]"
                    >
                      Disconnect Solana
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled={connecting}
                onClick={() => {
                  if (evmLabel) {
                    onOpenWalletRoom();
                    return;
                  }
                  void (async () => {
                    const result = await connectNow('auto');
                    if (result === 'picker') onOpenWalletRoom();
                  })();
                }}
                className="flex min-h-[44px] items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-ink hover:bg-accent-bright disabled:opacity-70 sm:px-4 lg:min-h-0 lg:py-1.5"
              >
                <Wallet className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
                <span className="max-w-[9.5rem] truncate">
                  {connecting ? 'Connecting…' : evmLabel ? evmLabel : connectLabel(host, false)}
                </span>
              </button>
            )}
          </div>
        </div>
        <OpenInWalletBar />
      </div>

      {moreOpen && (
        <div
          className="fixed inset-x-0 top-0 bottom-[4.6rem] z-[105] lg:hidden"
          aria-hidden
        >
          <button
            type="button"
            className="absolute inset-0 bg-ink/55"
            aria-label="Close more menu"
            onClick={() => setMoreOpen(false)}
          />
          <div
            ref={mobileSheetRef}
            className="absolute inset-x-0 bottom-0 mx-auto max-h-[min(70vh,28rem)] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/12 bg-surface/98 px-2 py-3 shadow-2xl backdrop-blur-xl scrollbar-none"
            role="dialog"
            aria-label="More rooms"
          >
            {MORE_GROUPS.map((group) => (
              <div key={group.title} className="border-b border-white/8 py-1 last:border-b-0">
                <p className="px-3 pt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-steel">
                  {group.title}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCurrentPath(item.id);
                        setMoreOpen(false);
                      }}
                      className={`flex min-h-[44px] w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-white/[0.04] ${
                        currentPath === item.id ? 'text-accent' : 'text-white/85'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-steel" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile / tablet — always bottom footer nav (never moves to header) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink/90 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-2xl lg:hidden"
        aria-label="Mobile"
      >
        <div className="mx-auto flex max-w-lg flex-nowrap items-stretch justify-between">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const moreActive =
              moreOpen || (MORE_IDS.has(currentPath) && !PRIMARY_MOBILE.has(currentPath));
            const active =
              item.id === 'more' ? moreActive : !moreOpen && mobileActiveId === item.id;
            const hood = item.id === 'hoodstreet';
            return (
              <button
                key={item.id}
                type="button"
                data-more-toggle={item.id === 'more' ? 'true' : undefined}
                onClick={() => {
                  if (item.id === 'more') {
                    setMoreOpen((v) => !v);
                    return;
                  }
                  setMoreOpen(false);
                  setCurrentPath(item.id);
                }}
                className={`flex min-h-[44px] min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-2 text-[9px] font-semibold sm:text-[10px] ${
                  active && hood
                    ? 'text-[#CCFF00]'
                    : active
                      ? 'text-accent'
                      : 'text-steel'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
