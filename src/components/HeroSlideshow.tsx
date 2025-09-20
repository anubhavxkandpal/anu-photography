import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroImage {
  src: string;
  alt: string;
  focusPosition?: string; // For object-position CSS
}

const HeroSlideshow: React.FC = () => {
  // Curated list of best hero images
  const heroImages: HeroImage[] = [
    {
      src: '/images/optimized/landscapes/IMG_9604-Edit.jpg',
      alt: 'Stunning landscape photography',
      focusPosition: 'center center'
    },
    {
      src: '/images/optimized/landscapes/IMG_0095-Edit.jpg',
      alt: 'Natural beauty captured',
      focusPosition: 'center center'
    },
    {
      src: '/images/optimized/landscapes/kalga_DSC_7632.jpg',
      alt: 'Mountain landscape from Kalga',
      focusPosition: 'center center'
    },
    {
      src: '/images/optimized/landscapes/kalga_DSC_7634.jpg',
      alt: 'Kalga valley view',
      focusPosition: 'center center'
    },
    {
      src: '/images/optimized/artsy/IMG_0536-Edit.jpg',
      alt: 'Bridge architectural photography',
      focusPosition: 'center center'
    },
    {
      src: '/images/optimized/landscapes/IMG_0738-Edit.jpg',
      alt: 'Water body landscape',
      focusPosition: 'center center'
    },
    {
      src: '/images/optimized/landscapes/IMG_0107-Edit.jpg',
      alt: 'Professional landscape',
      focusPosition: 'center center'
    }
  ];;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="absolute inset-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img 
            src={heroImages[currentIndex].src}
            alt={heroImages[currentIndex].alt}
            className="w-full h-full object-cover"
            style={{ objectPosition: heroImages[currentIndex].focusPosition }}
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50"></div>
      
      {/* Subtle dot indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlideshow;
