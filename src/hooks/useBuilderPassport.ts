/**
 * React Hook for Builder Passport
 * 
 * Fetches and manages builder passport data from the on-chain program.
 */

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  BuilderPassport,
  fetchBuilderPassport,
  derivePassportPDA,
} from '../lib/builderPassport';

interface UseBuilderPassportReturn {
  passport: BuilderPassport | null;
  passportPDA: PublicKey | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch builder passport for the connected wallet
 */
export function useBuilderPassport(): UseBuilderPassportReturn {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  
  const [passport, setPassport] = useState<BuilderPassport | null>(null);
  const [passportPDA, setPassportPDA] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPassport = async () => {
    if (!publicKey) {
      setPassport(null);
      setPassportPDA(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [pda] = derivePassportPDA(publicKey);
      setPassportPDA(pda);
      
      const passportData = await fetchBuilderPassport(connection, publicKey);
      setPassport(passportData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch passport'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassport();
  }, [publicKey, connection]);

  return {
    passport,
    passportPDA,
    loading,
    error,
    refetch: fetchPassport,
  };
}

/**
 * Hook to fetch builder passport for any wallet address
 */
export function useBuilderPassportByWallet(
  walletAddress: PublicKey | null
): UseBuilderPassportReturn {
  const { connection } = useConnection();
  
  const [passport, setPassport] = useState<BuilderPassport | null>(null);
  const [passportPDA, setPassportPDA] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPassport = async () => {
    if (!walletAddress) {
      setPassport(null);
      setPassportPDA(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [pda] = derivePassportPDA(walletAddress);
      setPassportPDA(pda);
      
      const passportData = await fetchBuilderPassport(connection, walletAddress);
      setPassport(passportData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch passport'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassport();
  }, [walletAddress, connection]);

  return {
    passport,
    passportPDA,
    loading,
    error,
    refetch: fetchPassport,
  };
}
