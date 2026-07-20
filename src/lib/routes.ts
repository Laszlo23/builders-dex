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
] as const;

export type AppRoute = (typeof APP_ROUTES)[number];

export const APP_ROUTE_SET = new Set<string>(APP_ROUTES);

export function isAppRoute(path: string): path is AppRoute {
  return APP_ROUTE_SET.has(path);
}

export function safeNavigate(
  path: string,
  setCurrentPath: (path: string) => void,
  fallback: AppRoute = 'landing'
): void {
  if (isAppRoute(path)) {
    setCurrentPath(path);
    return;
  }
  console.warn(`[nav] unknown route "${path}" → ${fallback}`);
  setCurrentPath(fallback);
}
