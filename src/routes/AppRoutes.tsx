import React, { lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { RequireAuth } from '../components/RequireAuth';
import { useEffect } from 'react';

/**
 * IMPORTANTE: los componentes perezosos se crean UNA sola vez a nivel de módulo.
 * Si se hiciera `lazy()` dentro del render, cada re-render crearía un componente
 * nuevo y React volvería a suspender la ruta (pantalla "Cargando..." trabada).
 */
const StoreFrontPage = lazy(() => import('../pages/StoreFront'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetail'));
const ServicesPage = lazy(() => import('../pages/ServicesPage'));
const NewsPage = lazy(() => import('../pages/NewsPage'));
const AboutPage = lazy(() => import('../pages/About'));
const AccountPage = lazy(() => import('../pages/AccountPage'));
const MyCouponsPage = lazy(() => import('../pages/MyCouponsPage'));
const MyOrdersPage = lazy(() => import('../pages/MyOrdersPage'));
const MyFavoritesPage = lazy(() => import('../pages/MyFavoritesPage'));
const AdminLoginPage = lazy(() => import('../pages/AdminLoginPage'));
const AdminPanel = lazy(() => import('../pages/AdminPanel'));
const InformationPage = lazy(() => import('../pages/Information'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

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
        <Route path="/" element={<StoreFrontPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/novedades" element={<NewsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<Navigate to="/cuenta" replace />} />
        <Route path="/cuenta" element={<AccountPage />} />
        <Route path="/mis-cupones" element={<MyCouponsPage />} />
        <Route path="/mis-pedidos" element={<MyOrdersPage />} />
        <Route path="/mis-favoritos" element={<MyFavoritesPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminPanel />
            </RequireAuth>
          }
        />
        <Route path="/information/*" element={<InformationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
