/**
 * Re-optimize public raster assets → resized originals + sibling .webp
 * Usage: npm run optimize:images
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'public');

function maxWidth(rel) {
  const name = path.basename(rel);
  if (name === 'brand-mark.png') return 128;
  if (name.startsWith('hero-poster') || name.startsWith('og-image')) return 1280;
  if (rel.includes('parallax')) return 1600;
  if (rel.includes('projects')) return 1200;
  return 1400;
}

async function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(p, files);
    else if (/\.(png|jpe?g)$/i.test(ent.name) && !ent.name.includes('.opt.')) files.push(p);
  }
  return files;
}

(async () => {
  const files = await walk(root);
  for (const file of files) {
    const rel = path.relative(root, file);
    const before = fs.statSync(file).size;
    const meta = await sharp(file).metadata();
    const tw = maxWidth(rel);
    const resize = meta.width && meta.width > tw ? { width: tw } : undefined;
    const webpPath = file.replace(/\.(png|jpe?g)$/i, '.webp');

    await sharp(file).resize(resize).webp({ quality: 78, effort: 4 }).toFile(webpPath);

    const tmp = file + '.tmp';
    if (/\.png$/i.test(file)) {
      await sharp(file).resize(resize).png({ compressionLevel: 9 }).toFile(tmp);
    } else {
      await sharp(file).resize(resize).jpeg({ quality: 82, mozjpeg: true }).toFile(tmp);
    }
    if (fs.statSync(tmp).size < before * 0.98) fs.renameSync(tmp, file);
    else fs.unlinkSync(tmp);

    console.log(
      `${rel}: ${Math.round(before / 1024)}KB → ${Math.round(fs.statSync(file).size / 1024)}KB / webp ${Math.round(fs.statSync(webpPath).size / 1024)}KB`
    );
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
