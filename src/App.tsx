import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SEO } from './components/SEO';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import StoreFront from './pages/StoreFront';
import About from './pages/About';
import Information from './pages/Information';
import { Cart } from './components/Cart';

// Crear una instancia de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuraciones globales de React Query
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 30 * 60 * 1000, // 30 minutos
      retry: 1, // Reintentar una vez en caso de fallo
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <div className="min-h-screen bg-gray-100">
          <SEO 
            title="GATOTAKU - Tu Tienda de Anime"
            description="Tienda online de productos de anime y manga. Encuentra los mejores artículos de tus series favoritas."
          />
          <AuthProvider>
            <CartProvider>
              <Router future={{ 
                v7_startTransition: true,
                v7_relativeSplatPath: true 
              }}>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<StoreFront />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/information" element={<Information />} />
                      <Route path="/cart" element={<Cart />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </Router>
            </CartProvider>
          </AuthProvider>
        </div>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;