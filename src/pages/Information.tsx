import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import About from './About';
import PaymentMethods from './PaymentMethods';
import Shipping from './Shipping';
import Refunds from './Refunds';
import Layaway from './Layaway';
import GeneralInfo from './GeneralInfo';

const Information = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(`/information/${path}`);
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const validPaths = ['/information', '/information/general', '/information/about', '/information/payment-methods', '/information/shipping', '/information/refunds', '/information/layaway'];
    if (!validPaths.includes(currentPath)) {
      navigate('/information/general', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <aside className="panel p-4 md:sticky md:top-6" aria-label="Secciones de información">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Ayuda</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">Información</h1>
            <nav className="mt-4 flex flex-col space-y-1.5" aria-label="Secciones">
            <button 
              onClick={() => handleNavigation('general')}
              className={`nav-link w-full text-left ${location.pathname.endsWith('general') ? 'active' : ''}`}
            >
              Información General
            </button>
            <button 
              onClick={() => handleNavigation('about')}
              className={`nav-link w-full text-left ${location.pathname.endsWith('about') ? 'active' : ''}`}
            >
              Sobre Nosotros
            </button>
            <button 
              onClick={() => handleNavigation('payment-methods')}
              className={`nav-link w-full text-left ${location.pathname.endsWith('payment-methods') ? 'active' : ''}`}
            >
              Métodos de Pago
            </button>
            <button 
              onClick={() => handleNavigation('shipping')}
              className={`nav-link w-full text-left ${location.pathname.endsWith('shipping') ? 'active' : ''}`}
            >
              Envíos
            </button>
            <button 
              onClick={() => handleNavigation('refunds')}
              className={`nav-link w-full text-left ${location.pathname.endsWith('refunds') ? 'active' : ''}`}
            >
              Devoluciones
            </button>
            <button 
              onClick={() => handleNavigation('layaway')}
              className={`nav-link w-full text-left ${location.pathname.endsWith('layaway') ? 'active' : ''}`}
            >
              Apartado
            </button>
            </nav>
          </aside>
        </div>

        {/* Content Area */}
        <div key={location.pathname} className="flex-grow animate-fade-up">
          <div className="panel p-4 sm:p-6">
            <Suspense fallback={<div>Cargando...</div>}>
              <Routes>
              <Route path="*" element={<Navigate to="general" replace />} />
              <Route path="general" element={<GeneralInfo />} />
              <Route path="about" element={<About />} />
              <Route path="payment-methods" element={<PaymentMethods />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="refunds" element={<Refunds />} />
              <Route path="layaway" element={<Layaway />} />
            </Routes>
          </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;
