import { UNSTAKE_COOLDOWN_DAYS } from './earn';
import { HOOD_SHARE_PROJECT_ID } from './hoodShare';

export type SquareLoopPhase = 'dormant' | 'activated' | 'parked' | 'stalled';

export type SquareLoopVerb = 'activate' | 'park' | 'stall' | 'unpark-request' | 'unpark' | 'exit-stall';

export const SQUARE_LOOP_MAX_PER_WALLET = 3;
export const SQUARE_LOOP_UNPARK_DAYS = UNSTAKE_COOLDOWN_DAYS;
export const FIRST_STALL_PROJECT_ID = HOOD_SHARE_PROJECT_ID;
export const FIRST_STALL_NAME = 'Aura Share';

export const SQUARE_LOOP_PHASES: SquareLoopPhase[] = ['dormant', 'activated', 'parked', 'stalled'];

export function squareLoopPhaseLabel(phase: SquareLoopPhase): string {
  switch (phase) {
    case 'dormant':
      return 'Dormant';
    case 'activated':
      return 'Activated';
    case 'parked':
      return 'Parked';
    case 'stalled':
      return 'Stall';
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

export function squareLoopPhaseBlurb(phase: SquareLoopPhase): string {
  switch (phase) {
    case 'dormant':
      return 'Unlit tile. Create the Square account, then activate on Builders DEX. We do not wrap the NFT.';
    case 'activated':
      return 'Lights on. The Square is your identity here. Parking puts it on the street.';
    case 'parked':
      return 'On the street. Provide BUILD/USDG as an LP NFT in the TBA when $BUILD is live, or take a stall.';
    case 'stalled':
      return 'Storefront hanging a catalog sign. Allocation and the project share sit in the Square wallet.';
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

export type SquareLoopPerk = {
  title: string;
  body: string;
};

export const SQUARE_LOOP_PERKS: SquareLoopPerk[] = [
  {
    title: 'Fee dust, not APR',
    body: 'Parked Squares share real swap / protocol fees. If volume is zero, this week’s fees are zero.',
  },
  {
    title: 'Stall rights',
    body: 'A parked Square can take a stall on an inspected catalog launch. First stall: Aura Share on Hood.',
  },
  {
    title: 've-boost later',
    body: 'When $BUILD has a published address, lock it from the Square TBA to boost fee share — never idle wallet stake.',
  },
  {
    title: 'Same color',
    body: 'Growth is neon state, not rarity. Every Square stays #CCFF00.',
  },
];

export function neonLevel(input: {
  phase: SquareLoopPhase;
  parkedAt: number | null;
  now?: number;
}): number {
  const now = input.now ?? Date.now();
  switch (input.phase) {
    case 'dormant':
      return 8;
    case 'activated':
      return 28;
    case 'parked': {
      const days = input.parkedAt ? (now - input.parkedAt) / 86_400_000 : 0;
      return Math.min(72, 40 + Math.floor(days * 2));
    }
    case 'stalled':
      return 88;
    default: {
      const _exhaustive: never = input.phase;
      return _exhaustive;
    }
  }
}

export function formatFeeWei(wei: string): string {
  const value = Number(wei || '0');
  if (!Number.isFinite(value) || value <= 0) return '0 ETH';
  return `${(value / 1e18).toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH`;
}
