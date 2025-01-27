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
  const { addToCart } = useCart();
  
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
      } catch (err: any) {
        console.error('Error fetching product:', err);
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

    addToCart({
      ...product,
      quantity
    });
  };

  const handleQuantityChange = (change: number) => {
    if (!product) return;
    
    const newQuantity = Math.max(1, Math.min(quantity + change, product.stock));
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/')} 
          className="ml-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title={`${product.name} - GATOTAKU`} 
        description={product.description || `Detalles del producto ${product.name}`} 
      />
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div>
          <ImageCarousel 
            images={product.images} 
            alt={product.name} 
          />
        </div>

        {/* Product Info Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          
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
    </div>
  );
}
