import React, { useState, useEffect, useRef } from 'react';
import { optimizeImage } from '../utils/imageOptimization';

interface ImageCarouselProps {
  images: (string | {
    src: string;
    srcSet?: string;
    webp?: string
  })[];
  alt: string;
  className?: string;
  imageRefs?: (refs: (HTMLImageElement | null)[]) => void;
  onFullyLoaded?: () => void;
  loading?: HTMLImageElement['loading'];
}

export function ImageCarousel({
  images,
  alt,
  className = '',
  imageRefs,
  onFullyLoaded,
  loading
}: ImageCarouselProps) {
  const safeImages = React.useMemo(() => {
    if (!images || images.length === 0) {
      return ['https://via.placeholder.com/400x400?text=No+Image'];
    }
    return images.map(img => {
      if (typeof img === 'string') return optimizeImage(img);
      if (typeof img === 'object' && img.src) {
        return { ...img, src: optimizeImage(img.src) };
      }
      return img;
    });
  }, [images]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<number[]>([]);
  const imageElementRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [safeImages]);

  useEffect(() => {
    safeImages.forEach(src => {
      const img = new Image();
      img.src = typeof src === 'string' ? src : src.src;
    });
  }, [safeImages]);

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => {
      if (!prev.includes(index)) {
        return [...prev, index];
      }
      return prev;
    });
  };

  const handleImageLoad = () => {
    if (onFullyLoaded) {
      onFullyLoaded();
    }
  };

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? safeImages.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % safeImages.length
    );
  };

  useEffect(() => {
    if (imageRefs) {
      imageRefs(imageElementRefs.current);
    }
  }, [safeImages, imageRefs]);

  return (
    <div
      className={`${className} relative w-full h-full overflow-hidden`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botón de imagen anterior */}
      {safeImages.length > 1 && (
        <button
          onClick={handlePrevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center"
        >
          <div className="bg-orange-500/50 hover:bg-orange-600/60 rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-300">
            <span className="text-white text-xl font-bold transform -translate-x-0.5">
              ‹
            </span>
          </div>
        </button>
      )}

      {/* Botón de siguiente imagen */}
      {safeImages.length > 1 && (
        <button
          onClick={handleNextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center"
        >
          <div className="bg-orange-500/50 hover:bg-orange-600/60 rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-300">
            <span className="text-white text-xl font-bold transform translate-x-0.5">
              ›
            </span>
          </div>
        </button>
      )}

      {/* Contador de imágenes */}
      {safeImages.length > 1 && (
        <div className="absolute bottom-2 right-2 z-20 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          {currentImageIndex + 1} / {safeImages.length}
        </div>
      )}

      <div className="absolute inset-0 grid grid-cols-1 grid-rows-1">
        {safeImages.map((image, index) => {
          const src = typeof image === 'string' ? image : image.src;
          const isCurrentImage = index === currentImageIndex;
          const isErrored = imageLoadErrors.includes(index);

          const imgProps = { loading: loading ?? (isCurrentImage && index === 0 ? 'eager' : 'lazy') } as {
            loading: HTMLImageElement['loading'];
          };

          return (
            <div
              key={`${src}-${index}`}
              className={`
                absolute inset-0 transition-opacity duration-300
                ${isCurrentImage
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'}
              `}
            >
              <picture>
                {typeof image === 'object' && image.webp && (
                  <source srcSet={image.webp} type="image/webp" />
                )}
                <img
                  ref={(el) => {
                    imageElementRefs.current[index] = el;
                    if (el) {
                      if (isCurrentImage && index === 0) {
                        el.setAttribute('fetchpriority', 'high');
                      } else {
                        el.removeAttribute('fetchpriority');
                      }
                    }
                  }}
                  src={isErrored
                    ? 'https://via.placeholder.com/400x400?text=Image+Error'
                    : src}
                  alt={`${alt} - imagen ${index + 1}`}
                  srcSet={typeof image === 'object' ? image.srcSet : undefined}
                  onError={() => handleImageError(index)}
                  onLoad={() => handleImageLoad()}
                  className="w-full h-full object-cover absolute inset-0 transform scale-100"
                  {...imgProps}
                />
              </picture>
            </div>
          );
        })}
      </div>

      {/* Indicadores de imagen */}
      {safeImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {safeImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleImageChange(index)}
              className={`
                w-2 h-2 rounded-full transition-colors duration-300
                ${index === currentImageIndex ? 'bg-orange-500' : 'bg-gray-300'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
