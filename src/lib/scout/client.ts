import bs58 from 'bs58';
import { scoutSubmitMessage } from '../reputation/messages';
import type { ScoutLeaderboardRow, ScoutSubmissionRow } from './types';

export type { ScoutLeaderboardRow, ScoutSubmissionRow };

export async function fetchScoutLeaderboard(
  limit = 15,
): Promise<ScoutLeaderboardRow[]> {
  const res = await fetch(`/api/scout/leaderboard?limit=${limit}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { leaderboard: ScoutLeaderboardRow[] };
  return data.leaderboard || [];
}

export async function fetchScoutRecent(limit = 10): Promise<ScoutSubmissionRow[]> {
  const res = await fetch(`/api/scout/recent?limit=${limit}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { submissions: ScoutSubmissionRow[] };
  return data.submissions || [];
}

export async function submitScoutCall(input: {
  wallet: string;
  missionId: string;
  projectId: string;
  analysis: string;
  evidenceUrl?: string;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<{
  ok: boolean;
  already?: boolean;
  error?: string;
  rewardXp?: number;
  earlyCall?: boolean;
  submission?: ScoutSubmissionRow;
}> {
  const updatedAt = Date.now();
  let signature = '';
  try {
    if (!input.signMessage) {
      return { ok: false, error: 'Wallet signature required' };
    }
    const msg = scoutSubmitMessage({
      wallet: input.wallet,
      missionId: input.missionId,
      projectId: input.projectId,
      updatedAt,
    });
    const sig = await input.signMessage(new TextEncoder().encode(msg));
    signature = bs58.encode(sig);
  } catch {
    return { ok: false, error: 'Wallet declined to sign Scout call' };
  }

  const res = await fetch('/api/scout/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet: input.wallet,
      missionId: input.missionId,
      projectId: input.projectId,
      analysis: input.analysis,
      evidenceUrl: input.evidenceUrl,
      updatedAt,
      signature,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    already?: boolean;
    error?: string;
    rewardXp?: number;
    earlyCall?: boolean;
    submission?: ScoutSubmissionRow;
  };
  if (!res.ok) {
    return { ok: false, error: data.error || `Submit failed (${res.status})` };
  }
  return {
    ok: true,
    already: data.already,
    rewardXp: data.rewardXp,
    earlyCall: data.earlyCall,
    submission: data.submission,
  };
}
