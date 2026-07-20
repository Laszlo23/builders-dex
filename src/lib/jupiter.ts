export type OrderResponse = {
  transaction: string | null;
  requestId: string;
  inAmount?: string;
  outAmount: string;
  otherAmountThreshold?: string;
  swapType?: string;
  slippageBps?: number;
  priceImpactPct?: string;
  routePlan?: unknown[];
  router?: string;
  mode?: string;
  feeBps?: number;
  feeMint?: string;
  errorCode?: number;
  errorMessage?: string;
};

export type ExecuteResponse = {
  status: 'Success' | 'Failed';
  signature?: string;
  code?: number;
  totalInputAmount?: string;
  totalOutputAmount?: string;
  inputAmountResult?: string;
  outputAmountResult?: string;
  error?: string;
};

export type TokenMetaResponse = {
  id: string;
  name?: string;
  symbol?: string;
  icon?: string | null;
  decimals?: number;
  usdPrice?: number;
  mcap?: number;
  liquidity?: number;
};

export type OrderParams = {
  inputMint: string;
  outputMint: string;
  amount: string;
  taker?: string;
  slippageBps?: number;
};

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error || data.message || res.statusText;
  } catch {
    return res.statusText || `HTTP ${res.status}`;
  }
}

export async function fetchOrder(params: OrderParams): Promise<OrderResponse> {
  const search = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amount,
  });
  if (params.taker) search.set('taker', params.taker);
  if (params.slippageBps != null) search.set('slippageBps', String(params.slippageBps));

  const res = await fetch(`/api/jupiter/order?${search.toString()}`);
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json();
}

export async function executeSwap(signedTransaction: string, requestId: string): Promise<ExecuteResponse> {
  const res = await fetch('/api/jupiter/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signedTransaction, requestId }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json();
}

export async function fetchTokenMetadata(mints: string[]): Promise<TokenMetaResponse[]> {
  if (mints.length === 0) return [];
  const res = await fetch(`/api/jupiter/tokens?query=${encodeURIComponent(mints.join(','))}`);
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json();
}

export function toRawAmount(uiAmount: number, decimals: number): string {
  if (!Number.isFinite(uiAmount) || uiAmount <= 0) return '0';
  const [whole, frac = ''] = uiAmount.toFixed(decimals).split('.');
  const padded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  const raw = BigInt(whole) * BigInt(10 ** decimals) + BigInt(padded || '0');
  return raw.toString();
}

export function fromRawAmount(raw: string | undefined, decimals: number): number {
  if (!raw) return 0;
  const value = BigInt(raw);
  const base = BigInt(10 ** decimals);
  const whole = value / base;
  const frac = value % base;
  const fracStr = frac.toString().padStart(decimals, '0');
  return Number(`${whole}.${fracStr}`);
}

export function formatUiAmount(amount: number, maxFrac = 6): string {
  if (!Number.isFinite(amount) || amount === 0) return '0';
  if (amount < 0.000001) return amount.toExponential(2);
  return amount.toLocaleString('en-US', {
    maximumFractionDigits: maxFrac,
    minimumFractionDigits: 0,
  });
}

export function solscanTxUrl(signature: string): string {
  return `https://solscan.io/tx/${signature}`;
}
