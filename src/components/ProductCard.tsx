import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Product } from '../types/database';
import { ImageCarousel } from './ImageCarousel';
import { generateWebPSrcset, generateLowResPlaceholder, optimizeImage } from '../utils/imageOptimization';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const [imageLoadProgress, setImageLoadProgress] = useState(0);
  const [isImageFullyLoaded, setIsImageFullyLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [justFavorited, setJustFavorited] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
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

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((current) => !current);
    setJustFavorited(true);
    setTimeout(() => setJustFavorited(false), 500);
  }, []);

  return (
    <div className={[
      className,
      "product-card group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-teal-200 hover:shadow-md"
    ].filter(Boolean).join(' ')}>
      {/* Imagen del producto sobre fondo neutro */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F0F0F0]">
        {/* Barra de progreso de carga */}
        <div
          className="absolute top-0 left-0 h-1 bg-teal-600 z-40 transition-all duration-300"
          style={{
            width: `${imageLoadProgress}%`,
            opacity: isImageFullyLoaded ? 0 : 1
          }}
        />

        {/* Placeholder de baja resolución */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-lg transition-opacity duration-300"
          style={{
            backgroundImage: `url(${imageData[0].lowResSrc})`,
            zIndex: 10,
            opacity: isImageFullyLoaded ? 0 : 0.35
          }}
        />

        <button
          type="button"
          onClick={handleToggleFavorite}
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-500 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-110 hover:border-teal-300 hover:text-teal-700 active:scale-90 focus:outline-none focus:ring-2 focus:ring-teal-200"
          aria-label={isFavorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
          aria-pressed={isFavorite}
          title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart size={17} strokeWidth={2} className={`${isFavorite ? 'fill-teal-600 text-teal-600' : ''} ${justFavorited ? 'animate-jelly' : ''}`} />
        </button>

        <ImageCarousel
          images={imageData}
          alt={product.name}
          loading="lazy"
          className="product-card-zoom relative z-20 h-full w-full transition-opacity duration-500"
          onFullyLoaded={handleImageFullyLoaded}
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-grow flex-col p-3 sm:p-4">
        <h2 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-900">
          {product.name}
        </h2>

        <div className="mt-2 flex min-h-[1.5rem] flex-wrap gap-1.5">
          {product.category_ref && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {product.category_ref.name}
            </span>
          )}
          {product.anime && (
            <span className="inline-flex items-center rounded-full border border-teal-100 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
              {product.anime.name}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Precio</p>
            <p className="text-lg font-bold leading-tight text-slate-900">C${product.price.toFixed(2)}</p>
          </div>
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${product.stock > 0 ? 'text-teal-700' : 'text-red-600'}`}>
            {product.stock > 0 ? 'En stock' : 'Agotado'}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-teal-700 active:translate-y-0.5 active:scale-[0.95] focus:outline-none focus:ring-2 focus:ring-teal-200"
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <ShoppingCart size={16} className={justAdded ? 'animate-pop' : ''} />
          <span>{justAdded ? '¡Agregado!' : 'Agregar al carrito'}</span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;