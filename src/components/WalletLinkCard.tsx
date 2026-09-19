import { ExternalLink, Link2, Unlink, Wallet } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { addHoodToWallet, HOOD_DOCS_URL } from '../data/hoodChain';
import { BASE_SOLANA_BRIDGE_DOCS } from '../data/crossChainRegistry';

type LinkState = {
  solanaWallet: string;
  evmWallet?: string;
  baseWallet: string;
  solSig: string | null;
  evmSig?: string | null;
  baseSig: string | null;
} | null;

type InjectedEth = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
};

function injectedEth(): InjectedEth | null {
  if (typeof window === 'undefined') return null;
  return (window as Window & { ethereum?: InjectedEth }).ethereum ?? null;
}

export default function WalletLinkCard() {
  const { publicKey, signMessage, connected } = useWallet();
  const [evmWallet, setEvmWallet] = useState('');
  const [link, setLink] = useState<LinkState>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

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
      setEvmWallet(data.link?.evmWallet || data.link?.baseWallet || '');
    } catch {
      setLink(null);
    }
  }, [sol]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const pickInjected = async () => {
    const eth = injectedEth();
    if (!eth) {
      setError('No injected EVM wallet. Paste the same 0x you use on Base and Hood.');
      return;
    }
    try {
      const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[];
      const addr = accounts?.[0];
      if (addr) setEvmWallet(addr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wallet rejected');
    }
  };

  const optionalEvmSig = async (solanaWallet: string, evm: string): Promise<string | undefined> => {
    const eth = injectedEth();
    if (!eth) return undefined;
    try {
      const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[];
      const from = accounts?.[0];
      if (!from || from.toLowerCase() !== evm.toLowerCase()) return undefined;
      const msg = `Builders DEX link Solana wallet\nEVM: ${evm}\nSolana: ${solanaWallet}\nAction: bind`;
      const sig = await eth.request({ method: 'personal_sign', params: [msg, from] });
      return typeof sig === 'string' ? sig : undefined;
    } catch {
      return undefined;
    }
  };

  const bind = async () => {
    if (!sol || !signMessage) {
      setError('Connect a Solana wallet that supports signMessage');
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(evmWallet.trim())) {
      setError('Enter a valid EVM 0x address (same key on Base and Hood)');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const evm = evmWallet.trim();
      const msg = `Builders DEX link EVM wallet\nSolana: ${sol}\nEVM: ${evm}\nAction: bind`;
      const sigBytes = await signMessage(new TextEncoder().encode(msg));
      const solSig = bs58.encode(sigBytes);
      const evmSig = await optionalEvmSig(sol, evm);
      const res = await fetch('/api/wallet-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          solanaWallet: sol,
          evmWallet: evm,
          baseWallet: evm,
          solSig,
          evmSig,
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
      const msg = `Builders DEX unlink EVM wallet\nSolana: ${sol}\nAction: unbind`;
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

  const linked = link?.evmWallet || link?.baseWallet;

  return (
    <section className="pulse-card mt-6 rounded-3xl border border-white/10 bg-surface p-5 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        <Link2 className="mb-1 inline h-3.5 w-3.5" /> Cross-chain wallet link
      </p>
      <h2 className="font-display mt-1 text-xl font-bold">Bind EVM for Base + Hood</h2>
      <p className="mt-1 max-w-lg text-xs text-steel">
        Solana Passport stays primary. One 0x address is the same account on Base and Robinhood
        Chain. Dual-sign maps it for AURA utilities and Hood mint UX — not a wrapped NFT bridge.
      </p>
      {linked ? (
        <div className="mt-4 space-y-2 font-mono text-[11px] text-steel">
          <p>
            EVM:{' '}
            <span className="break-all text-white">{linked}</span>
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
            value={evmWallet}
            onChange={(e) => setEvmWallet(e.target.value)}
            placeholder="0x… EVM address (Base / Hood)"
            className="min-w-[220px] flex-1 rounded-xl border border-white/12 bg-ink/80 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={() => void pickInjected()}
            className="rounded-full border border-white/15 px-3 py-2 text-xs text-white"
          >
            Use injected
          </button>
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
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setAddError(null);
            void addHoodToWallet().then(setAddError);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white"
        >
          <Wallet className="h-3 w-3" />
          Add Hood (4663)
        </button>
      </div>
      {addError && <p className="mt-2 text-xs text-amber-200/90">{addError}</p>}
      <p className="mt-3 text-[11px] text-steel">
        Linked wallets can hold Aura OS AURA on Base and mint HoodStreet / CCFF00 on Hood after you
        fund ETH for gas. Passport and share certificates stay on Solana.
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <a
          href={BASE_SOLANA_BRIDGE_DOCS}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-accent"
        >
          Base↔Solana Bridge docs <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={HOOD_DOCS_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-accent"
        >
          Hood bridging docs <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}
