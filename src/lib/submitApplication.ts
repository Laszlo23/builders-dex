import type { Project } from '../types';

type SubmitPayload = Omit<Project, 'id' | 'rating' | 'upvotes' | 'comments' | 'tokenPriceHistory'>;

export type ApplicationSubmitResult = {
  id: string;
  projectId: string;
};

export async function submitApplication(
  project: SubmitPayload,
  wallet?: string,
): Promise<ApplicationSubmitResult> {
  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: project.name,
      ticker: project.ticker,
      problem: project.problem,
      description: project.description,
      contactEmail: project.application?.contactEmail,
      whyBuildersDex: project.application?.whyBuildersDex,
      wallet,
      tagline: project.tagline,
      category: project.category,
      chain: project.chain,
      githubRepo: project.githubRepo,
      goal: project.goal,
      journey: project.journey,
      builderStory: project.builderStory,
      demoUrl: project.application?.demoUrl,
      pitchDeckUrl: project.application?.pitchDeckUrl,
      videoUrl: project.application?.videoUrl,
      whitepaperUrl: project.application?.whitepaperUrl,
      hackathonName: project.application?.hackathonName,
      tracks: project.application?.tracks,
      techStack: project.application?.techStack,
      lookingFor: project.application?.lookingFor,
      teamSize: project.application?.teamSize,
      fundingStatus: project.application?.fundingStatus,
      previousLaunches: project.application?.previousLaunches,
      socials: project.application?.socials,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    id?: string;
    projectId?: string;
  };
  if (!response.ok) {
    throw new Error(body.error || 'Failed to submit application');
  }
  if (!body.id || !body.projectId) {
    throw new Error('Application saved without a listing id');
  }
  return { id: body.id, projectId: body.projectId };
}
