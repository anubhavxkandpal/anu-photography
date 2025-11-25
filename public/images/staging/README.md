# Image Staging Folder

Drop your unoptimized images here, organized by category.

## Folder Structure

```
staging/
├── landscapes/    ← Nature, mountains, scenic vistas
├── portraits/     ← People, headshots, personal portraits
├── artsy/         ← Creative, experimental, abstract
└── events/        ← Weddings, celebrations, occasions
```

## Workflow

1. **Drop images** into the appropriate category folder
2. **Run optimization**: `npm run optimize` or `npm run optimize:landscapes`
3. **Check manifests** in `scripts/manifests/` for JSON entries
4. **Add metadata** (title, alt, location, tier) to manifest entries
5. **Copy to data files** in `src/data/[category].json`
6. **Clear staging** once images are processed

## Tier System

When adding images to the JSON data, assign a tier:

- **Tier 1 (Featured)**: Your absolute best work, hero-worthy
- **Tier 2 (Great)**: Strong images, core portfolio pieces
- **Tier 3 (Good)**: Solid work that adds variety

Images are sorted by tier (featured first), then by date within each tier.

## Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- TIFF (.tif, .tiff)

Non-JPEG formats will be converted to JPEG during optimization.

## Optimization Settings

- Max dimension: 2000px (preserves aspect ratio)
- JPEG quality: 83 (adaptive, may reduce for very large files)
- Target size: ~300-500KB per image
- Progressive JPEG for faster perceived loading
