import React, { useState } from 'react';
import { ExternalLink, Wallet, AlertTriangle, ArrowRight } from 'lucide-react';
import { BRAND_HOOD_STANCE, BRAND_MULTICHAIN } from '../data/brand';
import {
  CUBES_MINT_URL,
  DEBRIDGE_APP_URL,
  HOOD_ACROSS_URL,
  HOOD_ARBITRUM_PORTAL,
  HOOD_CHAIN_ID,
  HOOD_CHAIN_NAME,
  HOOD_DISCLAIMER,
  HOOD_DOCS_URL,
  HOOD_EXPLORER_URL,
  HOOD_NATIVE_SYMBOL,
  HOOD_RELAY_URL,
  HOOD_RPC_URL,
  MAYAN_APP_URL,
  addHoodToWallet,
} from '../data/hoodChain';

type Props = {
  setCurrentPath: (path: string) => void;
};

function OfficialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent/40 hover:text-accent"
    >
      {label} <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export default function HoodGuideView({ setCurrentPath }: Props) {
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const addChain = async () => {
    setAdding(true);
    setAddError(null);
    const err = await addHoodToWallet();
    setAddError(err);
    setAdding(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-white sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        {BRAND_MULTICHAIN} · Robinhood Chain {HOOD_CHAIN_ID}
      </p>
      <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        We love how Hood moves
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
        {BRAND_HOOD_STANCE} Cubes is in the catalog. Apply lists Hood. Passport binds the same 0x
        you use on Base. This page is the honest hop so you can actually join — there is no
        canonical Solana → Robinhood Chain bridge. Arrive with{' '}
        <span className="text-white">{HOOD_NATIVE_SYMBOL} for gas first</span>.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void addChain()}
          disabled={adding}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-ink disabled:opacity-60"
        >
          <Wallet className="h-3.5 w-3.5" />
          {adding ? 'Requesting…' : 'Add Hood to EVM wallet'}
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('cubes')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white"
        >
          Cubes live <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('profile')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white"
        >
          Link EVM wallet
        </button>
      </div>
      {addError && <p className="mt-3 text-xs text-amber-200/90">{addError}</p>}

      <ol className="mt-10 space-y-6">
        <li className="rounded-3xl border border-white/10 bg-ink/60 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">1 · EVM wallet</p>
          <h2 className="font-display mt-1 text-xl font-bold">Add {HOOD_CHAIN_NAME}</h2>
          <p className="mt-2 text-sm text-steel">
            Use Rabby, MetaMask, or Robinhood Wallet. Phantom connected only to Solana cannot add
            4663. Chain ID <span className="text-white">{HOOD_CHAIN_ID}</span>, RPC{' '}
            <span className="break-all text-white">{HOOD_RPC_URL}</span>, explorer{' '}
            <span className="break-all text-white">{HOOD_EXPLORER_URL}</span>, symbol {HOOD_NATIVE_SYMBOL}.
          </p>
        </li>
        <li className="rounded-3xl border border-white/10 bg-ink/60 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">2 · Test hop</p>
          <h2 className="font-display mt-1 text-xl font-bold">SOL → ETH or USDC on Ethereum or Base</h2>
          <p className="mt-2 text-sm text-steel">
            Bridge a <span className="text-white">test amount</span> you can afford to lose. Type
            the URL yourself — never ads or DMs. Deep liquidity is on Ethereum L1 or Base, not on
            Hood.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <OfficialLink href={DEBRIDGE_APP_URL} label="deBridge" />
            <OfficialLink href={MAYAN_APP_URL} label="Mayan" />
          </div>
        </li>
        <li className="rounded-3xl border border-white/10 bg-ink/60 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">3 · Onto Hood</p>
          <h2 className="font-display mt-1 text-xl font-bold">EVM balance → Hood ETH</h2>
          <p className="mt-2 text-sm text-steel">
            Prefer Relay or Across (listed in Robinhood docs). Conservative path: Ethereum →
            Arbitrum portal (~10 min in). Canonical exit from Hood is ~7 days.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <OfficialLink href={HOOD_RELAY_URL} label="Relay" />
            <OfficialLink href={HOOD_ACROSS_URL} label="Across" />
            <OfficialLink href={HOOD_ARBITRUM_PORTAL} label="Arbitrum portal" />
            <OfficialLink href={HOOD_DOCS_URL} label="Robinhood bridging docs" />
          </div>
        </li>
        <li className="rounded-3xl border border-white/10 bg-ink/60 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">4 · Gas first</p>
          <h2 className="font-display mt-1 text-xl font-bold">Same 0x on Base and Hood</h2>
          <p className="mt-2 text-sm text-steel">
            Your EVM address does not change when you hop L2s. Once that wallet is funded with ETH
            on 4663, Cubes mint and other Hood apps can charge gas. Bind it to your Solana Passport
            on Profile — we are not a custodial bridge.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <OfficialLink href={CUBES_MINT_URL} label="Cubes mint" />
            <OfficialLink href={HOOD_EXPLORER_URL} label="Hood explorer" />
          </div>
        </li>
      </ol>

      <p className="mt-8 flex items-start gap-2 font-mono text-[11px] leading-relaxed text-steel">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200" />
        {HOOD_DISCLAIMER}
      </p>
    </div>
  );
}
