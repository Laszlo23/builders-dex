import React, { createContext, useContext, useState, useEffect } from 'react';

export type SolanaNetwork = 'mainnet' | 'devnet';

interface NetworkContextValue {
  network: SolanaNetwork;
  setNetwork: (network: SolanaNetwork) => void;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

const NETWORK_STORAGE_KEY = 'buildersdex.network';

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetworkState] = useState<SolanaNetwork>(() => {
    try {
      const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
      return stored === 'devnet' ? 'devnet' : 'mainnet';
    } catch {
      return 'mainnet';
    }
  });

  const setNetwork = (newNetwork: SolanaNetwork) => {
    setNetworkState(newNetwork);
    try {
      localStorage.setItem(NETWORK_STORAGE_KEY, newNetwork);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
}
