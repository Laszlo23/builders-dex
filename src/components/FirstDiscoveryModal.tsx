import React, { useEffect, useState } from 'react';
import { Sparkles, X, ChevronRight, Award, Zap } from 'lucide-react';
import { FIRST_DISCOVERY_COPY } from '../data/builderEconomy';
import { GENESIS_PROJECT_IDS } from '../data/genesisBuilders';
import { Project } from '../types';
import { recordDiscovery } from '../lib/discoveryStreak';
import ConfettiEffect from './ConfettiEffect';
import DiscoveryStreakToast from './DiscoveryStreakToast';

type Props = {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  onPick: (projectId: string) => void;
  /** XP granted for completing first discovery (display) */
  rewardXp?: number;
};

type Step = 'welcome' | 'pick' | 'reward';

export default function FirstDiscoveryModal({
  open,
  onClose,
  projects,
  onPick,
  rewardXp = 100,
}: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStreakToast, setShowStreakToast] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [pickedName, setPickedName] = useState('');

  useEffect(() => {
    if (open) {
      setStep('welcome');
      setPickedId(null);
      setShowConfetti(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const picks =
    GENESIS_PROJECT_IDS.map((id) => projects.find((p) => p.id === id)).filter(
      (p): p is Project => Boolean(p),
    ).length > 0
      ? GENESIS_PROJECT_IDS.map((id) => projects.find((p) => p.id === id)).filter(
          (p): p is Project => Boolean(p),
        )
      : [...projects]
          .filter((p) => p.curation.status === 'curated')
          .sort((a, b) => b.builderScore.overall - a.builderScore.overall)
          .slice(0, 3);

  const handlePick = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const streakData = recordDiscovery();
    setCurrentStreak(streakData.currentStreak);
    setPickedId(projectId);
    setPickedName(project?.name || 'Builder');
    setShowConfetti(true);
    setShowStreakToast(true);
    setStep('reward');
  };

  const finish = () => {
    if (!pickedId) return;
    onPick(pickedId);
  };

  if (!open) return null;

  return (
    <>
      <ConfettiEffect trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <DiscoveryStreakToast
        streak={currentStreak}
        show={showStreakToast}
        onDismiss={() => setShowStreakToast(false)}
      />
      <div
        className="fixed inset-0 z-[120] flex items-end justify-center bg-black/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:items-center"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="relative flex max-h-[min(88dvh,42rem)] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] border border-accent/35 bg-gradient-to-b from-[#1a2210] via-ink to-ink shadow-[0_40px_120px_-40px_rgba(200,232,104,0.35)]"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="first-discovery-title"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
          />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-full p-2 text-steel hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative overflow-y-auto overscroll-contain p-6 sm:p-8">
            {/* Progress dots */}
            <div className="mb-6 flex gap-1.5">
              {(['welcome', 'pick', 'reward'] as Step[]).map((s) => (
                <span
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    step === s
                      ? 'bg-accent'
                      : ['welcome', 'pick', 'reward'].indexOf(step) >
                          ['welcome', 'pick', 'reward'].indexOf(s)
                        ? 'bg-accent/50'
                        : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {step === 'welcome' && (
              <div className="animate-[fadeIn_0.4s_ease]">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                  Onboarding · 01
                </p>
                <h2
                  id="first-discovery-title"
                  className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
                >
                  {FIRST_DISCOVERY_COPY.title}
                </h2>
                <div className="mt-4 space-y-2">
                  {FIRST_DISCOVERY_COPY.lines.map((line) => (
                    <p key={line} className="text-sm leading-relaxed text-white/85 sm:text-base">
                      {line}
                    </p>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3">
                  <Zap className="h-4 w-4 shrink-0 text-accent" />
                  <p className="font-mono text-[11px] text-accent">
                    Complete this → +{rewardXp} XP · Scout Initiate badge
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('pick')}
                  className="btn-sheen mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-4 text-sm font-bold text-ink active:scale-[0.98] min-h-[56px]"
                >
                  Enter the reputation layer
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {step === 'pick' && (
              <div className="animate-[fadeIn_0.35s_ease]">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                  Onboarding · 02
                </p>
                <h2 className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Choose your first signal
                </h2>
                <p className="mt-2 text-sm text-steel">
                  Tap a builder. You&apos;ll open their story and start your discovery streak.
                </p>
                <ul className="mt-5 space-y-2">
                  {picks.map((p, i) => (
                    <li
                      key={p.id}
                      style={{ animationDelay: `${i * 80}ms` }}
                      className="animate-[fadeIn_0.4s_ease_both]"
                    >
                      <button
                        type="button"
                        onClick={() => handlePick(p.id)}
                        className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:border-accent/50 hover:bg-accent/[0.08] hover:shadow-[0_0_24px_-8px_rgba(200,232,104,0.5)] active:scale-[0.99] min-h-[60px]"
                      >
                        <div>
                          <p className="font-semibold text-white group-hover:text-accent">{p.name}</p>
                          <p className="mt-0.5 text-xs text-steel">{p.tagline}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 font-mono text-xs font-bold text-accent">
                          {p.githubRepo && p.githubRepo !== '—' ? p.githubRepo : 'Catalog'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {step === 'reward' && (
              <div className="animate-[fadeIn_0.4s_ease] text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                  Onboarding · 03
                </p>
                <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 ring-2 ring-accent/50">
                  <Award className="h-8 w-8 text-accent" />
                </div>
                <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-accent">
                  +{rewardXp} XP
                </h2>
                <p className="mt-2 text-lg font-semibold text-white">Scout Initiate unlocked</p>
                <p className="mt-2 text-sm text-steel">
                  You discovered <span className="text-white">{pickedName}</span>. Share builders to
                  earn more signal XP — up to 5 boosts per day.
                </p>
                <button
                  type="button"
                  onClick={finish}
                  className="btn-sheen mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-4 text-sm font-bold text-ink active:scale-[0.98] min-h-[56px]"
                >
                  <Sparkles className="h-5 w-5" />
                  Open their story
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
