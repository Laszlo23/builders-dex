/**
 * HoodStreet — official public pages + confirmed CCFF00 facts.
 * Cubes mint stays outbound Square Apes. No Solana wrap. No invented token mint.
 */
import { CUBES_CONTRACT, CUBES_MINT_URL, CUBES_PROJECT_ID } from './hoodChain';

export const HOODSTREET_SITE = 'https://hoodstreet.capital';
export const HOODSTREET_CCFF00_URL = 'https://hoodstreet.capital/ccff00';
export const HOODSTREET_NEON_URL = 'https://hoodstreet.capital/neon';
export const HOODSTREET_DISCLOSURES = 'https://hoodstreet.capital/disclosures';
export const HOODSTREET_PROJECT_ID = CUBES_PROJECT_ID;
export const HOODSTREET_HEX = '#CCFF00';
export const HOODSTREET_NAME = 'HoodStreet';
export const CCFF00_NAME = 'CCFF00';
export const CCFF00_SUPPLY = 10_000;
export const CCFF00_PUBLIC = 9_750;
export const CCFF00_RESERVED = 250;
export const CCFF00_PER_NFT = 10_000;
export const CCFF00_TOKEN_SUPPLY = 1_000_000_000;

export type HoodStreetLayerStatus = 'live' | 'outbound' | 'planned';

export type HoodStreetLayer = {
  id: string;
  name: string;
  status: HoodStreetLayerStatus;
  href: string;
  internal?: string;
  blurb: string;
};

export const HOODSTREET_LAYERS: HoodStreetLayer[] = [
  {
    id: 'ccff00',
    name: 'CCFF00',
    status: 'live',
    href: HOODSTREET_CCFF00_URL,
    blurb:
      'Founding membership. 10,000 on-chain Squares. One color. Each Square is an ERC-6551 wallet loaded with 10,000 $CCFF00.',
  },
  {
    id: 'neon',
    name: 'My Neon',
    status: 'live',
    href: HOODSTREET_NEON_URL,
    blurb:
      'The wallet interface for assets inside your Square. Built for human control now, agent control later.',
    internal: 'ccff00',
  },
  {
    id: 'cubes',
    name: 'Cubes mint',
    status: 'outbound',
    href: CUBES_MINT_URL,
    internal: 'cubes',
    blurb:
      'ETH mint on Robinhood Chain via Square Apes. We list the confirmed contract and live phases() — we are not the minter.',
  },
];

export const HOODSTREET_FACTS = [
  'Every Square is the same immutable #CCFF00. No rarity theater.',
  'SVG and metadata live in the contract. No IPFS.',
  'The NFT owns an ERC-6551 account. Transfer the Square, the wallet moves with it.',
  'That account can buy inspected Hood projects and hold the receipts — the Square is the trading identity.',
  '$CCFF00 transfers stay off until the 9,750 public Squares mint out.',
  '10,000 NFTs × 10,000 tokens = 1,000,000,000 $CCFF00. Fixed.',
] as const;

export function hoodStreetExplorerToken(): string {
  return `https://robinhoodchain.blockscout.com/token/${CUBES_CONTRACT}`;
}
