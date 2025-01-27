import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Loader from '../components/common/Loader';

const lazyLoadPage = (importFn: () => Promise<{ default: React.ComponentType }>) => {
  const LazyComponent = lazy(importFn);
  return (
    <Suspense fallback={<Loader />}>
      <LazyComponent />
    </Suspense>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={lazyLoadPage(() => import('../pages/StoreFront'))} />
      <Route 
        path="/admin" 
        element={
          <PrivateRoute>
            {lazyLoadPage(() => import('../pages/AdminPanel'))}
          </PrivateRoute>
        } 
      />
      {/* Añade más rutas según necesites */}
    </Routes>
  );
};

export default AppRoutes;
