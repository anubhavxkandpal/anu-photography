#!/usr/bin/env node

/**
 * Legacy Image Migration Script for Anu Photography
 *
 * Some gallery JSON entries still point at unoptimized, full-size files
 * living directly under public/images/ (e.g. /images/ANU00281.jpg) instead
 * of the compressed copies under public/images/optimized/[category]/.
 *
 * This script:
 *   1. Scans src/data/[category].json for any `src` starting with /images/
 *      but not /images/optimized/.
 *   2. Optimizes each one with the same settings as optimize-images.js
 *      (max 2000px longest edge, progressive mozjpeg, quality ~83 stepping
 *      down toward 70 if over ~500KB).
 *   3. Writes the result to public/images/optimized/[category]/[filename]
 *      (skips if the target already exists).
 *   4. Updates the JSON entry's src, width, and height in place.
 *
 * It never deletes or moves the original top-level files.
 *
 * Usage:
 *   node scripts/migrate-legacy-images.js
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

const CONFIG = {
  maxDimension: 2000,
  jpegQuality: 83,
  targetSizeKB: 500,
  minQuality: 70,
  progressive: true,
  categories: ['landscapes', 'wildlife', 'portraits', 'travel', 'artsy', 'events'],
};

const DATA_DIR = path.join(PROJECT_ROOT, 'src/data');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'images/optimized');

async function getFileSizeKB(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size / 1024;
}

/** Optimize a single image, mirroring optimize-images.js settings. */
async function optimizeImage(inputPath, outputPath) {
  const metadata = await sharp(inputPath).metadata();
  const originalWidth = metadata.width;
  const originalHeight = metadata.height;

  let width, height;
  if (originalWidth > originalHeight) {
    width = Math.min(originalWidth, CONFIG.maxDimension);
    height = null;
  } else {
    width = null;
    height = Math.min(originalHeight, CONFIG.maxDimension);
  }

  let quality = CONFIG.jpegQuality;
  let buffer = await sharp(inputPath)
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality, progressive: CONFIG.progressive, mozjpeg: true })
    .toBuffer();

  let sizeKB = buffer.length / 1024;

  while (sizeKB > CONFIG.targetSizeKB && quality > CONFIG.minQuality) {
    quality -= 3;
    buffer = await sharp(inputPath)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, progressive: CONFIG.progressive, mozjpeg: true })
      .toBuffer();
    sizeKB = buffer.length / 1024;
  }

  await fs.writeFile(outputPath, buffer);

  const finalMetadata = await sharp(outputPath).metadata();

  return {
    originalSizeKB: await getFileSizeKB(inputPath),
    finalSizeKB: sizeKB,
    finalWidth: finalMetadata.width,
    finalHeight: finalMetadata.height,
    quality,
  };
}

async function migrateCategory(category) {
  const jsonPath = path.join(DATA_DIR, `${category}.json`);
  const raw = await fs.readFile(jsonPath, 'utf-8');
  const data = JSON.parse(raw);

  const outputDir = path.join(OUTPUT_DIR, category);
  await fs.mkdir(outputDir, { recursive: true });

  let migrated = 0;
  let totalOriginalKB = 0;
  let totalFinalKB = 0;
  let changed = false;

  for (const image of data.images) {
    if (!image.src.startsWith('/images/') || image.src.startsWith('/images/optimized/')) {
      continue;
    }

    const filename = path.basename(image.src);
    const inputPath = path.join(PUBLIC_DIR, image.src);
    const outputFilename = filename.replace(/\.(png|webp|tiff?)$/i, '.jpg');
    const outputPath = path.join(outputDir, outputFilename);
    const newSrc = `/images/optimized/${category}/${outputFilename}`;

    try {
      await fs.access(outputPath);
      const existingMetadata = await sharp(outputPath).metadata();
      console.log(`  ⏭  ${category}/${outputFilename} already exists, skipping optimization (updating src/dimensions only)`);
      image.src = newSrc;
      image.width = existingMetadata.width;
      image.height = existingMetadata.height;
      changed = true;
      continue;
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      // Target doesn't exist yet — proceed with optimization.
    }

    try {
      const result = await optimizeImage(inputPath, outputPath);
      totalOriginalKB += result.originalSizeKB;
      totalFinalKB += result.finalSizeKB;
      migrated++;

      const reduction = ((1 - result.finalSizeKB / result.originalSizeKB) * 100).toFixed(1);
      console.log(`  ✓ ${filename} → optimized/${category}/${outputFilename}`);
      console.log(`    ${result.originalSizeKB.toFixed(0)}KB → ${result.finalSizeKB.toFixed(0)}KB (${reduction}% reduction, q${result.quality})`);

      image.src = newSrc;
      image.width = result.finalWidth;
      image.height = result.finalHeight;
      changed = true;
    } catch (error) {
      console.log(`  ✗ ${filename}: ${error.message}`);
    }
  }

  if (changed) {
    await fs.writeFile(jsonPath, JSON.stringify(data, null, 2) + '\n');
  }

  return { migrated, totalOriginalKB, totalFinalKB };
}

async function main() {
  console.log('\n🚚 Anu Photography - Legacy Image Migration\n');
  console.log('═'.repeat(50));

  let totalMigrated = 0;
  let grandTotalOriginalKB = 0;
  let grandTotalFinalKB = 0;

  for (const category of CONFIG.categories) {
    console.log(`\n📁 ${category}`);
    console.log('─'.repeat(50));
    const { migrated, totalOriginalKB, totalFinalKB } = await migrateCategory(category);
    if (migrated === 0) {
      console.log('  ℹ️  No legacy images to migrate.');
    }
    totalMigrated += migrated;
    grandTotalOriginalKB += totalOriginalKB;
    grandTotalFinalKB += totalFinalKB;
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`✅ Done! Migrated ${totalMigrated} images.`);
  if (totalMigrated > 0) {
    const reduction = ((1 - grandTotalFinalKB / grandTotalOriginalKB) * 100).toFixed(1);
    console.log(`   Total size: ${(grandTotalOriginalKB / 1024).toFixed(2)}MB → ${(grandTotalFinalKB / 1024).toFixed(2)}MB (${reduction}% reduction)`);
  }
  console.log();
}

main().catch(console.error);
