import { useEffect } from 'react';
import { absoluteUrl, getSeoForPath, SITE_NAME, SITE_URL } from '../lib/seo';
import { getPostBySlug } from '../data/blog';

type Props = {
  path: string;
  projectName?: string;
  blogSlug?: string | null;
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function Seo({ path, projectName, blogSlug }: Props) {
  useEffect(() => {
    const base = getSeoForPath(path);
    const post = path === 'blog' && blogSlug ? getPostBySlug(blogSlug) : null;
    const title = post
      ? `${post.title} — Builders DEX Blog`
      : path === 'project-detail' && projectName
        ? `${projectName} — Builders DEX`
        : base.title;
    const description = post?.excerpt || base.description;
    const url = absoluteUrl(post ? `/blog/${post.slug}` : base.path);
    const image = absoluteUrl('/og-image.webp');

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'application-name', SITE_NAME);
    upsertMeta('name', 'theme-color', '#07080A');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
    upsertMeta('name', 'twitter:image:width', '1280');
    upsertMeta('name', 'twitter:image:height', '853');
    upsertMeta('property', 'og:type', post ? 'article' : 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:image:type', 'image/webp');
    upsertMeta('property', 'og:image:width', '1280');
    upsertMeta('property', 'og:image:height', '853');
    upsertMeta('property', 'og:image:alt', `${SITE_NAME} — Reputation layer of Web3`);
    upsertLink('canonical', url);

    // Always add Organization schema
    upsertJsonLd('builders-dex-org', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/brand-mark.webp`,
      description: 'A builder intelligence network with integrated trading on Solana',
      sameAs: [
        'https://x.com/BuildCultureID',
        'https://github.com/Laszlo23/builders-dex',
      ],
    });

    // Always add WebSite schema
    upsertJsonLd('builders-dex-website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: 'Discover curated Solana builders and projects with quality ratings and integrated trading',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    });

    if (post) {
      upsertJsonLd('builders-dex-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        datePublished: post.date,
        author: { '@type': 'Person', name: post.author },
        description: post.excerpt,
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        mainEntityOfPage: url,
      });
    } else {
      upsertJsonLd('builders-dex-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: SITE_NAME,
        url: SITE_URL,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        description,
        featureList: [
          'Curated Solana project discovery',
          'Live Builder Score™ quality ratings',
          'Jupiter-powered token swaps',
          'Community-driven builder verification',
        ],
        offers: {
          '@type': 'Offer',
          description: 'Free builder discovery and quality research. Swap fees via Jupiter protocol.',
        },
      });
    }
  }, [path, projectName, blogSlug]);

  return null;
}
