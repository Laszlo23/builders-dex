import React, { useEffect, useState } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import CandleChart from './CandleChart';
import {
  AvantisPair,
  Candle,
  fetchAvantisPairs,
  fetchAvantisPrice,
  fetchCandles,
} from '../lib/avantis';

/**
 * Avantis-powered perps terminal (Base).
 * Live marks via avantis-trader-sdk sidecar; real OHLCV candles for charts.
 * Execution opens Avantis (Base USDC perps) — Solana wallet remains for Spot.
 */
export default function PerpsPanel() {
  const [pairs, setPairs] = useState<AvantisPair[]>([]);
  const [pairIndex, setPairIndex] = useState(1);
  const [mark, setMark] = useState<number | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [candleInterval, setCandleInterval] = useState('15m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState(10);
  const [collateral, setCollateral] = useState('100');
  const [provider, setProvider] = useState<string>('');

  const active = pairs.find((p) => p.pairIndex === pairIndex) || pairs[0];

  useEffect(() => {
    let cancelled = false;
    fetchAvantisPairs()
      .then((list) => {
        if (cancelled) return;
        setPairs(list);
        if (list.length && !list.some((p) => p.pairIndex === pairIndex)) {
          setPairIndex(list[0].pairIndex);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Pairs failed'));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchCandles(pairIndex, candleInterval, 150), fetchAvantisPrice(pairIndex)])
      .then(([c, px]) => {
        if (cancelled) return;
        setCandles(c.candles || []);
        setProvider(c.provider || '');
        setMark(px);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Market data failed');
        setLoading(false);
      });

    const id = window.setInterval(() => {
      fetchAvantisPrice(pairIndex).then((px) => {
        if (!cancelled && px != null) setMark(px);
      });
    }, 8000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pairIndex, candleInterval]);

  const changePct =
    candles.length >= 2
      ? (
          ((candles[candles.length - 1].close - candles[0].open) / candles[0].open) *
          100
        ).toFixed(2)
      : '0.00';
  const up = Number(changePct) >= 0;

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/[0.06] px-3 py-2.5">
        <select
          value={pairIndex}
          onChange={(e) => setPairIndex(Number(e.target.value))}
          className="rounded-md border border-white/10 bg-[#12141a] px-2 py-1.5 text-sm font-semibold outline-none"
        >
          {pairs.map((p) => (
            <option key={p.pairIndex} value={p.pairIndex}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg font-semibold tabular-nums">
            {mark != null
              ? `$${mark.toLocaleString(undefined, { maximumFractionDigits: mark < 10 ? 4 : 2 })}`
              : '—'}
          </span>
          <span className={`font-mono text-xs ${up ? 'text-accent' : 'text-steel'}`}>
            {up ? '+' : ''}
            {changePct}%
          </span>
        </div>
        <span className="rounded border border-accent/25 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-accent">
          Avantis · Base
        </span>
        <div className="ml-auto flex gap-1">
          {['5m', '15m', '1h', '4h'].map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setCandleInterval(iv)}
              className={`rounded px-2 py-1 font-mono text-[10px] ${
                candleInterval === iv ? 'bg-accent text-ink' : 'text-steel hover:text-white'
              }`}
            >
              {iv}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px]">
        <div className="relative h-[320px] border-b border-white/[0.06] sm:h-[420px] lg:border-b-0 lg:border-r">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/40">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-4 text-center text-xs text-steel">
              {error}
            </div>
          )}
          {!loading && !error && <CandleChart candles={candles} />}
          {provider && (
            <p className="absolute bottom-2 left-3 font-mono text-[9px] text-steel/70">
              Candles · {provider} · Mark · Avantis/Pyth
            </p>
          )}
        </div>

        <aside className="bg-[#0a0b0d] p-3">
          <div className="mb-3 flex gap-1">
            <button
              type="button"
              onClick={() => setSide('long')}
              className={`flex-1 rounded-md py-2 text-xs font-bold ${
                side === 'long' ? 'bg-accent text-ink' : 'bg-white/5 text-steel'
              }`}
            >
              Long
            </button>
            <button
              type="button"
              onClick={() => setSide('short')}
              className={`flex-1 rounded-md py-2 text-xs font-bold ${
                side === 'short' ? 'bg-white/25 text-white' : 'bg-white/5 text-steel'
              }`}
            >
              Short
            </button>
          </div>

          <label className="mb-1 block font-mono text-[10px] text-steel">Collateral (USDC)</label>
          <input
            type="number"
            value={collateral}
            onChange={(e) => setCollateral(e.target.value)}
            className="mb-3 w-full rounded-md border border-white/10 bg-ink px-3 py-2 font-mono text-sm outline-none focus:border-accent/40"
          />

          <label className="mb-1 block font-mono text-[10px] text-steel">
            Leverage · {leverage}x
          </label>
          <input
            type="range"
            min={2}
            max={50}
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="mb-4 w-full accent-[#C8E868]"
          />

          <div className="mb-4 space-y-1 font-mono text-[11px] text-steel">
            <div className="flex justify-between">
              <span>Pair</span>
              <span className="text-white/80">{active?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Notional</span>
              <span className="text-white/80">
                ${(parseFloat(collateral || '0') * leverage).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Chain</span>
              <span className="text-accent">Base · Avantis</span>
            </div>
          </div>

          <a
            href="https://avantisfi.com/"
            target="_blank"
            rel="noreferrer"
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold ${
              side === 'long'
                ? 'bg-accent text-ink hover:bg-accent-bright'
                : 'bg-white/25 text-white hover:bg-white/35'
            }`}
          >
            Open {side} on Avantis
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-steel">
            Market data powered by <span className="text-white/70">avantis-trader-sdk</span>. Perps
            settle in USDC on Base. Use Spot tab for Solana curated swaps via Jupiter.
          </p>
        </aside>
      </div>
    </div>
  );
}
