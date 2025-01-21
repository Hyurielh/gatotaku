import React from 'react';
import type { Product } from '../types/database';
import { ImageCarousel } from './ImageCarousel';
import { ProductDetails } from './ProductDetails';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Validación y normalización de datos
  const validImages = React.useMemo(() => {
    if (!product.images || product.images.length === 0) {
      return ['https://via.placeholder.com/400x400?text=No+Image'];
    }
    // Filtrar imágenes inválidas o vacías
    return product.images.filter(img => img && img.trim() !== '');
  }, [product.images]);

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <ImageCarousel images={validImages} alt={product.name} />
      <ProductDetails product={product} />
    </article>
  );
}