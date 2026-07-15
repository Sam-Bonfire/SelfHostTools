import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../public/images/mascot/origin.png');
const OUTPUT_DIR = path.join(__dirname, '../public/images/mascot');

const SIZES = [64, 128, 256, 512];
const FORMATS = ['webp', 'png'];

const PUBLIC_DIR = path.join(__dirname, '../public');

async function generateAssets() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Input file not found: ${INPUT_FILE}`);
    process.exit(1);
  }

  console.log(`🖼️  Generating responsive assets from ${INPUT_FILE}...`);

  // 1. Responsive Mascot Images
  for (const size of SIZES) {
    for (const format of FORMATS) {
      const filename = `mascot_${size}.${format}`;
      const outputPath = path.join(OUTPUT_DIR, filename);
      try {
        await sharp(INPUT_FILE)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toFormat(format)
          .toFile(outputPath);
        console.log(`   ✅ Generated ${filename}`);
      } catch (err) {
        console.error(`   ❌ Failed to generate ${filename}:`, err);
      }
    }
  }

  // 2. Favicons & PWA Icons
  const faviconConfig = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  console.log(`🎨 Generating favicons...`);
  for (const icon of faviconConfig) {
    try {
      await sharp(INPUT_FILE)
        .resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFormat('png')
        .toFile(path.join(PUBLIC_DIR, icon.name));
      console.log(`   ✅ Generated ${icon.name}`);
    } catch (err) {
      console.error(`   ❌ Failed to generate ${icon.name}:`, err);
    }
  }

  // Generate legacy favicon.ico (using 32x32 png content, harmless for modern usage or use specific tooling if strict)
  // For now, copy 32x32 to favicon.ico is a "good enough" hack or use a library.
  // Actually, let's just use the 32x32 png logic but save as .ico? Sharp throws error for .ico.
  // We will just skip .ico generation here and rely on the PNGs, or rename a png. Browsers handle png-as-ico fine usually.
  // Let's just output `favicon.ico` as a renamed 32x32 PNG for simplicity.
  try {
    await sharp(INPUT_FILE).resize(32, 32).toFormat('png').toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
    console.log(`   ✅ Generated favicon.ico (PNG format)`);
  } catch (err) {
    console.error(`   ❌ Failed favicon.ico`);
  }

  // 3. Cleanup unused
  const filesToDelete = ['mascot.png', 'mascot_100.png', 'mascot_256.png', 'favicon.png'];
  console.log(`🧹 Cleaning up old assets...`);
  for (const file of filesToDelete) {
    const p = path.join(PUBLIC_DIR, file);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`   🗑️  Deleted ${file}`);
    }
  }
}

generateAssets();
