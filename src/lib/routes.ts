/** Valid in-app routes for navigation targets */
export const APP_ROUTES = [
  'landing',
  'explore',
  'project-detail',
  'swap',
  'apply',
  'launch',
  'launchpad',
  'raise',
  'team',
  'blog',
  'terms',
  'privacy',
  'imprint',
  'contact',
  'feedback',
  'support',
  'faq',
  'mission',
  'vision',
  'roadmap',
  'manifesto',
  'story',
  'guide',
  'builders',
  'dao',
  'earn',
  'terminal',
  'ai',
  'profile',
  'campaign',
  'investor',
  'builder-graph',
  'builder-stories',
  'telegram-bot',
  'tg-vote',
  'review',
  'aura',
  'hood',
  'hoodstreet',
  'ccff00',
  'build',
  'cubes',
  'coming-soon',
] as const;

export type AppRoute = (typeof APP_ROUTES)[number];

export const APP_ROUTE_SET = new Set<string>(APP_ROUTES);

/** Extra query/path state kept in the address bar */
export type NavState = {
  projectId?: string | null;
  blogSlug?: string | null;
  raiseId?: string | null;
  buy?: string | null;
  stall?: string | null;
};

/** Legacy route aliases that map to current routes */
const ROUTE_ALIASES: Record<string, AppRoute> = {
  intelligence: 'ai',
  passport: 'profile',
  rankings: 'builders',
  graph: 'builder-graph',
  stories: 'builder-stories',
  'aura-live': 'aura',
  bridge: 'hood',
  'cubes-live': 'cubes',
  'hood-street': 'hoodstreet',
  hoodstreet: 'hoodstreet',
  neon: 'ccff00',
  'my-neon': 'ccff00',
  myneon: 'ccff00',
  build: 'build',
  '$build': 'build',
};

export function isAppRoute(path: string): path is AppRoute {
  return APP_ROUTE_SET.has(path);
}

/** Resolve a path to its canonical route (handles aliases) */
function resolveRoute(path: string): AppRoute | null {
  if (isAppRoute(path)) return path;
  if (path in ROUTE_ALIASES) return ROUTE_ALIASES[path];
  return null;
}

export function safeNavigate(
  path: string,
  setCurrentPath: (path: string) => void,
  fallback: AppRoute = 'landing',
  state?: NavState,
): void {
  if (isAppRoute(path)) {
    setCurrentPath(path);
    syncUrlToPath(path, state);
    return;
  }
  console.warn(`[nav] unknown route "${path}" → coming-soon`);
  try {
    sessionStorage.setItem('bdx_coming_soon', path);
  } catch {
    /* ignore */
  }
  setCurrentPath('coming-soon');
  syncUrlToPath('coming-soon', state);
}

function readSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

/** Project id from `?id=` or `?project=` (share + legacy). */
export function getProjectIdFromSearch(search?: string): string | null {
  const q =
    search != null
      ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      : readSearchParams();
  const raw = (q.get('id') || q.get('project') || '').trim();
  return raw || null;
}

export function getProjectIdFromUrl(): string | null {
  return getProjectIdFromSearch();
}

export function getRaiseIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
  if (path !== 'raise') return null;
  return getProjectIdFromSearch();
}

export function getBlogSlugFromPathname(pathname?: string): string | null {
  const raw =
    pathname ?? (typeof window === 'undefined' ? '' : window.location.pathname);
  const match = raw.replace(/\/$/, '').match(/^\/blog\/([^/?#]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getBlogSlugFromUrl(): string | null {
  return getBlogSlugFromPathname();
}

/** Canonical story URL path used in the address bar and share links. */
export function projectExplorePath(projectId: string): string {
  return `/explore?id=${encodeURIComponent(projectId)}`;
}

export function syncUrlToPath(path: AppRoute, state?: NavState): void {
  if (typeof window === 'undefined') return;
  if (path === 'tg-vote') return;

  const next = hrefForRoute(path, {
    projectId: state?.projectId ?? (path === 'project-detail' ? getProjectIdFromUrl() : null),
    blogSlug: state?.blogSlug ?? (path === 'blog' ? getBlogSlugFromUrl() : null),
    raiseId: state?.raiseId ?? (path === 'raise' ? getRaiseIdFromUrl() : null),
    buy: state?.buy ?? (path === 'ccff00' ? new URLSearchParams(window.location.search).get('buy') : null),
    stall: state?.stall ?? (path === 'ccff00' ? new URLSearchParams(window.location.search).get('stall') : null),
  });

  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== next) {
    window.history.pushState(null, '', next);
  }
}

export function hrefForRoute(path: AppRoute, state?: NavState): string {
  if (path === 'landing') return '/';
  if (path === 'project-detail') {
    const id = state?.projectId;
    return id ? projectExplorePath(id) : '/explore';
  }
  if (path === 'raise') {
    const id = state?.raiseId || state?.projectId;
    return id ? `/raise?id=${encodeURIComponent(id)}` : '/raise';
  }
  if (path === 'blog' && state?.blogSlug) {
    return `/blog/${encodeURIComponent(state.blogSlug)}`;
  }
  if (path === 'builder-graph') return '/graph';
  if (path === 'builder-stories') return '/stories';
  if (path === 'ccff00') {
    const params = new URLSearchParams();
    if (state?.buy) params.set('buy', state.buy);
    if (state?.stall) params.set('stall', state.stall);
    const q = params.toString();
    return q ? `/ccff00?${q}` : '/ccff00';
  }
  return `/${path}`;
}

export function getPathFromUrl(): string {
  if (typeof window === 'undefined') return 'landing';

  const pathname = window.location.pathname;
  const path = pathname.replace(/^\//, '').replace(/\/$/, '');
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  const q = new URLSearchParams(window.location.search);

  if (pathname === '/tg' || hash === 'tg-vote' || q.get('app') === 'vote') {
    return 'tg-vote';
  }

  if (window.Telegram?.WebApp?.initData) return 'tg-vote';

  if (!path || path === 'index.html') return 'landing';

  const blogSlug = getBlogSlugFromPathname(pathname);
  if (blogSlug) return 'blog';

  const projectId = getProjectIdFromSearch();
  if (path === 'explore' && projectId) {
    return 'project-detail';
  }

  const resolved = resolveRoute(path);
  if (resolved) {
    if (path !== resolved && path in ROUTE_ALIASES) {
      window.history.replaceState(null, '', hrefForRoute(resolved));
    }
    if (resolved === 'project-detail' && projectId) {
      const canonical = projectExplorePath(projectId);
      const current = `${window.location.pathname}${window.location.search}`;
      if (current !== canonical) {
        window.history.replaceState(null, '', canonical);
      }
    }
    return resolved;
  }

  try {
    sessionStorage.setItem('bdx_coming_soon', path);
  } catch {
    /* ignore */
  }
  return 'coming-soon';
}
