/**
 * Image data types for Anu Photography galleries
 */

/**
 * Curated tag set for filtering
 * Organized by type for clarity
 */
export const TAGS = {
  // Subject tags
  subject: [
    'mountains',
    'water',
    'forest',
    'birds',
    'dogs',
    'monkeys',
    'wildlife',
    'architecture',
    'temples',
    'streets',
    'people',
  ],
  // Style/mood tags
  style: [
    'candid',
    'golden-hour',
    'misty',
    'silhouette',
    'dramatic',
    'serene',
    'abstract',
  ],
  // Location tags (can expand as needed)
  location: [
    'himalayas',
    'urban',
    'rural',
  ],
} as const;

// Flatten all tags into a single array for validation
export const ALL_TAGS = [
  ...TAGS.subject,
  ...TAGS.style,
  ...TAGS.location,
] as const;

export type Tag = typeof ALL_TAGS[number];

/**
 * Gallery categories
 */
export const CATEGORIES = [
  'landscapes',
  'wildlife', 
  'portraits',
  'travel',
  'artsy',
  'events',
] as const;

export type Category = typeof CATEGORIES[number];

/**
 * Category metadata for display
 */
export const CATEGORY_INFO: Record<Category, { name: string; description: string }> = {
  landscapes: {
    name: 'Nature & Landscapes',
    description: 'Mountains, valleys, forests, and natural vistas',
  },
  wildlife: {
    name: 'Wildlife',
    description: 'Birds, animals, and creatures in their natural habitat',
  },
  portraits: {
    name: 'People & Portraits',
    description: 'Human subjects, expressions, and stories',
  },
  travel: {
    name: 'Travel',
    description: 'Places, streets, and moments from journeys',
  },
  artsy: {
    name: 'Creative & Artsy',
    description: 'Abstract, experimental, and artistic compositions',
  },
  events: {
    name: 'Events',
    description: 'Celebrations, gatherings, and special occasions',
  },
};

export interface GalleryImage {
  /** Relative path to the optimized image */
  src: string;
  
  /** Alt text for accessibility and SEO */
  alt: string;
  
  /** Display title for the image */
  title: string;
  
  /** Location where the photo was taken */
  location: string;
  
  /** Date the photo was taken (YYYY-MM-DD format) */
  date: string;
  
  /** Primary category for gallery organization */
  category: Category;
  
  /** 
   * Tier for ordering within the gallery
   * 1 = Featured (best work, shown first)
   * 2 = Great (strong portfolio pieces)
   * 3 = Good (solid work, adds variety)
   */
  tier: 1 | 2 | 3;
  
  /**
   * Tags for filtering and discovery
   * Images can have multiple tags from the curated set
   */
  tags?: Tag[];
}

/**
 * Category data structure in JSON files
 */
export interface CategoryData {
  category: {
    name: string;
    slug: string;
    description: string;
  };
  images: GalleryImage[];
}

/**
 * Sort images by tier (ascending) then by date (descending)
 * This puts featured images first, then sorts by recency within each tier
 */
export function sortGalleryImages(images: GalleryImage[]): GalleryImage[] {
  return [...images].sort((a, b) => {
    // First sort by tier (1 before 2 before 3)
    if (a.tier !== b.tier) {
      return a.tier - b.tier;
    }
    // Within same tier, sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Filter images by tags (returns images that have ANY of the selected tags)
 */
export function filterByTags(images: GalleryImage[], selectedTags: Tag[]): GalleryImage[] {
  if (selectedTags.length === 0) return images;
  return images.filter(img => 
    img.tags?.some(tag => selectedTags.includes(tag))
  );
}

/**
 * Get all unique tags from a set of images
 */
export function getAvailableTags(images: GalleryImage[]): Tag[] {
  const tagSet = new Set<Tag>();
  images.forEach(img => {
    img.tags?.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}
