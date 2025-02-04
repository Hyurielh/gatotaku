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
      "product-card border rounded-lg overflow-hidden shadow-md flex flex-col h-full relative no-transform transition-all duration-300"
    ].filter(Boolean).join(' ')} >
      <div className="w-full aspect-square overflow-hidden relative bg-gray-100">
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
      <div className="bg-white/90 py-3 px-4 flex-grow flex flex-col justify-between border-t border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h2>
          <div className="flex gap-1 text-xs text-orange-500 mb-1">
            {product.category_ref && <span>{product.category_ref.name}</span>}
            {product.anime && <span>• {product.anime.name}</span>}
          </div>
          <span className="text-lg font-bold text-orange-500 block mb-1">
            C${product.price.toFixed(2)}
          </span>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        </div>
        <button 
          onClick={() => addItem(product)}
          className="w-full bg-black text-white py-2 px-2 rounded-md flex items-center justify-center gap-1 hover:bg-gray-800 transition-colors"
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <ShoppingCart size={16} />
          Agregar
        </button>
      </div>
    </div>
  );
}

export default ProductCard;