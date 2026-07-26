/** Shared message formats for wallet signatures (client + server) */

export function passportSyncMessage(wallet: string, updatedAt: number): string {
  return `Builders DEX Passport\nWallet: ${wallet}\nUpdated: ${updatedAt}`;
}

export function scoutSubmitMessage(input: {
  wallet: string;
  missionId: string;
  projectId: string;
  updatedAt: number;
}): string {
  return `Builders DEX Scout\nWallet: ${input.wallet}\nMission: ${input.missionId}\nProject: ${input.projectId}\nUpdated: ${input.updatedAt}`;
}

export function upvoteMessage(input: {
  wallet: string;
  projectId: string;
  updatedAt: number;
}): string {
  return `Builders DEX Upvote\nWallet: ${input.wallet}\nProject: ${input.projectId}\nUpdated: ${input.updatedAt}`;
}
