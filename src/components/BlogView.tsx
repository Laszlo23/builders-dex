import React from 'react';
import { Clock, Tag } from 'lucide-react';
import { BLOG_POSTS, getPostBySlug } from '../data/blog';
import OptimizedImage from './OptimizedImage';

interface BlogViewProps {
  setCurrentPath: (path: string) => void;
  blogSlug: string | null;
  setBlogSlug: (slug: string | null) => void;
}

export default function BlogView({ setCurrentPath, blogSlug, setBlogSlug }: BlogViewProps) {
  const post = blogSlug ? getPostBySlug(blogSlug) : null;

  if (post) {
    return (
      <article className="mx-auto max-w-3xl px-4 py-10 text-white sm:px-6">
        <button
          type="button"
          onClick={() => setBlogSlug(null)}
          className="font-mono text-[11px] text-steel hover:text-accent"
        >
          ← All posts
        </button>
        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10">
          <OptimizedImage
            src={post.coverImage}
            alt=""
            className="aspect-[16/9] w-full object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Blog</p>
        <h1 className="section-title font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[11px] text-steel">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.author}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {post.readingMinutes} min
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] text-accent"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-white/85">
          {post.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCurrentPath('terminal')}
          className="mt-10 rounded-full bg-accent px-5 py-2.5 text-xs font-bold text-ink"
        >
          Open Terminal™
        </button>
      </article>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-white sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Blog</p>
      <h1 className="section-title font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        On the pulse
      </h1>
      <p className="mt-2 max-w-xl text-sm text-steel">
        Essays on reputation infrastructure, Proof of Building™, and the builders shaping Web3 —
        written for humans and search engines.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {BLOG_POSTS.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setBlogSlug(p.slug)}
            className="pulse-card group overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-surface/90 text-left transition hover:border-accent/35"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <OptimizedImage
                src={p.coverImage}
                alt=""
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 font-mono text-[10px] text-accent"
                  >
                    <Tag className="h-3 w-3" />
                    {t}
                  </span>
                ))}
              </div>
              <h2 className="font-display mt-3 text-xl font-bold tracking-tight">{p.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-steel">{p.excerpt}</p>
              <p className="mt-4 font-mono text-[10px] text-steel">
                {p.date} · {p.readingMinutes} min · {p.author}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
