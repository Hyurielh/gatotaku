import { HashRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SEO } from './components/SEO';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Suspense } from 'react';


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <div className="bg-gray-100">
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <SEO 
            title="GATOTAKU - Tu Tienda de Anime"
            description="Tienda online de productos de anime y manga. Encuentra los mejores artículos de tus series favoritas."
            // Add more meta tags
            openGraph={{
              title: "GATOTAKU",
              description: "Tu Tienda de Anime",
              image: "url-to-your-og-image"
            }}
          />
          <AuthProvider>
            <CartProvider>
              <Router>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <Suspense fallback={<div>Loading...</div>}>
                    <main id="main-content" className="flex-grow pt-8">
                      <AppRoutes />
                    </main>
                  </Suspense>
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