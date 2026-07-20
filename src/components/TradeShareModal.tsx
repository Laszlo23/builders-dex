import React, { useState } from 'react';
import { Check, Copy, Download, Share2, X, ExternalLink } from 'lucide-react';
import {
  BUILDING_CULTURE_HANDLE,
  TradeSharePayload,
  buildTradeShareText,
  pickTradeShareImage,
  twitterIntentUrl,
} from '../data/tradeShare';
import { formatUiAmount } from '../lib/jupiter';
import OptimizedImage from './OptimizedImage';

type Props = {
  trade: TradeSharePayload & { signature?: string };
  onClose: () => void;
  onShared?: () => void;
};

export default function TradeShareModal({ trade, onClose, onShared }: Props) {
  const seed = trade.signature || `${trade.fromToken}-${trade.toToken}-${trade.toAmount}`;
  const image = pickTradeShareImage(seed);
  const text = buildTradeShareText(trade, seed);
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onShared?.();
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      alert('Could not copy — select the text manually.');
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Builders DEX trade',
          text,
          url: 'https://buildersdex.app',
        });
        onShared?.();
      } catch {
        /* cancelled */
      }
    } else {
      void copyText();
    }
  };

  const shareX = () => {
    onShared?.();
    window.open(twitterIntentUrl(text), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-black/75 p-3 backdrop-blur-md sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-accent/30 bg-gradient-to-b from-white/[0.07] to-ink shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-share-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-ink/60 p-2 text-steel hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative aspect-square overflow-hidden sm:aspect-[4/3]">
          <OptimizedImage src={image} alt="" className="h-full w-full object-cover" sizes="400px" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              Share your trade
            </p>
            <h2 id="trade-share-title" className="font-display mt-1 text-xl font-bold">
              {formatUiAmount(trade.fromAmount)} {trade.fromToken}
              <span className="mx-1.5 text-steel">→</span>
              <span className="text-accent">
                {formatUiAmount(trade.toAmount)} {trade.toToken}
              </span>
            </h2>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-ink/50 px-4 py-3 text-sm leading-relaxed text-white/90">
            {text}
          </p>
          <p className="mt-2 font-mono text-[10px] text-steel">
            Tags @{BUILDING_CULTURE_HANDLE} · uses campaign creative
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={shareX}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-bold text-ink hover:bg-accent-bright sm:flex-none"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Post on X
            </button>
            <button
              type="button"
              onClick={() => void shareNative()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-4 py-2.5 text-xs font-semibold text-accent"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            <button
              type="button"
              onClick={() => void copyText()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 px-4 py-2.5 text-xs text-steel hover:text-white"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={image}
              download
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 px-4 py-2.5 text-xs text-steel hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Image
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
