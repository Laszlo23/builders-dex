import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowDownUp,
  Settings,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Wallet,
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import {
  SOL_MINT,
  USDC_MINT,
  filterCuratedTokens,
  getCuratedToken,
  CuratedToken,
} from '../data/curatedTokens';
import { useSwapQuote } from '../hooks/useSwapQuote';
import { useTradeableTokens, isMintTradeable } from '../hooks/useTradeableTokens';
import {
  executeSwap,
  fetchTokenMetadata,
  formatUiAmount,
  fromRawAmount,
  solscanTxUrl,
} from '../lib/jupiter';
import { SwapTransaction } from '../types';
import TradeShareModal from './TradeShareModal';

type SwapStatus = 'idle' | 'quoting' | 'ready' | 'confirming' | 'success' | 'error';

interface SwapViewProps {
  transactions: SwapTransaction[];
  onSwapComplete: (tx: SwapTransaction) => void;
  onTradeShared?: () => void;
  initialOutputMint?: string | null;
}

function TokenLogo({ token, size = 28 }: { token: CuratedToken; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed || !token.logoURI) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-white/5 font-mono text-[10px] font-bold text-accent"
        style={{ width: size, height: size }}
      >
        {token.symbol.slice(0, 2)}
      </div>
    );
  }
  return (
    <img
      src={token.logoURI}
      alt={token.symbol}
      width={size}
      height={size}
      className="rounded-full bg-white/5"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function pickDefaultPair(
  tokens: CuratedToken[],
  preferredOut?: string | null
): { input: string; output: string } {
  const mints = new Set(tokens.map((t) => t.mint));
  const sol = mints.has(SOL_MINT) ? SOL_MINT : tokens[0]?.mint;
  const usdc = mints.has(USDC_MINT) ? USDC_MINT : tokens.find((t) => t.mint !== sol)?.mint;
  const out =
    preferredOut && mints.has(preferredOut)
      ? preferredOut
      : usdc || tokens[1]?.mint || tokens[0]?.mint;
  const input =
    out === sol
      ? usdc || tokens.find((t) => t.mint !== out)?.mint || sol
      : sol || tokens.find((t) => t.mint !== out)?.mint;
  return { input: input || SOL_MINT, output: out || USDC_MINT };
}

export default function SwapView({
  transactions,
  onSwapComplete,
  onTradeShared,
  initialOutputMint,
}: SwapViewProps) {
  const { publicKey, connected, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const {
    tokens: tradeableTokens,
    mintSet,
    loading: tokensLoading,
    error: tokensError,
  } = useTradeableTokens();

  const defaults = pickDefaultPair(tradeableTokens, initialOutputMint);
  const [inputMint, setInputMint] = useState(defaults.input);
  const [outputMint, setOutputMint] = useState(defaults.output);
  const [fromAmount, setFromAmount] = useState('');
  const [slippageMode, setSlippageMode] = useState<'auto' | 'manual'>('auto');
  const [slippageBps, setSlippageBps] = useState(50);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pickerSide, setPickerSide] = useState<'from' | 'to' | null>(null);
  const [tokenQuery, setTokenQuery] = useState('');
  const [usdPrices, setUsdPrices] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<SwapStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [shareTrade, setShareTrade] = useState<{
    fromToken: string;
    toToken: string;
    fromAmount: number;
    toAmount: number;
    signature?: string;
  } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [pairReady, setPairReady] = useState(false);
  const [solanaHealth, setSolanaHealth] = useState<{
    jupiterConfigured: boolean;
    curatedMints: number;
    tradeable: string[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSolanaHealth({
          jupiterConfigured: Boolean(data.jupiterConfigured),
          curatedMints: Number(data.curatedMints) || 0,
          tradeable: Array.isArray(data.tradeable) ? data.tradeable : [],
        });
      })
      .catch(() => {
        if (!cancelled) setSolanaHealth(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync pair once tradeable list loads / initial mint changes
  useEffect(() => {
    if (tokensLoading || tradeableTokens.length === 0) return;
    const next = pickDefaultPair(tradeableTokens, initialOutputMint);
    setOutputMint(next.output);
    setInputMint(next.input);
    setPairReady(true);
  }, [tokensLoading, tradeableTokens, initialOutputMint]);

  useEffect(() => {
    if (!pairReady || tradeableTokens.length === 0) return;
    let cancelled = false;
    fetchTokenMetadata(tradeableTokens.map((t) => t.mint))
      .then((rows) => {
        if (cancelled) return;
        const next: Record<string, number> = {};
        for (const row of rows) {
          if (row.id && typeof row.usdPrice === 'number') {
            next[row.id] = row.usdPrice;
          }
        }
        setUsdPrices(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pairReady, tradeableTokens]);

  const inputToken = getCuratedToken(inputMint);
  const outputToken = getCuratedToken(outputMint);
  const pairValid =
    Boolean(inputToken && outputToken) &&
    isMintTradeable(inputMint, mintSet) &&
    isMintTradeable(outputMint, mintSet);

  const { order, loading: quoting, error: quoteError } = useSwapQuote({
    inputMint,
    outputMint,
    uiAmount: fromAmount,
    taker: publicKey?.toBase58(),
    slippageBps: slippageMode === 'manual' ? slippageBps : null,
    enabled: pairValid && pairReady,
    mintSet,
  });

  const outAmountUi = useMemo(() => {
    if (!order?.outAmount || !outputToken) return '';
    return formatUiAmount(fromRawAmount(order.outAmount, outputToken.decimals), 8);
  }, [order, outputToken]);

  useEffect(() => {
    if (!pairReady) return;
    if (quoting) {
      setStatus('quoting');
      return;
    }
    if (quoteError) {
      setStatus('error');
      setStatusMessage(quoteError);
      return;
    }
    if (order && fromAmount) {
      setStatus('ready');
      setStatusMessage(null);
      return;
    }
    if (status !== 'confirming' && status !== 'success') {
      setStatus('idle');
      setStatusMessage(null);
    }
  }, [quoting, quoteError, order, fromAmount, pairReady]);

  const rateLabel = useMemo(() => {
    if (!inputToken || !outputToken) return null;
    const inAmt = parseFloat(fromAmount);
    const outAmt = outAmountUi ? parseFloat(outAmountUi.replace(/,/g, '')) : 0;
    if (!inAmt || !outAmt) return null;
    return `1 ${inputToken.symbol} ≈ ${formatUiAmount(outAmt / inAmt)} ${outputToken.symbol}`;
  }, [fromAmount, outAmountUi, inputToken, outputToken]);

  const filteredTokens = filterCuratedTokens(tokenQuery, tradeableTokens);

  const invertTokens = () => {
    setInputMint(outputMint);
    setOutputMint(inputMint);
    if (outAmountUi) setFromAmount(outAmountUi.replace(/,/g, ''));
  };

  const selectToken = (mint: string) => {
    if (!isMintTradeable(mint, mintSet)) return;
    if (pickerSide === 'from') {
      if (mint === outputMint) setOutputMint(inputMint);
      setInputMint(mint);
    } else if (pickerSide === 'to') {
      if (mint === inputMint) setInputMint(outputMint);
      setOutputMint(mint);
    }
    setPickerSide(null);
    setTokenQuery('');
  };

  const handleSwap = async () => {
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }
    if (!pairValid || !inputToken || !outputToken) {
      setStatusMessage('Selected pair is not tradeable');
      setStatus('error');
      return;
    }
    if (!order?.transaction || !order.requestId || !signTransaction) {
      setStatusMessage('Connect wallet and wait for a valid quote');
      setStatus('error');
      return;
    }
    if (order.errorMessage || order.errorCode) {
      setStatusMessage(order.errorMessage || 'Quote unavailable');
      setStatus('error');
      return;
    }

    try {
      setStatus('confirming');
      setStatusMessage('Confirm in your wallet…');
      setLastSignature(null);

      const txBytes = Buffer.from(order.transaction, 'base64');
      if (txBytes.length < 32 || txBytes.length > 2048) {
        throw new Error('Invalid swap transaction from router');
      }
      const vtx = VersionedTransaction.deserialize(txBytes);
      const signed = await signTransaction(vtx);
      const signedBase64 = Buffer.from(signed.serialize()).toString('base64');

      setStatusMessage('Landing transaction…');
      const result = await executeSwap(signedBase64, order.requestId);

      if (result.status !== 'Success' || !result.signature) {
        throw new Error(result.error || 'Swap failed');
      }

      const explorerUrl = solscanTxUrl(result.signature);
      const inAmt = fromRawAmount(result.inputAmountResult || order.inAmount, inputToken.decimals);
      const outAmt = fromRawAmount(
        result.outputAmountResult || order.outAmount,
        outputToken.decimals
      );

      onSwapComplete({
        id: result.signature,
        time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        fromToken: inputToken.symbol,
        toToken: outputToken.symbol,
        fromMint: inputMint,
        toMint: outputMint,
        fromAmount: inAmt,
        toAmount: outAmt,
        signature: result.signature,
        status: 'success',
        explorerUrl,
      });
      setLastSignature(result.signature);
      setStatus('success');
      setStatusMessage('Swap confirmed — share it?');
      setFromAmount('');
      setShareTrade({
        fromToken: inputToken.symbol,
        toToken: outputToken.symbol,
        fromAmount: inAmt,
        toAmount: outAmt,
        signature: result.signature,
      });
      setShareOpen(true);
    } catch (err: unknown) {
      setStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Swap failed');
    }
  };

  const ctaLabel = (() => {
    if (tokensLoading) return 'Loading tokens…';
    if (tokensError) return 'Token config error';
    if (tradeableTokens.length < 2) return 'No tradeable pairs';
    if (!connected) return 'Connect wallet';
    if (quoting) return 'Quoting…';
    if (status === 'confirming') return 'Confirming…';
    if (!fromAmount) return 'Enter amount';
    if (quoteError) return 'Quote unavailable';
    if (!order?.transaction) return 'Get quote';
    return 'Swap';
  })();

  const ctaDisabled =
    tokensLoading ||
    Boolean(tokensError) ||
    tradeableTokens.length < 2 ||
    !pairValid ||
    (connected &&
      (quoting ||
        status === 'confirming' ||
        !fromAmount ||
        Boolean(quoteError) ||
        !order?.transaction));

  if (!inputToken || !outputToken) {
    return (
      <div className="px-4 py-16 text-center text-sm text-steel">
        {tokensLoading ? 'Loading tradeable tokens…' : 'No tradeable tokens enabled in .env'}
      </div>
    );
  }

  return (
    <div className="relative px-4 py-6 text-white sm:py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-5 text-center sm:text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Trade</p>
          <h1 className="font-display mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Curated swap
          </h1>
          <p className="mt-1 text-sm text-steel">
            {tradeableTokens.length} coins live · {inputToken.symbol} → {outputToken.symbol}. Only
            env-enabled tokens can be traded.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px]">
            <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-steel">
              Solana · Jupiter V2
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 ${
                solanaHealth?.jupiterConfigured
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-accent/30 bg-accent/10 text-accent/90'
              }`}
            >
              {solanaHealth == null
                ? 'API…'
                : solanaHealth.jupiterConfigured
                  ? 'Jupiter key ready'
                  : 'Quotes OK · no API key (rate-limited)'}
            </span>
            <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-steel">
              {connected ? 'Wallet connected' : 'Wallet needed to swap'}
            </span>
            {solanaHealth && solanaHealth.tradeable.length > 0 && (
              <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-steel">
                {solanaHealth.tradeable.join(' · ')}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.07] to-surface/90 p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase text-accent">
              Spot · Solana · Jupiter
            </span>
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className="rounded-lg p-2 text-steel hover:bg-white/[0.05] hover:text-white"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden rounded-xl border border-white/[0.08] bg-ink/50 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-steel">Slippage</span>
                  <div className="flex items-center gap-1">
                    {(['auto', 'manual'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSlippageMode(m)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] capitalize ${
                          slippageMode === m ? 'bg-accent text-ink' : 'bg-white/5 text-steel'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                    {slippageMode === 'manual' && (
                      <div className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1">
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={slippageBps / 100}
                          onChange={(e) => {
                            const pct = parseFloat(e.target.value || '0');
                            const bps = Math.round(pct * 100);
                            setSlippageBps(Math.min(500, Math.max(1, Number.isFinite(bps) ? bps : 50)));
                          }}
                          className="w-12 bg-transparent font-mono text-[11px] text-white outline-none"
                        />
                        <span className="text-[11px] text-steel">%</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-xl border border-white/10 bg-ink/60 p-3.5">
            <div className="mb-2 flex justify-between text-xs text-steel">
              <span>You pay</span>
              {usdPrices[inputMint] != null && fromAmount && (
                <span className="font-mono">
                  ≈ ${(parseFloat(fromAmount) * usdPrices[inputMint]).toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="min-w-0 flex-1 bg-transparent font-mono text-2xl font-medium tabular-nums text-white outline-none placeholder:text-white/15"
              />
              <button
                type="button"
                onClick={() => setPickerSide('from')}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pl-1.5 pr-3 hover:border-accent/40"
              >
                <TokenLogo token={inputToken} size={22} />
                <span className="text-sm font-semibold">{inputToken.symbol}</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 -my-2.5 flex justify-center">
            <button
              type="button"
              onClick={invertTokens}
              className="rounded-full border border-white/12 bg-surface p-2 text-steel shadow-lg hover:border-accent/40 hover:text-accent"
              aria-label="Invert"
            >
              <ArrowDownUp className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-ink/60 p-3.5">
            <div className="mb-2 flex justify-between text-xs text-steel">
              <span>You receive</span>
              {quoting && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />}
            </div>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 font-mono text-2xl font-medium tabular-nums text-white/90">
                {outAmountUi || '0.00'}
              </div>
              <button
                type="button"
                onClick={() => setPickerSide('to')}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pl-1.5 pr-3 hover:border-accent/40"
              >
                <TokenLogo token={outputToken} size={22} />
                <span className="text-sm font-semibold">{outputToken.symbol}</span>
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-1 font-mono text-[11px] text-steel">
            {rateLabel && (
              <div className="flex justify-between gap-2">
                <span>Rate</span>
                <span className="text-right text-white/70">{rateLabel}</span>
              </div>
            )}
            {order?.router && (
              <div className="flex justify-between">
                <span>Route</span>
                <span className="text-white/70">{order.router}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={ctaDisabled}
            onClick={handleSwap}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-ink transition hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-35"
          >
            {!connected && <Wallet className="h-4 w-4" />}
            {(quoting || status === 'confirming' || tokensLoading) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {ctaLabel}
          </button>

          <AnimatePresence>
            {(statusMessage || lastSignature) && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${
                  status === 'success'
                    ? 'border-accent/30 bg-accent/10 text-accent'
                    : status === 'error'
                      ? 'border-white/20 bg-white/[0.06] text-steel'
                      : 'border-white/10 bg-white/[0.03] text-steel'
                }`}
              >
                {status === 'success' ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : status === 'error' ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin" />
                )}
                <div className="min-w-0 flex-1">
                  <p>{statusMessage}</p>
                  {lastSignature && (
                    <a
                      href={solscanTxUrl(lastSignature)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      Solscan <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {status === 'success' && shareTrade && (
                    <button
                      type="button"
                      onClick={() => setShareOpen(true)}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1.5 text-[11px] font-bold text-accent hover:bg-accent/25"
                    >
                      Share trade · @buildingcultu3
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {transactions.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-steel">
              Recent swaps
            </p>
            <ul className="space-y-1.5">
              {transactions.slice(0, 5).map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 font-mono text-[11px]"
                >
                  <span className="text-steel">{tx.time}</span>
                  <span className="min-w-0 truncate text-white">
                    {formatUiAmount(tx.fromAmount)} {tx.fromToken}
                    <span className="mx-1 text-steel">→</span>
                    <span className="text-accent">
                      {formatUiAmount(tx.toAmount)} {tx.toToken}
                    </span>
                  </span>
                  {tx.explorerUrl && (
                    <a
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-steel hover:text-accent"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <AnimatePresence>
        {pickerSide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center"
            onClick={() => setPickerSide(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0e1014] p-3 shadow-2xl"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold">Select token</h3>
                <button
                  type="button"
                  onClick={() => setPickerSide(null)}
                  className="rounded p-1.5 text-steel hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-steel" />
                <input
                  value={tokenQuery}
                  onChange={(e) => setTokenQuery(e.target.value)}
                  placeholder="Search tradeable"
                  className="w-full rounded-lg border border-white/8 bg-ink py-2 pl-8 pr-3 text-sm outline-none focus:border-accent/35"
                  autoFocus
                />
              </div>
              <div className="max-h-72 space-y-0.5 overflow-y-auto">
                {filteredTokens.map((token) => (
                  <button
                    key={token.mint}
                    type="button"
                    onClick={() => selectToken(token.mint)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left hover:bg-white/[0.04]"
                  >
                    <TokenLogo token={token} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{token.symbol}</div>
                      <div className="truncate font-mono text-[10px] text-steel">{token.name}</div>
                    </div>
                    {usdPrices[token.mint] != null && (
                      <span className="font-mono text-xs text-steel">
                        ${usdPrices[token.mint].toFixed(usdPrices[token.mint] < 1 ? 4 : 2)}
                      </span>
                    )}
                  </button>
                ))}
                {filteredTokens.length === 0 && (
                  <p className="py-8 text-center text-xs text-steel">No match</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {shareOpen && shareTrade && (
        <TradeShareModal
          trade={shareTrade}
          onClose={() => setShareOpen(false)}
          onShared={onTradeShared}
        />
      )}
    </div>
  );
}
