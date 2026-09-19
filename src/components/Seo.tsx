import { useEffect } from 'react';
import {
  OG_HEIGHT,
  OG_WIDTH,
  OG_LOCALE,
  SITE_NAME,
  TWITTER_SITE,
  absoluteUrl,
  jsonLdGraph,
  resolveSeoForRequest,
} from '../lib/seo';
import type { Project } from '../types';

type Props = {
  path: string;
  project?: Project;
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

export default function Seo({ path, project, projectName, blogSlug }: Props) {
  useEffect(() => {
    const seo = resolveSeoForRequest(window.location.pathname, window.location.search);
    const title = project
      ? `${project.name} — Builder Story | Builders DEX`
      : seo.title;
    const description = project?.tagline || seo.description;
    const url = absoluteUrl(
      project ? `/explore?id=${project.id}` : seo.path,
    );
    const image = absoluteUrl(seo.image);
    const type = seo.type;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', seo.robots);
    upsertMeta('name', 'application-name', SITE_NAME);
    upsertMeta('name', 'theme-color', '#07080A');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:site', TWITTER_SITE);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
    upsertMeta('name', 'twitter:image:alt', title);
    upsertMeta('name', 'twitter:image:width', String(OG_WIDTH));
    upsertMeta('name', 'twitter:image:height', String(OG_HEIGHT));
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:locale', OG_LOCALE);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:image:secure_url', image);
    upsertMeta('property', 'og:image:type', 'image/webp');
    upsertMeta('property', 'og:image:width', String(OG_WIDTH));
    upsertMeta('property', 'og:image:height', String(OG_HEIGHT));
    upsertMeta('property', 'og:image:alt', title);
    if (seo.publishedTime) {
      upsertMeta('property', 'article:published_time', seo.publishedTime);
      upsertMeta('property', 'article:modified_time', seo.publishedTime);
    }
    upsertLink('canonical', url);

    const graph = jsonLdGraph({
      ...seo,
      title,
      description,
      path: project ? `/explore?id=${project.id}` : seo.path,
      project: project ?? seo.project,
    });
    graph.forEach((node, i) => upsertJsonLd(`builders-dex-ld-${i}`, node));

    document.head.querySelectorAll('script[id^="builders-dex-ld-"]').forEach((el) => {
      const n = Number(el.id.replace('builders-dex-ld-', ''));
      if (Number.isFinite(n) && n >= graph.length) el.remove();
    });
  }, [path, project, projectName, blogSlug]);

  return null;
}
