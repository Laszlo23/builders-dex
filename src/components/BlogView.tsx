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

  if (blogSlug && !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-white sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Blog</p>
        <h1 className="font-display mt-2 text-3xl font-bold">That post is not in the catalog</h1>
        <p className="mt-3 text-sm text-steel">
          Unknown slugs should not dump you on a blank page. Open the live essays instead.
        </p>
        <button
          type="button"
          onClick={() => setBlogSlug(null)}
          className="mt-8 rounded-full bg-accent px-5 py-2.5 text-xs font-bold text-ink"
        >
          All posts
        </button>
      </div>
    );
  }

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
            alt={`Cover image for ${post.title}`}
            className="aspect-[1200/630] w-full object-cover"
            width={1200}
            height={630}
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
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setCurrentPath('terminal')}
            className="rounded-full bg-accent px-5 py-2.5 text-xs font-bold text-ink"
          >
            Open Terminal™
          </button>
          <button
            type="button"
            onClick={() => setCurrentPath('explore')}
            className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold hover:border-accent/40"
          >
            Explore stories
          </button>
          <button
            type="button"
            onClick={() => setCurrentPath('guide')}
            className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold hover:border-accent/40"
          >
            Site guide
          </button>
        </div>
      </article>
    );
  }

  const posts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-white sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Blog</p>
      <h1 className="section-title font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        On the pulse
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-steel">
        Essays on Builder Score™, Proof of Building™, why trade is last, and HoodStreet on
        Robinhood Chain — written so first-time visitors and search engines get the same map.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {posts.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setBlogSlug(p.slug)}
            className="pulse-card group overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-surface/90 text-left transition hover:border-accent/35"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <OptimizedImage
                src={p.coverImage}
                alt={`Cover image for ${p.title}`}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                width={1200}
                height={630}
                sizes="(max-width: 768px) 100vw, 50vw"
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
