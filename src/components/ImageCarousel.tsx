import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface ImageCarouselProps {
  images: (string | { src: string; srcSet?: string })[];
  alt: string;
  srcSet?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export function ImageCarousel({ 
  images, 
  alt, 
  srcSet, 
  loading = 'lazy', 
  className 
}: ImageCarouselProps) {
  // Ensure images is always an array with a fallback
  const safeImages = useMemo(() => 
    Array.isArray(images) && images.length > 0 
      ? images.map((image, index) => {
          // Normalize image to always be an object
          if (typeof image === 'string') {
            return { 
              src: image, 
              srcSet: `${image} 320w, ${image} 640w, ${image} 1024w, ${image} 1920w`
            };
          }
          
          // If already an object but no srcSet, generate a default
          if (!image.srcSet) {
            return { 
              ...image, 
              srcSet: `${image.src} 320w, ${image.src} 640w, ${image.src} 1024w, ${image.src} 1920w`
            };
          }
          
          return image;
        })
      : [{ 
          src: 'https://via.placeholder.com/400x400?text=No+Image', 
          srcSet: 'https://via.placeholder.com/400x400?text=No+Image 320w' 
        }]
  , [images]);

  // State for current image index and load errors
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<number[]>([]);

  // Reset index when images change
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageLoadErrors([]);
  }, [safeImages]);

  // Memoized navigation handlers
  const handleNext = useCallback(() => {
    setCurrentImageIndex(prev => {
      return prev === safeImages.length - 1 ? 0 : prev + 1;
    });
  }, [safeImages]);

  const handlePrev = useCallback(() => {
    setCurrentImageIndex(prev => {
      return prev === 0 ? safeImages.length - 1 : prev - 1;
    });
  }, [safeImages]);

  // Handle image load errors
  const handleImageError = useCallback((index: number) => {
    setImageLoadErrors(prev => [...prev, index]);
  }, [safeImages]);

  // Render method with careful styling
  return (
    <div 
      className={`${className} relative w-full h-full overflow-hidden`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 grid grid-cols-1 grid-rows-1">
        {safeImages.map((image, index) => {
          const isCurrentImage = index === currentImageIndex;
          const hasLoadError = imageLoadErrors.includes(index);

          return (
            <div
              key={`${image.src}-${index}`}
              className={`
                absolute inset-0 transition-all duration-500 ease-in-out
                ${isCurrentImage 
                  ? 'opacity-100 z-10 visible' 
                  : 'opacity-0 z-0 invisible'}
                ${hasLoadError ? 'hidden' : ''}
              `}
            >
              <img
                key={`img-${index}`}
                src={image.src}
                alt={`${alt} - Image ${index + 1}`}
                srcSet={image.srcSet}
                loading={loading}
                onError={() => handleImageError(index)}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      {safeImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-orange-500 transition-colors z-20"
            aria-label="Previous Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-orange-500 transition-colors z-20"
            aria-label="Next Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {safeImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {safeImages.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => setCurrentImageIndex(index)}
              className={`
                w-2 h-2 rounded-full transition-colors duration-300
                ${index === currentImageIndex ? 'bg-orange-500' : 'bg-gray-300'}
              `}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
