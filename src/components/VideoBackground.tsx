import React from 'react';
import Atmosphere from './Atmosphere';

type Props = {
  /** Stronger dim for readable UI panels (swap) */
  intensity?: 'hero' | 'panel';
  className?: string;
};

/**
 * Hero veil over the site-wide CCFF00 Square field.
 */
export default function VideoBackground({ intensity = 'hero', className = '' }: Props) {
  const veil =
    intensity === 'hero'
      ? 'bg-[linear-gradient(180deg,rgba(7,8,10,0.28)_0%,rgba(7,8,10,0.40)_42%,rgba(7,8,10,0.82)_100%)]'
      : 'bg-[linear-gradient(180deg,rgba(7,8,10,0.60)_0%,rgba(7,8,10,0.86)_100%)]';

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className={`absolute inset-0 ${veil}`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,8,10,0.24)_58%,rgba(7,8,10,0.62)_100%)]" />
      <Atmosphere variant={intensity === 'hero' ? 'hero' : 'app'} />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
    </div>
  );
}
