import React from 'react';

type Props = {
  title?: string;
  detail: string;
};

export default function ComingSoonBanner({
  title = "We're still working on this",
  detail,
}: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-accent/25 bg-accent/8 px-4 py-3 text-sm text-white/85">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{title}</p>
      <p className="mt-1 leading-relaxed text-steel">{detail}</p>
    </div>
  );
}
