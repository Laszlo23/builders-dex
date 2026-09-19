import {
  OG_HEIGHT,
  OG_WIDTH,
  OG_LOCALE,
  SITE_NAME,
  SITE_URL,
  TWITTER_SITE,
  absoluteUrl,
  jsonLdGraph,
  type ResolvedSeo,
} from './seo';

const BOT_RE =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Slack-ImgProxy|Discordbot|TelegramBot|WhatsApp|Applebot|Iframely|SkypeUriPreview|vkShare|Pinterest|redditbot|Embedly|Quora Link Preview|Outbrain|Showyoubot|Viber|LINE\/|Googlebot/i;

export function isPreviewBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  return BOT_RE.test(userAgent);
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function upsertMeta(
  html: string,
  attr: 'name' | 'property',
  key: string,
  content: string,
): string {
  const re = new RegExp(`<meta\\s+[^>]*${attr}=["']${key}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function upsertLink(html: string, rel: string, href: string): string {
  const re = new RegExp(`<link\\s+[^>]*rel=["']${rel}["'][^>]*>`, 'i');
  const tag = `<link rel="${rel}" href="${escapeAttr(href)}" />`;
  if (re.test(html)) return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
  return html.replace(/<\/head>/i, `    <link rel="${rel}" href="${escapeAttr(href)}" />\n  </head>`);
}

function upsertTitle(html: string, title: string): string {
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(title)}</title>`);
  }
  return html.replace(/<\/head>/i, `    <title>${escapeAttr(title)}</title>\n  </head>`);
}

function upsertJsonLd(html: string, id: string, data: unknown): string {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const tag = `<script type="application/ld+json" id="${id}">${json}</script>`;
  const re = new RegExp(`<script[^>]*id=["']${id}["'][^>]*>[\\s\\S]*?<\\/script>`, 'i');
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

export function injectSeoIntoHtml(html: string, seo: ResolvedSeo): string {
  const image = absoluteUrl(seo.image);
  const url = absoluteUrl(seo.path);
  let next = upsertTitle(html, seo.title);
  next = upsertMeta(next, 'name', 'description', seo.description);
  next = upsertMeta(next, 'name', 'robots', seo.robots);
  next = upsertMeta(next, 'name', 'theme-color', '#07080A');
  next = upsertMeta(next, 'property', 'og:type', seo.type);
  next = upsertMeta(next, 'property', 'og:locale', OG_LOCALE);
  next = upsertMeta(next, 'property', 'og:site_name', SITE_NAME);
  next = upsertMeta(next, 'property', 'og:title', seo.title);
  next = upsertMeta(next, 'property', 'og:description', seo.description);
  next = upsertMeta(next, 'property', 'og:url', url);
  next = upsertMeta(next, 'property', 'og:image', image);
  next = upsertMeta(next, 'property', 'og:image:secure_url', image);
  next = upsertMeta(next, 'property', 'og:image:type', 'image/webp');
  next = upsertMeta(next, 'property', 'og:image:width', String(seo.imageWidth || OG_WIDTH));
  next = upsertMeta(next, 'property', 'og:image:height', String(seo.imageHeight || OG_HEIGHT));
  next = upsertMeta(next, 'property', 'og:image:alt', seo.title);
  next = upsertMeta(next, 'name', 'twitter:card', 'summary_large_image');
  next = upsertMeta(next, 'name', 'twitter:site', TWITTER_SITE);
  next = upsertMeta(next, 'name', 'twitter:title', seo.title);
  next = upsertMeta(next, 'name', 'twitter:description', seo.description);
  next = upsertMeta(next, 'name', 'twitter:image', image);
  next = upsertMeta(next, 'name', 'twitter:image:alt', seo.title);
  next = upsertMeta(next, 'name', 'twitter:image:width', String(OG_WIDTH));
  next = upsertMeta(next, 'name', 'twitter:image:height', String(OG_HEIGHT));
  if (seo.publishedTime) {
    next = upsertMeta(next, 'property', 'article:published_time', seo.publishedTime);
    next = upsertMeta(next, 'property', 'article:modified_time', seo.publishedTime);
  }
  next = upsertLink(next, 'canonical', url);
  const graph = jsonLdGraph(seo);
  graph.forEach((node, i) => {
    next = upsertJsonLd(next, `builders-dex-ld-${i}`, node);
  });
  return next;
}

export { SITE_URL };
