import React, { useMemo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Project } from '../types';
import { CHAIN_LANES } from '../data/chainLanes';
import {
  CALL_COST,
  displayedVotes,
  heatForProjects,
  signalAllowance,
  signalRemaining,
  utcDay,
  type SignalSide,
  type SignalSnapshot,
} from '../lib/projectSignal';
import { isTriRoom, type RoomStamps } from '../lib/roomStamps';
import ProjectSignalButtons from './ProjectSignalButtons';

type Props = {
  projects: Project[];
  signal: SignalSnapshot;
  builderXp: number;
  signalBonus: number;
  stamps: RoomStamps;
  setCurrentPath: (path: string) => void;
  onOpenStory: (projectId: string) => void;
  onSignal: (id: string, side: SignalSide) => void;
  onCall: (id: string) => void;
  onOpenWalletRoom: () => void;
};

export default function ConvictionDeskView({
  projects,
  signal,
  builderXp,
  signalBonus,
  stamps,
  setCurrentPath,
  onOpenStory,
  onSignal,
  onCall,
  onOpenWalletRoom,
}: Props) {
  const allowance = signalAllowance(builderXp, signalBonus);
  const remaining = signalRemaining(signal, builderXp, signalBonus);
  const live = projects.filter((p) => p.curation.status !== 'rejected');
  const heat = useMemo(() => heatForProjects(live, signal), [live, signal]);
  const maxHeat = Math.max(1, ...heat.map((h) => h.heat));
  const called = live.find((p) => p.id === signal.callId) ?? null;
  const top = heat[0] ? live.find((p) => p.id === heat[0].id) : null;
  const tri = isTriRoom(stamps);
  const pct = allowance > 0 ? Math.round((remaining / allowance) * 100) : 0;

  return (
    <div className="desk-page mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#CCFF00]">
            The Desk · {utcDay()} UTC
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
            {stamps.squareId ? `Square #${stamps.squareId} is on the desk.` : <>Stamp today&apos;s call.</>}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">
            Collect the three rooms. Load a CCFF00 Square for neon signal. Spend {CALL_COST} points
            to lock one conviction until midnight UTC. Not financial advice.
          </p>
        </div>
        <div className="desk-ring" style={{ ['--desk-pct' as string]: pct }}>
          <span>
            <strong className="font-display text-xl">{remaining}</strong>
            <span className="block font-mono text-[9px] uppercase tracking-widest text-steel">
              / {allowance}
            </span>
          </span>
        </div>
      </div>

      <div className="relative mt-8 grid gap-2 sm:grid-cols-3">
        {CHAIN_LANES.map((lane) => {
          const on = stamps[lane.id];
          return (
            <button
              key={lane.id}
              type="button"
              onClick={onOpenWalletRoom}
              className={`desk-stamp ${on ? 'is-on' : ''}`}
            >
              <span className="desk-coin">{on ? 'IN' : '—'}</span>
              <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                {lane.label} stamp
              </span>
              <span className="mt-1 block text-sm font-semibold">{on ? 'Collected' : lane.job}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        {tri ? (
          <span className="rounded-full bg-[#CCFF00] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
            Tri-room +2 signal
          </span>
        ) : (
          <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-steel">
            Connect all three rooms for +2
          </span>
        )}
        {stamps.squareId ? (
          <span className="rounded-full bg-[#CCFF00]/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#CCFF00]">
            Square neon +1
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentPath('ccff00')}
            className="rounded-full border border-[#CCFF00]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#CCFF00]"
          >
            Load a Square
          </button>
        )}
        <button
          type="button"
          onClick={() => setCurrentPath('stacc')}
          className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-steel"
        >
          Hood book
        </button>
      </div>

      {called && (
        <section className="desk-call-foil relative mt-8 rounded-[1.75rem] p-6 sm:p-8">
          <p className="relative font-mono text-[10px] uppercase tracking-[0.22em] text-[#CCFF00]">
            Today&apos;s call
          </p>
          <h2 className="relative mt-2 font-display text-3xl font-bold">{called.name}</h2>
          <p className="relative mt-2 max-w-lg text-sm text-white/75">{called.tagline}</p>
          <button
            type="button"
            onClick={() => onOpenStory(called.id)}
            className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-[#CCFF00] px-4 py-2 text-xs font-bold text-ink"
          >
            Read the story <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      )}

      <section className="relative mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Heat</p>
            <h2 className="font-display mt-1 text-2xl font-bold">Who is moving the desk.</h2>
          </div>
          {top && (
            <p className="font-mono text-[10px] text-steel">
              Lead {top.ticker} · NFA
            </p>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {heat.slice(0, 8).map((row, i) => {
            const project = live.find((p) => p.id === row.id);
            if (!project) return null;
            const votes = displayedVotes(project.id, project.upvotes, signal);
            const width = `${Math.max(8, Math.round((row.heat / maxHeat) * 100))}%`;
            return (
              <article
                key={row.id}
                className={`rounded-2xl border p-4 ${
                  row.called ? 'border-[#CCFF00]/40 bg-[#CCFF00]/5' : 'border-white/10 bg-ink/50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button type="button" onClick={() => onOpenStory(project.id)} className="text-left">
                    <p className="font-mono text-[10px] text-steel">
                      #{i + 1} · ${project.ticker}
                    </p>
                    <h3 className="font-display text-xl font-bold">{project.name}</h3>
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <ProjectSignalButtons
                      compact
                      up={votes.up}
                      down={votes.down}
                      mine={votes.mine}
                      remaining={remaining}
                      allowance={allowance}
                      onVote={(side) => onSignal(project.id, side)}
                    />
                    <button
                      type="button"
                      disabled={Boolean(signal.callId) || remaining < CALL_COST}
                      onClick={() => onCall(project.id)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#CCFF00]/35 px-3 py-1.5 text-xs font-semibold text-[#CCFF00] disabled:opacity-40"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {row.called ? 'Stamped' : `Call · ${CALL_COST}`}
                    </button>
                  </div>
                </div>
                <div className="desk-heat mt-3">
                  <span style={{ width }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
