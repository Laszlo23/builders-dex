import React from 'react';
import {
  ArrowLeftRight,
  Layers,
  Activity,
  Briefcase,
  Rocket,
  Coins,
  User,
  Flag,
  BookOpen,
  Users,
  HelpCircle,
  Compass,
  Newspaper,
  ScrollText,
  Shield,
  Stamp,
  Mail,
  Network,
  Clapperboard,
  MessageSquareHeart,
  Headphones,
  Eye,
  Map,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { BRAND_SOCIALS, CULTURE_NODE_X_POST } from '../data/brand';

type FooterLink = { id: string; label: string; icon: LucideIcon };

const PRODUCT: FooterLink[] = [
  { id: 'swap', label: 'Trade', icon: ArrowLeftRight },
  { id: 'explore', label: 'Explore', icon: Layers },
  { id: 'terminal', label: 'Terminal™', icon: Activity },
  { id: 'builder-graph', label: 'Builder Graph™', icon: Network },
  { id: 'builder-stories', label: 'Builder Stories', icon: Clapperboard },
  { id: 'investor', label: 'Investor Mode', icon: Briefcase },
  { id: 'launchpad', label: 'Accelerator', icon: Rocket },
  { id: 'earn', label: 'Earn', icon: Coins },
  { id: 'profile', label: 'Passport™', icon: User },
];

const COMMUNITY: FooterLink[] = [
  { id: 'vision', label: 'Vision', icon: Eye },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'manifesto', label: 'Manifest', icon: ScrollText },
  { id: 'mission', label: 'Mission', icon: Flag },
  { id: 'story', label: 'Story', icon: BookOpen },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'feedback', label: 'Feedback', icon: MessageSquareHeart },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'guide', label: 'Site guide', icon: Compass },
  { id: 'blog', label: 'Blog', icon: Newspaper },
];

const LEGAL: FooterLink[] = [
  { id: 'terms', label: 'Terms', icon: ScrollText },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'imprint', label: 'Imprint', icon: Stamp },
  { id: 'contact', label: 'Contact', icon: Mail },
];

interface SiteFooterProps {
  setCurrentPath: (path: string) => void;
  tradeableCount: number;
}

export default function SiteFooter({ setCurrentPath, tradeableCount }: SiteFooterProps) {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/8 bg-ink/90 pb-24 pt-12 lg:pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url(/parallax/wall.webp), url(/parallax/wall.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/92 to-ink/80" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <img
                src="/brand-mark.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl border border-accent/35 object-cover"
                loading="lazy"
                decoding="async"
              />
              <p className="font-sans text-sm font-bold tracking-tight">
                BUILDERS <span className="text-accent">DEX</span>
              </p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-steel">
              Every legendary protocol starts as an unknown builder. Build something worthy of being
              featured here.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 font-mono text-[10px] text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              LIVE · {tradeableCount} tradeable
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {BRAND_SOCIALS.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/80 transition hover:border-accent/40 hover:text-accent"
                >
                  {s.label} <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
            <a
              href={CULTURE_NODE_X_POST}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] text-accent hover:underline"
            >
              Like · share · comment Culture Node ↗
            </a>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3">
            {[
              { title: 'Product', links: PRODUCT },
              { title: 'Community', links: COMMUNITY },
              { title: 'Legal', links: LEGAL },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {col.links.map((l) => {
                    const Icon = l.icon;
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => setCurrentPath(l.id)}
                          className="inline-flex items-center gap-2 text-xs text-steel transition hover:text-accent"
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0 text-accent/80" aria-hidden />
                          {l.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] text-steel/80">
            © 2026 BUILDERS DEX — BUILT BY PEOPLE · Building Culture
          </p>
          <a
            href="https://app.buildingcultureid.space/team"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] text-accent hover:underline"
          >
            <Users className="h-3 w-3" />
            Team on Building Culture ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
