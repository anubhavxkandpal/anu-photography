import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import type { GalleryImage, Tag } from '../data/types';
import { getAvailableTags } from '../data/types';
import ImageLightbox from './ImageLightbox';

interface FilterableGalleryProps {
  images: GalleryImage[];
  category?: string;
  showAllTags?: boolean; // Show all tags or just those present in images
}

const FilterableGallery: React.FC<FilterableGalleryProps> = ({ 
  images, 
  category,
  showAllTags = false 
}) => {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [columns, setColumns] = useState(3);

  // Get available tags from the images
  const availableTags = useMemo(() => getAvailableTags(images), [images]);

  // Filter and sort images
  const filteredImages = useMemo(() => {
    let result = images;
    
    // Filter by selected tags (show images that have ANY of the selected tags)
    if (selectedTags.length > 0) {
      result = result.filter(img => 
        img.tags?.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Sort by tier, then by date
    return [...result].sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [images, selectedTags]);

  // Single column layout - no masonry

  const toggleTag = (tag: Tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };



  // Tag display names (capitalize and format)
  const formatTag = (tag: string) => {
    return tag.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
        {/* Category Header */}
        {category && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-100 mb-4">
              {category}
            </h1>
            <div className="w-24 h-1 bg-earth-400 mx-auto" />
          </motion.div>
        )}

        {/* Filter Toggle Button */}
        {availableTags.length > 0 && (
          <div className="mb-10">
            <div className="text-center mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200 uppercase tracking-wider"
              >
                {showFilters ? '− Hide Filters' : '+ Filter Photos'}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-center gap-2">
              {/* All button */}
              <button
                onClick={clearFilters}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTags.length === 0
                    ? 'bg-earth-500 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              
              {/* Tag pills */}
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? 'bg-earth-500 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {formatTag(tag)}
                </button>
              ))}
            </div>
                  </div>
                  
                  {/* Active filter count */}
                  {selectedTags.length > 0 && (
                    <p className="text-center text-sm text-gray-400 mt-4">
                      Showing {filteredImages.length} of {images.length} photos
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Single Column Gallery */}
        <motion.div 
          className="flex flex-col gap-12 sm:gap-16 lg:gap-20"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.1 }
            }
          }}
        >
          {filteredImages.map((image, index) => {
            const isFeatured = 'featured' in image && image.featured === true;
            
            return (
              <div
                key={image.src}
                className={`cursor-pointer hover:opacity-90 transition-opacity duration-300 ${
                  isFeatured ? 'my-8 sm:my-12 lg:my-16' : ''
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className={isFeatured 
                    ? "w-full max-h-[85vh] object-contain" 
                    : "w-full h-auto"
                  }
                  loading="lazy"
                />
              </div>
            );
          })}
        </motion.div>

        {/* Empty state */}
        {filteredImages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-gray-400 text-lg">
              No photos match the selected filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-earth-400 hover:text-earth-300 font-medium"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <ImageLightbox
          images={filteredImages}
          currentIndex={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNext={() => setSelectedImage((prev) => prev !== null ? (prev + 1) % filteredImages.length : 0)}
          onPrev={() => setSelectedImage((prev) => prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : 0)}
        />
      )}
    </>
  );
};

export default FilterableGallery;
