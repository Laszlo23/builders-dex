import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildPublicStatus, type BuildPublicStatus } from '../data/buildToken';
import { neonLevel, type SquareLoopPhase } from '../data/squareLoop';
import {
  listedSquareLoop,
  loadSquareLoopStore,
  mutateSquareLoop,
  saveSquareLoopStore,
  squareLoopEntry,
  type SquareLoopStore,
} from '../lib/squareLoop';
import {
  chainActivate,
  chainClaimFees,
  chainExitStall,
  chainPark,
  chainRequestUnpark,
  chainSyncFees,
  chainTakeStall,
  chainUnpark,
  loadSquareLoopChain,
  squareLoopContractsReady,
} from '../lib/squareLoopChain';

export type SquareLoopAction =
  | 'activate'
  | 'park'
  | 'stall'
  | 'unpark-request'
  | 'unpark'
  | 'exit-stall'
  | 'claim';

function applyVerb(
  store: SquareLoopStore,
  tokenId: number,
  action: SquareLoopAction,
): SquareLoopStore {
  if (action === 'claim') return store;
  return mutateSquareLoop(store, tokenId, action);
}

export function useSquareLoop(tokenId: number | null) {
  const [store, setStore] = useState<SquareLoopStore>(() => loadSquareLoopStore());
  const [status, setStatus] = useState<BuildPublicStatus>(() => buildPublicStatus());
  const [busy, setBusy] = useState<SquareLoopAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const [earnedWei, setEarnedWei] = useState('0');

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch('/api/build/status')
        .then((res) => res.json())
        .then((payload: BuildPublicStatus & { error?: string }) => {
          if (cancelled || payload.error) return;
          setStatus((prev) => {
            const address = payload.token.address ?? prev.token.address;
            return {
            ...payload,
            token: {
              ...prev.token,
              ...payload.token,
              address,
              status: address ? 'live' : 'planned',
              origin: payload.token.origin ?? prev.token.origin,
              bankrTokenUrl: payload.token.bankrTokenUrl ?? prev.token.bankrTokenUrl,
              bankrTradeUrl: payload.token.bankrTradeUrl ?? prev.token.bankrTradeUrl,
              dexscreenerUrl: payload.token.dexscreenerUrl ?? prev.token.dexscreenerUrl,
              deployTx: payload.token.deployTx ?? prev.token.deployTx,
              implementation: payload.token.implementation ?? prev.token.implementation,
            },
            contracts: {
              activationRegistry:
                payload.contracts.activationRegistry ?? prev.contracts.activationRegistry,
              stallVault: payload.contracts.stallVault ?? prev.contracts.stallVault,
              feeSplitter: payload.contracts.feeSplitter ?? prev.contracts.feeSplitter,
            },
            };
          });
        })
        .catch(() => {
          /* keep local planned snapshot */
        });
    };
    load();
    const id = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (tokenId == null || !squareLoopContractsReady()) return;
    let cancelled = false;
    loadSquareLoopChain(tokenId)
      .then((snap) => {
        if (cancelled || !snap) return;
        setEarnedWei(snap.earnedWei);
        setStore((prev) => {
          const next = {
            squares: { ...prev.squares, [String(tokenId)]: snap.entry },
          };
          saveSquareLoopStore(next);
          return next;
        });
      })
      .catch(() => {
        /* keep local preview if the RPC hiccups */
      });
    return () => {
      cancelled = true;
    };
  }, [tokenId]);

  const persist = useCallback((next: SquareLoopStore) => {
    saveSquareLoopStore(next);
    setStore(next);
  }, []);

  const entry = useMemo(
    () => (tokenId == null ? null : squareLoopEntry(store, tokenId)),
    [store, tokenId],
  );

  const listed = useMemo(() => listedSquareLoop(store), [store]);

  const phase: SquareLoopPhase = entry?.phase ?? 'dormant';
  const neon = neonLevel({
    phase,
    parkedAt: entry?.parkedAt ?? null,
  });

  const run = useCallback(
    async (action: SquareLoopAction): Promise<boolean> => {
      if (tokenId == null) {
        setError('Load a Square token id first.');
        return false;
      }
      setError(null);
      setBusy(action);
      try {
        if (squareLoopContractsReady()) {
          let hash = '';
          switch (action) {
            case 'activate':
              hash = await chainActivate(tokenId);
              break;
            case 'park':
              hash = await chainPark(tokenId);
              try {
                hash = await chainSyncFees(tokenId);
              } catch {
                /* splitter join is optional until fees exist */
              }
              break;
            case 'stall':
              hash = await chainTakeStall(tokenId);
              break;
            case 'unpark-request':
              hash = await chainRequestUnpark(tokenId);
              break;
            case 'unpark':
              hash = await chainUnpark(tokenId);
              try {
                hash = await chainSyncFees(tokenId);
              } catch {
                /* splitter leave is optional until fees exist */
              }
              break;
            case 'exit-stall':
              hash = await chainExitStall(tokenId);
              break;
            case 'claim':
              hash = await chainClaimFees(tokenId);
              break;
            default: {
              const _exhaustive: never = action;
              throw new Error(String(_exhaustive));
            }
          }
          setTx(hash);
        } else if (action === 'claim') {
          throw new Error('Fee splitter is not on-chain yet. This week’s fees are 0.');
        }
        persist(applyVerb(store, tokenId, action));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Square loop action failed');
        return false;
      } finally {
        setBusy(null);
      }
    },
    [persist, store, tokenId],
  );

  return {
    store,
    status,
    entry,
    listed,
    phase,
    neon,
    busy,
    error,
    tx,
    run,
    feesThisWeek: earnedWei !== '0' ? earnedWei : status.feesThisWeekWei || '0',
    contractsReady: squareLoopContractsReady(),
  };
}
