import fs from 'fs';
import path from 'path';

const categories = ['landscapes', 'portraits', 'artsy', 'events'];

console.log('🗑️  Starting cleanup of original images...\n');

let totalSizeBefore = 0;
let totalSizeAfter = 0;

function getDirectorySize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  let size = 0;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      size += stats.size;
    }
  }
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Calculate current size
for (const category of categories) {
  const originalDir = path.join('public', 'images', category);
  const optimizedDir = path.join('public', 'images', 'optimized', category);
  
  const originalSize = getDirectorySize(originalDir);
  const optimizedSize = getDirectorySize(optimizedDir);
  
  totalSizeBefore += originalSize + optimizedSize;
  totalSizeAfter += optimizedSize;
  
  if (fs.existsSync(originalDir)) {
    console.log(`📁 ${category}:`);
    console.log(`   Original: ${formatBytes(originalSize)}`);
    console.log(`   Optimized: ${formatBytes(optimizedSize)}`);
    console.log(`   Removing original folder...`);
    
    // Remove original directory
    fs.rmSync(originalDir, { recursive: true, force: true });
    console.log(`   ✅ Removed ${originalDir}\n`);
  }
}

console.log('📊 Cleanup Summary:');
console.log(`Before: ${formatBytes(totalSizeBefore)}`);
console.log(`After: ${formatBytes(totalSizeAfter)}`);
console.log(`Saved: ${formatBytes(totalSizeBefore - totalSizeAfter)} (${((totalSizeBefore - totalSizeAfter) / totalSizeBefore * 100).toFixed(1)}%)`);
console.log('\n✅ Original image cleanup complete!');
console.log('💡 Note: Only optimized images remain. Original files have been removed to reduce repository size.');