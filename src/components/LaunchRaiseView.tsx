import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, ShieldAlert, Stamp } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Project, UserWallet } from '../types';
import ProofOfBuildingCard from './ProofOfBuildingCard';
import LiveScoreCitationsCard from './LiveScoreCitationsCard';
import ScoreBars, { BuilderScoreBadge, CurationBadges } from './ScoreBars';
import { ReputationChipBadge } from './ReputationUnlocksCard';
import { proofOfBuildingFor } from '../lib/proofOfBuilding';
import { BUILDER_SCORE_UNLOCK, builderUnlockLabels, builderAccessFromScore, reputationChipFor } from '../lib/reputationRules';
import { useLiveBuilderScore } from '../hooks/useLiveBuilderScore';
import type { BuilderScore } from '../types';
import { useShareRaise } from '../hooks/useShareRaises';
import {
  RAISE_MAINNET_MINT,
  buildMintShareIx,
  connectionForRaiseCluster,
  deriveRaisePda,
  fetchConfigTreasury,
  fetchOnchainRaise,
  formatRaiseTxError,
  raiseExplorerTx,
  sendRaiseTx,
} from '../lib/shareRaiseOnchain';
import { buildShareNftIxs } from '../lib/shareNft';
import { useNetwork } from '../providers/NetworkProvider';
import { seedFromHex } from '../lib/projectSeed';

interface LaunchRaiseViewProps {
  raiseId: string | null;
  project: Project | undefined;
  wallet: UserWallet;
  connectWallet: () => void;
  onBack: () => void;
  setCurrentPath: (path: string) => void;
}

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

function solLabel(lamports: number): string {
  return `${(lamports / 1e9).toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`;
}

export default function LaunchRaiseView({
  raiseId,
  project,
  wallet,
  connectWallet,
  onBack,
  setCurrentPath,
}: LaunchRaiseViewProps) {
  const { raise, loading: raiseLoading } = useShareRaise(raiseId);
  const liveState = useLiveBuilderScore(project?.id || '', project?.builderScore || EMPTY_SCORE);
  const score = liveState.score;
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction, connected } = useWallet();
  const { network } = useNetwork();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [nftSig, setNftSig] = useState<string | null>(null);
  const [onchainMinted, setOnchainMinted] = useState<number | null>(null);

  const mintConnection = useMemo(
    () => connectionForRaiseCluster(raise?.cluster, connection),
    [raise?.cluster, connection],
  );

  const proof = project ? proofOfBuildingFor(project) : null;
  const chip = project && proof ? reputationChipFor(project, proof) : null;
  const access = builderAccessFromScore(score?.overall || 0);
  const unlocks = builderUnlockLabels(access);

  useEffect(() => {
    if (!raise?.raisePda) {
      setOnchainMinted(null);
      return;
    }
    let cancelled = false;
    void fetchOnchainRaise(mintConnection, new PublicKey(raise.raisePda)).then((live) => {
      if (!cancelled && live) setOnchainMinted(live.sharesMinted);
    });
    return () => {
      cancelled = true;
    };
  }, [raise?.raisePda, mintConnection, sig]);

  const mintable = useMemo(() => {
    if (!raise) return { ok: false, reason: 'Raise not found' };
    if (raise.demo && !raise.raisePda) {
      return { ok: false, reason: 'Demo listing — on-chain mint after Devnet deploy + attestation' };
    }
    if (!raise.raisePda) {
      return { ok: false, reason: 'Raise PDA missing' };
    }
    if (raise.status !== 'live') {
      return { ok: false, reason: `Raise is ${raise.status} — mint closed or not opened` };
    }
    if (!raise.inspection.pobVerified || raise.inspection.builderScore < BUILDER_SCORE_UNLOCK) {
      return { ok: false, reason: 'Inspection gate closed' };
    }
    if (chip?.tone === 'risk') return { ok: false, reason: 'Proof of Building™ is at risk' };
    if (raise.cluster !== 'devnet' && network === 'mainnet' && !RAISE_MAINNET_MINT) {
      return { ok: false, reason: 'Mainnet share mint is gated until the Devnet canary' };
    }
    if ((onchainMinted ?? raise.sharesMinted) >= raise.shareSupply) {
      return { ok: false, reason: 'Sold out' };
    }
    return { ok: true, reason: '' };
  }, [raise, chip, network, onchainMinted]);

  const mint = async () => {
    if (!raise || !signTransaction || !publicKey) {
      connectWallet();
      return;
    }
    if (!mintable.ok) {
      setError(mintable.reason);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const founder = new PublicKey(raise.founderWallet);
      const seed = seedFromHex(raise.projectSeedHex);
      const [pda] = deriveRaisePda(founder, seed);
      const raiseKey = raise.raisePda ? new PublicKey(raise.raisePda) : pda;
      const onchain = await fetchOnchainRaise(mintConnection, raiseKey);
      if (!onchain) throw new Error('Raise account not on Devnet yet');
      const treasury = await fetchConfigTreasury(mintConnection);
      if (!treasury) throw new Error('Raise config missing — program not initialized');
      const ix = buildMintShareIx({
        raise: raiseKey,
        buyer: publicKey,
        founder,
        treasury,
        serial: onchain.sharesMinted,
      });
      const signature = await sendRaiseTx(
        mintConnection,
        publicKey,
        signTransaction,
        ix,
        [],
        sendTransaction,
      );
      setSig(signature);
      setOnchainMinted(onchain.sharesMinted + 1);
      try {
        const nft = await buildShareNftIxs({
          connection: mintConnection,
          payer: publicKey,
          raiseId: raise.id,
          projectName: project?.name || raise.projectId,
          ticker: project?.ticker || 'SHARE',
          serial: onchain.sharesMinted,
        });
        const metadataSig = await sendRaiseTx(
          mintConnection,
          publicKey,
          signTransaction,
          nft.ixs,
          [nft.mint],
          sendTransaction,
        );
        setNftSig(metadataSig);
      } catch (nftErr) {
        setError(
          `Share minted; wallet NFT failed: ${formatRaiseTxError(nftErr)}`,
        );
      }
    } catch (err) {
      setError(formatRaiseTxError(err));
    } finally {
      setBusy(false);
    }
  };

  if (raiseLoading) {
    return (
      <div className="flex justify-center py-20 text-steel">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!raise) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-steel">
        <p>Raise not found.</p>
        <button type="button" onClick={onBack} className="mt-4 text-accent">
          Back to Accelerator
        </button>
      </div>
    );
  }

  const nextSerial = (onchainMinted ?? raise.sharesMinted) + 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-steel hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Accelerator
      </button>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="share-cert-card overflow-hidden p-6 sm:p-8">
          <div className="share-cert-foil" />
          <p className="relative font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
            Share certificate
          </p>
          <h1 className="font-display relative mt-2 text-3xl font-bold">
            {project?.name || raise.projectId}
          </h1>
          <p className="relative mt-1 font-mono text-xs text-steel">
            #{String(nextSerial).padStart(3, '0')} / {raise.shareSupply} ·{' '}
            {(raise.holderPoolBps / 100).toFixed(1)}% holder pool of deposited wins
          </p>

          <div className="relative mt-6 grid grid-cols-2 gap-3 font-mono text-[11px]">
            <div className="rounded-2xl border border-white/10 bg-ink/50 p-3">
              <p className="text-steel">Price</p>
              <p className="mt-1 text-lg text-white">{solLabel(raise.priceLamports)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink/50 p-3">
              <p className="text-steel">Founder retained</p>
              <p className="mt-1 text-lg text-white">{(raise.founderRetainedBps / 100).toFixed(0)}%</p>
            </div>
          </div>

          <p className="relative mt-5 text-xs leading-relaxed text-steel">
            This NFT is an on-chain claim receipt on proceeds the founder deposits into the raise
            vault. It is not equity in a legal entity and not a promise of future profit. A win is
            money that actually lands on-chain.
          </p>

          {raise.inspection.pobVerified && raise.inspection.builderScore >= BUILDER_SCORE_UNLOCK ? (
            <p className="relative mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] text-accent">
              <Stamp className="h-3 w-3" /> Inspected · score {raise.inspection.builderScore}
            </p>
          ) : (
            <p className="relative mt-4 inline-flex items-center gap-1.5 text-xs text-amber-200/90">
              <ShieldAlert className="h-3.5 w-3.5" /> Waiting on full Builders DEX inspection
            </p>
          )}

          <div className="relative mt-6">
            {!connected ? (
              <button
                type="button"
                onClick={connectWallet}
                className="w-full rounded-2xl bg-accent py-3 text-sm font-bold text-ink"
              >
                Connect wallet
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || !mintable.ok}
                onClick={() => void mint()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Mint certificate #{String(nextSerial).padStart(3, '0')}
              </button>
            )}
            {!mintable.ok && (
              <p className="mt-2 text-xs text-steel">{mintable.reason}</p>
            )}
            {raise.cluster === 'devnet' && (
              <p className="mt-2 text-xs text-accent/80">
                Mints on Solana Devnet (0.05 SOL + rent). Phantom will be asked to sign a Devnet
                transaction — you need Devnet SOL in the connected wallet.
              </p>
            )}
            {error && <p className="mt-2 text-xs text-amber-200/90">{error}</p>}
            {sig && (
              <a
                href={raiseExplorerTx(sig, raise.cluster)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block break-all font-mono text-[10px] text-accent"
              >
                Share {sig}
              </a>
            )}
            {nftSig && (
              <a
                href={raiseExplorerTx(nftSig, raise.cluster)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block break-all font-mono text-[10px] text-accent"
              >
                NFT {nftSig}
              </a>
            )}
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
                {chip && <ReputationChipBadge chip={chip} />}
              </div>
              <ScoreBars score={score} />
              {proof && <ProofOfBuildingCard proof={proof} />}
              <LiveScoreCitationsCard
                live={liveState.live}
                loading={liveState.loading}
                mode={liveState.mode}
                overall={score.overall}
              />
              <div className="rounded-2xl border border-white/10 bg-surface p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                  Accelerator unlocks
                </p>
                <ul className="mt-2 space-y-1 text-xs text-steel">
                  {unlocks.map((u) => (
                    <li key={u.label}>
                      {u.unlocked ? '●' : '○'} {u.label}
                    </li>
                  ))}
                </ul>
              </div>
              {project.aiAnalysis && (
                <div className="rounded-2xl border border-white/10 bg-surface p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    AI inspection
                  </p>
                  <p className="mt-2 text-sm text-steel">{project.aiAnalysis.summary}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setCurrentPath('project-detail')}
                className="text-xs font-semibold text-accent"
              >
                Full builder story →
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
