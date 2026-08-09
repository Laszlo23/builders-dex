import React, { useCallback, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  WalletError,
  WalletReadyState,
  type Adapter,
} from '@solana/wallet-adapter-base';
import '@solana/wallet-adapter-react-ui/styles.css';

/** Solana mainnet — override with a private RPC in prod (Helius / Alchemy / etc.). */
const DEFAULT_RPC = 'https://api.mainnet-beta.solana.com';
const WALLET_STORAGE_KEY = 'buildersdex.walletName';

type Props = {
  children: React.ReactNode;
};

function clearPersistedWallet(): void {
  try {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    // Legacy default key used by older adapter versions
    localStorage.removeItem('walletName');
  } catch {
    /* ignore */
  }
}

/**
 * Wallet Standard + Mobile Wallet Adapter only.
 * Do NOT register legacy PhantomWalletAdapter / SolflareWalletAdapter —
 * Solflare's SDK uses window.open('_blank') which breaks mobile Connect
 * (new tab/window). WalletProvider auto-merges standard wallets and injects
 * SolanaMobileWalletAdapter on Android.
 */
export default function SolanaWalletProvider({ children }: Props) {
  const endpoint = import.meta.env.VITE_SOLANA_RPC_URL || DEFAULT_RPC;
  const wallets = useMemo(() => [], []);

  const onError = useCallback((error: WalletError, adapter?: Adapter) => {
    console.warn('[wallet]', error.name, error.message, adapter?.name);
    // Stop infinite autoConnect retries when the stored wallet is gone / blocked
    if (
      error.name === 'WalletConnectionError' ||
      error.name === 'WalletNotReadyError' ||
      error.name === 'WalletDisconnectedError' ||
      error.name === 'WalletTimeoutError'
    ) {
      clearPersistedWallet();
    }
  }, []);

  const autoConnect = useCallback(async (adapter: Adapter) => {
    // Only auto-reconnect wallets that are already installed in the browser.
    // Loadable/NotDetected adapters cause endless connect attempts.
    return adapter.readyState === WalletReadyState.Installed;
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={autoConnect}
        localStorageKey={WALLET_STORAGE_KEY}
        onError={onError}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
