import React, { useEffect, useRef } from 'react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [loadedImages, setLoadedImages] = React.useState<Set<number>>(new Set([0]));
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);

  // Preload next and previous images
  useEffect(() => {
    const preloadImages = (indexes: number[]) => {
      indexes.forEach(index => {
        if (index >= 0 && index < images.length && !loadedImages.has(index)) {
          const img = new Image();
          img.src = images[index];
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
          };
        }
      });
    };

    // Preload next and previous images
    const nextIndex = (currentImageIndex + 1) % images.length;
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    preloadImages([nextIndex, prevIndex]);
  }, [currentImageIndex, images, loadedImages]);

  const changeImage = (newIndex: number) => {
    if (isTransitioning || newIndex === currentImageIndex) return;
    setIsTransitioning(true);
    setCurrentImageIndex(newIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextImage = () => {
    changeImage((currentImageIndex + 1) % images.length);
  };

  const previousImage = () => {
    changeImage((currentImageIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative bg-white">
      <div className="relative w-full h-64 overflow-hidden">
        {images.map((src, index) => (
          <img
            key={src}
            ref={el => imagesRef.current[index] = el}
            src={src}
            alt={`${alt} - Imagen ${index + 1}`}
            className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-300 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            loading={index === 0 ? "eager" : "lazy"}
            style={{
              visibility: Math.abs(index - currentImageIndex) <= 1 ? 'visible' : 'hidden'
            }}
            onLoad={() => {
              if (!loadedImages.has(index)) {
                setLoadedImages(prev => new Set([...prev, index]));
              }
            }}
          />
        ))}
        
        {!loadedImages.has(currentImageIndex) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500"></div>
          </div>
        )}
      </div>

      <button
        onClick={previousImage}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 text-white p-2 rounded-full hover:bg-black transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Imagen anterior"
        disabled={isTransitioning}
      >
        <i className="fas fa-chevron-left text-lg" aria-hidden="true"></i>
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 text-white p-2 rounded-full hover:bg-black transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Siguiente imagen"
        disabled={isTransitioning}
      >
        <i className="fas fa-chevron-right text-lg" aria-hidden="true"></i>
      </button>

      <div 
        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1" 
        role="tablist"
        aria-label="Navegación de imágenes"
      >
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => changeImage(index)}
            role="tab"
            aria-selected={index === currentImageIndex}
            aria-label={`Imagen ${index + 1}`}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-orange-500 w-4' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            disabled={isTransitioning}
          />
        ))}
      </div>
    </div>
  );
}