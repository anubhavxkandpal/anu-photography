import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  quality = 80
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Create optimized versions for different screen sizes
  const createOptimizedSrc = (width: number, format = 'webp') => {
    // For now, we'll use the original image but add query params for future optimization
    return `${src}?w=${width}&q=${quality}&f=${format}`;
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gallery-200 flex items-center justify-center ${className}`}>
        <div className="text-gallery-500 text-center p-4">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gallery-200 via-gallery-300 to-gallery-200 animate-pulse" />
      )}
      
      {/* Responsive image with srcset for different screen sizes */}
      <img
        src={src}
        srcSet={`
          ${createOptimizedSrc(400)} 400w,
          ${createOptimizedSrc(800)} 800w,
          ${createOptimizedSrc(1200)} 1200w,
          ${createOptimizedSrc(1600)} 1600w
        `}
        sizes={`
          (max-width: 640px) 400px,
          (max-width: 1024px) 800px,
          (max-width: 1536px) 1200px,
          1600px
        `}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        decoding="async"
      />
    </div>
  );
};

export default OptimizedImage;