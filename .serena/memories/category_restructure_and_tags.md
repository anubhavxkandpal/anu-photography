# Category Restructure & Tag-Based Filtering System

## Overview
Major restructure of the gallery system: expanded from 4 to 6 categories, added a tag-based filtering system, and created a unified Explore page.

## Date Implemented
November 2025

## Category Changes

### Old Structure (4 categories)
- landscapes
- portraits
- artsy
- events

### New Structure (6 categories)
1. **landscapes** - Nature & Landscapes (mountains, valleys, forests)
2. **wildlife** - Wildlife (birds, dogs, monkeys, animals)
3. **portraits** - People & Portraits (human subjects only)
4. **travel** - Travel (places, streets, journeys) - currently empty, ready for content
5. **artsy** - Creative & Artsy (abstract, experimental)
6. **events** - Events (celebrations, gatherings) - may be merged later

### Migration Completed
- Animal images moved from `portraits.json` → `wildlife.json`
- Created new `wildlife.json` and `travel.json` data files

## Tag System

### Tag Categories
Located in `src/data/types.ts`:

**Subject tags:**
- mountains, water, forest, birds, dogs, monkeys, wildlife, architecture, temples, streets, people

**Style tags:**
- candid, golden-hour, misty, silhouette, dramatic, serene, abstract

**Location tags:**
- himalayas, urban, rural

### How Tags Work
- Each image can have multiple tags: `tags: ["mountains", "misty", "himalayas"]`
- Tags are optional (backward compatible)
- FilterableGallery component shows tag pills for filtering
- Filter shows images matching ANY selected tag

## New Components

### FilterableGallery (`src/components/FilterableGallery.tsx`)
Replaces MasonryGallery for gallery pages. Features:
- Tag filter pills at top
- "All" button to clear filters
- Shows count when filtering ("Showing X of Y photos")
- Animated filtering with framer-motion
- Same masonry layout as before
- Shows tags on image hover

## New Pages

### Explore Page (`src/pages/explore.astro`)
- URL: `/explore`
- Shows ALL images from ALL categories combined
- Full tag filtering across entire collection
- Great for discovery

### Wildlife Gallery (`src/pages/galleries/wildlife.astro`)
- URL: `/galleries/wildlife`
- New category for animals

### Travel Gallery (`src/pages/galleries/travel.astro`)
- URL: `/galleries/travel`
- New category, currently empty awaiting content

## Updated Files

### Data Files
- `src/data/types.ts` - Added tags, categories constants, helper functions
- `src/data/landscapes.json` - Added tags to all images
- `src/data/portraits.json` - Removed animals, added tags
- `src/data/wildlife.json` - NEW - animal images with tags
- `src/data/travel.json` - NEW - empty, ready for content
- `src/data/artsy.json` - Added tags to all images
- `src/data/events.json` - Added tags to all images

### Gallery Pages
All gallery pages now use FilterableGallery:
- `src/pages/galleries/landscapes.astro`
- `src/pages/galleries/wildlife.astro` (NEW)
- `src/pages/galleries/portraits.astro`
- `src/pages/galleries/travel.astro` (NEW)
- `src/pages/galleries/artsy.astro`
- `src/pages/galleries/events.astro`

### Layout & Navigation
- `src/layouts/Layout.astro` - Updated nav with new categories + Explore link
- `src/pages/index.astro` - Updated homepage with 6 category cards + Explore

## Adding New Tags
1. Add to the appropriate array in `src/data/types.ts` (TAGS object)
2. TypeScript will enforce valid tags across all JSON files

## Notes
- MasonryGallery component still exists but is no longer used by gallery pages
- Events category kept but may be merged into other categories later
- Travel category is empty - ready for user to add images
- Future: Consider AI-powered auto-tagging based on image content
