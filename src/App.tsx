import * as React from 'react';
import { Suspense, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { queryClient } from './lib/queryClient';
import { RequireAuth } from './components/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';

// Lazy load pages with more robust error handling
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const About = React.lazy(() => import('./pages/About'));
const Information = React.lazy(() => import('./pages/Information'));
const Refunds = React.lazy(() => import('./pages/Refunds'));
const PaymentMethods = React.lazy(() => import('./pages/PaymentMethods'));
const Layaway = React.lazy(() => import('./pages/Layaway'));
const StoreFront = React.lazy(() => import('./pages/StoreFront'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  useEffect(() => {
    console.error('Caught an error:', error);
  }, [error]);

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <div>No internet connection. Please check your network.</div>;
  }

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
        queryClient.clear();
      }}
    >
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <SEO 
                  title="GATOTAKU - Tu Tienda de Anime"
                  description="Tienda online de productos de anime y manga. Encuentra los mejores artículos de tus series favoritas."
                />
                <div className="App">
                  <Header />
                  <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                      <Route path="/" element={<StoreFront />} />
                      <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/information/*" element={<Information />} />
                      <Route path="/refunds" element={<Refunds />} />
                      <Route path="/payment-methods" element={<PaymentMethods />} />
                      <Route path="/layaway" element={<Layaway />} />
                      <Route path="/product-detail/:id" element={<ProductDetail />} />
                    </Routes>
                  </Suspense>
                  <Footer />
                </div>
              </Router>
            </CartProvider>
          </AuthProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;