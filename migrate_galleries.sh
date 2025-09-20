#!/bin/bash
# Script to migrate from AnimatedGallery to MasonryGallery

# Update artsy.astro
sed -i '' 's/import AnimatedGallery from/import MasonryGallery from/g' src/pages/galleries/artsy.astro
sed -i '' 's/<AnimatedGallery/<MasonryGallery/g' src/pages/galleries/artsy.astro

# Update events.astro
sed -i '' 's/import AnimatedGallery from/import MasonryGallery from/g' src/pages/galleries/events.astro
sed -i '' 's/<AnimatedGallery/<MasonryGallery/g' src/pages/galleries/events.astro

echo "Migration complete!"
