import React, { useEffect, useState } from 'react';
import {
  Eye,
  Map,
  ScrollText,
  ShieldAlert,
  Share2,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import {
  LISTING_CRITERIA,
  VISION,
  ROADMAP,
  MANIFEST_PAGE,
  type WhyPageId,
} from '../data/visionPages';
import { BRAND_PHILOSOPHY } from '../data/brand';

interface Props {
  page: WhyPageId;
  setCurrentPath: (path: string) => void;
}

const TABS: { id: WhyPageId; label: string; icon: LucideIcon }[] = [
  { id: 'vision', label: 'Vision', icon: Eye },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'manifesto', label: 'Manifest', icon: ScrollText },
];

export default function VisionRoadmapManifestView({ page, setCurrentPath }: Props) {
  const [active, setActive] = useState<WhyPageId>(page);

  useEffect(() => {
    setActive(page);
  }, [page]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0c1018] via-[#0a0c10] to-[#07080A] px-6 py-10 sm:px-10">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #C8E868 0%, transparent 70%)' }}
        />
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C8E868]">
          Why we build · {BRAND_PHILOSOPHY}
        </p>
        <h1 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {active === 'vision' && VISION.title}
          {active === 'roadmap' && ROADMAP.title}
          {active === 'manifesto' && MANIFEST_PAGE.title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">
          {active === 'vision' && VISION.lead}
          {active === 'roadmap' && ROADMAP.lead}
          {active === 'manifesto' && MANIFEST_PAGE.lead}
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActive(id);
                setCurrentPath(id);
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                active === id
                  ? 'bg-[#C8E868] text-[#07080A]'
                  : 'border border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-8 space-y-8">
        {active === 'vision' && <VisionBody setCurrentPath={setCurrentPath} />}
        {active === 'roadmap' && <RoadmapBody />}
        {active === 'manifesto' && <ManifestBody setCurrentPath={setCurrentPath} />}
      </div>
    </div>
  );
}

function CriteriaStrip() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0a0c10] px-5 py-6 sm:px-8">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#C8E868]" aria-hidden />
        <div>
          <h2 className="font-display text-lg font-bold text-white">Listing criteria</h2>
          <p className="mt-1 text-sm text-white/45">
            Talent Protocol + Neynar first. Repo next. Reputation before any curated trade.
          </p>
        </div>
      </div>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {LISTING_CRITERIA.map((c) => (
          <li
            key={c.step}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8E868]">
              {c.step}
            </p>
            <h3 className="mt-1.5 text-sm font-semibold text-white">{c.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-white/45">{c.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function VisionBody({ setCurrentPath }: { setCurrentPath: (path: string) => void }) {
  return (
    <>
      <CriteriaStrip />
      {VISION.sections.map((s) => (
        <section
          key={s.heading}
          className="rounded-2xl border border-white/[0.08] bg-[#0a0c10] px-6 py-7 sm:px-8"
        >
          <h2 className="font-display text-xl font-bold text-white">{s.heading}</h2>
          {s.body.map((p) => (
            <p key={p.slice(0, 48)} className="mt-3 text-sm leading-relaxed text-white/55">
              {p}
            </p>
          ))}
        </section>
      ))}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setCurrentPath('manifesto')}
          className="inline-flex items-center gap-2 rounded-full bg-[#C8E868] px-5 py-2.5 text-xs font-bold text-[#07080A]"
        >
          Read the Manifest <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentPath('roadmap')}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-white/80 hover:border-white/30"
        >
          See Roadmap
        </button>
      </div>
    </>
  );
}

function RoadmapBody() {
  return (
    <>
      <CriteriaStrip />
      <div className="space-y-4">
        {ROADMAP.phases.map((phase, i) => (
          <section
            key={phase.id}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0c10] px-6 py-7 sm:px-8"
          >
            {i === 0 && (
              <div
                className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full opacity-20 blur-3xl"
                style={{ background: '#C8E868' }}
              />
            )}
            <div className="relative flex flex-wrap items-baseline gap-3">
              <span className="rounded-full border border-[#C8E868]/40 bg-[#C8E868]/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#C8E868]">
                {phase.label}
              </span>
              <h2 className="font-display text-xl font-bold text-white">{phase.title}</h2>
            </div>
            <ul className="relative mt-5 space-y-2.5">
              {phase.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-white/55"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8E868]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

function ManifestBody({ setCurrentPath }: { setCurrentPath: (path: string) => void }) {
  return (
    <>
      <CriteriaStrip />
      <ul className="space-y-3">
        {MANIFEST_PAGE.tenets.map((t, i) => (
          <li
            key={t.title}
            className="rounded-2xl border border-white/[0.08] bg-[#0a0c10] px-5 py-5 sm:px-7"
          >
            <p className="font-mono text-[10px] text-white/30">{String(i + 1).padStart(2, '0')}</p>
            <h2 className="font-display mt-1 text-lg font-bold text-white">{t.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/50">{t.body}</p>
          </li>
        ))}
      </ul>
      <blockquote className="rounded-2xl border border-[#C8E868]/30 bg-[#C8E868]/[0.06] px-6 py-8 sm:px-8">
        <Share2 className="h-5 w-5 text-[#C8E868]" aria-hidden />
        <p className="font-display mt-4 text-lg font-bold leading-snug text-white sm:text-xl">
          {MANIFEST_PAGE.closing}
        </p>
        <button
          type="button"
          onClick={() => setCurrentPath('apply')}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#C8E868] px-5 py-2.5 text-xs font-bold text-[#07080A]"
        >
          Apply for recognition <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </blockquote>
    </>
  );
}
