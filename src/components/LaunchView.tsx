import React, { useState } from 'react';
import { CheckCircle2, FilePlus2 } from 'lucide-react';
import { UserWallet } from '../types';
import ProjectSubmitForm from './ProjectSubmitForm';
import { submitApplication } from '../lib/submitApplication';

interface LaunchViewProps {
  wallet: UserWallet;
  onLaunch: (projectId: string) => void;
  connectWallet: () => void;
  setCurrentPath?: (path: string) => void;
  walletAddress?: string;
}

export default function LaunchView({
  wallet,
  onLaunch,
  connectWallet,
  setCurrentPath,
  walletAddress,
}: LaunchViewProps) {
  const [submitted, setSubmitted] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-white">
        <div className="pulse-card rounded-3xl border border-accent/30 bg-surface p-10">
          <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-4 font-display text-2xl font-bold">Application received</h1>
          <p className="mt-3 text-sm text-steel">
            You’re in the review queue. Your team is visible as{' '}
            <span className="text-accent">in review</span> — not tradeable, and not a share mint
            yet. We’ll curate you onto Explore after Proof of Building™.
          </p>
          {confirmationId && (
            <p className="mt-2 font-mono text-xs text-steel/70">
              Reference: <span className="text-accent">{confirmationId}</span>
              {projectId ? ` · listing ${projectId}` : ''}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {setCurrentPath && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentPath('explore')}
                  className="rounded-full bg-accent px-5 py-3 text-sm font-bold text-ink hover:bg-accent-bright active:scale-95 min-h-[48px]"
                >
                  See Explore (include pending)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPath('profile')}
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold hover:border-accent/40 hover:bg-white/5 active:scale-95 min-h-[48px]"
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
        List your project
      </h1>
      <p className="mt-2 max-w-xl text-sm text-steel">
        One packet. We review Proof of Building™. Approved teams show on Explore; share NFTs open
        after inspection — not at submit.
      </p>

      {submitError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">
            <strong>Error:</strong> {submitError}
          </p>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="mt-2 text-xs text-red-300 underline hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

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
          isSubmitting={isSubmitting}
          onSubmit={async (p) => {
            setSubmitError(null);
            setIsSubmitting(true);
            try {
              const result = await submitApplication(p, walletAddress);
              onLaunch(result.projectId);
              setConfirmationId(result.id);
              setProjectId(result.projectId);
              setSubmitted(true);
            } catch (error) {
              setSubmitError(
                error instanceof Error ? error.message : 'Network error. Please try again.',
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      </div>
    </div>
  );
}
