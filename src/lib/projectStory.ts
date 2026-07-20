import { Project } from '../types';

export type StoryChapter = {
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
};

/** Editorial blog chapters from project fields — vision, problem, journey */
export function storyChaptersFor(project: Project): StoryChapter[] {
  return [
    {
      id: 'problem',
      eyebrow: 'The problem',
      title: 'What the world gets wrong',
      body: [
        project.problem,
        `In a market flooded with tokens, ${project.name} started from a harder question: can this be verified, used, and trusted — before anyone asks for liquidity?`,
      ],
    },
    {
      id: 'vision',
      eyebrow: 'The vision',
      title: 'What they are building toward',
      body: [
        project.tagline,
        project.description,
        project.whySelected
          ? `Why Builders DEX selected them: “${project.whySelected}”`
          : `${project.name} is still earning its place in the reputation graph.`,
      ],
    },
    {
      id: 'founders',
      eyebrow: 'The builders',
      title: 'Who is shipping it',
      body: [
        project.builderStory,
        project.team.length
          ? `Core team: ${project.team.map((t) => `${t.name} (${t.role})`).join(' · ')}.`
          : 'The founding team is still assembling public identity.',
      ],
    },
    {
      id: 'journey',
      eyebrow: 'The journey',
      title: `${project.foundedYear} → ${project.journey}`,
      body: [
        `Founded in ${project.foundedYear} on ${project.chain}. Category: ${project.category}.`,
        project.communityMilestones?.length
          ? `Milestones: ${project.communityMilestones.join(' · ')}.`
          : 'Public milestones are still accumulating on-chain and in the open.',
        project.aiAnalysis?.summary ||
          'Builder Intelligence™ continues to monitor quality, market fit, and risk as the product ships.',
      ],
    },
  ];
}

export function storyReadingMinutes(project: Project): number {
  const words = [
    project.problem,
    project.description,
    project.builderStory,
    project.tagline,
    project.whySelected,
  ]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(3, Math.min(12, Math.round(words / 180) + 2));
}
