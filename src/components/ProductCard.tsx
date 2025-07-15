import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Product } from '../types/database';
import { ImageCarousel } from './ImageCarousel';
import { generateWebPSrcset, convertToWebP, generateLowResPlaceholder } from '../utils/imageOptimization';
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
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const imageLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validImages = React.useMemo(() => {
    if (!product.images || product.images.length === 0) {
      return ['https://via.placeholder.com/400x400?text=No+Image'];
    }
    const filtered = product.images.filter(img => img && img.trim() !== '');
    return filtered.length > 0 ? filtered : ['https://via.placeholder.com/400x400?text=No+Image'];
  }, [product.images]);

  const imageData = React.useMemo(() => {
    return validImages.map((src, index) => ({
      src: src,
      srcSet: generateWebPSrcset([src])[0],
      webp: convertToWebP(src),
      lowResSrc: generateLowResPlaceholder(src)
    }));
  }, [validImages]);

  // Callback para manejar la carga completa de imágenes
  const handleImageFullyLoaded = useCallback(() => {
    // Detener intervalos y timeouts
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (imageLoadTimeoutRef.current) {
      clearTimeout(imageLoadTimeoutRef.current);
    }

    // Establecer progreso al 100% y marcar como cargado
    setImageLoadProgress(100);
    setIsImageFullyLoaded(true);
  }, []);

  useEffect(() => {
    // Reiniciar estados
    setImageLoadProgress(0);
    setIsImageFullyLoaded(false);

    // Simular progreso de carga gradual
    progressIntervalRef.current = setInterval(() => {
      setImageLoadProgress(prev => {
        if (prev < 80) {  // Dejar espacio para la carga final
          return prev + 10;
        }
        clearInterval(progressIntervalRef.current!);
        return prev;
      });
    }, 200);

    // Timeout de seguridad
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

  return (
    <div className={[
      className, 
      "product-card bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl flex flex-col h-full relative transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
    ].filter(Boolean).join(' ')} >
      {/* Imagen mucho más prominente en móvil */}
      <div className="w-full aspect-[3/4] sm:aspect-square overflow-hidden relative bg-gray-100">
        {/* Barra de progreso de carga */}
        <div 
          className="absolute top-0 left-0 h-1 bg-orange-500 z-50 transition-all duration-300" 
          style={{ 
            width: `${imageLoadProgress}%`,
            opacity: isImageFullyLoaded ? 0 : 1
          }}
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
          className="w-full h-full relative z-20 transition-opacity duration-500"
          onFullyLoaded={handleImageFullyLoaded}
        />
      </div>
      
      {/* Contenido optimizado para móvil */}
      <div className="bg-white p-2 sm:p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-1 sm:space-y-2">
          {/* Título compacto pero legible */}
          <h2 className="text-xs sm:text-base font-bold text-gray-900 line-clamp-2 leading-tight">
            {product.name}
          </h2>
          
          {/* Tags más compactos */}
          <div className="flex flex-wrap gap-0.5 sm:gap-1">
            {product.category_ref && (
              <span className="bg-orange-100 text-orange-700 px-1 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
                {product.category_ref.name}
              </span>
            )}
            {product.anime && (
              <span className="bg-blue-100 text-blue-700 px-1 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium">
                {product.anime.name}
              </span>
            )}
          </div>
          
          {/* Precio destacado */}
          <div className="text-sm sm:text-xl font-bold text-orange-600">
            C${product.price.toFixed(2)}
          </div>
          
          {/* Descripción más compacta en móvil */}
          <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-2 leading-tight">
            {product.description}
          </p>
        </div>
        
        {/* Botón optimizado */}
        <button 
          onClick={() => addItem(product)}
          className="w-full bg-orange-500 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-md flex items-center justify-center gap-1 hover:bg-orange-600 transition-all duration-200 font-medium text-[10px] sm:text-sm shadow-sm hover:shadow-md mt-2"
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <ShoppingCart size={10} className="sm:w-4 sm:h-4" />
          <span className="hidden xs:inline sm:inline">Agregar</span>
          <span className="xs:hidden sm:hidden">+</span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;