/**
 * Share Helper — native share API + clipboard fallback with witty copy
 */

import { Project } from '../types';

export interface ShareData {
  text: string;
  url: string;
}

const SHARE_TEMPLATES = [
  'I discovered {name} — Builder Score™ {score}/100. Real builders, real code. {url}',
  'Found a gem: {name} (Score: {score}/100). This one ships. {url}',
  'Proof of Building™: {name} — {score}/100 on the Builder Score. Check it out: {url}',
  '{name} is building for real. Score: {score}/100. No vibes, just commits. {url}',
  'Scout report: {name} earned {score}/100. Reputation first. {url}',
];

function pickRandomTemplate(): string {
  return SHARE_TEMPLATES[Math.floor(Math.random() * SHARE_TEMPLATES.length)];
}

export function generateShareText(project: Project): string {
  const template = pickRandomTemplate();
  const score = project.builderScore.overall;
  const url = `https://dex.buildingcultureid.space/project-detail?id=${project.id}`;

  return template
    .replace('{name}', project.name)
    .replace('{score}', score.toString())
    .replace('{url}', url);
}

export function generateShareUrl(project: Project): string {
  return `https://dex.buildingcultureid.space/project-detail?id=${project.id}`;
}

export async function shareProject(project: Project): Promise<boolean> {
  const text = generateShareText(project);
  const url = generateShareUrl(project);

  if (navigator.share) {
    try {
      await navigator.share({
        text,
        url,
      });
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return false;
      }
      console.error('Share failed:', error);
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Clipboard write failed:', error);
    return false;
  }
}
