/**
 * Image data types for Anu Photography galleries
 */

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
  
  /** Category for filtering/organization */
  category: 'landscapes' | 'portraits' | 'artsy' | 'events';
  
  /** 
   * Tier for ordering within the gallery
   * 1 = Featured (best work, shown first)
   * 2 = Great (strong portfolio pieces)
   * 3 = Good (solid work, adds variety)
   */
  tier: 1 | 2 | 3;
}

/**
 * Category metadata
 */
export interface CategoryInfo {
  name: string;
  slug: string;
  description: string;
  heroImage?: string;
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
