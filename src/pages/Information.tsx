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
    // Always navigate to the full information path
    navigate(`/information/${path}`, { replace: true });
  };

  // Redirect to general info if no specific route is selected
  useEffect(() => {
    const currentPath = location.pathname;
    const isExactInformationPath = currentPath === '/information' || currentPath.startsWith('/information/');
    if (!isExactInformationPath) {
      navigate('/information/general', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <h2 className="text-xl font-bold mb-4">Información</h2>
          <nav className="flex flex-col space-y-2">
            <button 
              onClick={() => handleNavigation('general')}
              className={`nav-link ${location.pathname.endsWith('general') ? 'active' : ''}`}
            >
              Información General
            </button>
            <button 
              onClick={() => handleNavigation('about')}
              className={`nav-link ${location.pathname.endsWith('about') ? 'active' : ''}`}
            >
              Sobre Nosotros
            </button>
            <button 
              onClick={() => handleNavigation('payment-methods')}
              className={`nav-link ${location.pathname.endsWith('payment-methods') ? 'active' : ''}`}
            >
              Métodos de Pago
            </button>
            <button 
              onClick={() => handleNavigation('shipping')}
              className={`nav-link ${location.pathname.endsWith('shipping') ? 'active' : ''}`}
            >
              Envíos
            </button>
            <button 
              onClick={() => handleNavigation('refunds')}
              className={`nav-link ${location.pathname.endsWith('refunds') ? 'active' : ''}`}
            >
              Devoluciones
            </button>
            <button 
              onClick={() => handleNavigation('layaway')}
              className={`nav-link ${location.pathname.endsWith('layaway') ? 'active' : ''}`}
            >
              Apartado
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
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
  );
};

export default Information;
