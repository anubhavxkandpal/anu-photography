import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Configuration
const QUALITY = 85;
const MAX_WIDTH = 1200;

async function optimizeImage(inputPath, outputPath, quality = QUALITY) {
  try {
    await sharp(inputPath)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(MAX_WIDTH, null, { 
        withoutEnlargement: true,
        fastShrinkOnLoad: false 
      })
      .jpeg({ quality, progressive: true })
      .toFile(outputPath);
    
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const reduction = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
    
    console.log(`✓ ${path.basename(inputPath)}: ${(inputStats.size / 1024 / 1024).toFixed(1)}MB → ${(outputStats.size / 1024 / 1024).toFixed(1)}MB (${reduction}% reduction)`);
    
    return {
      originalName: path.basename(inputPath),
      optimizedName: path.basename(outputPath),
      originalSize: inputStats.size,
      optimizedSize: outputStats.size,
      reduction
    };
  } catch (error) {
    console.error(`✗ Error processing ${inputPath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🖼️  Starting new image optimization...\n');
  
  const sourceDir = 'public/images';
  const tempDir = 'public/images/temp-optimized';
  
  // Create temp directory for optimized images
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file) && 
    fs.statSync(path.join(sourceDir, file)).isFile()
  );
  
  console.log(`Found ${imageFiles.length} new images to optimize:\n`);
  
  const results = [];
  let index = 1;
  
  for (const file of imageFiles) {
    const sourcePath = path.join(sourceDir, file);
    const outputPath = path.join(tempDir, file.replace(/\.(jpg|jpeg|png)$/i, '.jpg'));
    
    console.log(`${index}. Processing: ${file}`);
    const result = await optimizeImage(sourcePath, outputPath);
    
    if (result) {
      results.push({ index, ...result });
    }
    
    index++;
  }
  
  console.log('\n✅ Image optimization complete!\n');
  console.log('📋 New optimized images (numbered for categorization):');
  console.log('=' .repeat(60));
  
  results.forEach(({ index, originalName, optimizedName }) => {
    console.log(`${index.toString().padStart(2)}. ${optimizedName}`);
  });
  
  console.log('\n💡 Next step: Tell me which numbers go in which category!');
  console.log('Categories: landscapes, portraits, artsy, events');
  console.log('\nOptimized images are temporarily stored in: public/images/temp-optimized/');
}

main().catch(console.error);