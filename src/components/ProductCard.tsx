import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Product } from '../types/database';
import { ImageCarousel } from './ImageCarousel';
import { generateWebPSrcset, generateLowResPlaceholder, optimizeImage } from '../utils/imageOptimization';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const [imageLoadProgress, setImageLoadProgress] = useState(0);
  const [isImageFullyLoaded, setIsImageFullyLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const imageLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validImages = React.useMemo(() => {
    if (!product.images || product.images.length === 0) {
      return ['https://via.placeholder.com/400x400?text=No+Image'];
    }
    const filtered = product.images.filter(img => img && img.trim() !== '');
    return filtered.length > 0 ? filtered : ['https://via.placeholder.com/400x400?text=No+Image'];
  }, [product.images]);

  const imageData = React.useMemo(() => {
    return validImages.map((src) => {
      const optimizedSrc = optimizeImage(src);
      return {
        src: optimizedSrc,
        srcSet: generateWebPSrcset([optimizedSrc])[0],
        webp: optimizeImage(src, { format: 'webp', quality: 70 }),
        lowResSrc: generateLowResPlaceholder(optimizedSrc)
      };
    });
  }, [validImages]);

  const handleImageFullyLoaded = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (imageLoadTimeoutRef.current) {
      clearTimeout(imageLoadTimeoutRef.current);
    }

    setImageLoadProgress(100);
    setIsImageFullyLoaded(true);
  }, []);

  useEffect(() => {
    setImageLoadProgress(0);
    setIsImageFullyLoaded(false);

    progressIntervalRef.current = setInterval(() => {
      setImageLoadProgress(prev => {
        if (prev < 80) {  // Dejar espacio para la carga final
          return prev + 10;
        }
        clearInterval(progressIntervalRef.current!);
        return prev;
      });
    }, 200);

    imageLoadTimeoutRef.current = setTimeout(() => {
      handleImageFullyLoaded();
    }, 5000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
      }
    };
  }, [product, handleImageFullyLoaded]);

  const handleAddToCart = useCallback(() => {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 500);
  }, [addItem, product]);

  return (
    <div className={[
      className,
      "product-card bg-white border-2 border-black rounded-xl overflow-hidden shadow-hard hover:shadow-hard-orange flex flex-col h-full relative transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group"
    ].filter(Boolean).join(' ')} >
      {/* Imagen con proporción equilibrada */}
      <div className="w-full aspect-[4/5] sm:aspect-square overflow-hidden relative bg-gray-100">
        {/* Barra de progreso de carga */}
        <div
          className="absolute top-0 left-0 h-1 bg-orange-500 z-50 transition-all duration-300"
          style={{
            width: `${imageLoadProgress}%`,
            opacity: isImageFullyLoaded ? 0 : 1
          }}
        />

        {/* Barrido de luz al hover (decorativo) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-30 w-1/3 bg-white/40 -translate-x-[150%] -skew-x-[15deg] group-hover:animate-shine"
        />

        {/* Placeholder de baja resolución */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 blur-lg transition-opacity duration-300"
          style={{
            backgroundImage: `url(${imageData[0].lowResSrc})`,
            zIndex: 10,
            opacity: isImageFullyLoaded ? 0 : 0.5
          }}
        />

        <ImageCarousel
          images={imageData}
          alt={product.name}
          loading="lazy"
          className="product-card-zoom w-full h-full relative z-20 transition-opacity duration-500"
          onFullyLoaded={handleImageFullyLoaded}
        />
      </div>

      {/* Contenido con textos más legibles */}
      <div className="bg-white p-3 sm:p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-2">
          {/* Título más legible */}
          <h2 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-tight">
            {product.name}
          </h2>

          {/* Tags con mejor tamaño */}
          <div className="flex flex-wrap gap-1">
            {product.category_ref && (
              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium inline-block border border-black/30 transition-transform duration-200 hover:scale-110">
                {product.category_ref.name}
              </span>
            )}
            {product.anime && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium inline-block border border-black/30 transition-transform duration-200 hover:scale-110">
                {product.anime.name}
              </span>
            )}
          </div>

          {/* Precio estilo sticker manga */}
          <div>
            <span className="inline-block bg-orange-500 text-white text-base sm:text-lg font-bold px-2.5 py-0.5 border-2 border-black shadow-hard-sm -rotate-1">
              C${product.price.toFixed(2)}
            </span>
          </div>

          {/* Descripción legible */}
          <p className="text-xs sm:text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Botón estilo manga: sombra dura que colapsa al presionar */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-orange-500 text-white py-2 sm:py-2 px-3 sm:px-3 rounded-md flex items-center justify-center gap-2 border-2 border-black shadow-hard-sm hover:bg-orange-600 transition-all duration-200 font-bold text-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none mt-3"
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <ShoppingCart size={14} className={`sm:w-4 sm:h-4 ${justAdded ? 'animate-pop' : ''}`} />
          <span>{justAdded ? '¡Agregado!' : 'Agregar'}</span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;