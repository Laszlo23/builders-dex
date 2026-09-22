import React, { useEffect, useState } from 'react';
import { ExternalLink, Wallet, AlertTriangle, ArrowRight } from 'lucide-react';
import { BRAND_HOOD_STANCE, BRAND_MULTICHAIN } from '../data/brand';
import { HOODSTREET_SITE } from '../data/hoodStreet';
import ChainLaneBar from './ChainLaneBar';
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

type HoodStatus = {
  founder?: { address: string; eth: number; explorerUrl: string };
};

export default function HoodGuideView({ setCurrentPath }: Props) {
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [founderEth, setFounderEth] = useState<HoodStatus['founder'] | null>(null);

  const addChain = async () => {
    setAdding(true);
    setAddError(null);
    const err = await addHoodToWallet();
    setAddError(err);
    setAdding(false);
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/hood/status')
      .then((r) => r.json())
      .then((data: HoodStatus) => {
        if (!cancelled && data.founder) setFounderEth(data.founder);
      })
      .catch(() => {
        /* public balance is optional */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="hood-lane-page mx-auto max-w-3xl px-4 py-8 text-white sm:px-6">
      <ChainLaneBar active="hood" setCurrentPath={setCurrentPath} />
      <p className="relative mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[#CCFF00]">
        {BRAND_MULTICHAIN} · Robinhood Chain {HOOD_CHAIN_ID}
      </p>
      <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        We love how Hood moves
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
        {BRAND_HOOD_STANCE} HoodStreet is in the catalog — CCFF00, My Neon, Cubes mint. Apply lists
        Hood. Passport binds the same 0x you use on Base. This page is the honest hop so you can
        actually join — there is no canonical Solana → Robinhood Chain bridge. Arrive with{' '}
        <span className="text-white">{HOOD_NATIVE_SYMBOL} for gas first</span>.
      </p>

      {founderEth && (
        <div className="mt-6 rounded-2xl border border-accent/25 bg-accent/10 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Founder on Hood
          </p>
          <p className="mt-1 text-sm text-white">
            {founderEth.eth.toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH on chain{' '}
            {HOOD_CHAIN_ID}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-steel">
            Same published 0x as Base AURA. The Accelerator mint is on this network — inspected
            share NFTs in ETH, same wallet you already use. Solana Devnet stays the program canary.
          </p>
          <a
            href={founderEth.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-accent"
          >
            {founderEth.address} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

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
          onClick={() => setCurrentPath('launchpad')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white"
        >
          Accelerator mint <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('hoodstreet')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#CCFF00]/40 px-4 py-2.5 text-xs font-semibold text-[#CCFF00]"
        >
          HoodStreet <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('ccff00')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#CCFF00]/40 px-4 py-2.5 text-xs font-semibold text-[#CCFF00]"
        >
          CCFF00 Wallet <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('cubes')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white"
        >
          Live phases <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('stacc')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#CCFF00]/40 px-4 py-2.5 text-xs font-semibold text-[#CCFF00]"
        >
          staccpad book <ArrowRight className="h-3.5 w-3.5" />
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
            on 4663, HoodStreet / Cubes mint and other Hood apps can charge gas. Bind it to your Solana Passport
            on Profile — we are not a custodial bridge.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <OfficialLink href={HOODSTREET_SITE} label="HoodStreet" />
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
