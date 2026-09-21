import React from 'react';
import { ExternalLink, Lock, Radio } from 'lucide-react';
import {
  BUILD_LAUNCHPADS,
  BUILD_PAIR_FALLBACK,
  BUILD_PAIR_LABEL,
  BUILD_TOKEN_NAME,
  BUILD_TOKEN_SYMBOL,
  explorerAddress,
  explorerTx,
  type BuildLaunchpad,
} from '../data/buildToken';
import { HOOD_CHAIN_ID, HOOD_DISCLAIMER } from '../data/hoodChain';
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

export default function BuildTokenView({ setCurrentPath }: Props) {
  const loop = useSquareLoop(null);
  const token = loop.status.token;
  const lock = loop.status.lock;
  const contracts = loop.status.contracts;

  return (
    <div className="hood-lane-page mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
      <ChainLaneBar active="hood" setCurrentPath={setCurrentPath} />

      <ComingSoonBanner
        title={token.status === 'live' ? 'Token address published' : "We're still working on this"}
        detail={
          token.status === 'live'
            ? 'Verify the contract on Blockscout before you buy. Lock proof is listed below when we have a tx.'
            : `$BUILD is not live on Robinhood Chain ${HOOD_CHAIN_ID} yet. No address, no lock, no APR. Crowd Launch on Pools.trade is the intended door — not Pons, not a volume bot.`
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
          wrap of the Square. Utility is fee share to parked Square TBAs, stall rights, and later
          governance — after an address is published. Pair {BUILD_PAIR_LABEL} (or {BUILD_PAIR_FALLBACK}{' '}
          if the pad forces ETH).
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-mono text-[10px] uppercase text-steel">Status</p>
            <p className="mt-1 font-display text-2xl font-bold">{token.status}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-mono text-[10px] uppercase text-steel">Address</p>
            {token.address ? (
              <a
                href={explorerAddress(token.address)}
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
      </div>

      <section className="mt-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#CCFF00]">Launchpad</p>
        <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">
          Traction without Pons trash.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-steel">
          Default is a Pools.trade Crowd Launch so LP locks on Uniswap v4. Clanker is the backup if
          we want the creator-fee remainder piped into parked Squares. We will not launch through a
          900-deploys-an-hour mill, a bundler, or a volume bot.
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
          These read CCFF00 ownerOf and the TBA. They never wrap the Square. Addresses stay empty
          until deploy.
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

      <p className="mt-8 font-mono text-[10px] leading-relaxed text-steel">{HOOD_DISCLAIMER}</p>
    </div>
  );
}
