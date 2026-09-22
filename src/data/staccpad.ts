/**
 * Live Hood NFT vault / NGU desk operated by staccpad — outbound only.
 * Same CCFF00 collection we already read. We do not run their contracts,
 * iframe their SPA, or invent a stacc / staccpad / Robinhood Markets tie.
 * www.staccpad.fun is a separate Solana launchpad. Do not mix the two.
 */
import { CCFF00_NFT } from './ccff00Wallet';
import { hoodExplorerAddressUrl, hoodExplorerTokenUrl } from './hoodChain';

export const STACCPAD_SITE = 'https://staccpad.fun';
export const STACCPAD_EXPLORE_URL = 'https://staccpad.fun/';
export const STACCPAD_CCFF00_TERMINAL = 'https://staccpad.fun/terminal/ccff00';
export const STACCPAD_HAP_NGU_TERMINAL = 'https://staccpad.fun/terminal/ngu-ef264ab6';
export const STACCPAD_NEONS_URL = 'https://staccpad.fun/neons';
export const STACCPAD_SOLANA_LAUNCHPAD = 'https://www.staccpad.fun';

/** Same Squares contract HoodStreet publishes. Confirmed on their CCFF00 desk. */
export const STACCPAD_CCFF00_COLLECTION = CCFF00_NFT;
export const STACCPAD_CCFF00_VAULT = '0x144e73359476Cb496bC538Eb91dB8172604038B1' as const;
export const STACCPAD_HOOK = '0xcFEC18Db9C2aC4812800D7b181Cb3Fb2d82a8044' as const;
export const STACCPAD_POOL_MANAGER = '0x38bB0B3644E83CF828D2D15A1AF9E75FA3aDe82b' as const;

export const STACCPAD_DISCLAIMER =
  'Not affiliated with staccpad, stacc, Neon Fun Machines, Bankr, or Robinhood Markets. Their Hood contracts are unaudited. Tick their four disclosures on their site before you sign anything. No refunds.';

export type StaccpadDeskId = 'ccff00' | 'neons' | 'hap-ngu' | 'explore';

export type StaccpadDesk = {
  id: StaccpadDeskId;
  name: string;
  tag: string;
  href: string;
  blurb: string;
  ours: boolean;
};

export const STACCPAD_DESKS: StaccpadDesk[] = [
  {
    id: 'ccff00',
    name: 'CCFF00 vault',
    tag: 'Our collection · their book',
    href: STACCPAD_CCFF00_TERMINAL,
    ours: true,
    blurb:
      'Uniswap v4 CLMM on Hood. 1 Square = 1e18 vault claim. Floor, ape, and LP live on their terminal — we do not execute that router from here.',
  },
  {
    id: 'neons',
    name: 'Neons',
    tag: 'Square is the wallet',
    href: STACCPAD_NEONS_URL,
    ours: true,
    blurb:
      'Their Doppler / Bankr-rail launch: the Square TBA opens a locked WETH pool, keeps the fee stream, and buys in the same transaction. Official desk, not ours.',
  },
  {
    id: 'hap-ngu',
    name: 'Happy Apes NGU',
    tag: 'Example curve · not ours',
    href: STACCPAD_HAP_NGU_TERMINAL,
    ours: false,
    blurb:
      'The desk you sent. Rising-only NGU mint, 20% auto-locked LP, WETH / USDG books. Useful as the live Hood pattern — not a Builders collection.',
  },
  {
    id: 'explore',
    name: 'Bump grid',
    tag: 'Whole Hood tape',
    href: STACCPAD_EXPLORE_URL,
    ours: false,
    blurb:
      'STACCSHOME, Jail Diaries, and the rest of their vault tape. Omni / Bet / Pawn stay on their SPA. We do not rehost it.',
  },
];

export const STACCPAD_FACTS = [
  'CCFF00 collection on their desk matches our Square NFT.',
  'Vault 0x144e…38B1 holds the 1:1 claim token for that collection.',
  'Hook 0xcFEC…8044 + their PoolManager — Uniswap v4, LP described as locked.',
  'Neons retitles as Neon Fun Machines on neonfunmachines.fun. Same bundle.',
  'Solana staccpad (Meteora / HawkFi) is a different product on www.staccpad.fun.',
] as const;

export function staccpadCollectionExplorer(): string {
  return hoodExplorerTokenUrl(STACCPAD_CCFF00_COLLECTION);
}

export function staccpadVaultExplorer(): string {
  return hoodExplorerAddressUrl(STACCPAD_CCFF00_VAULT);
}

export function staccpadHookExplorer(): string {
  return hoodExplorerAddressUrl(STACCPAD_HOOK);
}
