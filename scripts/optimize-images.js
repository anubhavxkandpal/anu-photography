#!/usr/bin/env node

/**
 * Image Optimization Script for Anu Photography
 * 
 * This script optimizes images from the staging folder and outputs them
 * to the optimized folder, ready for use on the website.
 * 
 * Usage:
 *   node scripts/optimize-images.js [category]
 *   
 * Examples:
 *   node scripts/optimize-images.js landscapes    # Process only landscapes
 *   node scripts/optimize-images.js               # Process all categories
 * 
 * The script will:
 *   1. Read images from public/images/staging/[category]/
 *   2. Resize to max 2000px on longest edge (preserves aspect ratio)
 *   3. Compress with quality settings optimized for web
 *   4. Output to public/images/optimized/[category]/
 *   5. Generate a manifest JSON for easy addition to gallery data
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  maxDimension: 2000,        // Max width or height in pixels
  jpegQuality: 83,           // JPEG quality (80-85 is sweet spot for web)
  pngCompressionLevel: 9,    // PNG compression (0-9)
  webpQuality: 82,           // WebP quality if converting
  targetSizeKB: 500,         // Target file size in KB (soft limit)
  minQuality: 70,            // Never go below this quality
  progressive: true,         // Progressive JPEG for faster perceived loading
  categories: ['landscapes', 'wildlife', 'portraits', 'travel', 'artsy', 'events']
};

const STAGING_DIR = path.join(PROJECT_ROOT, 'public/images/staging');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public/images/optimized');
const MANIFEST_DIR = path.join(PROJECT_ROOT, 'scripts/manifests');

/**
 * Get file size in KB
 */
async function getFileSizeKB(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size / 1024;
}

/**
 * Optimize a single image with smart quality adjustment
 */
async function optimizeImage(inputPath, outputPath, filename) {
  const ext = path.extname(filename).toLowerCase();
  const isJpeg = ['.jpg', '.jpeg'].includes(ext);
  const isPng = ext === '.png';
  
  // Get original dimensions
  const metadata = await sharp(inputPath).metadata();
  const originalWidth = metadata.width;
  const originalHeight = metadata.height;
  
  // Calculate resize dimensions (max 2000px on longest edge)
  let width, height;
  if (originalWidth > originalHeight) {
    width = Math.min(originalWidth, CONFIG.maxDimension);
    height = null; // Sharp will calculate to maintain aspect ratio
  } else {
    width = null;
    height = Math.min(originalHeight, CONFIG.maxDimension);
  }
  
  // First pass: try with target quality
  let quality = CONFIG.jpegQuality;
  let buffer;
  
  const pipeline = sharp(inputPath)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    });
  
  if (isJpeg) {
    buffer = await pipeline
      .jpeg({
        quality: quality,
        progressive: CONFIG.progressive,
        mozjpeg: true  // Use mozjpeg for better compression
      })
      .toBuffer();
  } else if (isPng) {
    buffer = await pipeline
      .png({
        compressionLevel: CONFIG.pngCompressionLevel,
        progressive: true
      })
      .toBuffer();
  } else {
    // For other formats, convert to JPEG
    buffer = await pipeline
      .jpeg({
        quality: quality,
        progressive: CONFIG.progressive,
        mozjpeg: true
      })
      .toBuffer();
  }
  
  let sizeKB = buffer.length / 1024;
  
  // If still too large for JPEG, try reducing quality incrementally
  if (isJpeg && sizeKB > CONFIG.targetSizeKB) {
    while (sizeKB > CONFIG.targetSizeKB && quality > CONFIG.minQuality) {
      quality -= 3;
      buffer = await sharp(inputPath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: quality,
          progressive: CONFIG.progressive,
          mozjpeg: true
        })
        .toBuffer();
      sizeKB = buffer.length / 1024;
    }
  }
  
  // Write the optimized image
  await fs.writeFile(outputPath, buffer);
  
  // Get final file info
  const finalMetadata = await sharp(outputPath).metadata();
  
  return {
    originalSizeKB: await getFileSizeKB(inputPath),
    finalSizeKB: sizeKB,
    originalDimensions: `${originalWidth}x${originalHeight}`,
    finalDimensions: `${finalMetadata.width}x${finalMetadata.height}`,
    quality: quality
  };
}

/**
 * Process all images in a category
 */
async function processCategory(category) {
  const stagingPath = path.join(STAGING_DIR, category);
  const outputPath = path.join(OUTPUT_DIR, category);
  
  // Check if staging folder exists
  try {
    await fs.access(stagingPath);
  } catch {
    console.log(`  ⚠️  No staging folder for ${category}, skipping...`);
    return { processed: 0, manifest: [] };
  }
  
  // Ensure output directory exists
  await fs.mkdir(outputPath, { recursive: true });
  
  // Get all image files
  const files = await fs.readdir(stagingPath);
  const imageFiles = files.filter(f => 
    /\.(jpg|jpeg|png|webp|tiff?)$/i.test(f)
  );
  
  if (imageFiles.length === 0) {
    console.log(`  ℹ️  No images in ${category} staging folder`);
    return { processed: 0, manifest: [] };
  }
  
  console.log(`\n📁 Processing ${category}: ${imageFiles.length} images`);
  console.log('─'.repeat(50));
  
  const manifest = [];
  let totalOriginalKB = 0;
  let totalFinalKB = 0;
  
  for (const filename of imageFiles) {
    const inputPath = path.join(stagingPath, filename);
    const outputFilename = filename.replace(/\.(png|webp|tiff?)$/i, '.jpg');
    const outputFilePath = path.join(outputPath, outputFilename);
    
    try {
      const result = await optimizeImage(inputPath, outputFilePath, filename);
      totalOriginalKB += result.originalSizeKB;
      totalFinalKB += result.finalSizeKB;
      
      const reduction = ((1 - result.finalSizeKB / result.originalSizeKB) * 100).toFixed(1);
      
      console.log(`  ✓ ${filename}`);
      console.log(`    ${result.originalSizeKB.toFixed(0)}KB → ${result.finalSizeKB.toFixed(0)}KB (${reduction}% reduction, q${result.quality})`);
      console.log(`    ${result.originalDimensions} → ${result.finalDimensions}`);
      
      // Add to manifest for easy JSON creation
      manifest.push({
        filename: outputFilename,
        src: `/images/optimized/${category}/${outputFilename}`,
        originalFile: filename,
        processedAt: new Date().toISOString().split('T')[0],
        // Placeholder fields for manual editing
        title: '',
        alt: '',
        location: '',
        tier: 2  // Default to 'great'
      });
      
    } catch (error) {
      console.log(`  ✗ ${filename}: ${error.message}`);
    }
  }
  
  // Summary for this category
  if (manifest.length > 0) {
    const totalReduction = ((1 - totalFinalKB / totalOriginalKB) * 100).toFixed(1);
    console.log('─'.repeat(50));
    console.log(`  📊 ${category} Summary:`);
    console.log(`     Total: ${(totalOriginalKB/1024).toFixed(2)}MB → ${(totalFinalKB/1024).toFixed(2)}MB (${totalReduction}% reduction)`);
    console.log(`     Average: ${(totalFinalKB/manifest.length).toFixed(0)}KB per image`);
  }
  
  return { processed: manifest.length, manifest };
}

/**
 * Save manifest for newly processed images
 */
async function saveManifest(category, manifest) {
  if (manifest.length === 0) return;
  
  await fs.mkdir(MANIFEST_DIR, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const manifestPath = path.join(MANIFEST_DIR, `${category}-${timestamp}.json`);
  
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  📝 Manifest saved: ${path.relative(PROJECT_ROOT, manifestPath)}`);
}

/**
 * Main function
 */
async function main() {
  console.log('\n🖼️  Anu Photography - Image Optimization\n');
  console.log('═'.repeat(50));
  
  const targetCategory = process.argv[2];
  const categoriesToProcess = targetCategory 
    ? [targetCategory] 
    : CONFIG.categories;
  
  // Validate category if specified
  if (targetCategory && !CONFIG.categories.includes(targetCategory)) {
    console.error(`❌ Invalid category: ${targetCategory}`);
    console.error(`   Valid categories: ${CONFIG.categories.join(', ')}`);
    process.exit(1);
  }
  
  let totalProcessed = 0;
  
  for (const category of categoriesToProcess) {
    const { processed, manifest } = await processCategory(category);
    totalProcessed += processed;
    
    if (manifest.length > 0) {
      await saveManifest(category, manifest);
    }
  }
  
  console.log('\n' + '═'.repeat(50));
  if (totalProcessed > 0) {
    console.log(`✅ Done! Processed ${totalProcessed} images total.`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Check the manifest files in scripts/manifests/`);
    console.log(`   2. Add titles, alt text, and locations to each entry`);
    console.log(`   3. Set tier (1=featured, 2=great, 3=good)`);
    console.log(`   4. Copy entries to src/data/[category].json`);
    console.log(`   5. Move or delete processed images from staging/`);
  } else {
    console.log(`ℹ️  No images to process. Drop images into:`);
    console.log(`   public/images/staging/[category]/`);
  }
  console.log();
}

main().catch(console.error);
