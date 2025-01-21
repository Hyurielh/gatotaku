import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ProductCard } from './components/ProductCard';
import { RequireAuth } from './components/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SearchAndFilters } from './components/SearchAndFilters';
import { Cart } from './components/Cart';
import type { Product, Category, Anime, Filters } from './types/database';
import { supabase } from './lib/supabase';
import { SEO } from './components/SEO';

// Lazy load pages
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));

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
          <Router>
            <div className="min-h-screen bg-gray-50">
              <header className="bg-black text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-4">
                      <img src="https://scontent.fmga10-1.fna.fbcdn.net/v/t39.30808-6/291873004_109262688512144_5940417088440245166_n.png?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=F7mYKfLo77oQ7kNvgEE3FOG&_nc_oc=Adj1eM9ES38N1LrkeaJ0Lx4vgOKAOmjjWLX22WIuF_i-wsmBs92bequytdNojOlNBeE&_nc_zt=23&_nc_ht=scontent.fmga10-1.fna&_nc_gid=Au0Khp9jyJ1_KC2RXyWxOFd&oh=00_AYCbxz9yjo4IItufbVTRPE4xaiftj68X08KTg9DUvIHhJQ&oe=6795C8DD" className="w-10 h-10 rounded-full" alt="" />
                      <h1 className="text-4xl align-center font-black tracking-wider" style={{ fontFamily: "'Bebas Neue', cursive" }}>
                        GATOTAKU
                      </h1>
                    </Link>
                    <div className="flex items-center gap-6">
                      <a 
                        href="https://www.facebook.com/gatotaku.rivas" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white hover:text-orange-500 transition-colors"
                        aria-label="Visitar Facebook"
                      >
                        <i className="fab fa-facebook text-2xl" aria-hidden="true"></i>
                      </a>
                      <a 
                        href="https://www.tiktok.com/@gatotaku2022" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white hover:text-orange-500 transition-colors"
                        aria-label="Visitar TikTok"
                      >
                        <i className="fab fa-tiktok text-2xl" aria-hidden="true"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </header>

              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<StoreFront />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <RequireAuth>
                        <AdminPanel />
                      </RequireAuth>
                    }
                  />
                </Routes>
              </Suspense>

              <footer className="bg-black text-white mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-orange-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-3xl font-black tracking-wider" style={{ fontFamily: "'Bebas Neue', cursive" }}>
                        GATOTAKU
                      </span>
                    </div>
                    <div className="flex gap-6">
                      <a 
                        href="https://www.facebook.com/gatotaku.rivas" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white hover:text-orange-500 transition-colors"
                        aria-label="Visitar Facebook"
                      >
                        <i className="fab fa-facebook text-2xl" aria-hidden="true"></i>
                      </a>
                      <a 
                        href="https://www.tiktok.com/@gatotaku2022" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white hover:text-orange-500 transition-colors"
                        aria-label="Visitar TikTok"
                      >
                        <i className="fab fa-tiktok text-2xl" aria-hidden="true"></i>
                      </a>
                    </div>
                    <p className="text-gray-400">
                      2024 GATOTAKU. Todos los derechos reservados.
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}