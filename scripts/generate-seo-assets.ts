/**
 * Generate 1200×630 OG images + public/sitemap.xml
 * Usage: npx tsx scripts/generate-seo-assets.ts
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { INITIAL_PROJECTS } from '../src/data/projects';
import { buildSitemapXml } from '../src/lib/seo';

const W = 1200;
const H = 630;
const root = process.cwd();
const publicDir = path.join(root, 'public');
const ogDir = path.join(publicDir, 'og');

function escapeSvg(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function overlaySvg(title: string, subtitle: string): Buffer {
  const safeTitle = escapeSvg(title.length > 28 ? `${title.slice(0, 27)}…` : title);
  const safeSub = escapeSvg(subtitle.length > 48 ? `${subtitle.slice(0, 47)}…` : subtitle);
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
  <text x="64" y="470" fill="#F4F6F0" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700">${safeTitle}</text>
  <text x="64" y="530" fill="#C8D0C0" font-family="Arial, Helvetica, sans-serif" font-size="26">${safeSub}</text>
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

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, buildSitemapXml());
  console.log('wrote public/sitemap.xml');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
