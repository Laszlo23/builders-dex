import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Stamp, Wallet } from 'lucide-react';
import type { Project } from '../types';
import ProofOfBuildingCard from './ProofOfBuildingCard';
import LiveScoreCitationsCard from './LiveScoreCitationsCard';
import ScoreBars, { BuilderScoreBadge, CurationBadges } from './ScoreBars';
import { proofOfBuildingFor } from '../lib/proofOfBuilding';
import { BUILDER_SCORE_UNLOCK } from '../lib/reputationRules';
import { useLiveBuilderScore } from '../hooks/useLiveBuilderScore';
import type { BuilderScore } from '../types';
import { connectHoodEvm, mintHoodShare, readHoodShareSupply } from '../lib/hoodShareMint';
import {
  HOOD_SHARE_ADDRESS,
  HOOD_SHARE_HOLDER_POOL_BPS,
  HOOD_SHARE_MAX_PER_WALLET,
  HOOD_SHARE_SUPPLY,
  formatHoodSharePrice,
  hoodShareExplorer,
  hoodShareTxExplorer,
} from '../data/hoodShare';
import { HOOD_CHAIN_ID, HOOD_DISCLAIMER, addHoodToWallet } from '../data/hoodChain';
import ChainLaneBar from './ChainLaneBar';
import { LIVE_AURA_RAISE_SEED } from '../data/liveShareRaise';

type Props = {
  project: Project | undefined;
  onBack: () => void;
  setCurrentPath: (path: string, state?: { buy?: string | null; stall?: string | null }) => void;
};

const EMPTY_SCORE: BuilderScore = {
  overall: 0,
  development: 0,
  innovation: 0,
  community: 0,
  transparency: 0,
  productProgress: 0,
  builderReputation: 0,
  liquidityHealth: 0,
};

export default function HoodShareView({ project, onBack, setCurrentPath }: Props) {
  const liveState = useLiveBuilderScore(
    project?.id || LIVE_AURA_RAISE_SEED.projectId,
    project?.builderScore || EMPTY_SCORE,
  );
  const score = liveState.score;
  const proof = project ? proofOfBuildingFor(project) : null;
  const [account, setAccount] = useState<string | null>(null);
  const [minted, setMinted] = useState<number>(0);
  const [live, setLive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<string | null>(null);

  const refresh = () => {
    void readHoodShareSupply()
      .then((s) => {
        setMinted(s.minted);
        setLive(s.live);
      })
      .catch(() => {
        /* RPC optional */
      });
  };

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 20_000);
    return () => window.clearInterval(id);
  }, []);

  const nextSerial = minted + 1;
  const soldOut = minted >= HOOD_SHARE_SUPPLY;
  const inspected = LIVE_AURA_RAISE_SEED.builderScore >= BUILDER_SCORE_UNLOCK;
  const deployed = HOOD_SHARE_ADDRESS !== '0x0000000000000000000000000000000000000000';

  const onConnect = async () => {
    setError(null);
    try {
      const addr = await connectHoodEvm();
      setAccount(addr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connect failed');
    }
  };

  const onMint = async () => {
    if (!account) {
      await onConnect();
      return;
    }
    if (!deployed || !live || soldOut || !inspected) return;
    setBusy(true);
    setError(null);
    try {
      const hash = await mintHoodShare();
      setTx(hash);
      window.setTimeout(refresh, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mint failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hood-lane-page mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
      <ChainLaneBar active="hood" setCurrentPath={setCurrentPath} />
      <button
        type="button"
        onClick={onBack}
        className="relative mt-6 inline-flex items-center gap-1.5 text-xs text-steel hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Accelerator
      </button>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="share-cert-card overflow-hidden p-6 sm:p-8">
          <div className="share-cert-foil" />
          <p className="relative font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
            Share certificate · Robinhood Chain {HOOD_CHAIN_ID}
          </p>
          <h1 className="font-display relative mt-2 text-3xl font-bold">
            {project?.name || 'Aura OS'}
          </h1>
          <p className="relative mt-1 font-mono text-xs text-steel">
            #{String(Math.min(nextSerial, HOOD_SHARE_SUPPLY)).padStart(3, '0')} / {HOOD_SHARE_SUPPLY}{' '}
            · {(HOOD_SHARE_HOLDER_POOL_BPS / 100).toFixed(0)}% holder pool · max{' '}
            {HOOD_SHARE_MAX_PER_WALLET}/wallet
          </p>

          <div className="relative mt-6 grid grid-cols-2 gap-3 font-mono text-[11px]">
            <div className="rounded-2xl border border-white/10 bg-ink/50 p-3">
              <p className="text-steel">Price</p>
              <p className="mt-1 text-lg text-white">{formatHoodSharePrice()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink/50 p-3">
              <p className="text-steel">Minted</p>
              <p className="mt-1 text-lg text-white">
                {minted} / {HOOD_SHARE_SUPPLY}
              </p>
            </div>
          </div>

          <p className="relative mt-5 text-xs leading-relaxed text-steel">
            This NFT is an on-chain claim receipt on Robinhood Chain. It is not equity and not a
            promise of profit. Pay ETH on 4663 — same 0x as Base AURA, ERC-721 not the token.
            Solana Devnet stays the program canary.
          </p>

          {inspected ? (
            <p className="relative mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] text-accent">
              <Stamp className="h-3 w-3" /> Inspected · score {LIVE_AURA_RAISE_SEED.builderScore}
            </p>
          ) : (
            <p className="relative mt-4 text-xs text-amber-200/90">Inspection gate closed</p>
          )}

          <div className="relative mt-6">
            {!account ? (
              <button
                type="button"
                onClick={() => void onConnect()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-bold text-ink"
              >
                <Wallet className="h-4 w-4" /> Connect EVM wallet to mint
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || !deployed || !live || soldOut || !inspected}
                onClick={() => void onMint()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {soldOut
                  ? 'Sold out'
                  : !deployed
                    ? 'Waiting for Hood contract'
                    : !live
                      ? 'Mint closed'
                      : `Mint #${String(nextSerial).padStart(3, '0')} · ${formatHoodSharePrice()}`}
              </button>
            )}
            {account && (
              <p className="mt-2 break-all font-mono text-[10px] text-steel">{account}</p>
            )}
            <p className="mt-2 text-xs text-steel">
              Need ETH on Hood for gas + price. Add chain 4663, then approve one wallet prompt.
              Or buy from a CCFF00 Square so the certificate sits in the NFT wallet.
            </p>
            <button
              type="button"
              onClick={() => setCurrentPath('ccff00', { buy: 'p5' })}
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-[#CCFF00]/40 py-3 text-sm font-bold text-[#CCFF00]"
            >
              Mint as Square wallet
            </button>
            <button
              type="button"
              onClick={() => setCurrentPath('ccff00', { buy: 'p5', stall: '1' })}
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl border border-[#CCFF00]/40 py-3 text-sm font-bold text-[#CCFF00]"
            >
              Take Square stall · then mint
            </button>
            {!deployed && (
              <p className="mt-2 text-xs text-amber-200/90">
                Contract address is not on chain 4663 yet. Refresh after deploy.
              </p>
            )}
            <button
              type="button"
              onClick={() => void addHoodToWallet()}
              className="mt-2 text-xs font-semibold text-accent"
            >
              Add Hood to wallet
            </button>
            {error && <p className="mt-2 text-xs text-amber-200/90">{error}</p>}
            {tx && (
              <a
                href={hoodShareTxExplorer(tx)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block break-all font-mono text-[10px] text-accent"
              >
                Minted {tx}
              </a>
            )}
            <a
              href={hoodShareExplorer()}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block font-mono text-[10px] text-steel hover:text-accent"
            >
              Contract {HOOD_SHARE_ADDRESS}
            </a>
          </div>
        </section>

        <aside className="space-y-4">
          {project && score && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <BuilderScoreBadge overall={score.overall} mode={liveState.mode} />
                <CurationBadges
                  status={project.curation.status}
                  builderVerified={project.curation.builderVerified}
                />
              </div>
              <ScoreBars score={score} />
              {proof && <ProofOfBuildingCard proof={proof} />}
              <LiveScoreCitationsCard
                live={liveState.live}
                loading={liveState.loading}
                mode={liveState.mode}
                overall={score.overall}
              />
              <button
                type="button"
                onClick={() => setCurrentPath('project-detail')}
                className="text-xs font-semibold text-accent"
              >
                Full builder story →
              </button>
            </>
          )}
          <p className="font-mono text-[10px] leading-relaxed text-steel">{HOOD_DISCLAIMER}</p>
        </aside>
      </div>
    </div>
  );
}
