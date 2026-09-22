import React, { useState } from 'react';
import { ExternalLink, Lock, Radio, Wallet } from 'lucide-react';
import {
  BUILD_DISCLAIMER,
  BUILD_LAUNCHPADS,
  BUILD_TOKEN_DECIMALS,
  BUILD_TOKEN_NAME,
  BUILD_TOKEN_SYMBOL,
  explorerAddress,
  explorerToken,
  explorerTx,
  type BuildLaunchpad,
} from '../data/buildToken';
import { HOOD_CHAIN_ID, HOOD_CHAIN_ID_HEX, HOOD_DISCLAIMER } from '../data/hoodChain';
import ChainLaneBar from './ChainLaneBar';
import ComingSoonBanner from './ComingSoonBanner';
import SquareLoopPanel from './SquareLoopPanel';
import { useSquareLoop } from '../hooks/useSquareLoop';

type Props = {
  setCurrentPath: (path: string, state?: { buy?: string | null; stall?: string | null }) => void;
};

function LaunchpadCard({ pad }: { pad: BuildLaunchpad }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-ink/60 p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xl font-bold">{pad.name}</h3>
        <span className="rounded-full border border-[#CCFF00]/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#CCFF00]">
          {pad.role}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-steel">{pad.model}</p>
      <a
        href={pad.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[#CCFF00]"
      >
        Open {pad.name} <ExternalLink className="h-3 w-3" />
      </a>
    </article>
  );
}

async function watchBuildToken(address: `0x${string}`): Promise<string | null> {
  const eth = (window as Window & {
    ethereum?: {
      request: (args: { method: string; params?: unknown }) => Promise<unknown>;
    };
  }).ethereum;
  if (!eth) return 'Connect MetaMask, Rabby, or Robinhood Wallet on Hood 4663.';
  try {
    await eth.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address,
          symbol: BUILD_TOKEN_SYMBOL,
          decimals: BUILD_TOKEN_DECIMALS,
        },
      },
    });
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : 'Wallet rejected the token';
  }
}

export default function BuildTokenView({ setCurrentPath }: Props) {
  const loop = useSquareLoop(null);
  const token = loop.status.token;
  const lock = loop.status.lock;
  const contracts = loop.status.contracts;
  const [watchError, setWatchError] = useState<string | null>(null);

  return (
    <div className="hood-lane-page mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
      <ChainLaneBar active="hood" setCurrentPath={setCurrentPath} />

      <ComingSoonBanner
        title={
          token.status === 'live'
            ? 'Address is live. Lock is not.'
            : "We're still working on this"
        }
        detail={
          token.status === 'live'
            ? 'Bankr Doppler mint on Hood 4663. Verify the clone on Blockscout. No LP lock, no DexScreener pair, no APR. Trade outbound on Bankr — we do not swap this here.'
            : `$BUILD is not live on Robinhood Chain ${HOOD_CHAIN_ID} yet. No address, no lock, no APR.`
        }
      />

      <div className="mt-4 overflow-hidden rounded-[2rem] border border-[#CCFF00]/40 bg-ink p-6 sm:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#CCFF00]">
          <Radio className="mr-1.5 inline h-3 w-3" />
          Hood token · {BUILD_TOKEN_SYMBOL}
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold sm:text-6xl">{BUILD_TOKEN_NAME}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel sm:text-base">
          Coordination token for Builders DEX on chain {HOOD_CHAIN_ID}. It is not $CCFF00 and not a
          wrap of the Square. It launched through Bankr as a Doppler ERC-20 clone. Utility (fee
          share to parked Square TBAs, stall rights, governance) stays off until a lock and splitter
          volume exist. Pair is unindexed — do not invent BUILD/USDG.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-mono text-[10px] uppercase text-steel">Status</p>
            <p className="mt-1 font-display text-2xl font-bold">{token.status}</p>
            <p className="mt-1 font-mono text-[10px] text-steel">
              {token.origin === 'bankr-doppler' ? 'Bankr Doppler' : 'Unpublished'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-mono text-[10px] uppercase text-steel">Address</p>
            {token.address ? (
              <a
                href={explorerToken(token.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block break-all font-mono text-xs text-[#CCFF00]"
              >
                {token.address}
              </a>
            ) : (
              <p className="mt-1 font-mono text-xs text-steel">Unpublished</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-mono text-[10px] uppercase text-steel">LP lock</p>
            {lock.published ? (
              <a
                href={lock.url || (lock.tx ? explorerTx(lock.tx) : '#')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block break-all font-mono text-xs text-[#CCFF00]"
              >
                {lock.tx || lock.url}
              </a>
            ) : (
              <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-steel">
                <Lock className="h-3 w-3" /> Not published
              </p>
            )}
          </div>
        </div>

        {token.address && (
          <div className="mt-6 flex flex-wrap gap-2">
            {token.bankrTradeUrl && (
              <a
                href={token.bankrTradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hood-cta-fill inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-xs font-bold"
              >
                Trade on Bankr <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {token.bankrTokenUrl && (
              <a
                href={token.bankrTokenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hood-cta inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-xs font-semibold"
              >
                Bankr token page <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {token.dexscreenerUrl && (
              <a
                href={token.dexscreenerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hood-cta inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-xs font-semibold"
              >
                DexScreener <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <a
              href={explorerAddress(token.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="hood-cta inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-xs font-semibold"
            >
              Blockscout <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={() => {
                void watchBuildToken(token.address as `0x${string}`).then(setWatchError);
              }}
              className="hood-cta inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-xs font-semibold"
            >
              <Wallet className="h-3 w-3" /> Add to EVM wallet
            </button>
          </div>
        )}
        {watchError && (
          <p className="mt-3 font-mono text-[11px] text-amber-200">{watchError}</p>
        )}
        {token.deployTx && (
          <p className="mt-4 font-mono text-[10px] text-steel">
            Deploy{' '}
            <a
              href={explorerTx(token.deployTx)}
              target="_blank"
              rel="noreferrer"
              className="text-[#CCFF00]"
            >
              {token.deployTx.slice(0, 10)}…
            </a>
            {token.implementation ? ` · ${token.implementation}` : ''} · chain {HOOD_CHAIN_ID_HEX}
          </p>
        )}
      </div>

      <section className="mt-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#CCFF00]">Launchpad</p>
        <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">
          Bankr launched it. We do not swap it.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-steel">
          Best integration is a published receipt plus outbound trade. We will not embed Bankr, run
          x402, invent a lock, or list this on the Solana Trade tab. Pools.trade and Clanker were
          the earlier doors — unused for this mint.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {BUILD_LAUNCHPADS.map((pad) => (
            <LaunchpadCard key={pad.id} pad={pad} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#CCFF00]">
          Overlay contracts
        </p>
        <h2 className="font-display mt-2 text-2xl font-bold">Registry, vault, splitter</h2>
        <p className="mt-3 max-w-2xl text-sm text-steel">
          These read CCFF00 ownerOf and the TBA. They never wrap the Square. Registry, stall
          vault, and splitter are live on 4663. $BUILD now has an address — fee dust stays 0 until
          volume hits the splitter. DAO $BUILD stake stays a labeled simulation.
        </p>
        <ul className="mt-4 space-y-2 font-mono text-xs text-steel">
          <li>
            ActivationRegistry{' '}
            {contracts.activationRegistry ? (
              <a href={explorerAddress(contracts.activationRegistry)} className="text-[#CCFF00]">
                {contracts.activationRegistry}
              </a>
            ) : (
              'unpublished'
            )}
          </li>
          <li>
            StallVault{' '}
            {contracts.stallVault ? (
              <a href={explorerAddress(contracts.stallVault)} className="text-[#CCFF00]">
                {contracts.stallVault}
              </a>
            ) : (
              'unpublished'
            )}
          </li>
          <li>
            FeeSplitter{' '}
            {contracts.feeSplitter ? (
              <a href={explorerAddress(contracts.feeSplitter)} className="text-[#CCFF00]">
                {contracts.feeSplitter}
              </a>
            ) : (
              'unpublished'
            )}
          </li>
        </ul>
      </section>

      <div className="mt-10">
        <SquareLoopPanel setCurrentPath={setCurrentPath} compact />
      </div>

      <p className="mt-8 font-mono text-[10px] leading-relaxed text-steel">
        {BUILD_DISCLAIMER} {HOOD_DISCLAIMER}
      </p>
    </div>
  );
}
