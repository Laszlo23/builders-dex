import React, { useState } from 'react';
import { HumanFounder, BuilderConversation } from '../data/prideMovement';

type Props = {
  founder: HumanFounder;
  conversations?: BuilderConversation[];
};

export default function FounderHumanCard({ founder, conversations = [] }: Props) {
  const [openId, setOpenId] = useState<string | null>(conversations[0]?.id ?? null);

  const stats = [
    founder.buildingYears > 0
      ? { label: 'Building', value: `${founder.buildingYears} years` }
      : null,
    founder.previousFailures > 0
      ? { label: 'Previous failures', value: String(founder.previousFailures) }
      : null,
    founder.openSourceCommits > 0
      ? {
          label: 'Open Source',
          value: `${founder.openSourceCommits.toLocaleString()} commits`,
        }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-surface p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Builder</p>
      <div className="mt-3 flex flex-wrap items-start gap-4">
        <img
          src={founder.avatarUrl}
          alt=""
          className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-bold tracking-tight">{founder.name}</h2>
          <p className="mt-2 text-sm italic leading-relaxed text-white/85">
            &ldquo;{founder.mission}&rdquo;
          </p>
        </div>
      </div>

      {stats.length > 0 ? (
        <dl className="mt-5 grid grid-cols-3 gap-2">
          {stats.map((r) => (
            <div key={r.label} className="rounded-xl border border-white/8 bg-ink/50 px-3 py-2.5">
              <dt className="font-mono text-[9px] uppercase text-steel">{r.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-white">{r.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-steel">
          Identity verified via public profile · metrics from live GitHub score only
        </p>
      )}

      {conversations.length > 0 && (
        <div className="mt-6 border-t border-white/8 pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
            Builder Conversations
          </p>
          <h3 className="font-display mt-1 text-lg font-bold">Ask {founder.name.split(' ')[0]}</h3>
          <ul className="mt-3 space-y-2">
            {conversations.map((c) => {
              const open = openId === c.id;
              return (
                <li key={c.id} className="rounded-xl border border-white/10 bg-ink/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : c.id)}
                    className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left text-sm font-semibold hover:bg-white/[0.03]"
                  >
                    <span>&ldquo;{c.question}&rdquo;</span>
                    <span className="font-mono text-[10px] text-accent">{open ? '−' : '+'}</span>
                  </button>
                  {open && (
                    <div className="border-t border-white/8 px-3.5 py-3">
                      <p className="font-mono text-[9px] uppercase text-accent">Builder answered</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/90">
                        &ldquo;{c.answer}&rdquo;
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
