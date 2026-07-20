import React from 'react';
import { ExternalLink, ArrowLeftRight } from 'lucide-react';
import { CONVICTION_WINNERS } from '../data/convictionWinners';

type Props = {
  onTrade?: (mint?: string) => void;
};

/**
 * Founder conviction bag — durable winners, not the newest launches.
 */
export default function ConvictionWinnersSection({ onTrade }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-ink/50 p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        Conviction bag
      </p>
      <h2 className="font-sans mt-1 text-xl font-bold tracking-tight sm:text-2xl">
        Not the newest. Definitively winners.
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-steel">
        Tokens we actually believe in — working products, known builders, years of shipping. Not a
        launchpad FOMO list.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONVICTION_WINNERS.map((t) => (
          <li
            key={t.id}
            className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition hover:border-accent/35"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-sans text-lg font-bold tracking-tight text-white">
                  {t.ticker}
                  <span className="ml-2 font-mono text-[10px] font-normal uppercase tracking-wider text-steel">
                    {t.chain}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-white/70">{t.name}</p>
              </div>
            </div>
            <p className="mt-3 flex-1 text-xs leading-relaxed text-white/55">{t.blurb}</p>
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-accent/80">{t.why}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/80 transition hover:border-accent/40 hover:text-accent"
              >
                Site <ExternalLink className="h-3 w-3" />
              </a>
              {t.solanaMint && onTrade && (
                <button
                  type="button"
                  onClick={() => onTrade(t.solanaMint)}
                  className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent transition hover:bg-accent/25"
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  Trade {t.tradeSymbol ?? t.ticker}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
