import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { walletDeepLinks } from '../lib/walletHost';
import { useWalletHost } from '../hooks/useWalletHost';
import { loadEvmAccount } from '../lib/walletRoom';

const HIDE_KEY = 'bdx_hide_wallet_open';

export default function OpenInWalletBar() {
  const host = useWalletHost();
  const { connected } = useWallet();
  const evm = typeof window !== 'undefined' ? loadEvmAccount() : null;
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem(HIDE_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (hidden || host.inApp || connected || evm) return null;

  const links = walletDeepLinks();

  return (
    <div className="lg:hidden">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <p className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-steel">
          Open in
        </p>
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            rel="noopener noreferrer"
            className="inline-flex min-h-[40px] shrink-0 items-center rounded-full border border-white/15 bg-white/[0.06] px-3 text-[11px] font-semibold text-white active:scale-95"
          >
            {link.name}
          </a>
        ))}
        <button
          type="button"
          aria-label="Hide open in wallet"
          onClick={() => {
            setHidden(true);
            try {
              sessionStorage.setItem(HIDE_KEY, '1');
            } catch {
              /* ignore */
            }
          }}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-steel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
