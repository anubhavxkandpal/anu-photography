import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Configuration
const QUALITY = 85;
const MAX_WIDTH = 1200; // Max width for web display
const THUMBNAIL_WIDTH = 400; // For mobile/thumbnail

async function optimizeImage(inputPath, outputPath, width = MAX_WIDTH, quality = QUALITY) {
  try {
    await sharp(inputPath)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(width, null, { 
        withoutEnlargement: true,
        fastShrinkOnLoad: false 
      })
      .jpeg({ quality, progressive: true })
      .toFile(outputPath);
    
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const reduction = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
    
    console.log(`✓ ${path.basename(inputPath)}: ${(inputStats.size / 1024 / 1024).toFixed(1)}MB → ${(outputStats.size / 1024 / 1024).toFixed(1)}MB (${reduction}% reduction)`);
  } catch (error) {
    console.error(`✗ Error processing ${inputPath}:`, error.message);
  }
}

async function processDirectory(sourceDir, outputDir) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);
  
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
      const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.jpg'));
      await optimizeImage(sourcePath, outputPath);
    }
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...\n');
  
  const categories = ['landscapes', 'portraits', 'artsy', 'events'];
  
  for (const category of categories) {
    const sourceDir = path.join('public', 'images', category);
    const outputDir = path.join('public', 'images', 'optimized', category);
    
    if (fs.existsSync(sourceDir)) {
      console.log(`📁 Processing ${category}...`);
      await processDirectory(sourceDir, outputDir);
      console.log('');
    }
  }
  
  console.log('✅ Image optimization complete!');
  console.log('\n📊 To see total size reduction:');
  console.log('du -sh public/images/optimized/');
}

main().catch(console.error);