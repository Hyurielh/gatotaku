import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import About from './About';
import PaymentMethods from './PaymentMethods';
import Shipping from './Shipping';
import Refunds from './Refunds';
import Layaway from './Layaway';

const Information = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <h2 className="text-xl font-bold mb-4">Información</h2>
          <nav className="flex flex-col space-y-2">
            <Link 
              to="/information/about" 
              className={`nav-link ${location.pathname === '/information/about' ? 'active' : ''}`}
            >
              Sobre Nosotros
            </Link>
            <Link 
              to="/information/payment-methods" 
              className={`nav-link ${location.pathname === '/information/payment-methods' ? 'active' : ''}`}
            >
              Métodos de Pago
            </Link>
            <Link 
              to="/information/shipping" 
              className={`nav-link ${location.pathname === '/information/shipping' ? 'active' : ''}`}
            >
              Envíos
            </Link>
            <Link 
              to="/information/refunds" 
              className={`nav-link ${location.pathname === '/information/refunds' ? 'active' : ''}`}
            >
              Política de Reembolsos
            </Link>
            <Link 
              to="/information/layaway" 
              className={`nav-link ${location.pathname === '/information/layaway' ? 'active' : ''}`}
            >
              Sistema de Apartado
            </Link>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Suspense fallback={<div>Cargando...</div>}>
            <Routes>
              <Route index element={
                <div className="prose max-w-none">
                  <h1 className="section-title">Información General</h1>
                  <p className="info-text mb-6">
                    Bienvenido a la sección de información de Gatotaku. Aquí encontrarás todo lo que necesitas saber sobre nuestros servicios:
                  </p>
                  <div className="grid gap-4">
                    <Link to="/information/payment-methods" className="card hover:border-orange-600">
                      <h2 className="text-xl font-semibold text-orange-600">Métodos de Pago</h2>
                      <p className="text-gray-600">Conoce nuestras opciones de pago disponibles</p>
                    </Link>
                    
                    <Link to="/information/shipping" className="card hover:border-orange-600">
                      <h2 className="text-xl font-semibold text-orange-600">Envíos</h2>
                      <p className="text-gray-600">Información sobre entregas y costos de envío</p>
                    </Link>
                    
                    <Link to="/information/refunds" className="card hover:border-orange-600">
                      <h2 className="text-xl font-semibold text-orange-600">Política de Reembolsos</h2>
                      <p className="text-gray-600">Conoce nuestras políticas de devolución</p>
                    </Link>
                    
                    <Link to="/information/layaway" className="card hover:border-orange-600">
                      <h2 className="text-xl font-semibold text-orange-600">Sistema de Apartado</h2>
                      <p className="text-gray-600">Información sobre cómo apartar productos</p>
                    </Link>
                    
                    <Link to="/information/about" className="card hover:border-orange-600">
                      <h2 className="text-xl font-semibold text-orange-600">Sobre Nosotros</h2>
                      <p className="text-gray-600">Conoce más sobre Gatotaku</p>
                    </Link>
                  </div>
                </div>
              } />
              <Route path="/about" element={<About />} />
              <Route path="/payment-methods" element={<PaymentMethods />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/layaway" element={<Layaway />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Information;
