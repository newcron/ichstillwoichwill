import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src/assets');
const DIST_DIR = path.join(__dirname, '../dist/assets');

const WIDTHS = [4000, 2560, 1920, 1280, 1080, 640, 320];
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];

async function ensureDistDir() {
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }
}

async function optimizeImage(filePath, fileName, relativeDir = '') {
  const ext = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, ext);

  console.log(`Processing: ${fileName}`);

  try {
    // Read the original image
    const image = sharp(filePath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      console.warn(`  ⚠️  Skipping ${fileName}: Could not read dimensions`);
      return;
    }

    // Process each width
    for (const width of WIDTHS) {
      const outputFileName = `${baseName}-${width}.avif`;
      // Preserve subdirectory structure in dist
      const distSubDir = relativeDir ? path.join(DIST_DIR, relativeDir) : DIST_DIR;
      const outputPath = path.join(distSubDir, outputFileName);

      if (metadata.width < width) {
        // Use original without resizing
        console.log(`  ✓ ${outputFileName} (original: ${metadata.width}px)`);
        await sharp(filePath)
          .avif({ quality: 80 })
          .toFile(outputPath);
      } else {
        // Resize to target width
        await sharp(filePath)
          .resize(width, null, {
            withoutEnlargement: true,
            fit: 'inside',
          })
          .avif({ quality: 80 })
          .toFile(outputPath);

        console.log(`  ✓ ${outputFileName}`);
      }
    }
  } catch (err) {
    console.error(`  ✗ Error processing ${fileName}:`, err.message);
  }
}

async function processDirectoryRecursive(dir, relativeDir = '') {
  const files = fs.readdirSync(dir);
  let processedCount = 0;

  for (const file of files) {
    if (file.startsWith('.')) continue;

    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    const relativePath = relativeDir ? path.join(relativeDir, file) : file;

    if (stats.isDirectory()) {
      // Recursively process subdirectories
      const subDirCount = await processDirectoryRecursive(filePath, relativePath);
      processedCount += subDirCount;
    } else if (stats.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        // Ensure subdirectory exists in dist
        const distSubDir = relativeDir ? path.join(DIST_DIR, relativeDir) : DIST_DIR;
        if (!fs.existsSync(distSubDir)) {
          fs.mkdirSync(distSubDir, { recursive: true });
        }
        await optimizeImage(filePath, file, relativeDir);
        processedCount++;
      }
    }
  }

  return processedCount;
}

async function processAllImages() {
  try {
    await ensureDistDir();

    const totalImages = await processDirectoryRecursive(SRC_DIR);

    if (totalImages === 0) {
      console.log('No image files found in src/assets');
      return;
    }

    console.log('\n✓ Image optimization complete!');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

processAllImages();





