export type ScoutSubmissionRow = {
  id: number;
  wallet: string;
  missionId: string;
  projectId: string;
  analysis: string;
  evidenceUrl: string;
  rewardXp: number;
  earlyCall: boolean;
  createdAt: string;
  outcome30d?: string | null;
  outcome90d?: string | null;
  scoredAt30d?: string | null;
  scoredAt90d?: string | null;
};

export type ScoutLeaderboardRow = {
  wallet: string;
  displayName: string;
  scoutXp: number;
  submissionCount: number;
  earlyCalls: number;
  levelName: string;
  verified: boolean;
  /** Hit rate from scored 30d outcomes; null until enough outcomes exist */
  accuracyPct: number | null;
};
