import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Keyboard, Mousewheel } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface Image {
  src: string;
  alt: string;
  title: string;
  location?: string;
  date?: string;
  category: string;
}

interface ImageLightboxProps {
  images: Image[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) => {
  const swiperRef = useRef<SwiperType>();
  const [activeIndex, setActiveIndex] = useState(currentIndex);



  useEffect(() => {
    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrev();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(currentIndex, 0);
    }
    setActiveIndex(currentIndex);
  }, [currentIndex]);



  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.4, 
        ease: [0.25, 0.25, 0.25, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      y: 30,
      transition: { 
        duration: 0.3, 
        ease: 'easeIn'
      }
    }
  };

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        className="relative w-full h-full max-w-7xl max-h-screen pb-32"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-12 h-12 bg-gray-800/80 hover:bg-gray-900 rounded-full flex items-center justify-center text-white transition-colors duration-200"
          aria-label="Close lightbox"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Swiper Gallery */}
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[Navigation, Keyboard, Mousewheel]}
          initialSlide={currentIndex}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          keyboard={{
            enabled: true,
          }}
          mousewheel={{
            forceToAxis: true,
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
          className="w-full h-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={`lightbox-${image.src}-${index}`} className="flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={image.src}
                  alt=""
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                  loading={Math.abs(index - currentIndex) <= 1 ? 'eager' : 'lazy'}
                />

              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button
          className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gray-800/80 hover:bg-gray-900 rounded-full flex items-center justify-center text-white transition-colors duration-200 disabled:opacity-30"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gray-800/80 hover:bg-gray-900 rounded-full flex items-center justify-center text-white transition-colors duration-200 disabled:opacity-30"
          aria-label="Next image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Image Counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Thumbnail Strip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-full">
          <div className="flex gap-2 px-4 py-3 bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-x-auto max-w-screen-lg">
            {images.map((image, index) => (
            <button
              key={`thumb-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (swiperRef.current) {
                    swiperRef.current.slideTo(index);
                  }
                }}
                className={`flex-shrink-0 w-24 h-18 rounded overflow-hidden border-2 transition-all duration-200 ${
                  index === activeIndex 
                    ? 'border-white shadow-lg' 
                    : 'border-transparent hover:border-white/50'
                }`}
              >
                <img
                  src={image.src}
                  className="w-full h-full object-cover"
                  style={{ 
                    minHeight: '72px',
                    background: '#4B5563'
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageLightbox;