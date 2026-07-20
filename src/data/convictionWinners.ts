/** Personal conviction bag — durable products, not the newest launch. */

export type ConvictionWinner = {
  id: string;
  ticker: string;
  name: string;
  chain: string;
  blurb: string;
  why: string;
  href: string;
  /** Optional Solana mint for Trade CTA when in catalog */
  solanaMint?: string;
  tradeSymbol?: string;
};

export const CONVICTION_WINNERS: ConvictionWinner[] = [
  {
    id: 'iotx',
    ticker: 'IOTX',
    name: 'IoTeX',
    chain: 'IoTeX L1',
    blurb: 'Real-world AI & DePIN — devices, data, and machine identity since 2017.',
    why: 'Shipped L1 + ioID. Builders with deep crypto/security pedigree.',
    href: 'https://iotex.io/',
  },
  {
    id: 'xyz',
    ticker: 'XYZ',
    name: 'XYZ',
    chain: 'Conviction',
    blurb: 'Long-horizon bag — not chasing the newest ticker of the week.',
    why: 'Personal conviction. Product and team over launch fireworks.',
    href: 'https://www.coingecko.com/en/search_coin?query=xyz',
  },
  {
    id: 'pundix',
    ticker: 'PUNDIX',
    name: 'Pundi X',
    chain: 'Function X',
    blurb: 'Crypto payments in the real world — XPOS, wallets, retail rails.',
    why: 'Years of shipping POS + payment UX. Not a vapor narrative.',
    href: 'https://pundix.com/',
  },
  {
    id: 'ray',
    ticker: 'RAY',
    name: 'Raydium',
    chain: 'Solana',
    blurb: 'Solana AMM + liquidity engine builders actually use.',
    why: 'Core Solana DeFi plumbing with a working product every day.',
    href: 'https://raydium.io/',
    solanaMint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    tradeSymbol: 'RAY',
  },
  {
    id: 'jup',
    ticker: 'JUP',
    name: 'Jupiter',
    chain: 'Solana',
    blurb: 'The swap layer of Solana — aggregation that became infrastructure.',
    why: 'Known builders. Product every trader already opens.',
    href: 'https://jup.ag/',
    solanaMint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    tradeSymbol: 'JUP',
  },
];
