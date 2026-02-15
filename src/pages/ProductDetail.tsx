import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';
import { ImageCarousel } from '../components/ImageCarousel';
import { SEO } from '../components/SEO';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category_ref:categories(id, name),
            anime:anime(id, name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          setError('Producto no encontrado');
          return;
        }

        setProduct(data);
      } catch{
        setError(err.message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem(product, quantity);
  };

  const handleQuantityChange = (change: number) => {
    if (!product) return;
    
    const newQuantity = Math.max(1, Math.min(quantity + change, product.stock));
    setQuantity(newQuantity);
  };

  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden">
      <div className="w-full max-w-full px-0 py-8 relative z-10">
        <SEO 
          title={`GATOTAKU - ${product?.name || 'Detalle del Producto'}`}
          description={`Detalles de ${product?.name}`}
        />

        {loading ? (
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <p>Cargando producto...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Volver a la tienda
            </button>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8">
            {/* Imagen del producto */}
            <div>
              <ImageCarousel 
                images={product.images} 
                alt={`Imágenes de ${product.name}`} 
              />
            </div>

            {/* Detalles del producto */}
            <div className="p-6 rounded-lg shadow-md py-3 px-4 flex-grow flex flex-col justify-between border-t border-gray-200 bg-white/80">
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              {product.anime && (
                <p className="text-gray-600">
                  Anime: {product.anime.name}
                </p>
              )}

              {product.category_ref && (
                <p className="text-gray-600">
                  Categoría: {product.category_ref.name}
                </p>
              )}

              <p className="text-2xl font-bold text-orange-500">
                ${product.price.toFixed(2)}
              </p>

              <p className="text-gray-700">{product.description}</p>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    -
                  </button>
                  <span className="text-xl">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`px-6 py-2 rounded text-white ${
                    product.stock === 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                </button>
              </div>

              <p className="text-gray-500">
                Stock disponible: {product.stock}
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white shadow-md">
        <p className="text-gray-500">
          Stock disponible: {product?.stock}
        </p>
      </div>
    </div>
  );
}
