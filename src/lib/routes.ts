/** Valid in-app routes for navigation targets */
export const APP_ROUTES = [
  'landing',
  'explore',
  'project-detail',
  'swap',
  'apply',
  'launch',
  'launchpad',
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
] as const;

export type AppRoute = (typeof APP_ROUTES)[number];

export const APP_ROUTE_SET = new Set<string>(APP_ROUTES);

/** Legacy route aliases that map to current routes */
const ROUTE_ALIASES: Record<string, AppRoute> = {
  intelligence: 'ai',
  passport: 'profile',
  rankings: 'builders',
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
  fallback: AppRoute = 'landing'
): void {
  if (isAppRoute(path)) {
    setCurrentPath(path);
    syncUrlToPath(path);
    return;
  }
  console.warn(`[nav] unknown route "${path}" → ${fallback}`);
  setCurrentPath(fallback);
  syncUrlToPath(fallback);
}

function syncUrlToPath(path: AppRoute): void {
  if (typeof window === 'undefined') return;
  if (path === 'tg-vote') return;
  
  const url = path === 'landing' ? '/' : `/${path}`;
  if (window.location.pathname !== url) {
    window.history.pushState(null, '', url);
  }
}

export function getPathFromUrl(): string {
  if (typeof window === 'undefined') return 'landing';
  
  const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  const q = new URLSearchParams(window.location.search);
  
  if (window.location.pathname === '/tg' || hash === 'tg-vote' || q.get('app') === 'vote') {
    return 'tg-vote';
  }
  
  if (window.Telegram?.WebApp?.initData) return 'tg-vote';
  
  if (!path || path === 'index.html') return 'landing';
  
  const resolved = resolveRoute(path);
  if (resolved) {
    // If this is an alias, redirect to the canonical URL
    if (path !== resolved && path in ROUTE_ALIASES) {
      const canonicalUrl = resolved === 'landing' ? '/' : `/${resolved}`;
      window.history.replaceState(null, '', canonicalUrl);
    }
    return resolved;
  }
  
  return 'landing';
}
