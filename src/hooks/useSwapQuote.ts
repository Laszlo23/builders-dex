import { useEffect, useRef, useState } from 'react';
import { fetchOrder, OrderResponse, toRawAmount } from '../lib/jupiter';
import { getCuratedToken } from '../data/curatedTokens';

export type SwapQuoteState = {
  order: OrderResponse | null;
  loading: boolean;
  error: string | null;
};

type Args = {
  inputMint: string;
  outputMint: string;
  uiAmount: string;
  taker?: string | null;
  slippageBps?: number | null;
  debounceMs?: number;
  enabled?: boolean;
  mintSet?: Set<string>;
};

export function useSwapQuote({
  inputMint,
  outputMint,
  uiAmount,
  taker,
  slippageBps,
  debounceMs = 400,
  enabled = true,
  mintSet,
}: Args): SwapQuoteState {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const inputToken = getCuratedToken(inputMint);
    const outputToken = getCuratedToken(outputMint);
    const amountNum = parseFloat(uiAmount);

    if (!enabled) {
      setOrder(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (mintSet && (!mintSet.has(inputMint) || !mintSet.has(outputMint))) {
      setOrder(null);
      setError('Token is not enabled for trading');
      setLoading(false);
      return;
    }

    if (!inputToken || !outputToken || !uiAmount || !Number.isFinite(amountNum) || amountNum <= 0) {
      setOrder(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (inputMint === outputMint) {
      setOrder(null);
      setError('Select two different tokens');
      setLoading(false);
      return;
    }

    const rawAmount = toRawAmount(amountNum, inputToken.decimals);
    if (rawAmount === '0') {
      setOrder(null);
      setLoading(false);
      return;
    }

    const currentRequest = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const result = await fetchOrder({
          inputMint,
          outputMint,
          amount: rawAmount,
          taker: taker || undefined,
          slippageBps: slippageBps ?? undefined,
        });

        if (currentRequest !== requestIdRef.current) return;

        if (result.errorMessage || result.errorCode) {
          setOrder(null);
          setError(result.errorMessage || `Quote error ${result.errorCode}`);
        } else {
          setOrder(result);
          setError(null);
        }
      } catch (err: unknown) {
        if (currentRequest !== requestIdRef.current) return;
        setOrder(null);
        setError(err instanceof Error ? err.message : 'Failed to fetch quote');
      } finally {
        if (currentRequest === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [inputMint, outputMint, uiAmount, taker, slippageBps, debounceMs, enabled, mintSet]);

  return { order, loading, error };
}
