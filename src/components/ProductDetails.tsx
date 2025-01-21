import React from 'react';
import type { Product } from '../types/database';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
          <span className="text-sm text-orange-500">{product.category}</span>
        </div>
        <span className="text-lg font-bold text-orange-500">
          ${product.price.toFixed(2)}
        </span>
      </div>
      <p className="mt-2 text-gray-600">{product.description}</p>
      <button 
        className="mt-4 w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 transition-colors"
        aria-label={`Agregar ${product.name} al carrito`}
      >
        <i className="fas fa-shopping-cart mr-2" aria-hidden="true"></i>
        Agregar al carrito
      </button>
    </div>
  );
}