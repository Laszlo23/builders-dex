import { ComponentType, lazy, LazyExoticComponent } from 'react';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Enhanced lazy() that retries failed chunk loads.
 * 
 * Fixes the "pages don't load the first time" bug where dynamic imports fail
 * initially but succeed on reload. Common causes:
 * - Network timing issues
 * - CDN cache misses
 * - Race conditions during hydration
 * - Asset hash mismatches after deploy
 * 
 * @param importFn - The dynamic import function, e.g. () => import('./MyComponent')
 * @returns A lazy-loaded component with automatic retry on failure
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let attempts = 0;

      const attemptLoad = () => {
        attempts++;

        importFn()
          .then(resolve)
          .catch((error) => {
            // Detect chunk loading errors
            const isChunkError =
              error?.name === 'ChunkLoadError' ||
              error?.message?.includes('Failed to fetch') ||
              error?.message?.includes('dynamically imported module') ||
              error?.message?.includes('Importing a module script failed');

            if (isChunkError && attempts < MAX_RETRY_ATTEMPTS) {
              console.warn(
                `[lazyWithRetry] Chunk load failed (attempt ${attempts}/${MAX_RETRY_ATTEMPTS}), retrying...`,
                error
              );

              // Wait before retrying
              setTimeout(attemptLoad, RETRY_DELAY_MS);
            } else {
              // Either not a chunk error, or we've exhausted retries
              if (isChunkError) {
                console.error(
                  `[lazyWithRetry] Chunk load failed after ${attempts} attempts, giving up.`,
                  error
                );
              }
              reject(error);
            }
          });
      };

      attemptLoad();
    });
  });
}
