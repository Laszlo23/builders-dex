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
  Trophy,
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
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface NavbarProps {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  builderXp: number;
  builderLevelName: string;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

const DESKTOP_NAV = [
  { id: 'swap', label: 'Trade', icon: ArrowLeftRight },
  { id: 'explore', label: 'Explore', icon: Layers },
  { id: 'terminal', label: 'Terminal', icon: Activity },
  { id: 'launchpad', label: 'Accelerator', icon: Rocket },
  { id: 'earn', label: 'Earn', icon: Coins },
] as const;

const MORE_LINKS = [
  { id: 'landing', label: 'Home', icon: Home },
  { id: 'blog', label: 'Blog', icon: BookOpen },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'builders', label: 'Rankings', icon: Trophy },
  { id: 'investor', label: 'Investor Mode', icon: Sparkles },
  { id: 'ai', label: 'Intelligence™', icon: Sparkles },
  { id: 'profile', label: 'Passport™', icon: User },
  { id: 'apply', label: 'Apply', icon: FilePlus2 },
  { id: 'campaign', label: 'Share kit', icon: Share2 },
  { id: 'vision', label: 'Vision', icon: Eye },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'manifesto', label: 'Manifest', icon: ScrollText },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'feedback', label: 'Feedback', icon: MessageSquareHeart },
] as const;

const MOBILE_NAV = [
  { id: 'landing', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Layers },
  { id: 'swap', label: 'Trade', icon: ArrowLeftRight },
  { id: 'launchpad', label: 'Accel', icon: Rocket },
  { id: 'profile', label: 'Passport', icon: User },
] as const;

export default function Navbar({
  currentPath,
  setCurrentPath,
  builderXp,
  builderLevelName,
}: NavbarProps) {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [walletOpen, setWalletOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const activeDesktop =
    currentPath === 'project-detail'
      ? 'explore'
      : DESKTOP_NAV.some((n) => n.id === currentPath)
        ? currentPath
        : null;

  const mobileActiveId =
    currentPath === 'project-detail'
      ? 'explore'
      : currentPath === 'ai' ||
          currentPath === 'apply' ||
          currentPath === 'launch' ||
          currentPath === 'campaign' ||
          currentPath === 'dao'
        ? 'profile'
        : currentPath;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (walletRef.current && !walletRef.current.contains(t)) setWalletOpen(false);
      if (moreRef.current && !moreRef.current.contains(t)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-50 pt-3 sm:pt-4">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.1] to-ink/65 px-2.5 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:h-16 sm:px-4">
          {/* Logo — left */}
          <button
            type="button"
            onClick={() => setCurrentPath('landing')}
            className="relative z-10 flex shrink-0 items-center gap-2"
            aria-label="Builders DEX home"
          >
            <img
              src="/brand-mark.png"
              alt=""
              width={44}
              height={44}
              className="h-8 w-8 rounded-lg border border-accent/25 object-cover sm:h-11 sm:w-11"
              decoding="async"
              fetchPriority="high"
            />
            <span className="font-sans text-[13px] font-bold tracking-tight text-white sm:text-[15px]">
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
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentPath(item.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium tracking-tight transition ${
                    active
                      ? 'bg-accent/10 text-accent'
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
                  moreOpen || MORE_LINKS.some((l) => l.id === currentPath)
                    ? 'bg-accent/10 text-accent'
                    : 'text-steel hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <MoreHorizontal className="h-3.5 w-3.5 shrink-0" />
                More
                <ChevronDown className={`h-3.5 w-3.5 transition ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-surface/95 py-1 shadow-2xl backdrop-blur-xl">
                  {MORE_LINKS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCurrentPath(item.id);
                          setMoreOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs transition hover:bg-white/[0.04] ${
                          currentPath === item.id ? 'text-accent' : 'text-white/85'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 text-steel" />
                        {item.label}
                      </button>
                    );
                  })}
                  <div className="mt-1 border-t border-white/8 px-3 py-2 font-mono text-[10px] text-steel">
                    {builderLevelName} · {builderXp} XP
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Wallet — right */}
          <div className="relative z-10 flex shrink-0 items-center">
            {connected && publicKey ? (
              <div className="relative" ref={walletRef}>
                <button
                  type="button"
                  onClick={() => setWalletOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-mono text-xs text-white hover:border-accent/30"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span>{truncateAddress(publicKey.toBase58())}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-steel" />
                </button>
                {walletOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/10 bg-surface/95 p-2 shadow-2xl backdrop-blur-xl">
                    <p className="break-all px-2 py-1.5 font-mono text-[10px] text-steel">
                      {publicKey.toBase58()}
                    </p>
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
                        disconnect();
                        setWalletOpen(false);
                      }}
                      className="w-full rounded-lg px-2 py-2 text-left text-xs text-steel hover:bg-white/[0.05]"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setVisible(true)}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-bold text-ink hover:bg-accent-bright"
              >
                <Wallet className="h-3.5 w-3.5" />
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / tablet — always bottom footer nav (never moves to header) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink/95 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-2xl lg:hidden"
        aria-label="Mobile"
      >
        <div className="mx-auto flex max-w-lg flex-nowrap items-stretch justify-between">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const active = mobileActiveId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentPath(item.id)}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-semibold ${
                  active ? 'text-accent' : 'text-steel'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
