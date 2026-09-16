import { useCallback, useEffect, useMemo, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { SOL_MINT } from '../data/curatedTokens';

const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const TOKEN_2022_PROGRAM = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

export type OnchainBalances = {
  balances: Record<string, number>;
  loading: boolean;
  reload: () => Promise<void>;
};

async function collectTokenBalances(
  connection: Connection,
  owner: PublicKey,
  programId: PublicKey,
  wanted: Set<string>,
  into: Record<string, number>,
) {
  const resp = await connection.getParsedTokenAccountsByOwner(owner, { programId });
  for (const { account } of resp.value) {
    const info = account.data.parsed?.info;
    const mint = String(info?.mint || '');
    if (!wanted.has(mint)) continue;
    const ui = Number(info?.tokenAmount?.uiAmount ?? 0);
    if (!Number.isFinite(ui)) continue;
    into[mint] = (into[mint] || 0) + ui;
  }
}

export function useOnchainBalances(mints: string[], refreshToken = 0): OnchainBalances {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const mintKey = useMemo(() => [...new Set(mints)].sort().join(','), [mints]);

  const reload = useCallback(async () => {
    if (!publicKey) {
      setBalances({});
      return;
    }
    const wanted = new Set<string>(mintKey.split(',').filter(Boolean));
    setLoading(true);
    try {
      const next: Record<string, number> = {};
      const lamports = await connection.getBalance(publicKey, 'confirmed');
      next[SOL_MINT] = lamports / LAMPORTS_PER_SOL;
      await collectTokenBalances(connection, publicKey, TOKEN_PROGRAM, wanted, next);
      try {
        await collectTokenBalances(connection, publicKey, TOKEN_2022_PROGRAM, wanted, next);
      } catch {
        /* Token-2022 optional */
      }
      setBalances(next);
    } catch {
      setBalances({});
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, mintKey]);

  useEffect(() => {
    void reload();
  }, [reload, refreshToken]);

  return { balances, loading, reload };
}
