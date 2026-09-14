import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

const MAX_RETRIES = 2;

/**
 * Error boundary that catches lazy-load chunk failures and automatically retries.
 * This fixes the issue where pages don't load on first visit but work on reload.
 */
export class ErrorBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    // Detect chunk loading errors (lazy route failures, including HTML served as JS)
    const errorMessage = String(error?.message || '').toLowerCase();
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      errorMessage.includes('failed to fetch dynamically imported module') ||
      errorMessage.includes('importing a module script failed') ||
      errorMessage.includes('error loading dynamically imported module') ||
      errorMessage.includes("unexpected token '<'") ||
      errorMessage.includes('mime type') ||
      errorMessage.includes('text/html') ||
      errorMessage.includes('failed to load module script');

    if (isChunkError && this.state.retryCount < MAX_RETRIES) {
      console.warn(
        `[ErrorBoundary] Chunk load failed, retrying... (${this.state.retryCount + 1}/${MAX_RETRIES})`
      );
      
      // Wait a bit, then retry by resetting the error boundary
      this.retryTimeout = setTimeout(() => {
        this.setState((prevState) => ({
          hasError: false,
          error: null,
          retryCount: prevState.retryCount + 1,
        }));
        this.props.onReset?.();
      }, 300);
    } else if (isChunkError && this.state.retryCount >= MAX_RETRIES) {
      // Auto-reload once per session to recover from chunk/HTML mismatch
      const storageKey = 'buildersdex.chunkReload';
      const hasReloaded = sessionStorage.getItem(storageKey);
      
      if (!hasReloaded) {
        console.warn('[ErrorBoundary] Auto-reloading to clear stale chunk state...');
        sessionStorage.setItem(storageKey, '1');
        window.location.reload();
      }
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleManualRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
    });
    this.props.onReset?.();
  };

  handleHardReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If we've exhausted retries, show a manual retry UI
      if (this.state.retryCount >= MAX_RETRIES) {
        return (
          this.props.fallback || (
            <div className="flex min-h-[50vh] items-center justify-center px-4">
              <div className="w-full max-w-md space-y-4 rounded-2xl border border-accent/20 bg-surface/50 p-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-accent">
                  Loading Error
                </h3>
                <p className="text-xs leading-relaxed text-steel">
                  This page failed to load. Please check your connection and try again.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={this.handleManualRetry}
                    className="flex-1 rounded-xl border border-accent/30 py-2.5 text-xs font-bold text-accent hover:bg-accent/10 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={this.handleHardReload}
                    className="flex-1 rounded-xl bg-accent py-2.5 text-xs font-bold text-ink hover:bg-accent-bright transition-colors"
                  >
                    Hard Reload
                  </button>
                </div>
              </div>
            </div>
          )
        );
      }

      // Auto-retry in progress, show loading state
      return (
        <div className="flex min-h-[40vh] items-center justify-center px-4" role="status" aria-label="Loading">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        </div>
      );
    }

    return this.props.children;
  }
}
