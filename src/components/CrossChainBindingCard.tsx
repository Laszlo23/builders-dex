import { Copy, ExternalLink, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AURA_BASE_DECIMALS,
  AURA_BASE_SUPPLY,
  AURA_USDC_V3_POOL,
  BASE_SOLANA_BRIDGE_DOCS,
  basescanTokenUrl,
  bindingForProject,
  dexScreenerTokenUrl,
  PASSPORT_COLLECTION,
  uniswapBaseSwapUrl,
  watchAuraOnBase,
} from '../data/crossChainRegistry';

type Props = {
  projectId: string;
  projectName: string;
};

type PairQuote = {
  priceUsd: string;
  liquidityUsd: number;
  pairUrl: string;
};

export default function CrossChainBindingCard({ projectId, projectName }: Props) {
  const binding = bindingForProject(projectId);
  const [copied, setCopied] = useState(false);
  const [watchError, setWatchError] = useState<string | null>(null);
  const [quote, setQuote] = useState<PairQuote | null>(null);

  const baseAddress = binding?.baseAddress;
  const swapUrl = baseAddress ? uniswapBaseSwapUrl(baseAddress) : null;
  const chartUrl = baseAddress
    ? `https://dexscreener.com/base/${AURA_USDC_V3_POOL.toLowerCase()}`
    : null;

  useEffect(() => {
    if (!baseAddress) return;
    let cancelled = false;
    fetch(`https://api.dexscreener.com/latest/dex/tokens/${baseAddress}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { pairs?: Array<{ chainId: string; priceUsd?: string; liquidity?: { usd?: number }; url?: string; pairAddress?: string }> } | null) => {
        if (cancelled || !data?.pairs?.length) return;
        const preferred =
          data.pairs.find(
            (p) => p.chainId === 'base' && p.pairAddress?.toLowerCase() === AURA_USDC_V3_POOL.toLowerCase(),
          ) || data.pairs.find((p) => p.chainId === 'base');
        if (!preferred?.priceUsd) return;
        setQuote({
          priceUsd: preferred.priceUsd,
          liquidityUsd: preferred.liquidity?.usd ?? 0,
          pairUrl: preferred.url || `https://dexscreener.com/base/${AURA_USDC_V3_POOL.toLowerCase()}`,
        });
      })
      .catch(() => {
        /* public quote is optional */
      });
    return () => {
      cancelled = true;
    };
  }, [baseAddress]);

  if (!binding) return null;

  const copyAddress = async () => {
    if (!baseAddress) return;
    try {
      await navigator.clipboard.writeText(baseAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const addToWallet = async () => {
    setWatchError(null);
    const err = await watchAuraOnBase();
    setWatchError(err);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-surface p-5 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
        Live on Base
      </p>
      <h3 className="font-display mt-2 text-lg font-bold text-white">
        {binding.symbol} Token · {projectName}
      </h3>
      <p className="mt-2 text-sm text-steel">
        Canonical {binding.symbol} is the Base ERC-20 ({AURA_BASE_SUPPLY.toLocaleString()} supply,{' '}
        {AURA_BASE_DECIMALS} decimals). Trade USDC → {binding.symbol} on Uniswap. Builder Passport
        stays on Solana ({PASSPORT_COLLECTION.name}). Jupiter stays off until a confirmed Solana wrap
        exists.
      </p>
      {quote && (
        <p className="mt-3 font-mono text-[11px] text-accent">
          ${Number(quote.priceUsd).toPrecision(3)} · Uni v3 AURA/USDC · $
          {Math.round(quote.liquidityUsd).toLocaleString()} liquidity
        </p>
      )}
      <dl className="mt-4 grid gap-2 font-mono text-[11px] text-steel">
        <div>
          <dt className="text-white/50">Base ERC-20</dt>
          <dd className="mt-0.5 flex flex-wrap items-center gap-2 break-all text-white">
            <span>{baseAddress}</span>
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-steel hover:border-accent/40 hover:text-accent"
            >
              <Copy className="h-3 w-3" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </dd>
        </div>
        <div>
          <dt className="text-white/50">Solana wrapped mint</dt>
          <dd className="mt-0.5 break-all text-white">
            {binding.solanaMint || 'Not bridged yet · TRADEABLE_AURA stays off'}
          </dd>
        </div>
        <div>
          <dt className="text-white/50">Passport collection</dt>
          <dd className="mt-0.5 break-all text-white">
            {PASSPORT_COLLECTION.collectionMint ||
              'Optional Metaplex Core — set VITE_PASSPORT_COLLECTION_MINT'}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {swapUrl && (
          <a
            href={swapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-ink hover:bg-accent-bright"
          >
            Trade on Uniswap <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {chartUrl && (
          <a
            href={quote?.pairUrl || chartUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5 text-xs text-accent"
          >
            Chart <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {baseAddress && (
          <a
            href={basescanTokenUrl(baseAddress)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent/40"
          >
            Basescan <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {baseAddress && (
          <a
            href={dexScreenerTokenUrl(baseAddress)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent/40"
          >
            All pools <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <button
          type="button"
          onClick={() => void addToWallet()}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent/40"
        >
          <Wallet className="h-3 w-3" />
          Add to wallet
        </button>
        <a
          href={BASE_SOLANA_BRIDGE_DOCS}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white hover:border-accent/40"
        >
          Bridge docs <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {watchError && <p className="mt-3 text-xs text-amber-300">{watchError}</p>}
    </section>
  );
}
