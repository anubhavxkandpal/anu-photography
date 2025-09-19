import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import ImageLightbox from './ImageLightbox';

interface Image {
  src: string;
  alt: string;
  title: string;
  location?: string;
  date?: string;
  category: string;
}

interface MasonryGalleryProps {
  images: Image[];
  category?: string;
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({ images, category }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [columns, setColumns] = useState(4);

  // Responsive columns
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumns(1);
      else if (window.innerWidth < 768) setColumns(2);
      else if (window.innerWidth < 1024) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Distribute images into columns
  const distributeImages = () => {
    const cols: Image[][] = Array.from({ length: columns }, () => []);
    images.forEach((image, index) => {
      cols[index % columns].push(image);
    });
    return cols;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.25, 0.25, 1]
      }
    }
  };

  const imageColumns = distributeImages();

  return (
    <>
      <div className="container mx-auto px-6 py-12">
        {/* Category Header */}
        {category && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-light text-forest-800 mb-4">
              {category}
            </h1>
            <div className="w-24 h-0.5 bg-forest-600/30 mx-auto"></div>
          </motion.div>
        )}

        {/* Masonry Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-4 md:gap-6"
        >
          {imageColumns.map((column, colIndex) => (
            <div key={colIndex} className="flex-1 flex flex-col gap-4 md:gap-6">
              {column.map((image, imgIndex) => {
                const originalIndex = images.findIndex(img => img.src === image.src);
                return (
                  <motion.div
                    key={`${colIndex}-${imgIndex}`}
                    variants={itemVariants}
                    className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                    onClick={() => setSelectedImage(originalIndex)}
                  >
                    <div className="relative overflow-hidden bg-gray-100">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <h3 className="text-white font-medium text-lg mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          {image.title}
                        </h3>
                        {image.location && (
                          <p className="text-white/80 text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                            {image.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <ImageLightbox
            images={images}
            currentIndex={selectedImage}
            onClose={() => setSelectedImage(null)}
            onNext={() => setSelectedImage((prev) => (prev! + 1) % images.length)}
            onPrev={() => setSelectedImage((prev) => (prev! - 1 + images.length) % images.length)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MasonryGallery;
