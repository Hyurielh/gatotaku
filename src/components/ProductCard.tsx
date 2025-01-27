import React from 'react';
import type { Product } from '../types/database';
import { ImageCarousel } from './ImageCarousel';
import { generateWebPSrcset } from '../utils/imageOptimization';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
    <div className="product-card border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="w-full h-64 md:h-80">
        <ImageCarousel 
          images={validImages} 
          alt={product.name} 
          srcSet={webPSrcset.join(', ')} 
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
          <div className="flex gap-2 text-sm text-orange-500 mb-2">
            {product.category_ref && <span>{product.category_ref.name}</span>}
            {product.anime && <span>• {product.anime.name}</span>}
          </div>
          <span className="text-xl font-bold text-orange-500 block mb-2">
            C${product.price.toFixed(2)}
          </span>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <button 
            onClick={() => addItem(product)}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart size={20} />
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;