import React, { useEffect, useMemo, useState } from 'react';
import {
  Droplets,
  Lock,
  Sparkles,
  CheckCircle2,
  BadgeCheck,
  Unlock,
  Timer,
  Heart,
} from 'lucide-react';
import { UserWallet } from '../types';
import {
  GrowthTask,
  LP_POOLS,
  STAKER_PERKS,
  GROWTH_TASK_ROUTES,
  PendingUnstake,
  UNSTAKE_COOLDOWN_LABEL,
  UNSTAKE_COOLDOWN_DAYS,
  unstakeReady,
  cooldownRemainingMs,
  formatCooldown,
} from '../data/earn';
import DepthCard from './DepthCard';
import GrowthSpinWheel from './GrowthSpinWheel';
import { SpinPrize, canSpin } from '../data/growthWheel';
import OptimizedImage from './OptimizedImage';

interface EarnViewProps {
  wallet: UserWallet;
  stakedBuild: number;
  onStake: (amount: number) => void;
  onRequestUnstake: (amount: number) => void;
  onClaimUnstake: () => void;
  pendingUnstake: PendingUnstake | null;
  onProvideLiquidity: (poolId: string, amount: number) => void;
  lpDeposits: Record<string, number>;
  tasks: GrowthTask[];
  onCompleteTask: (taskId: string) => void;
  onDailySpin: (prize: SpinPrize) => void;
  isStaker: boolean;
  setCurrentPath: (path: string) => void;
}

export default function EarnView({
  wallet,
  stakedBuild,
  onStake,
  onRequestUnstake,
  onClaimUnstake,
  pendingUnstake,
  onProvideLiquidity,
  lpDeposits,
  tasks,
  onCompleteTask,
  onDailySpin,
  isStaker,
  setCurrentPath,
}: EarnViewProps) {
  const [stakeAmt, setStakeAmt] = useState('');
  const [unstakeAmt, setUnstakeAmt] = useState('');
  const [lpAmt, setLpAmt] = useState<Record<string, string>>({});
  const [now, setNow] = useState(() => Date.now());
  const buildBal = wallet.balances.BUILD || 0;

  useEffect(() => {
    if (!pendingUnstake) return;
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [pendingUnstake]);

  const openTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);
  const socialOpen = useMemo(
    () => openTasks.filter((t) => t.category === 'social'),
    [openTasks]
  );

  const ready = unstakeReady(pendingUnstake, now);
  const remaining = pendingUnstake ? formatCooldown(cooldownRemainingMs(pendingUnstake, now)) : null;

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-10 text-white sm:px-6">
      {/* Emotional hero band with imagery */}
      <div className="relative mb-10 overflow-hidden rounded-[1.75rem] border border-accent/25">
        <OptimizedImage
          src="/campaign/hook-reputation.jpg"
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
            Lock conviction. Unlock the network.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75">
            Liquidity and stake are how members prove they believe in builders — not just browse
            them. Unstaking takes {UNSTAKE_COOLDOWN_LABEL} so conviction stays real.
          </p>
        </div>
      </div>

      {isStaker && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          <Sparkles className="h-4 w-4" />
          Staker active — fee rebates, early access, and XP boost unlocked.
        </div>
      )}

      <div className="rounded-2xl border border-accent/20 bg-accent/[0.06] px-4 py-3 font-mono text-xs text-accent">
        Member growth · {doneTasks.length}/{tasks.length} missions complete · {socialOpen.length}{' '}
        social tasks open
      </div>

      <div className="mt-8">
        <GrowthSpinWheel onWin={onDailySpin} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Stake + Unstake */}
        <DepthCard intensity="soft" className="overflow-hidden p-0">
          <div className="relative h-28 overflow-hidden">
            <OptimizedImage
              src="/parallax/standard.jpg"
              alt=""
              className="h-full w-full object-cover opacity-60"
            sizes="(max-width: 768px) 100vw, 50vw"
              />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
            <div className="absolute bottom-3 left-5 flex items-center gap-2">
              <Lock className="h-5 w-5 text-accent" />
              <h2 className="font-display text-xl font-bold">Stake $BUILD</h2>
            </div>
          </div>
          <div className="p-6 pt-2">
            <p className="text-sm text-steel">
              Lock the platform token for staker perks. Unstake enters a{' '}
              <span className="text-accent">{UNSTAKE_COOLDOWN_DAYS}-day cooldown</span> (
              {UNSTAKE_COOLDOWN_LABEL}) before BUILD returns to your wallet.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[10px] uppercase text-steel">Wallet</p>
                <p className="mt-1 text-accent">{buildBal.toLocaleString()} BUILD</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[10px] uppercase text-steel">Staked</p>
                <p className="mt-1 text-white">{stakedBuild.toLocaleString()} BUILD</p>
              </div>
            </div>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const n = parseFloat(stakeAmt);
                if (!n || n <= 0) return;
                if (!wallet.connected) {
                  alert('Connect wallet to stake $BUILD.');
                  return;
                }
                if (n > buildBal) {
                  alert('Insufficient $BUILD balance.');
                  return;
                }
                onStake(n);
                setStakeAmt('');
              }}
            >
              <input
                type="number"
                value={stakeAmt}
                onChange={(e) => setStakeAmt(e.target.value)}
                placeholder="Stake amount"
                className="flex-1 rounded-xl border border-white/10 bg-ink px-3 py-2.5 font-mono text-sm outline-none focus:border-accent/40"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-ink hover:bg-accent-bright"
              >
                <Lock className="h-3.5 w-3.5" />
                Stake
              </button>
            </form>

            <div className="mt-6 border-t border-white/8 pt-5">
              <div className="flex items-center gap-2">
                <Unlock className="h-4 w-4 text-accent" />
                <h3 className="font-display text-base font-bold">Unstake</h3>
              </div>
              <p className="mt-1 text-xs text-steel">
                Request unlock → wait {UNSTAKE_COOLDOWN_LABEL} → claim to wallet.
              </p>

              {pendingUnstake ? (
                <div className="mt-3 rounded-xl border border-accent/30 bg-accent/[0.08] px-3 py-3">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-accent">
                    <Timer className="h-3.5 w-3.5" />
                    {pendingUnstake.amount.toLocaleString()} BUILD in cooldown
                  </div>
                  <p className="mt-1 text-xs text-white/80">{remaining}</p>
                  <button
                    type="button"
                    disabled={!ready}
                    onClick={() => onClaimUnstake()}
                    className="mt-3 w-full rounded-xl bg-accent py-2.5 text-xs font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40 hover:bg-accent-bright"
                  >
                    {ready ? 'Claim to wallet' : 'Cooling down…'}
                  </button>
                </div>
              ) : (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const n = parseFloat(unstakeAmt);
                    if (!n || n <= 0) return;
                    if (!wallet.connected) {
                      alert('Connect wallet to unstake.');
                      return;
                    }
                    if (n > stakedBuild) {
                      alert('Cannot unstake more than you have staked.');
                      return;
                    }
                    onRequestUnstake(n);
                    setUnstakeAmt('');
                  }}
                >
                  <input
                    type="number"
                    value={unstakeAmt}
                    onChange={(e) => setUnstakeAmt(e.target.value)}
                    placeholder="Unstake amount"
                    disabled={stakedBuild <= 0}
                    className="flex-1 rounded-xl border border-white/10 bg-ink px-3 py-2.5 font-mono text-sm outline-none focus:border-accent/40 disabled:opacity-40"
                  />
                  <button
                    type="submit"
                    disabled={stakedBuild <= 0}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-bold text-accent hover:bg-accent/20 disabled:opacity-40"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    Unstake
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                Staker perks
              </p>
              {STAKER_PERKS.map((p) => (
                <div
                  key={p.title}
                  className="rounded-xl border border-white/8 bg-ink/40 px-3 py-2.5"
                >
                  <p className="text-sm font-semibold text-white">{p.title}</p>
                  <p className="mt-0.5 text-xs text-steel">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </DepthCard>

        {/* Growth tasks */}
        <DepthCard intensity="soft" className="p-6">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl font-bold">Growth tasks</h2>
          </div>
          <p className="mt-2 text-sm text-steel">
            Every member helps grow the platform. Complete tasks for XP and badges.
          </p>
          <ul className="mt-5 space-y-2">
            {openTasks.map((t) => (
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
                        className="rounded-lg bg-accent px-2.5 py-1 font-mono text-[10px] font-bold text-ink hover:bg-accent-bright"
                      >
                        {canSpin() ? 'Spin' : 'Wait'}
                      </button>
                    ) : (
                      <>
                        {GROWTH_TASK_ROUTES[t.id] && (
                          <button
                            type="button"
                            onClick={() => setCurrentPath(GROWTH_TASK_ROUTES[t.id])}
                            className="rounded-lg bg-accent px-2.5 py-1 font-mono text-[10px] font-bold text-ink hover:bg-accent-bright"
                          >
                            Go
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onCompleteTask(t.id)}
                          className="rounded-lg border border-accent/35 px-2.5 py-1 font-mono text-[10px] text-accent hover:bg-accent/10"
                        >
                          Claim
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
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

      {/* LP pools */}
      <section className="mt-12">
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/10">
          <OptimizedImage
            src="/parallax/index.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          sizes="(max-width: 768px) 100vw, 50vw"
            />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
          <div className="relative flex items-end justify-between gap-3 px-5 py-6">
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                <Droplets className="h-3.5 w-3.5" />
                Provide liquidity
              </p>
              <h2 className="font-display mt-1 text-2xl font-bold">Curated LP pools</h2>
              <p className="mt-1 text-xs text-steel">Fuel the builders you believe in.</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {LP_POOLS.map((pool) => (
            <div
              key={pool.id}
              className="rounded-2xl border border-white/10 bg-surface/70 p-5 backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-sans text-lg font-semibold">{pool.name}</h3>
                  <p className="font-mono text-[11px] text-steel">{pool.pair}</p>
                </div>
                {pool.curated && (
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[9px] text-accent">
                    Curated
                  </span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div>
                  <p className="text-steel">APR</p>
                  <p className="text-accent">{pool.apr}%</p>
                </div>
                <div>
                  <p className="text-steel">TVL</p>
                  <p className="text-white">${(pool.tvl / 1e6).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-steel">Risk</p>
                  <p className="text-white">{pool.risk}</p>
                </div>
              </div>
              <p className="mt-2 font-mono text-[10px] text-steel">
                Your deposit: {(lpDeposits[pool.id] || 0).toLocaleString()} USDC
              </p>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const n = parseFloat(lpAmt[pool.id] || '');
                  if (!n || n <= 0) return;
                  if (!wallet.connected) {
                    alert('Connect wallet to provide liquidity.');
                    return;
                  }
                  onProvideLiquidity(pool.id, n);
                  setLpAmt((m) => ({ ...m, [pool.id]: '' }));
                }}
              >
                <input
                  type="number"
                  value={lpAmt[pool.id] || ''}
                  onChange={(e) => setLpAmt((m) => ({ ...m, [pool.id]: e.target.value }))}
                  placeholder="USDC"
                  className="flex-1 rounded-xl border border-white/10 bg-ink px-3 py-2 font-mono text-sm outline-none focus:border-accent/40"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-bold text-accent hover:bg-accent/20"
                >
                  Deposit
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
