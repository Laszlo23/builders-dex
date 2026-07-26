import bs58 from 'bs58';
import type { EarnProgressSnapshot } from '../earnProgress';
import { passportSyncMessage } from './messages';

export type ReputationPublic = {
  wallet: string;
  displayName: string;
  builderXp: number;
  contributionsCount: number;
  levelName: string;
  verified: boolean;
  updatedAt: string;
  completedTaskCount: number;
  scoutXp: number;
};

export { passportSyncMessage };

export async function fetchReputation(wallet: string): Promise<{
  progress: EarnProgressSnapshot;
  displayName: string;
  verified: boolean;
  updatedAt: string;
} | null> {
  const res = await fetch(`/api/reputation/${encodeURIComponent(wallet)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Reputation fetch failed (${res.status})`);
  const data = (await res.json()) as {
    progress: EarnProgressSnapshot;
    displayName: string;
    verified: boolean;
    updatedAt: string;
  };
  return data;
}

async function signPayload(
  message: string,
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>,
): Promise<string> {
  if (!signMessage) {
    throw new Error('Wallet signature required — connect a signing wallet');
  }
  const sig = await signMessage(new TextEncoder().encode(message));
  return bs58.encode(sig);
}

export async function syncReputationToServer(input: {
  wallet: string;
  displayName?: string;
  progress: EarnProgressSnapshot;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<{ ok: boolean; verified: boolean; progress?: EarnProgressSnapshot }> {
  const updatedAt = Date.now();
  const signature = await signPayload(
    passportSyncMessage(input.wallet, updatedAt),
    input.signMessage,
  );

  const res = await fetch('/api/reputation/sync', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet: input.wallet,
      displayName: input.displayName || '',
      progress: { ...input.progress, updatedAt },
      updatedAt,
      signature,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Sync failed (${res.status})`);
  }
  return res.json() as Promise<{
    ok: boolean;
    verified: boolean;
    progress?: EarnProgressSnapshot;
  }>;
}

export async function fetchReputationLeaderboard(
  limit = 20,
): Promise<ReputationPublic[]> {
  const res = await fetch(`/api/reputation/leaderboard?limit=${limit}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { leaderboard: ReputationPublic[] };
  return data.leaderboard || [];
}
