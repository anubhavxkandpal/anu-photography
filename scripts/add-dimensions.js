#!/usr/bin/env node

/**
 * Backfill width/height into gallery JSON files.
 *
 * Reads each image referenced in src/data/{category}.json from public/,
 * measures it with sharp, and writes width/height fields onto the entry.
 * Safe to re-run; entries that already have dimensions are re-measured
 * only if --force is passed.
 *
 * Usage:
 *   node scripts/add-dimensions.js [--force]
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'src/data');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

const CATEGORIES = ['landscapes', 'wildlife', 'portraits', 'travel', 'artsy', 'events'];
const force = process.argv.includes('--force');

let updated = 0;
let missing = 0;

for (const category of CATEGORIES) {
  const jsonPath = path.join(DATA_DIR, `${category}.json`);
  const data = JSON.parse(await fs.readFile(jsonPath, 'utf8'));

  for (const image of data.images) {
    if (image.width && image.height && !force) continue;

    const filePath = path.join(PUBLIC_DIR, decodeURIComponent(image.src));
    try {
      const meta = await sharp(filePath).metadata();
      // Respect EXIF orientation: swap for rotated images
      const rotated = meta.orientation && meta.orientation >= 5;
      image.width = rotated ? meta.height : meta.width;
      image.height = rotated ? meta.width : meta.height;
      updated++;
    } catch {
      console.warn(`MISSING: ${category} -> ${image.src}`);
      missing++;
    }
  }

  await fs.writeFile(jsonPath, JSON.stringify(data, null, 2) + '\n');
  console.log(`${category}: written`);
}

console.log(`\nDone. ${updated} entries updated, ${missing} files missing.`);
