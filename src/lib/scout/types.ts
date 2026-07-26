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
};

export type ScoutLeaderboardRow = {
  wallet: string;
  displayName: string;
  scoutXp: number;
  submissionCount: number;
  earlyCalls: number;
  levelName: string;
  verified: boolean;
};
