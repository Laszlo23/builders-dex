export type AvantisPair = {
  pairIndex: number;
  name: string;
  from: string;
  to: string;
  binanceSymbol?: string;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export async function fetchAvantisPairs(): Promise<AvantisPair[]> {
  const res = await fetch('/api/avantis/pairs');
  const data = await res.json();
  return (data.pairs || []) as AvantisPair[];
}

export async function fetchAvantisPrice(pairIndex: number): Promise<number | null> {
  const res = await fetch(`/api/avantis/price/${pairIndex}`);
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.price === 'number' ? data.price : null;
}

export async function fetchCandles(
  pairIndex: number,
  interval = '15m',
  limit = 120
): Promise<{ candles: Candle[]; symbol?: string; provider?: string }> {
  const q = new URLSearchParams({
    pairIndex: String(pairIndex),
    interval,
    limit: String(limit),
  });
  const res = await fetch(`/api/avantis/candles?${q}`);
  if (!res.ok) throw new Error('Failed to load candles');
  return res.json();
}
