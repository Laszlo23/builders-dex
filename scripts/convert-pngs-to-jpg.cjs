const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const roots = [
    path.join('public', 'campaign'),
    'public',
  ];
  const files = [];
  for (const root of roots) {
    for (const name of fs.readdirSync(root)) {
      if (!/\.png$/i.test(name)) continue;
      if (name === 'brand-mark.png') continue; // keep tiny png logo
      const full = path.join(root, name);
      if (!fs.statSync(full).isFile()) continue;
      // only top-level public pngs + campaign
      if (root === 'public' && !['hero-poster.png', 'og-image.png'].includes(name)) continue;
      files.push(full);
    }
  }

  for (const file of files) {
    const before = fs.statSync(file).size;
    const jpg = file.replace(/\.png$/i, '.jpg');
    const webp = file.replace(/\.png$/i, '.webp');
    await sharp(file)
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(jpg);
    await sharp(file)
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(webp);
    fs.unlinkSync(file);
    console.log(
      `${path.relative('public', file)}: ${Math.round(before / 1024)}KB → jpg ${Math.round(fs.statSync(jpg).size / 1024)}KB / webp ${Math.round(fs.statSync(webp).size / 1024)}KB`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
