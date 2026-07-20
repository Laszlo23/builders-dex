import React from 'react';
import { BadgeCheck, Github, Globe } from 'lucide-react';
import { Project } from '../types';

/** X (Twitter) mark — lucide doesn't ship a perfect one in all versions */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

export function githubUrlFor(project: Project): string | null {
  if (!project.githubRepo || project.githubRepo === '—') return null;
  if (project.githubRepo.startsWith('http')) return project.githubRepo;
  return `https://github.com/${project.githubRepo}`;
}

export function websiteUrlFor(project: Project): string | null {
  return project.socials?.website || null;
}

export function twitterUrlFor(project: Project): string | null {
  const t = project.socials?.twitter;
  if (!t) return null;
  if (t.startsWith('http')) return t;
  return `https://x.com/${t.replace(/^@/, '')}`;
}

type Props = {
  project: Project;
  /** larger hit targets on detail pages */
  size?: 'sm' | 'md';
  className?: string;
  showVerified?: boolean;
};

export default function ProjectSocialLinks({
  project,
  size = 'sm',
  className = '',
  showVerified = true,
}: Props) {
  const icon = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  const btn =
    size === 'md'
      ? 'h-9 w-9'
      : 'h-7 w-7';

  const links = [
    { href: websiteUrlFor(project), label: 'Website', Icon: Globe },
    { href: twitterUrlFor(project), label: 'X', Icon: XIcon },
    { href: githubUrlFor(project), label: 'GitHub', Icon: Github },
  ].filter((l): l is { href: string; label: string; Icon: typeof Globe } => Boolean(l.href));

  const verified =
    showVerified &&
    (project.curation.builderVerified || project.curation.status === 'curated');

  if (links.length === 0 && !verified) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {verified && (
        <span
          className="inline-flex items-center gap-0.5 rounded-full border border-accent/35 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent"
          title="Builder verified"
        >
          <BadgeCheck className={`${icon} shrink-0`} />
          <span className="hidden sm:inline">Verified</span>
        </span>
      )}
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={label}
          title={label}
          className={`inline-flex ${btn} items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-steel transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent`}
        >
          <Icon className={icon} />
        </a>
      ))}
    </div>
  );
}
