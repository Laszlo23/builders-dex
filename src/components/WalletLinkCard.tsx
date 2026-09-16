import { ExternalLink, Link2, Unlink } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

type LinkState = {
  solanaWallet: string;
  baseWallet: string;
  solSig: string | null;
  baseSig: string | null;
} | null;

export default function WalletLinkCard() {
  const { publicKey, signMessage, connected } = useWallet();
  const [baseWallet, setBaseWallet] = useState('');
  const [link, setLink] = useState<LinkState>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sol = publicKey?.toBase58();

  const refresh = useCallback(async () => {
    if (!sol) {
      setLink(null);
      return;
    }
    try {
      const res = await fetch(`/api/wallet-link/${sol}`);
      if (res.status === 404) {
        setLink(null);
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLink(data.link);
      setBaseWallet(data.link?.baseWallet || '');
    } catch {
      setLink(null);
    }
  }, [sol]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const bind = async () => {
    if (!sol || !signMessage) {
      setError('Connect a Solana wallet that supports signMessage');
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(baseWallet.trim())) {
      setError('Enter a valid Base 0x address');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const msg = `Builders DEX link Base wallet\nSolana: ${sol}\nBase: ${baseWallet.trim()}\nAction: bind`;
      const sigBytes = await signMessage(new TextEncoder().encode(msg));
      const solSig = bs58.encode(sigBytes);
      const res = await fetch('/api/wallet-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          solanaWallet: sol,
          baseWallet: baseWallet.trim(),
          solSig,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Link failed');
      setLink(data.link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Link failed');
    } finally {
      setBusy(false);
    }
  };

  const unbind = async () => {
    if (!sol || !signMessage) {
      setError('Connect a Solana wallet that supports signMessage');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const msg = `Builders DEX unlink Base wallet\nSolana: ${sol}\nAction: unbind`;
      const sigBytes = await signMessage(new TextEncoder().encode(msg));
      const solSig = bs58.encode(sigBytes);
      const res = await fetch(`/api/wallet-link/${sol}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ solSig }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Unlink failed');
      }
      setLink(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unlink failed');
    } finally {
      setBusy(false);
    }
  };

  if (!connected) return null;

  return (
    <section className="pulse-card mt-6 rounded-3xl border border-white/10 bg-surface p-5 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        <Link2 className="mb-1 inline h-3.5 w-3.5" /> Cross-chain wallet link
      </p>
      <h2 className="font-display mt-1 text-xl font-bold">Bind Base for AURA</h2>
      <p className="mt-1 max-w-lg text-xs text-steel">
        Solana Passport stays primary. Dual-sign link maps your Base address for Aura OS utilities and
        bridge UX — not a wrapped NFT bridge.
      </p>
      {link ? (
        <div className="mt-4 space-y-2 font-mono text-[11px] text-steel">
          <p>
            Base:{' '}
            <span className="break-all text-white">{link.baseWallet}</span>
          </p>
          <button
            type="button"
            onClick={() => void unbind()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white"
          >
            <Unlink className="h-3 w-3" /> Unlink
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={baseWallet}
            onChange={(e) => setBaseWallet(e.target.value)}
            placeholder="0x… Base address"
            className="min-w-[220px] flex-1 rounded-xl border border-white/12 bg-ink/80 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={() => void bind()}
            disabled={busy}
            className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink disabled:opacity-60"
          >
            {busy ? 'Signing…' : 'Sign & link'}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
      <p className="mt-3 text-[11px] text-steel">
        Linked wallets can hold Aura OS AURA on Base after you trade it on Uniswap.
      </p>
      <a
        href="https://docs.base.org/base-chain/network-information/base-solana-bridge"
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-[11px] text-accent"
      >
        Base↔Solana Bridge docs <ExternalLink className="h-3 w-3" />
      </a>
    </section>
  );
}
