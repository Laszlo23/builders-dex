import React, { useEffect, useState } from 'react';
import { X, Zap } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useNetwork } from '../providers/NetworkProvider';
import { CHAIN_LANES, type ChainLaneId } from '../data/chainLanes';
import { connectEvmAccount, connectHoodAccount } from '../lib/evmWallet';
import {
  loadEvmAccount,
  loadWalletRoom,
  saveEvmAccount,
  saveWalletRoom,
  shortenWallet,
} from '../lib/walletRoom';

type Props = {
  open: boolean;
  onClose: () => void;
  setCurrentPath: (path: string) => void;
};

export default function WalletRoomModal({ open, onClose, setCurrentPath }: Props) {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { network, setNetwork } = useNetwork();
  const [room, setRoom] = useState<ChainLaneId>(() => loadWalletRoom());
  const [evm, setEvm] = useState<string | null>(() => loadEvmAccount());
  const [busy, setBusy] = useState<ChainLaneId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRoom(loadWalletRoom());
    setEvm(loadEvmAccount());
    setError(null);
  }, [open]);

  if (!open) return null;

  const go = async (id: ChainLaneId) => {
    setError(null);
    setBusy(id);
    try {
      saveWalletRoom(id);
      setRoom(id);
      if (id === 'solana') {
        if (!connected) setVisible(true);
        setCurrentPath('swap');
        onClose();
        return;
      }
      const addr = id === 'hood' ? await connectHoodAccount() : await connectEvmAccount();
      saveEvmAccount(addr);
      setEvm(addr);
      setCurrentPath(id === 'hood' ? 'ccff00' : 'aura');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connect failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-3 sm:items-center">
      <button type="button" className="absolute inset-0" aria-label="Close rooms" onClick={onClose} />
      <div
        role="dialog"
        aria-labelledby="wallet-room-title"
        className="relative z-10 w-full max-w-lg rounded-3xl border border-white/12 bg-surface p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">
              Pick a room
            </p>
            <h2 id="wallet-room-title" className="font-display mt-1 text-2xl font-bold">
              Wallet and chain
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-steel">
              Solana is Phantom. Base and Hood are EVM — MetaMask, Rabby, or Robinhood Wallet.
              Do not mix them.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-steel hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-2">
          {CHAIN_LANES.map((lane) => {
            const on = room === lane.id;
            const ready =
              lane.id === 'solana'
                ? connected
                : Boolean(evm) && (lane.id !== 'hood' || room === 'hood' || Boolean(evm));
            return (
              <button
                key={lane.id}
                type="button"
                disabled={busy !== null}
                onClick={() => void go(lane.id)}
                className={`chain-lane-chip chain-lane-chip--${lane.id} ${on ? 'is-active' : ''}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                    {lane.label}
                  </span>
                  {ready && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase text-white">
                      Ready
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-left text-sm font-semibold text-white">
                  {lane.job}
                </span>
                <span className="mt-0.5 block text-left font-mono text-[10px] text-steel">
                  {lane.wallet} · {lane.chain}
                  {busy === lane.id ? ' · connecting…' : ''}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/5 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-steel">
            Connected
          </p>
          {connected && publicKey ? (
            <span className="rounded-full border border-accent/30 px-2.5 py-1 font-mono text-[10px] text-accent">
              Sol {shortenWallet(publicKey.toBase58())}
            </span>
          ) : (
            <span className="font-mono text-[10px] text-steel">Solana off</span>
          )}
          {evm ? (
            <span className="rounded-full border border-[#CCFF00]/30 px-2.5 py-1 font-mono text-[10px] text-[#CCFF00]">
              EVM {shortenWallet(evm)}
            </span>
          ) : (
            <span className="font-mono text-[10px] text-steel">EVM off</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNetwork(network === 'mainnet' ? 'devnet' : 'mainnet')}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] text-steel"
          >
            <Zap className="h-3 w-3" />
            Solana {network === 'mainnet' ? 'mainnet' : 'devnet'}
          </button>
          {connected && (
            <button
              type="button"
              onClick={() => void disconnect()}
              className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] text-steel"
            >
              Disconnect Solana
            </button>
          )}
          {evm && (
            <button
              type="button"
              onClick={() => {
                saveEvmAccount(null);
                setEvm(null);
              }}
              className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] text-steel"
            >
              Forget EVM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
