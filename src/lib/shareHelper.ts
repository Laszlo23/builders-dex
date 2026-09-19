/**
 * Share helper — one URL, UTM, scout referral, native share, X compose.
 */

import { BUILDING_CULTURE_HANDLE } from '../data/tradeShare';
import { Project } from '../types';
import { SITE_URL } from './seo';
import { projectExplorePath } from './routes';
import { getOrCreateScoutCode } from './referral';

export type ShareMedium = 'native' | 'x' | 'copy';

export interface ShareData {
  text: string;
  url: string;
}

const BARE_SITE_LINE =
  /(?:^|\n)(?:https?:\/\/(?:www\.)?)?dex\.buildingcultureid\.space\/?\s*$/gim;

const SHARE_TEMPLATES = [
  'I just locked a discovery on Builders DEX: {name} · Builder Score™ {score}/100. Who deserves to win.',
  'Signal fired ↗ {name} scored {score}/100 Proof of Building™. Reputation before liquidity.',
  'Scout pulse: {name} is shipping. Score {score}/100. The place where Web3 discovers who deserves to win.',
  '{name} · {score}/100. Not a chart. A builder. Discover them early.',
  'Future note: I found {name} before the crowd. Builder Score™ {score}. Join the reputation layer.',
];

function pickRandomTemplate(): string {
  return SHARE_TEMPLATES[Math.floor(Math.random() * SHARE_TEMPLATES.length)];
}

export function withUtm(url: string, medium: ShareMedium): string {
  const parsed = new URL(url, SITE_URL);
  parsed.searchParams.set('utm_source', 'share');
  parsed.searchParams.set('utm_medium', medium);
  const code = getOrCreateScoutCode();
  if (code) parsed.searchParams.set('ref', code);
  return parsed.toString();
}

export function absoluteSiteUrl(pathAndQuery: string): string {
  if (pathAndQuery.startsWith('http')) return pathAndQuery;
  return `${SITE_URL}${pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`}`;
}

export function generateShareUrl(project: Project, medium: ShareMedium = 'copy'): string {
  return withUtm(absoluteSiteUrl(projectExplorePath(project.id)), medium);
}

export function generateShareText(project: Project): string {
  const template = pickRandomTemplate();
  const score = project.builderScore.overall;
  return template.replace('{name}', project.name).replace('{score}', score.toString());
}

export function campaignShareUrl(
  medium: ShareMedium = 'copy',
  opts?: { meme?: string },
): string {
  const path = opts?.meme
    ? `/campaign?meme=${encodeURIComponent(opts.meme)}`
    : '/campaign';
  return withUtm(absoluteSiteUrl(path), medium);
}

/** Ready-to-post body: drop the bare site line so the scout URL is the only link. */
export function composeShareBody(copy: string, hashtags = ''): string {
  const text = copy.replace(BARE_SITE_LINE, '').trim();
  const tags = hashtags.trim();
  return tags ? `${text}\n\n${tags}` : text;
}

/** Insert the scout URL into the compose text so X shows it before they hit Post. */
export function withShareLink(text: string, url: string): string {
  const trimmed = text.trim();
  if (!url || trimmed.includes(url)) return trimmed;
  return `${trimmed}\n\n${url}`;
}

export function tradeShareUrl(medium: ShareMedium = 'copy'): string {
  return withUtm(absoluteSiteUrl('/swap'), medium);
}

export function twitterIntentUrl(text: string, url?: string): string {
  const parsed = new URL('https://twitter.com/intent/tweet');
  parsed.searchParams.set('text', text);
  if (url) parsed.searchParams.set('url', url);
  parsed.searchParams.set('via', BUILDING_CULTURE_HANDLE);
  return parsed.toString();
}

/** Opens X compose with copy + scout link already in the post. One tap to Post. */
export function openXIntent(text: string, url: string): void {
  window.open(twitterIntentUrl(text, url), '_blank', 'noopener,noreferrer');
}

export async function shareNativePayload(opts: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: opts.title,
        text: opts.text,
        url: opts.url,
      });
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') return false;
      console.error('Share failed:', error);
    }
  }

  try {
    await navigator.clipboard.writeText(`${opts.text}\n\n${opts.url}`);
    return true;
  } catch (error) {
    console.error('Clipboard write failed:', error);
    return false;
  }
}

export async function shareProject(project: Project): Promise<boolean> {
  return shareNativePayload({
    title: `${project.name} — Builders DEX`,
    text: generateShareText(project),
    url: generateShareUrl(project, 'native'),
  });
}

export function shareProjectOnX(project: Project): void {
  openXIntent(generateShareText(project), generateShareUrl(project, 'x'));
}

export async function copyShareLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

export { BUILDING_CULTURE_HANDLE };
