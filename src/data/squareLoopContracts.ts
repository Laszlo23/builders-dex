/**
 * CCFF00 Square loop overlay on Robinhood Chain 4663.
 * Deployed 2026-09-21 from the published founder 0x. Does not launch $BUILD.
 */
import { CCFF00_NFT } from './ccff00Wallet';

export const SQUARE_LOOP_SQUARES = CCFF00_NFT;
export const ACTIVATION_REGISTRY_PUBLISHED =
  '0xbb780B26CEbA6cd184BF321158Bf6fD46A156da3' as const;
export const STALL_VAULT_PUBLISHED = '0x1c752a04dD0664FF605D10665F1cE7651780Da0c' as const;
export const FEE_SPLITTER_PUBLISHED = '0xC3bF5A881b079c947c0ec184A4fF3EBF8A364A64' as const;

export const SQUARE_LOOP_DEPLOY_TXS = {
  registry: '0x98f7ea5875f7ac74f622e772f8729c426161194ec09b8833a5f7b6c395421ae0',
  stall: '0x07aace6983cf7433d1781fbaafc2464abbfa9b6d5cfa043da4c5bd2557981f87',
  fees: '0xde79d2dd7413263ffa75f4c600cfd971dca0624917c545354169c736c0a9faf8',
} as const;
