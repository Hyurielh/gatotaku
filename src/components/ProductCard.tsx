import React from 'react';
import type { Product } from '../types/database';
import { ImageCarousel } from './ImageCarousel';
import { generateWebPSrcset } from '../utils/imageOptimization';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();

  const validImages = React.useMemo(() => {
    if (!product.images || product.images.length === 0) {
      return ['https://via.placeholder.com/400x400?text=No+Image'];
    }
    const filtered = product.images.filter(img => img && img.trim() !== '');
    return filtered.length > 0 ? filtered : ['https://via.placeholder.com/400x400?text=No+Image'];
  }, [product.images]);

  const webPSrcset = React.useMemo(() => {
    return generateWebPSrcset(validImages);
  }, [validImages]);

  return (
    <div className={[className, "product-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"].filter(Boolean).join(' ')} >
      <div className="w-full aspect-square">
        <div className="w-full h-full object-cover">
          <ImageCarousel 
            images={validImages} 
            alt={product.name} 
            srcSet={webPSrcset.join(', ')} 
            loading="lazy"
          />
        </div>
      </div>
      <div className="p-3 flex-grow flex flex-col justify-between">
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
          className="w-full bg-black text-white py-1 px-2 rounded-md hover:bg-gray-900 transition-colors flex items-center justify-center gap-1 text-xs"
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