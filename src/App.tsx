import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ProductCard } from './components/ProductCard';
import { RequireAuth } from './components/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SearchAndFilters } from './components/SearchAndFilters';
import { Cart } from './components/Cart';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { Product, Category, Anime, Filters } from './types/database';
import { supabase } from './lib/supabase';
import { SEO } from './components/SEO';

// Lazy load pages
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const About = React.lazy(() => import('./pages/About'));
const Information = React.lazy(() => import('./pages/Information'));
const Refunds = React.lazy(() => import('./pages/Refunds'));
const PaymentMethods = React.lazy(() => import('./pages/PaymentMethods'));
const Layaway = React.lazy(() => import('./pages/Layaway'));

function StoreFront() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [animes, setAnimes] = React.useState<Anime[]>([]);
  const [filters, setFilters] = React.useState<Filters>({
    search: '',
    category: '',
    anime: '',
    sortBy: 'name_asc'
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products with related data
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            category_ref:categories(id, name),
            anime:anime(id, name)
          `);

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        setCategories(categoriesData || []);

        // Fetch animes
        const { data: animesData } = await supabase
          .from('anime')
          .select('*')
          .order('name');
        setAnimes(animesData || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = React.useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = !filters.search || 
          product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.description.toLowerCase().includes(filters.search.toLowerCase());
        
        const matchesCategory = !filters.category || 
          product.category_id === filters.category;
        
        const matchesAnime = !filters.anime || 
          product.anime_id === filters.anime;

        return matchesSearch && matchesCategory && matchesAnime;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'name_desc':
            return b.name.localeCompare(a.name);
          default: // name_asc
            return a.name.localeCompare(b.name);
        }
      });
  }, [products, filters]);

  return (
    <>
      <SEO 
        title="GATOTAKU - Tu Tienda de Anime"
        description="Descubre nuestra colección de productos de anime. Figuras, mangas, accesorios y más."
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SearchAndFilters
          categories={categories}
          animes={animes}
          filters={filters}
          products={products}
          onFilterChange={setFilters}
        />
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      <Cart />
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header />
              <main className="flex-grow">
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<StoreFront />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/information/*" element={
                      <Suspense fallback={<div>Cargando...</div>}>
                        <Information />
                      </Suspense>
                    } />
                    <Route path="/refunds" element={
                      <Suspense fallback={<div>Cargando...</div>}>
                        <Refunds />
                      </Suspense>
                    } />
                    <Route path="/admin" element={
                      <RequireAuth>
                        <AdminPanel />
                      </RequireAuth>
                    } />
                    <Route path="/payment-methods" element={
                      <Suspense fallback={<div>Cargando...</div>}>
                        <PaymentMethods />
                      </Suspense>
                    } />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}