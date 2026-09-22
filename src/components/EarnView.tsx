import React, { useMemo } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { UserWallet } from '../types';
import {
  GrowthTask,
  GROWTH_TASK_ROUTES,
  GROWTH_TASK_EXTERNAL,
} from '../data/earn';
import DepthCard from './DepthCard';
import GrowthSpinWheel from './GrowthSpinWheel';
import { SpinPrize, canSpin } from '../data/growthWheel';
import { SOCIAL_GO_THEN_CLAIM } from '../lib/earnProgress';
import OptimizedImage from './OptimizedImage';
import SquareLoopPanel from './SquareLoopPanel';

interface EarnViewProps {
  wallet: UserWallet;
  tasks: GrowthTask[];
  startedTaskIds: string[];
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onDailySpin: (prize: SpinPrize) => void;
  setCurrentPath: (
    path: string,
    state?: { buy?: string | null; stall?: string | null; wallet?: string | null },
  ) => void;
  builderXp: number;
}

export default function EarnView({
  wallet,
  tasks,
  startedTaskIds,
  onStartTask,
  onCompleteTask,
  onDailySpin,
  setCurrentPath,
  builderXp,
}: EarnViewProps) {
  const openTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);
  const socialOpen = useMemo(
    () => openTasks.filter((t) => t.category === 'social'),
    [openTasks],
  );

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-10 text-white sm:px-6">
      <div className="relative mb-10 overflow-hidden rounded-[1.75rem] border border-accent/25">
        <OptimizedImage
          src="/campaign/hook-reputation.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/55" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-12">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            <Heart className="h-3.5 w-3.5" />
            Earn
          </p>
          <h1 className="font-display mt-3 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
            Tasks are live. The Square loop is a preview.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75">
            Growth tasks and the daily spin already save on this profile ({builderXp.toLocaleString()}{' '}
            XP). Fake LP APRs are gone. Park a CCFF00 Square for fee dust — $BUILD has a Bankr
            address, but fees this week stay 0 until the splitter sees volume.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-accent/20 bg-accent/[0.06] px-4 py-3 font-mono text-xs text-accent">
        {builderXp.toLocaleString()} XP · {doneTasks.length}/{tasks.length} missions complete ·{' '}
        {socialOpen.length} social open · progress saved
        {wallet.connected ? '' : ' · preview saves on this device'}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[#CCFF00]/25 bg-[#CCFF00]/5 px-4 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#CCFF00]">
            The Tape
          </p>
          <p className="mt-1 text-sm text-white/75">
            This XP is on-device until you Publish Passport. On-chain mint is a second step.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCurrentPath('profile')}
            className="rounded-full bg-[#CCFF00] px-4 py-2 text-xs font-bold text-ink"
          >
            Publish Passport
          </button>
          <button
            type="button"
            onClick={() => setCurrentPath('dossier')}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold"
          >
            Open Dossier
          </button>
        </div>
      </div>

      <div className="mt-8">
        <GrowthSpinWheel onWin={onDailySpin} />
      </div>

      <div className="mt-10">
        <SquareLoopPanel
          setCurrentPath={setCurrentPath}
          onActivated={() => onCompleteTask('t_stake')}
          onParked={() => onCompleteTask('t_lp')}
          onStalled={() => onCompleteTask('t_lp')}
        />
      </div>

      <div className="mt-10">
        <DepthCard intensity="soft" className="p-6">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl font-bold">Growth tasks</h2>
          </div>
          <p className="mt-2 text-sm text-steel">
            Complete the action, then Claim. Progress is saved — refresh safe.
            Social links: tap Go first, then Claim.
          </p>
          <ul className="mt-5 space-y-2">
            {openTasks.map((t) => {
              const needsGoFirst = SOCIAL_GO_THEN_CLAIM.has(t.id);
              const canClaim =
                !needsGoFirst || startedTaskIds.includes(t.id);
              return (
              <li
                key={t.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-steel">
                      {t.category}
                    </p>
                    <p className="text-sm font-semibold">{t.title}</p>
                    <p className="mt-0.5 text-xs text-steel">{t.description}</p>
                    <p className="mt-1 font-mono text-[10px] text-accent">
                      {t.id === 't_daily_spin'
                        ? canSpin()
                          ? 'Spin above · XP varies'
                          : 'Spun today · back in 24h'
                        : `+${t.xp} XP${t.badge ? ` · ${t.badge}` : ''}`}
                    </p>
                    {needsGoFirst && !canClaim && (
                      <p className="mt-1 text-[10px] text-steel/80">
                        Tap Go, then Claim
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    {t.id === 't_daily_spin' ? (
                      <button
                        type="button"
                        onClick={() => {
                          document
                            .getElementById('growth-spin-wheel')
                            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="rounded-lg bg-accent px-3 py-2 font-mono text-xs font-bold text-ink hover:bg-accent-bright active:scale-95 min-h-[40px]"
                      >
                        {canSpin() ? 'Spin' : 'Wait'}
                      </button>
                    ) : (
                      <>
                        {(GROWTH_TASK_EXTERNAL[t.id] || GROWTH_TASK_ROUTES[t.id]) && (
                          <button
                            type="button"
                            onClick={() => {
                              onStartTask(t.id);
                              const external = GROWTH_TASK_EXTERNAL[t.id];
                              if (external) {
                                window.open(external, '_blank', 'noopener,noreferrer');
                                return;
                              }
                              setCurrentPath(GROWTH_TASK_ROUTES[t.id]);
                            }}
                            className="rounded-lg bg-accent px-3 py-2 font-mono text-xs font-bold text-ink hover:bg-accent-bright active:scale-95 min-h-[40px]"
                          >
                            Go
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={!canClaim}
                          onClick={() => onCompleteTask(t.id)}
                          className="rounded-lg border border-accent/35 px-3 py-2 font-mono text-xs text-accent hover:bg-accent/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 min-h-[40px]"
                        >
                          Claim
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
              );
            })}
            {doneTasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2.5 text-xs text-accent"
              >
                <CheckCircle2 className="h-4 w-4" />
                {t.title} · done
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setCurrentPath('profile')}
            className="mt-4 text-xs font-semibold text-steel hover:text-accent"
          >
            View Passport™ →
          </button>
        </DepthCard>
      </div>
    </div>
  );
}
