import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { RequireAuth } from '../components/RequireAuth';
import { useEffect } from 'react';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
  </div>
);

const lazyLoadPage = (importFn: () => Promise<{ default: React.ComponentType }>) => {
  const LazyComponent = lazy(importFn);
  return (
    <Suspense fallback={<Spinner />}>
      <LazyComponent />
    </Suspense>
  );
};

const ScrollHandler: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollHandler />
      <Routes>
        <Route path="/" element={lazyLoadPage(() => import('../pages/StoreFront'))} />
        <Route path="/about" element={lazyLoadPage(() => import('../pages/About'))} />
        <Route path="/login" element={lazyLoadPage(() => import('../pages/LoginPage'))} />
        <Route 
          path="/admin" 
          element={
            <RequireAuth>
              {lazyLoadPage(() => import('../pages/AdminPanel'))}
            </RequireAuth>
          } 
        />
        <Route 
          path="/information/*" 
          element={lazyLoadPage(() => import('../pages/Information'))} 
        />
        {/* Añade más rutas según necesites */}
      </Routes>
    </>
  );
};

export default AppRoutes;