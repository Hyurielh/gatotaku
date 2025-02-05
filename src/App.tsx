import React, { useEffect } from 'react';
import { HashRouter as Router, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SEO } from './components/SEO';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Crear una instancia de QueryClient con configuración más robusta
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 30 * 60 * 1000, // 30 minutos
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
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
                  <main className="flex-grow pt-8">
                    <AppRoutes />
                  </main>
                  <Footer />
                  <Cart />
                  <ToastContainer 
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    closeOnClick
                    pauseOnHover
                    theme="colored"
                  />
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