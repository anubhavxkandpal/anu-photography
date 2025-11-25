# Image Management & Optimization System

## Overview
Implemented a complete image management system with centralized data, tier-based ordering, and an automated optimization pipeline.

## Date Implemented
November 2025

## Components

### 1. Staging Folder Structure
```
public/images/staging/
├── landscapes/
├── portraits/
├── artsy/
├── events/
└── README.md
```
Drop unoptimized images here before running the optimization script.

### 2. Image Optimization Script
**Location**: `scripts/optimize-images.js`

**Usage**:
```bash
npm run optimize              # Process all categories
npm run optimize:landscapes   # Process only landscapes
npm run optimize:portraits    # etc.
```

**Settings**:
- Max dimension: 2000px (longest edge)
- JPEG quality: 83 (adaptive, reduces for very large files)
- Target size: ~300-500KB per image
- Minimum quality: 70 (never goes below this)
- Uses mozjpeg for better compression
- Progressive JPEG for faster perceived loading

**Output**:
- Optimized images go to `public/images/optimized/[category]/`
- Manifest JSON saved to `scripts/manifests/[category]-[timestamp].json`

### 3. Centralized Image Data (JSON)
**Location**: `src/data/`

Files:
- `landscapes.json`
- `portraits.json`
- `artsy.json`
- `events.json`
- `types.ts` (TypeScript definitions)

**Structure**:
```json
{
  "category": {
    "name": "Nature & Landscapes",
    "slug": "landscapes",
    "description": "..."
  },
  "images": [
    {
      "src": "/images/optimized/landscapes/image.jpg",
      "alt": "Description",
      "title": "Display Title",
      "location": "Photo Location",
      "date": "2025-10-31",
      "category": "landscapes",
      "tier": 1
    }
  ]
}
```

### 4. Tier System
- **Tier 1 (Featured)**: Best work, shown first
- **Tier 2 (Great)**: Strong portfolio pieces
- **Tier 3 (Good)**: Solid work, adds variety

Images are sorted by tier (ascending), then by date (descending) within each tier.

### 5. Gallery Pages
Gallery pages now import from JSON and sort automatically:
```astro
import landscapeData from '../../data/landscapes.json';

const sortedImages = [...landscapeData.images].sort((a, b) => {
  if (a.tier !== b.tier) return a.tier - b.tier;
  return new Date(b.date).getTime() - new Date(a.date).getTime();
});
```

## Workflow for Adding New Images

1. **Drop images** into `public/images/staging/[category]/`
2. **Run optimization**: `npm run optimize` or `npm run optimize:[category]`
3. **Check manifest** in `scripts/manifests/` for generated JSON entries
4. **Add metadata** (title, alt, location, tier) to manifest entries
5. **Copy to data file**: Add entries to `src/data/[category].json`
6. **Clear staging**: Remove processed images from staging folder

## Files Changed
- Created: `scripts/optimize-images.js`
- Created: `public/images/staging/` (with subfolders)
- Created: `public/images/staging/README.md`
- Created: `src/data/types.ts`
- Created: `src/data/landscapes.json`
- Created: `src/data/portraits.json`
- Created: `src/data/artsy.json`
- Created: `src/data/events.json`
- Modified: `package.json` (added optimize scripts)
- Modified: `src/pages/galleries/landscapes.astro` (reads from JSON)
- Modified: `src/pages/galleries/portraits.astro` (reads from JSON)
- Modified: `src/pages/galleries/artsy.astro` (reads from JSON)
- Modified: `src/pages/galleries/events.astro` (reads from JSON)

## Reordering Images
To reorder images in a gallery:
1. Open `src/data/[category].json`
2. Change the `tier` value (1, 2, or 3)
3. Featured images (tier 1) appear first
4. Within each tier, newer dates appear first

## Notes
- Original image files in `public/images/` root still exist (not yet migrated to optimized folder)
- Some images need re-optimization as they exceed target size
- Tier assignments in JSON are preliminary and can be adjusted
