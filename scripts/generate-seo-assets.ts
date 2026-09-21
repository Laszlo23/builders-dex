/**
 * Generate 1200×630 OG images + public/sitemap.xml
 * Usage: npx tsx scripts/generate-seo-assets.ts
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { BLOG_POSTS } from '../src/data/blog';
import { MEME_CAMPAIGN_ASSETS } from '../src/data/campaign';
import { INITIAL_PROJECTS } from '../src/data/projects';
import { ROUTE_SEO, buildSitemapXml, type SeoRoute } from '../src/lib/seo';

const W = 1200;
const H = 630;
const root = process.cwd();
const publicDir = path.join(root, 'public');
const ogDir = path.join(publicDir, 'og');

const BLOG_PLATES: Record<string, string> = {
  'ccff00-square-loop': 'campaign/hook-wide.webp',
  'how-to-read-builder-score': 'campaign/hook-standard.webp',
  'trade-is-the-last-step': 'campaign/hook-trade-last.webp',
  'hoodstreet-on-robinhood-chain': 'campaign/hook-wide.webp',
  'reputation-layer-of-web3': 'campaign/hook-reputation.webp',
  'proof-of-building': 'campaign/hook-standard.webp',
  'builder-scouts-and-genesis-radar': 'campaign/hook-stories.webp',
  'building-culture-meets-builders-dex': 'campaign/story.webp',
};

function escapeSvg(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function overlaySvg(title: string, subtitle: string): Buffer {
  const safeTitle = escapeSvg(title.length > 34 ? `${title.slice(0, 33)}…` : title);
  const safeSub = escapeSvg(subtitle.length > 54 ? `${subtitle.slice(0, 53)}…` : subtitle);
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#07080A" stop-opacity="0.2"/>
      <stop offset="55%" stop-color="#07080A" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#07080A" stop-opacity="0.88"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="56" y="56" width="8" height="48" fill="#C8E868"/>
  <text x="80" y="90" fill="#C8E868" font-family="Arial, Helvetica, sans-serif" font-size="20" letter-spacing="5" font-weight="700">BUILDERS DEX</text>
  <text x="64" y="455" fill="#F4F6F0" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700">${safeTitle}</text>
  <text x="64" y="520" fill="#C8D0C0" font-family="Arial, Helvetica, sans-serif" font-size="24">${safeSub}</text>
</svg>`);
}

async function writeOg(coverRel: string | null, title: string, subtitle: string, dest: string) {
  const coverAbs = coverRel
    ? path.join(publicDir, coverRel.replace(/^\//, ''))
    : path.join(publicDir, 'campaign/og-wide.webp');
  const src = fs.existsSync(coverAbs) ? coverAbs : path.join(publicDir, 'campaign/og-wide.webp');
  const plate = await sharp(src)
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 0.72 })
    .toBuffer();
  await sharp(plate)
    .composite([{ input: overlaySvg(title, subtitle), top: 0, left: 0 }])
    .webp({ quality: 82, effort: 4 })
    .toFile(dest);
}

function ogLabel(title: string): string {
  return title.split(/\s[|—]\s/)[0]?.trim() || title;
}

async function main() {
  fs.mkdirSync(ogDir, { recursive: true });

  await writeOg(
    'campaign/og-wide.webp',
    'Builders DEX',
    'Who deserves to win.',
    path.join(publicDir, 'og-image.webp'),
  );
  console.log('wrote public/og-image.webp (1200×630)');

  for (const project of INITIAL_PROJECTS) {
    const dest = path.join(ogDir, `project-${project.id}.webp`);
    await writeOg(
      project.coverImage || null,
      project.name,
      `Builder Score™ ${project.builderScore.overall}/100`,
      dest,
    );
    console.log(`wrote ${path.relative(root, dest)}`);
  }

  const routes = Object.keys(ROUTE_SEO) as SeoRoute[];
  for (const route of routes) {
    if (route === 'landing') continue;
    const cfg = ROUTE_SEO[route];
    const dest = path.join(ogDir, `route-${route}.webp`);
    await writeOg('campaign/og-wide.webp', ogLabel(cfg.title), cfg.description, dest);
    console.log(`wrote ${path.relative(root, dest)}`);
  }

  for (const post of BLOG_POSTS) {
    const dest = path.join(ogDir, `blog-${post.slug}.webp`);
    await writeOg(BLOG_PLATES[post.slug] || 'campaign/og-wide.webp', post.title, post.excerpt, dest);
    console.log(`wrote ${path.relative(root, dest)}`);
  }

  for (const meme of MEME_CAMPAIGN_ASSETS) {
    const dest = path.join(ogDir, `meme-${meme.id}.webp`);
    await writeOg(meme.path, meme.label, 'Unruggable meme kit · Builders DEX', dest);
    console.log(`wrote ${path.relative(root, dest)}`);
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, buildSitemapXml());
  console.log('wrote public/sitemap.xml');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
