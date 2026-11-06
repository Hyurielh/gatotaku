import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  const getImageSrc = (image: (typeof safeImages)[number]) =>
    typeof image === 'string' ? image : image.src;

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

  const [viewerOpen, setViewerOpen] = useState(false);

  const openViewer = (index: number) => {
    setCurrentImageIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

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
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90"
        >
          <div className="bg-teal-600/85 hover:bg-teal-700/95 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-colors duration-200">
            <span className="text-white text-xl font-bold transform -translate-x-0.5">
              ‹
            </span>
          </div>
        </button>
      )}

      {/* Viewer / Lightbox */}
      {viewerOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4"
          onClick={closeViewer}
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada de ${alt}`}
        >
          <div className="max-w-full max-h-full">
            <img
              src={getImageSrc(safeImages[currentImageIndex])}
              alt={`${alt} - imagen ${currentImageIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            <div className="mt-4 flex justify-center space-x-4">
              <a
                href={getImageSrc(safeImages[currentImageIndex])}
                download
                className="px-4 py-2 bg-white text-black rounded"
                onClick={(e) => e.stopPropagation()}
              >
                Descargar
              </a>
              <button
                onClick={(e) => { e.stopPropagation(); closeViewer(); }}
                className="px-4 py-2 bg-white text-black rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Botón de siguiente imagen */}
      {safeImages.length > 1 && (
        <button
          onClick={handleNextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90"
        >
          <div className="bg-teal-600/85 hover:bg-teal-700/95 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-colors duration-200">
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
                  className="w-full h-full object-contain absolute inset-0 p-4"
                  {...imgProps}
                />
              </picture>
              {/* Mobile-only actions: ver/descargar */}
              <div className="absolute bottom-3 left-3 z-30 flex space-x-2 md:hidden">
                <button
                  onClick={() => openViewer(index)}
                  className="rounded bg-black/60 px-3 py-1 text-white backdrop-blur-sm transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  Ver
                </button>
                <a
                  href={isErrored ? 'https://via.placeholder.com/400x400?text=Image+Error' : src}
                  download
                  className="rounded bg-black/60 px-3 py-1 text-white backdrop-blur-sm transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  Descargar
                </a>
              </div>
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
                ${index === currentImageIndex ? 'bg-teal-600' : 'bg-slate-300'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
