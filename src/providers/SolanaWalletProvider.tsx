import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

/** Solana mainnet — override with a private RPC in prod (Helius / Alchemy / etc.). */
const DEFAULT_RPC = 'https://api.mainnet-beta.solana.com';

type Props = {
  children: React.ReactNode;
};

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

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
