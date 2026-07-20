import React, { useState } from 'react';
import { CheckCircle2, FilePlus2 } from 'lucide-react';
import { UserWallet, Project } from '../types';
import ProjectSubmitForm from './ProjectSubmitForm';

interface LaunchViewProps {
  wallet: UserWallet;
  onLaunch: (
    newProject: Omit<Project, 'id' | 'rating' | 'upvotes' | 'comments' | 'tokenPriceHistory'>
  ) => void;
  connectWallet: () => void;
  setCurrentPath?: (path: string) => void;
}

export default function LaunchView({
  wallet,
  onLaunch,
  connectWallet,
  setCurrentPath,
}: LaunchViewProps) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-white">
        <div className="pulse-card rounded-3xl border border-accent/30 bg-surface p-10">
          <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-4 font-display text-2xl font-bold">Application received</h1>
          <p className="mt-3 text-sm text-steel">
            Your hackathon-grade packet is <span className="text-accent">under review</span>. It
            will not become tradeable until Proof of Building™ passes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {setCurrentPath && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentPath('launchpad')}
                  className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-ink"
                >
                  View Launchpad
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPath('profile')}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold"
                >
                  Passport™
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-white sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Apply</p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Full builder application
      </h1>
      <p className="mt-2 max-w-xl text-sm text-steel">
        Same depth as a serious hackathon submission — demo, deck, tracks, stack, socials, and why
        you belong on the reputation layer.
      </p>

      <div className="pulse-card mt-8 rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-surface/90 p-6 md:p-8">
        <div className="mb-6 flex items-center gap-2">
          <FilePlus2 className="h-5 w-5 text-accent" />
          <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
            Application packet
          </p>
        </div>
        <ProjectSubmitForm
          founderName={wallet.connected ? wallet.address : 'Founder'}
          walletConnected={wallet.connected}
          onConnect={connectWallet}
          onSubmit={(p) => {
            onLaunch(p);
            setSubmitted(true);
          }}
        />
      </div>
    </div>
  );
}
