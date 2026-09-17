import { useEffect, useState } from 'react';
import { Loader2, Scroll } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useShareRaises } from '../hooks/useShareRaises';
import {
  buildClaimIx,
  claimableLamports,
  connectionForRaiseCluster,
  deriveCertificatePda,
  fetchOnchainCertificate,
  fetchOnchainRaise,
  sendRaiseTx,
} from '../lib/shareRaiseOnchain';

export default function ShareCertificatesCard() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { raises } = useShareRaises();
  const [rows, setRows] = useState<
    { raiseId: string; name: string; serial: number; pda: string; claimable: number; raisePda: string }[]
  >([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setRows([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
      const found: typeof rows = [];
      for (const raise of raises) {
        if (!raise.raisePda) continue;
        const clusterConnection = connectionForRaiseCluster(raise.cluster, connection);
        const raiseKey = new PublicKey(raise.raisePda);
        const onchain = await fetchOnchainRaise(clusterConnection, raiseKey);
        const minted = onchain?.sharesMinted ?? raise.sharesMinted;
        const acc = onchain?.accPerShare ?? 0n;
        for (let serial = 0; serial < minted; serial += 1) {
          const [pda] = deriveCertificatePda(raiseKey, serial);
          const cert = await fetchOnchainCertificate(clusterConnection, pda);
          if (!cert || !cert.owner.equals(publicKey)) continue;
          found.push({
            raiseId: raise.id,
            name: raise.projectId,
            serial,
            pda: pda.toBase58(),
            claimable: claimableLamports(acc, cert.lastAcc),
            raisePda: raise.raisePda,
          });
        }
      }
      if (!cancelled) setRows(found);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [publicKey, raises, connection]);

  const claim = async (row: (typeof rows)[number]) => {
    if (!publicKey || !signTransaction) return;
    setBusy(row.pda);
    try {
      const raise = raises.find((item) => item.raisePda === row.raisePda);
      const clusterConnection = connectionForRaiseCluster(raise?.cluster, connection);
      const ix = buildClaimIx({
        raise: new PublicKey(row.raisePda),
        certificate: new PublicKey(row.pda),
        owner: publicKey,
      });
      await sendRaiseTx(clusterConnection, publicKey, signTransaction, ix, [], sendTransaction);
    } finally {
      setBusy(null);
    }
  };

  if (!publicKey) return null;

  return (
    <section className="pulse-card mt-6 rounded-3xl border border-white/10 bg-surface p-5 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        <Scroll className="mb-1 inline h-3.5 w-3.5" /> Share certificates
      </p>
      <h2 className="font-display mt-1 text-xl font-bold">Your claim receipts</h2>
      <p className="mt-1 text-xs text-steel">
        Claim deposited wins for certificates you hold. Nothing is sent without your signature.
      </p>
      {rows.length === 0 ? (
        <p className="mt-4 text-xs text-steel">No certificates on this wallet yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((row) => (
            <li
              key={row.pda}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-ink/40 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-semibold">
                  {row.name} #{String(row.serial + 1).padStart(3, '0')}
                </p>
                <p className="font-mono text-[10px] text-steel">
                  claimable {(row.claimable / 1e9).toFixed(4)} SOL
                </p>
              </div>
              <button
                type="button"
                disabled={row.claimable <= 0 || busy === row.pda}
                onClick={() => void claim(row)}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-40"
              >
                {busy === row.pda && <Loader2 className="h-3 w-3 animate-spin" />}
                Claim
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
