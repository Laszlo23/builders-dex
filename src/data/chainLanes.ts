/** Visual + navigation break between the three live rooms. */
export type ChainLaneId = 'solana' | 'base' | 'hood';

export type ChainLane = {
  id: ChainLaneId;
  label: string;
  chain: string;
  job: string;
  wallet: string;
  route: string;
};

export const CHAIN_LANES: ChainLane[] = [
  {
    id: 'solana',
    label: 'Solana',
    chain: 'Solana',
    job: 'Passport · curated swap',
    wallet: 'Phantom',
    route: 'swap',
  },
  {
    id: 'base',
    label: 'Base',
    chain: 'Base',
    job: 'Canonical $AURA',
    wallet: 'Same 0x',
    route: 'aura',
  },
  {
    id: 'hood',
    label: 'Hood',
    chain: 'Robinhood 4663',
    job: 'Square wallet · $BUILD loop',
    wallet: 'EVM / TBA',
    route: 'ccff00',
  },
];

export const HOOD_LANE_ROUTES = new Set([
  'hood',
  'hoodstreet',
  'ccff00',
  'build',
  'cubes',
  'stacc',
]);

export function laneForRoute(route: string): ChainLaneId {
  if (HOOD_LANE_ROUTES.has(route)) return 'hood';
  if (route === 'aura') return 'base';
  return 'solana';
}
