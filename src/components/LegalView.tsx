import React from 'react';
import { LEGAL_DOCS, LegalDoc } from '../data/legal';

interface LegalViewProps {
  docId: LegalDoc['id'];
  setCurrentPath: (path: string) => void;
}

export default function LegalView({ docId, setCurrentPath }: LegalViewProps) {
  const doc = LEGAL_DOCS[docId];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-white sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Builders DEX</p>
      <h1 className="font-display mt-2 text-4xl font-bold tracking-tight">{doc.title}</h1>
      <p className="mt-2 font-mono text-[11px] text-steel">Updated {doc.updated}</p>

      <div className="mt-10 space-y-8">
        {doc.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-sans text-lg font-semibold text-white">{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="mt-2 text-sm leading-relaxed text-steel">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-white/10 pt-6">
        {(
          [
            ['terms', 'Terms'],
            ['privacy', 'Privacy'],
            ['imprint', 'Imprint'],
            ['contact', 'Contact'],
            ['vision', 'Vision'],
            ['roadmap', 'Roadmap'],
            ['manifesto', 'Manifest'],
            ['mission', 'Mission'],
            ['faq', 'FAQ'],
            ['feedback', 'Feedback'],
            ['support', 'Support'],
            ['team', 'Team'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setCurrentPath(id)}
            className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] font-semibold text-steel hover:text-accent"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
