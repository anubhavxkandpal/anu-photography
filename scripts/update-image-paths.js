import fs from 'fs';
import path from 'path';

const galleries = ['landscapes', 'portraits', 'artsy', 'events'];

function updateGalleryFile(galleryPath) {
  let content = fs.readFileSync(galleryPath, 'utf8');
  
  // Replace image paths to use optimized versions
  content = content.replace(
    /src: '\/images\/(landscapes|portraits|artsy|events)\/([^']+\.(jpg|jpeg|png|JPG|JPEG|PNG))'/g,
    "src: '/images/optimized/$1/$2'"
  );
  
  // Normalize file extensions to .jpg (since Sharp converts everything to JPEG)
  content = content.replace(
    /\/images\/optimized\/([^\/]+)\/([^']+)\.(jpeg|png|JPG|JPEG|PNG)'/g,
    "/images/optimized/$1/$2.jpg'"
  );
  
  fs.writeFileSync(galleryPath, content, 'utf8');
  console.log(`✓ Updated ${path.basename(galleryPath)}`);
}

console.log('🔄 Updating gallery files to use optimized images...\n');

galleries.forEach(gallery => {
  const galleryFile = `src/pages/galleries/${gallery}.astro`;
  if (fs.existsSync(galleryFile)) {
    updateGalleryFile(galleryFile);
  }
});

console.log('\n✅ All gallery files updated to use optimized images!');