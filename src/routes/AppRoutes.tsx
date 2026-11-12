import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { RequireAuth } from '../components/RequireAuth';
import { useEffect } from 'react';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
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
        <Route path="/servicios" element={lazyLoadPage(() => import('../pages/ServicesPage'))} />
        <Route path="/about" element={lazyLoadPage(() => import('../pages/About'))} />
        <Route path="/login" element={<Navigate to="/cuenta" replace />} />
        <Route path="/cuenta" element={lazyLoadPage(() => import('../pages/AccountPage'))} />
        <Route path="/mis-cupones" element={lazyLoadPage(() => import('../pages/MyCouponsPage'))} />
        <Route path="/admin/login" element={lazyLoadPage(() => import('../pages/AdminLoginPage'))} />
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
        <Route path="*" element={lazyLoadPage(() => import('../pages/NotFound'))} />
        {/* Añade más rutas según necesites */}
      </Routes>
    </>
  );
};

export default AppRoutes;