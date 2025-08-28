import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageLightbox from './ImageLightbox';

interface Image {
  src: string;
  alt: string;
  title: string;
  location?: string;
  date?: string;
  category: string;
}

interface AnimatedGalleryProps {
  images: Image[];
  category?: string;
}

const AnimatedGallery: React.FC<AnimatedGalleryProps> = ({ images, category }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
        duration: 0.6,
        ease: [0.25, 0.25, 0.25, 1]
      }
    }
  };

  const hoverVariants = {
    rest: { 
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    hover: { 
      scale: 1.05,
      y: -8,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

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
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-gallery-800 mb-4 capitalize">
              {category}
            </h1>
            <div className="w-24 h-1 bg-gallery-600 mx-auto"></div>
          </motion.div>
        )}

        {/* Gallery Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {images.map((image, index) => (
            <motion.div
              key={`${image.src}-${index}`}
              variants={itemVariants}
              className="group cursor-pointer"
              whileHover="hover"
              initial="rest"
              animate="rest"
              onClick={() => setSelectedImage(index)}
            >
              <motion.div
                variants={hoverVariants}
                className="relative overflow-hidden rounded-lg shadow-lg bg-gallery-200"
                style={{ aspectRatio: '4/5' }}
              >
                {/* Loading Skeleton */}
                {!imageLoaded[index] && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gallery-200 via-gallery-300 to-gallery-200 animate-pulse" />
                )}
                
                {/* Image */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded[index] ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageLoad(index)}
                />
                
                {/* Hover Overlay */}
                <motion.div
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  whileHover={{ opacity: 1 }}
                >
                  <motion.div
                    className="text-white text-center p-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                    {image.location && (
                      <p className="text-sm opacity-90">{image.location}</p>
                    )}
                  </motion.div>
                </motion.div>

                {/* Shadow Enhancement on Hover */}
                <motion.div
                  className="absolute -inset-2 bg-black/20 rounded-lg -z-10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                  variants={{
                    rest: { opacity: 0, scale: 0.95 },
                    hover: { opacity: 1, scale: 1 }
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {images.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="text-gallery-400 text-6xl mb-4">📸</div>
            <h3 className="font-heading text-2xl text-gallery-600 mb-2">No images yet</h3>
            <p className="text-gallery-500">Photos will appear here soon!</p>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <ImageLightbox
            images={images}
            currentIndex={selectedImage}
            onClose={() => setSelectedImage(null)}
            onNext={() => setSelectedImage((selectedImage + 1) % images.length)}
            onPrev={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AnimatedGallery;