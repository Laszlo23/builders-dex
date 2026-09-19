/**
 * Canonical CCFF00 Square wallet — addresses from the NFT itself + HoodStreet's
 * published frontend. $CCFF00 transfers stay off until their enableTrading().
 * Cubes mint stays outbound. No Solana wrap.
 */
import { CUBES_SQUARES_CONTRACT } from './hoodChain';
import { HOOD_SHARE_ADDRESS, HOOD_SHARE_MINT_SEL, HOOD_SHARE_PRICE_WEI } from './hoodShare';

export const CCFF00_NFT = CUBES_SQUARES_CONTRACT as `0x${string}`;
/** Published by CCFF00.ccff00Token() on 4663 — not a guessed mint. */
export const CCFF00_TOKEN = '0x73CB777311Dc5e464C53Ddafb4496Fd87fE0eC97' as const;
export const ERC6551_REGISTRY = '0x000000006551c19487814612e58FE06813775758';
export const ERC6551_IMPLEMENTATION = '0x03dA8C9df253a4401b08629a6F50E4c4E8e248cC';
export const ERC6551_SALT =
  '0x448cc5ed5a52db42393a3d48476af932464724d8262648ad18b66d2ffef1a8e0' as const;

export const GET_TBA_SEL = '0xabb23f5b';
export const TRADING_ACTIVATED_SEL = '0x4c44a538';
export const CCFF00_TOKEN_SEL = '0x76b1d068';
export const BALANCE_OF_SEL = '0x70a08231';
export const OWNER_OF_SEL = '0x6352211e';
export const EXECUTE_SEL = '0x51945447';
export const CREATE_ACCOUNT_SEL = '0x8a54c52f';

export type Ccff00DeskStatus = 'live' | 'locked';

export type Ccff00DeskItem = {
  id: string;
  name: string;
  blurb: string;
  status: Ccff00DeskStatus;
  lockReason?: string;
  to: `0x${string}`;
  valueWei: bigint;
  data: `0x${string}`;
  route?: string;
};

/** What a Square can buy or trade today — live ETH mints only. */
export const CCFF00_DESK: Ccff00DeskItem[] = [
  {
    id: 'p5',
    name: 'Aura Share',
    blurb: 'Inspected Hood Accelerator certificate. The Square pays ETH and holds the NFT.',
    status: 'live',
    to: HOOD_SHARE_ADDRESS,
    valueWei: HOOD_SHARE_PRICE_WEI,
    data: HOOD_SHARE_MINT_SEL,
    route: 'raise',
  },
  {
    id: 'ccff00-spot',
    name: '$CCFF00 spot',
    blurb: 'Transfers stay off until HoodStreet enables trading after the public Squares mint out.',
    status: 'locked',
    lockReason: 'enableTrading() is false on-chain',
    to: CCFF00_TOKEN,
    valueWei: 0n,
    data: '0x',
  },
];

export function ccff00DeskItem(id: string | null | undefined): Ccff00DeskItem | undefined {
  if (!id) return undefined;
  return CCFF00_DESK.find((item) => item.id === id);
}
