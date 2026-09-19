import { useEffect, useState } from 'react';
import { detectWalletHost, type WalletHost } from '../lib/walletHost';

export function useWalletHost(): WalletHost {
  const [host, setHost] = useState<WalletHost>(() => detectWalletHost());

  useEffect(() => {
    const refresh = () => setHost(detectWalletHost());
    const t = window.setTimeout(refresh, 350);
    window.addEventListener('ethereum#initialized', refresh);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('ethereum#initialized', refresh);
    };
  }, []);

  return host;
}
