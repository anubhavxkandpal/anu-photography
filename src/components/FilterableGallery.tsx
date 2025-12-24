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

// Helper component for scroll-triggered image reveals
interface GalleryImageItemProps {
  image: GalleryImage;
  onClick: () => void;
  formatTag: (tag: string) => string;
}

const GalleryImageItem: React.FC<GalleryImageItemProps> = ({ image, onClick, formatTag }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      key={image.src}
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
    >
      <img
        src={image.src}
        alt={image.alt}
        className="w-full h-auto object-cover transition-all duration-700 opacity-0 group-hover:scale-105"
        loading="lazy"
        onLoad={(e) => {
          (e.target as HTMLImageElement).classList.remove('opacity-0');
        }}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-heading font-semibold text-lg">
            {image.title}
          </h3>
          <p className="text-white/80 text-sm">
            {image.location}
          </p>
          {/* Show tags on hover */}
          {image.tags && image.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {image.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-white/90"
                >
                  {formatTag(tag)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const FilterableGallery: React.FC<FilterableGalleryProps> = ({ 
  images, 
  category,
  showAllTags = false 
}) => {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
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

  // Responsive columns
  React.useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 1024) setColumns(2);
      else setColumns(3);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Distribute images into columns
  const distributeImages = () => {
    const cols: GalleryImage[][] = Array.from({ length: columns }, () => []);
    filteredImages.forEach((image, index) => {
      cols[index % columns].push(image);
    });
    return cols;
  };

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

  const imageColumns = distributeImages();

  // Tag display names (capitalize and format)
  const formatTag = (tag: string) => {
    return tag.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        {/* Category Header */}
        {category && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              {category}
            </h1>
            <div className="w-24 h-1 bg-earth-400 mx-auto" />
          </motion.div>
        )}

        {/* Filter Pills */}
        {availableTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* All button */}
              <button
                onClick={clearFilters}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTags.length === 0
                    ? 'bg-earth-400 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                      ? 'bg-earth-400 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {formatTag(tag)}
                </button>
              ))}
            </div>
            
            {/* Active filter count */}
            {selectedTags.length > 0 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Showing {filteredImages.length} of {images.length} photos
              </p>
            )}
          </motion.div>
        )}

        {/* Masonry Grid */}
        <motion.div 
          className="flex gap-3 sm:gap-4 lg:gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05, delayChildren: 0.1 }
            }
          }}
        >
          {imageColumns.map((column, colIndex) => (
            <div key={colIndex} className="flex-1 flex flex-col gap-3 sm:gap-4 lg:gap-6">
              <AnimatePresence mode="popLayout">
                {column.map((image) => {
                  const globalIndex = filteredImages.findIndex(img => img.src === image.src);
                  return (
                    <GalleryImageItem
                      key={image.src}
                      image={image}
                      onClick={() => setSelectedImage(globalIndex)}
                      formatTag={formatTag}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        {/* Empty state */}
        {filteredImages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-gray-500 text-lg">
              No photos match the selected filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-earth-500 hover:text-earth-600 font-medium"
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
          initialIndex={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};

export default FilterableGallery;
