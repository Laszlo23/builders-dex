import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

/**
 * Prefer Passport display name → SNS .sol favorite domain → short address.
 */
export function useWalletDisplayName(passportName?: string): {
  label: string;
  shortAddress: string;
  domain: string | null;
  connected: boolean;
  address: string | null;
} {
  const { publicKey, connected } = useWallet();
  const address = publicKey?.toBase58() ?? null;
  const shortAddress = address ? truncateAddress(address) : '';
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setDomain(null);
      return;
    }
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      try {
        // Bonfida SNS — favorite domain for wallet (public proxy)
        const res = await fetch(
          `https://sns-sdk-proxy.bonfida.workers.dev/favorite-domain/${address}`,
          { signal: ctrl.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { domain?: string; result?: string };
        const name = data.domain || data.result;
        if (!cancelled && name && typeof name === 'string') {
          setDomain(name.endsWith('.sol') ? name : `${name}.sol`);
        }
      } catch {
        /* offline / CORS / no domain — fall through */
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [address]);

  const trimmedPassport = passportName?.trim() || '';
  const label = connected
    ? trimmedPassport || domain || shortAddress || 'Wallet'
    : 'Guest';

  return { label, shortAddress, domain, connected: !!connected, address };
}
