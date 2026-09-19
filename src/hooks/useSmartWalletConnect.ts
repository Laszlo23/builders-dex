import { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState, type WalletName } from '@solana/wallet-adapter-base';
import { connectEvmAccount } from '../lib/evmWallet';
import { saveEvmAccount, saveWalletRoom } from '../lib/walletRoom';
import { useWalletHost } from './useWalletHost';
import type { WalletHost } from '../lib/walletHost';

export type SmartConnectResult = 'solana' | 'evm' | 'picker';

async function connectInstalledSolana(
  wallets: ReturnType<typeof useWallet>['wallets'],
  select: (name: WalletName) => void,
  connect: () => Promise<void>,
  preferredNames: string[],
): Promise<void> {
  const installed = wallets.filter(
    (w) =>
      w.readyState === WalletReadyState.Installed ||
      w.readyState === WalletReadyState.Loadable,
  );
  if (installed.length === 0) {
    throw new Error('NO_SOLANA');
  }
  const lower = preferredNames.map((n) => n.toLowerCase());
  const match =
    installed.find((w) => lower.includes(w.adapter.name.toLowerCase())) ||
    installed.find((w) => lower.some((n) => w.adapter.name.toLowerCase().includes(n))) ||
    installed[0];
  if (!match) throw new Error('NO_SOLANA');
  select(match.adapter.name);
  await new Promise((r) => window.setTimeout(r, 40));
  await connect();
}

export function useSmartWalletConnect() {
  const host = useWalletHost();
  const { wallets, select, connect, connecting, connected } = useWallet();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectNow = useCallback(
    async (prefer: 'auto' | 'solana' | 'evm' = 'auto'): Promise<SmartConnectResult> => {
      setError(null);
      if (connected && prefer !== 'evm') return 'solana';

      const trySolana = prefer !== 'evm' && host.hasSolana;
      const tryEvm = prefer !== 'solana' && host.hasEvm;

      setBusy(true);
      try {
        if (trySolana) {
          try {
            await connectInstalledSolana(wallets, select, connect, host.solanaNames);
            saveWalletRoom('solana');
            return 'solana';
          } catch (err) {
            const noSolana = err instanceof Error && err.message === 'NO_SOLANA';
            if (!noSolana || !tryEvm) throw err;
          }
        }
        if (tryEvm) {
          const addr = await connectEvmAccount();
          saveEvmAccount(addr);
          saveWalletRoom(host.id === 'robinhood' ? 'hood' : 'base');
          return 'evm';
        }
        return 'picker';
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Connect failed';
        if (message === 'NO_SOLANA') {
          setError(null);
          return 'picker';
        }
        setError(message);
        return 'picker';
      } finally {
        setBusy(false);
      }
    },
    [connect, connected, host, select, wallets],
  );

  return { host, connectNow, connecting: connecting || busy, connected, error };
}

export function hostHint(host: WalletHost): string {
  if (host.inApp) return `You're in ${host.name}. One tap uses this wallet — no extra popup.`;
  if (host.hasSolana) return `${host.name} is ready on this device.`;
  if (host.hasEvm) return `${host.name} can sign Base and Hood.`;
  return 'Open this app inside Phantom, Solflare, MetaMask, Rainbow, Coinbase, or Trust.';
}
