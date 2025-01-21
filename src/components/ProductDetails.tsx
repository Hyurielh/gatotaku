import type { Product } from '../types/database';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useCart();

  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
          <div className="flex gap-2 text-sm text-orange-500">
            {product.category_ref && <span>{product.category_ref.name}</span>}
            {product.anime && <span>• {product.anime.name}</span>}
          </div>
        </div>
        <span className="text-lg font-bold text-orange-500">
          C${product.price.toFixed(2)}
        </span>
      </div>
      <p className="mt-2 text-gray-600">{product.description}</p>
      <button 
        onClick={() => addItem(product)}
        className="mt-4 w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
        aria-label={`Agregar ${product.name} al carrito`}
      >
        <ShoppingCart size={20} />
        Agregar al carrito
      </button>
    </div>
  );
}