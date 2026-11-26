import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';
import { ImageCarousel } from '../components/ImageCarousel';
import { SEO } from '../components/SEO';
import { SakugaButton, type SakugaButtonHandle } from '../components/SakugaButton';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const addButtonRef = useRef<SakugaButtonHandle>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setProduct(null);
    setQuantity(1);
    setLoading(true);
    setError(null);

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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;

    addItem(product, quantity, { openCart: false });
    addButtonRef.current?.done(0);
  };

  const handleQuantityChange = (change: number) => {
    if (!product) return;
    
    const newQuantity = Math.max(1, Math.min(quantity + change, product.stock));
    setQuantity(newQuantity);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <SEO
        title={`GATOTAKU - ${product?.name || 'Detalle del Producto'}`}
        description={`Detalles de ${product?.name}`}
      />

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver al catálogo
      </Link>

      {loading ? (
        <div className="flex min-h-[calc(100vh-220px)] items-center justify-center">
          <p className="text-sm font-medium text-slate-500">Cargando producto...</p>
        </div>
      ) : error ? (
        <div className="mt-8 text-center text-red-600">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-primary mt-4"
          >
            Volver a la tienda
          </button>
        </div>
      ) : product ? (
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F0F0F0]">
            <div className="aspect-square">
              <ImageCarousel
                images={product.images}
                alt={`Imágenes de ${product.name}`}
              />
            </div>
          </div>

          <div className="panel flex flex-col p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {product.category_ref && (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {product.category_ref.name}
                </span>
              )}
              {product.anime && (
                <span className="inline-flex items-center rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-800">
                  {product.anime.name}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{product.name}</h1>
            <p className="mt-3 text-3xl font-bold text-teal-700">C${product.price.toFixed(2)}</p>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>

            <div className="mt-auto pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || product.stock === 0}
                    className="p-2.5 text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Quitar una unidad"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <span className="min-w-10 text-center text-sm font-bold text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className="p-2.5 text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Agregar una unidad"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>

                <span className={`text-xs font-semibold uppercase tracking-wide ${product.stock > 0 ? 'text-teal-700' : 'text-red-600'}`}>
                  {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
                </span>
              </div>

              <SakugaButton
                ref={addButtonRef}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="sakuga-button-block mt-4"
              >
                <ShoppingCart size={19} aria-hidden="true" />
                {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </SakugaButton>

              <p className="mt-3 text-xs text-slate-500">
                Se agrega a tu carrito. Confirma el pedido por WhatsApp desde el carrito.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
