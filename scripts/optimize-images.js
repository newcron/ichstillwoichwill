import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src/assets');
const DIST_DIR = path.join(__dirname, '../dist/assets');

const WIDTHS = [4000, 2560, 1920, 1280, 1080, 640, 320];
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];
const CPU_COUNT = typeof os.availableParallelism === 'function'
  ? os.availableParallelism()
  : os.cpus().length;
const DEFAULT_CONCURRENCY = Math.max(1, CPU_COUNT - 1);
const FILE_CONCURRENCY = Math.max(
  1,
  Number.parseInt(process.env.IMAGE_OPTIMIZE_CONCURRENCY ?? `${DEFAULT_CONCURRENCY}`, 10) || DEFAULT_CONCURRENCY,
);

sharp.concurrency(0);

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

    const avifSettings = {
      quality: 50,
      chromaSubsampling: "4:2:0"
    };
    
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
          .avif(avifSettings)
          .toFile(outputPath);
      } else {
        // Resize to target width
        await sharp(filePath)
          .resize(width, null, {
            withoutEnlargement: true,
            fit: 'inside',
          })
          .avif(avifSettings)
          .toFile(outputPath);

        console.log(`  ✓ ${outputFileName}`);
      }
    }
  } catch (err) {
    console.error(`  ✗ Error processing ${fileName}:`, err.message);
  }
}

function collectImageJobs(dir, relativeDir = '') {
  const files = fs.readdirSync(dir);
  const jobs = [];

  for (const file of files) {
    if (file.startsWith('.')) continue;

    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    const relativePath = relativeDir ? path.join(relativeDir, file) : file;

    if (stats.isDirectory()) {
      jobs.push(...collectImageJobs(filePath, relativePath));
    } else if (stats.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        const distSubDir = relativeDir ? path.join(DIST_DIR, relativeDir) : DIST_DIR;
        if (!fs.existsSync(distSubDir)) {
          fs.mkdirSync(distSubDir, { recursive: true });
        }
        jobs.push({ filePath, fileName: file, relativeDir });
      }
    }
  }

  return jobs;
}

async function runWithConcurrency(items, concurrency, worker) {
  const queue = [...items];
  const workerCount = Math.min(concurrency, queue.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) {
          return;
        }

        await worker(item);
      }
    }),
  );
}

async function processAllImages() {
  try {
    await ensureDistDir();

    const jobs = collectImageJobs(SRC_DIR);
    const totalImages = jobs.length;

    if (totalImages === 0) {
      console.log('No image files found in src/assets');
      return;
    }

    console.log(`Found ${totalImages} image(s); processing up to ${FILE_CONCURRENCY} file(s) in parallel across ${CPU_COUNT} CPU core(s).`);

    await runWithConcurrency(jobs, FILE_CONCURRENCY, ({ filePath, fileName, relativeDir }) =>
      optimizeImage(filePath, fileName, relativeDir),
    );

    console.log('\n✓ Image optimization complete!');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

processAllImages();





