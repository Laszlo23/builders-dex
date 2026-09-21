import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Copy, ExternalLink, Loader2, Wallet } from 'lucide-react';
import { parseEther } from 'viem';
import ChainLaneBar from './ChainLaneBar';
import { BRAND_HOOD_STANCE } from '../data/brand';
import {
  CCFF00_DESK,
  CCFF00_NFT,
  CCFF00_TOKEN,
  type Ccff00DeskItem,
} from '../data/ccff00Wallet';
import {
  HOOD_CHAIN_ID,
  HOOD_DISCLAIMER,
  addHoodToWallet,
  hoodExplorerAddressUrl,
  hoodExplorerTokenUrl,
} from '../data/hoodChain';
import { HOODSTREET_DISCLOSURES, HOODSTREET_NEON_URL } from '../data/hoodStreet';
import { formatHoodSharePrice, hoodShareTxExplorer } from '../data/hoodShare';
import { connectHoodEvm } from '../lib/hoodShareMint';
import {
  createCcff00Account,
  executeAsSquare,
  formatCcff00,
  formatWeiEth,
  fundCcff00Tba,
  loadCcff00Wallet,
  loadSquareById,
  shortenHex,
  type Ccff00Square,
  type Ccff00WalletSnapshot,
} from '../lib/ccff00Wallet';
import SquareLoopPanel from './SquareLoopPanel';

type Props = {
  setCurrentPath: (path: string, state?: { buy?: string | null; stall?: string | null }) => void;
};

function buyFromSearch(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('buy');
}

function stallFromSearch(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('stall') === '1';
}

export default function Ccff00WalletView({ setCurrentPath }: Props) {
  const [account, setAccount] = useState<string | null>(null);
  const [snap, setSnap] = useState<Ccff00WalletSnapshot | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [manualId, setManualId] = useState('');
  const [fundEth, setFundEth] = useState('0.0002');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [buyId, setBuyId] = useState<string | null>(() => buyFromSearch());

  const selected = useMemo(
    () => snap?.squares.find((s) => s.tokenId === selectedId) ?? snap?.squares[0] ?? null,
    [snap, selectedId],
  );

  const liveBuy = CCFF00_DESK.find((item) => item.id === (buyId || 'p5') && item.status === 'live') ?? CCFF00_DESK[0];
  const fundedEnough = selected ? BigInt(selected.ethWei) >= (liveBuy?.valueWei ?? 0n) : false;
  const step = !account && !selected ? 1 : !selected ? 2 : !selected.tbaCreated || !fundedEnough ? 3 : 4;

  const refresh = async (owner: string, extra?: Ccff00Square, fresh = false) => {
    const next = await loadCcff00Wallet(owner, { fresh });
    if (extra && !next.squares.some((s) => s.tokenId === extra.tokenId)) {
      next.squares = [...next.squares, extra];
    }
    setSnap(next);
    setSelectedId((cur) => extra?.tokenId ?? cur ?? next.squares[0]?.tokenId ?? null);
  };

  const onConnect = async () => {
    setError(null);
    setBusy('connect');
    try {
      const from = await connectHoodEvm();
      setAccount(from);
      await refresh(from, undefined, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connect failed');
    } finally {
      setBusy(null);
    }
  };

  const onLookup = async () => {
    const tokenId = Number(manualId);
    setError(null);
    setBusy('lookup');
    try {
      const square = await loadSquareById(tokenId);
      if (account) await refresh(account, square);
      else {
        setSnap({
          owner: 'lookup',
          balance: 1,
          tradingActivated: false,
          token: CCFF00_TOKEN,
          squares: [square],
          fetchedAt: new Date().toISOString(),
        });
        setSelectedId(square.tokenId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setBusy(null);
    }
  };

  const runTx = async (label: string, work: () => Promise<string>) => {
    if (!selected) return;
    setError(null);
    setBusy(label);
    try {
      const hash = await work();
      setTx(hash);
      if (account) window.setTimeout(() => void refresh(account, undefined, true), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setBusy(null);
    }
  };

  const onBuy = (item: Ccff00DeskItem) => {
    if (!selected) {
      setError('Load a Square first — connect EVM or enter a token id.');
      return;
    }
    if (!selected.tbaCreated) {
      setError('Create the Square account, then buy from it.');
      return;
    }
    if (BigInt(selected.ethWei) < item.valueWei) {
      setError(`Fund the Square with at least ${formatWeiEth(item.valueWei)} first.`);
      return;
    }
    setBuyId(item.id);
    void runTx('buy', () => executeAsSquare(selected.tba, item));
  };

  useEffect(() => {
    const want = buyFromSearch();
    const stall = stallFromSearch();
    if (!want && !stall) return;
    if (want) setBuyId(want);
    const timer = window.setTimeout(() => {
      document
        .getElementById(stall ? 'square-loop' : 'square-desk')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, []);

  const copyTba = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.tba);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const steps = [
    { n: '01', t: 'Hood EVM', d: account ? shortenHex(account) : 'Connect 4663' },
    { n: '02', t: 'Square', d: selected ? `#${selected.tokenId}` : 'Find NFT' },
    { n: '03', t: 'Fund TBA', d: selected ? formatWeiEth(selected.ethWei, 4) : 'ETH inside' },
    { n: '04', t: 'Buy', d: liveBuy?.name || 'Desk' },
  ];

  return (
    <div className="hood-lane-page mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
      <ChainLaneBar active="hood" setCurrentPath={setCurrentPath} />

      <div className="relative mt-6 overflow-hidden rounded-[2rem] border border-[#CCFF00]/40 bg-ink">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#CCFF00]">
              Hood room · chain {HOOD_CHAIN_ID} · not Solana
            </p>
            <h1 className="section-title font-display mt-3 text-4xl font-bold sm:text-6xl">
              The Square is the wallet.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-steel sm:text-base">
              {BRAND_HOOD_STANCE} Phantom stays on Solana. This desk is EVM on 4663. The NFT pays.
              The owner only signs.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onConnect()}
                disabled={busy === 'connect'}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#CCFF00] px-5 py-2.5 text-xs font-bold text-ink disabled:opacity-60"
              >
                {busy === 'connect' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />}
                {account ? 'Refresh Squares' : '1 · Connect Hood EVM'}
              </button>
              <a
                href={HOODSTREET_NEON_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#CCFF00]/40 px-5 py-2.5 text-xs font-semibold"
              >
                My Neon <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setCurrentPath('hood')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold"
              >
                Get Hood ETH <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="relative mx-auto flex h-52 w-52 items-center justify-center sm:h-64 sm:w-64">
            <div className="absolute inset-6 rounded-[1.75rem] bg-[#CCFF00] opacity-40 blur-3xl" />
            <div className="neon-square relative flex h-full w-full flex-col items-center justify-center rounded-[1.75rem]">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-ink">Square</p>
              <p className="font-display mt-1 text-5xl font-bold text-ink">
                {selected ? `#${selected.tokenId}` : 'CCFF00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flow-rail mt-6">
        {steps.map((item, idx) => (
          <div
            key={item.n}
            className={`flow-step ${idx + 1 === step ? 'is-now' : ''} ${idx + 1 < step ? 'is-done' : ''}`}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#CCFF00]">{item.n}</p>
            <p className="mt-1 text-sm font-semibold">{item.t}</p>
            <p className="font-mono text-[10px] text-steel">{item.d}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-white/10 bg-ink/70 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#CCFF00]">2 · Load a Square</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={manualId}
            onChange={(e) => setManualId(e.target.value.replace(/[^\d]/g, ''))}
            placeholder="Token id"
            inputMode="numeric"
            className="min-h-[44px] w-36 rounded-full border border-white/15 bg-ink px-4 font-mono text-sm text-white"
          />
          <button
            type="button"
            onClick={() => void onLookup()}
            disabled={busy === 'lookup' || !manualId}
            className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-4 text-xs font-semibold disabled:opacity-50"
          >
            {busy === 'lookup' ? 'Reading…' : 'Load TBA'}
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] text-steel">
          NFT {shortenHex(CCFF00_NFT)} · $CCFF00 {shortenHex(CCFF00_TOKEN)}
        </p>
      </section>

      {snap && snap.squares.length > 1 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {snap.squares.map((square) => (
            <button
              key={square.tokenId}
              type="button"
              onClick={() => setSelectedId(square.tokenId)}
              className={`rounded-full px-4 py-2 font-mono text-xs ${
                selected?.tokenId === square.tokenId
                  ? 'bg-[#CCFF00] font-bold text-ink'
                  : 'border border-white/15 text-white'
              }`}
            >
              #{square.tokenId}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <section className="mt-6 rounded-3xl border border-[#CCFF00]/30 bg-[#CCFF00]/[0.06] p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#CCFF00]">
                3 · Token-bound account
              </p>
              <p className="mt-2 break-all font-mono text-sm text-white">{selected.tba}</p>
            </div>
            <button
              type="button"
              onClick={() => void copyTba()}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs"
            >
              <Copy className="h-3 w-3" /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-steel">ETH in Square</p>
              <p className="font-display mt-1 text-2xl font-bold">{formatWeiEth(selected.ethWei)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-steel">$CCFF00 inside</p>
              <p className="font-display mt-1 text-2xl font-bold">{formatCcff00(selected.ccff00Wei)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-steel">Account</p>
              <p className="font-display mt-1 text-2xl font-bold">
                {selected.tbaCreated ? 'Live' : 'Create first'}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {!selected.tbaCreated && (
              <button
                type="button"
                onClick={() => void runTx('create', () => createCcff00Account(selected.tokenId))}
                disabled={Boolean(busy)}
                className="rounded-full bg-[#CCFF00] px-4 py-2 text-xs font-bold text-ink disabled:opacity-50"
              >
                {busy === 'create' ? 'Creating…' : 'Create Square account'}
              </button>
            )}
            <input
              value={fundEth}
              onChange={(e) => setFundEth(e.target.value)}
              className="w-28 rounded-full border border-white/15 bg-ink px-3 py-2 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => {
                try {
                  void runTx('fund', () => fundCcff00Tba(selected.tba, parseEther(fundEth || '0')));
                } catch {
                  setError('Enter a valid ETH amount');
                }
              }}
              disabled={Boolean(busy)}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold disabled:opacity-50"
            >
              {busy === 'fund' ? 'Sending…' : 'Fund Square'}
            </button>
            <a
              href={hoodExplorerAddressUrl(selected.tba)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs"
            >
              Explorer <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={() => void addHoodToWallet()}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold"
            >
              Add Hood 4663
            </button>
          </div>
        </section>
      )}

      {selected && (
        <div id="square-loop" className="mt-8">
          <SquareLoopPanel tokenId={selected.tokenId} setCurrentPath={setCurrentPath} compact />
        </div>
      )}

      <section id="square-desk" className="mt-10 scroll-mt-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#CCFF00]">4 · Buy as this Square</p>
        <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">Projects settle into the NFT.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
          Solana swap cannot pay this. Base AURA cannot pay this. The Square on Hood can. Activate
          and park first if you want the Aura stall. $CCFF00 spot stays locked until HoodStreet
          enables trading.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {CCFF00_DESK.map((item) => (
            <article
              key={item.id}
              className={`rounded-3xl border p-5 ${
                buyId === item.id ? 'border-[#CCFF00]/50 bg-[#CCFF00]/5' : 'border-white/10 bg-ink/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-xl font-bold">{item.name}</h3>
                <span className="rounded-full border border-[#CCFF00]/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#CCFF00]">
                  {item.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-steel">{item.blurb}</p>
              {item.status === 'live' ? (
                <button
                  type="button"
                  onClick={() => onBuy(item)}
                  disabled={!selected || Boolean(busy)}
                  className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-[#CCFF00] px-4 text-xs font-bold text-ink disabled:opacity-50"
                >
                  {busy === 'buy' && buyId === item.id
                    ? 'Buying from Square…'
                    : `Buy as Square · ${item.id === 'p5' ? formatHoodSharePrice() : formatWeiEth(item.valueWei)}`}
                </button>
              ) : (
                <p className="mt-4 font-mono text-[11px] text-amber-200/90">{item.lockReason}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      {tx && (
        <a
          href={hoodShareTxExplorer(tx)}
          target="_blank"
          rel="noreferrer"
          className="mt-6 block break-all font-mono text-[11px] text-[#CCFF00]"
        >
          Tx {tx}
        </a>
      )}
      {error && (
        <p className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/5 px-4 py-3 text-sm text-amber-100">
          {error}
        </p>
      )}
      {snap && snap.balance > 0 && snap.squares.length === 0 && (
        <p className="mt-4 text-sm text-steel">
          This EOA holds {snap.balance} Square{snap.balance === 1 ? '' : 's'}, but recent transfers
          did not surface them. Enter the token id above.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" onClick={() => setCurrentPath('build')} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold">
          $BUILD
        </button>
        <button type="button" onClick={() => setCurrentPath('hoodstreet')} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold">
          HoodStreet
        </button>
        <button type="button" onClick={() => setCurrentPath('raise')} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold">
          Accelerator
        </button>
        <button type="button" onClick={() => setCurrentPath('cubes')} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold">
          Live phases
        </button>
        <a
          href={hoodExplorerTokenUrl(CCFF00_NFT)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold"
        >
          Squares explorer
        </a>
      </div>

      <p className="mt-8 font-mono text-[10px] leading-relaxed text-steel">
        {HOOD_DISCLAIMER} The Square wallet is HoodStreet&apos;s ERC-6551 account, not ours.{' '}
        <a href={HOODSTREET_DISCLOSURES} target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] underline-offset-2 hover:underline">
          Their disclosures
        </a>
        .
      </p>
    </div>
  );
}
