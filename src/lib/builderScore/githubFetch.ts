import type { GithubRepoSignals } from './types';
import { parseGithubRepo } from './compute';

type CacheEntry = { at: number; data: GithubRepoSignals | null; miss: boolean };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 45 * 60 * 1000;

export async function fetchGithubRepoSignals(
  repoRaw: string,
): Promise<GithubRepoSignals | null> {
  const parsed = parseGithubRepo(repoRaw);
  if (!parsed) return null;
  const key = `${parsed.owner}/${parsed.repo}`.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return hit.data;
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'BuildersDEX-ScorePipeline/2026.07.1',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers,
      signal: AbortSignal.timeout(12_000),
    });
    if (res.status === 404) {
      cache.set(key, { at: Date.now(), data: null, miss: true });
      return null;
    }
    if (!res.ok) {
      console.warn('[github]', key, res.status);
      // short-cache failures to avoid stampede
      cache.set(key, { at: Date.now() - TTL_MS + 60_000, data: null, miss: true });
      return null;
    }
    const j = (await res.json()) as {
      full_name: string;
      html_url: string;
      description: string | null;
      stargazers_count: number;
      forks_count: number;
      subscribers_count?: number;
      watchers_count?: number;
      open_issues_count: number;
      size: number;
      language: string | null;
      topics?: string[];
      created_at: string;
      pushed_at: string;
      archived: boolean;
      license?: { spdx_id?: string } | null;
    };
    const data: GithubRepoSignals = {
      fullName: j.full_name,
      htmlUrl: j.html_url,
      description: j.description,
      stars: j.stargazers_count || 0,
      forks: j.forks_count || 0,
      watchers: j.subscribers_count ?? j.watchers_count ?? 0,
      openIssues: j.open_issues_count || 0,
      sizeKb: j.size || 0,
      language: j.language,
      topics: j.topics || [],
      createdAt: j.created_at,
      pushedAt: j.pushed_at,
      archived: Boolean(j.archived),
      license: j.license?.spdx_id || null,
    };
    cache.set(key, { at: Date.now(), data, miss: false });
    return data;
  } catch (err) {
    console.warn('[github] fetch', key, err);
    return null;
  }
}
