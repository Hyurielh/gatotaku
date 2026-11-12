import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { fetchFavoriteProducts } from '../lib/favorites';
import type { Product } from '../types/database';

export default function MyFavoritesPage() {
  const { session, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userId = session?.user.id ?? null;

  const loadFavorites = useCallback(async () => {
    if (!userId) {
      setProducts([]);
      return;
    }

    setIsLoading(true);

    try {
      setProducts(await fetchFavoriteProducts(userId));
    } catch {
      toast.error('No se pudieron cargar tus favoritos');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  // Al quitar un favorito desde la tarjeta, la lista se refresca
  useEffect(() => {
    const handler = () => {
      void loadFavorites();
    };

    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, [loadFavorites]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <SEO
        title="Mis favoritos - Gatotaku"
        description="Revisa los productos que guardaste como favoritos y su precio actual en Gatotaku."
      />

      <div className="mb-1 flex items-center gap-2">
        <Heart className="text-teal-600" size={22} aria-hidden="true" />
        <h1 className="section-title">Mis favoritos</h1>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Tus productos guardados. Revisa aquí si les ponemos una promoción.
      </p>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : !session ? (
        <div className="panel p-6 text-center">
          <p className="text-sm text-slate-600">
            Inicia sesión para guardar productos como favoritos y verlos aquí.
          </p>
          <Link to="/cuenta" className="btn-primary mt-4">
            <LogIn size={16} aria-hidden="true" />
            Iniciar sesión
          </Link>
        </div>
      ) : isLoading ? (
        <p className="text-sm text-slate-500">Cargando favoritos...</p>
      ) : products.length === 0 ? (
        <div className="panel p-8 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden="true" />
          <p className="text-sm text-slate-500">
            Todavía no tienes favoritos. Toca el corazón en cualquier producto para guardarlo.
          </p>
          <Link to="/" className="btn-primary mt-4">
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={index * 40} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
