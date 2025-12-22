/**
 * Compress dump object images to under GitHub's file size limit
 *
 * Run with: node scripts/compress-images.js
 *
 * This will compress all images in public/dump-objects/ to be web-friendly
 * and under GitHub's 50MB recommended limit.
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const MAX_SIZE = 800; // Max dimension in pixels
const QUALITY = 0.8; // JPEG quality (80%)

async function compressImage(inputPath, outputPath) {
  try {
    const img = await loadImage(inputPath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    // Calculate new dimensions
    let width = img.width;
    let height = img.height;

    if (width > height && width > MAX_SIZE) {
      height = (height * MAX_SIZE) / width;
      width = MAX_SIZE;
    } else if (height > MAX_SIZE) {
      width = (width * MAX_SIZE) / height;
      height = MAX_SIZE;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw and compress
    ctx.drawImage(img, 0, 0, width, height);

    // Save as JPEG
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createJPEGStream({ quality: QUALITY });
    stream.pipe(out);

    return new Promise((resolve, reject) => {
      out.on('finish', () => {
        const stats = fs.statSync(outputPath);
        resolve(stats.size);
      });
      out.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Failed to compress ${path.basename(inputPath)}: ${error.message}`);
  }
}

async function compressAllImages() {
  const dumpObjectsPath = path.join(__dirname, '..', 'public', 'dump-objects');

  if (!fs.existsSync(dumpObjectsPath)) {
    fs.mkdirSync(dumpObjectsPath, { recursive: true });
  }

  const files = fs.readdirSync(dumpObjectsPath);
  const imageFiles = files.filter(file =>
    /\.(png|jpg|jpeg)$/i.test(file) && !file.startsWith('compressed-')
  );

  console.log(`🖼️  Found ${imageFiles.length} images to compress\n`);

  for (const file of imageFiles) {
    const inputPath = path.join(dumpObjectsPath, file);
    const outputPath = path.join(dumpObjectsPath, `compressed-${file.replace(/\.(png|jpg|jpeg)$/i, '.jpg')}`);

    try {
      const originalSize = fs.statSync(inputPath).size;
      const newSize = await compressImage(inputPath, outputPath);
      const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

      console.log(`✅ ${file}`);
      console.log(`   ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024 / 1024).toFixed(2)}MB (${savings}% smaller)\n`);
    } catch (error) {
      console.error(`❌ Failed: ${file}`);
      console.error(`   ${error.message}\n`);
    }
  }

  console.log('🎉 Compression complete!');
  console.log('📝 Upload the "compressed-*.jpg" files to GitHub instead of the originals.');
}

compressAllImages().catch(console.error);
