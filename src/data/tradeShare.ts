/** Post-trade share — funny copy + existing campaign creatives */

export const BUILDING_CULTURE_HANDLE = 'buildingcultu3';

export const TRADE_SHARE_IMAGES = [
  '/campaign/meme-unruggable.jpg',
  '/campaign/meme-no-more-zero.jpg',
  '/campaign/meme-outsourced-dyor.jpg',
  '/campaign/meme-touch-grass.jpg',
  '/campaign/hook-trade-last.jpg',
] as const;

export type TradeSharePayload = {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
};

const LINES = [
  (t: TradeSharePayload) =>
    `Just swapped ${t.fromToken} → ${t.toToken} on Builders DEX.\n\nCharts? Optional.\nCommits? Required.\n\n@${BUILDING_CULTURE_HANDLE} already DYOR'd it so I don't wake up to zero.`,
  (t: TradeSharePayload) =>
    `Traded ${t.fromToken} for ${t.toToken}.\n\nNot because a frog told me to.\nBecause Builders DEX verified the builders first.\n\nUNRUGGABLE energy.\n@${BUILDING_CULTURE_HANDLE}`,
  (t: TradeSharePayload) =>
    `${t.fromToken} → ${t.toToken} ✅\n\nI outsourced my DYOR to @${BUILDING_CULTURE_HANDLE}.\nTouch grass. They touched the repo.\n\n#BuildersDEX`,
  (t: TradeSharePayload) =>
    `Another swap on the reputation layer.\n${t.fromToken} → ${t.toToken}\n\nTrade is the last step — Proof of Building™ came first.\n\n@${BUILDING_CULTURE_HANDLE} #Unruggable`,
  (t: TradeSharePayload) =>
    `Rug season called. I hung up.\n\nSwapped ${t.fromToken} → ${t.toToken} on Builders DEX after the homework.\n\n@${BUILDING_CULTURE_HANDLE} built the trust. I just hit Swap.`,
];

export function pickTradeShareImage(seed?: string): string {
  let h = 0;
  const s = seed || String(Date.now());
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TRADE_SHARE_IMAGES[h % TRADE_SHARE_IMAGES.length];
}

export function buildTradeShareText(trade: TradeSharePayload, seed?: string): string {
  let h = 0;
  const s = seed || `${trade.fromToken}${trade.toToken}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return LINES[h % LINES.length](trade);
}

export function twitterIntentUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
