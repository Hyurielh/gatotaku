import { HashRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SEO } from './components/SEO';
import { AppShell } from './components/AppShell';
import { Cart } from './components/Cart';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Suspense } from 'react';


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Saltar al contenido principal
        </a>
        <SEO
          title="Gatotaku"
          description="Tienda online de productos de anime y manga. Encuentra los mejores artículos de tus series favoritas."
          openGraph={{
            title: "Gatotaku",
            description: "Tu Tienda de Anime",
            image: "https://gatotaku.com/logo.png"
          }}
        />
        <AuthProvider>
          <CartProvider>
            <Router>
              <AppShell>
                <Suspense fallback={<div className="flex justify-center py-16 text-sm font-medium text-slate-500">Cargando...</div>}>
                  <AppRoutes />
                </Suspense>
              </AppShell>
              <Cart />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                theme="colored"
              />
            </Router>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
