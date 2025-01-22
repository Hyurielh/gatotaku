import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import About from './About';
import PaymentMethods from './PaymentMethods';
import Shipping from './Shipping';
import Refunds from './Refunds';
import Layaway from './Layaway';

const Information = () => {
  const location = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <h2 className="text-xl font-bold mb-4">Información</h2>
          <nav className="flex flex-col space-y-2">
            <Link 
              to="/information/about" 
              className={`p-2 rounded hover:bg-gray-100 ${location.pathname === '/information/about' ? 'bg-gray-100 font-semibold' : ''}`}
            >
              Sobre Nosotros
            </Link>
            <Link 
              to="/information/payment-methods" 
              className={`p-2 rounded hover:bg-gray-100 ${location.pathname === '/information/payment-methods' ? 'bg-gray-100 font-semibold' : ''}`}
            >
              Métodos de Pago
            </Link>
            <Link 
              to="/information/shipping" 
              className={`p-2 rounded hover:bg-gray-100 ${location.pathname === '/information/shipping' ? 'bg-gray-100 font-semibold' : ''}`}
            >
              Envíos
            </Link>
            <Link 
              to="/information/refunds" 
              className={`p-2 rounded hover:bg-gray-100 ${location.pathname === '/information/refunds' ? 'bg-gray-100 font-semibold' : ''}`}
            >
              Política de Reembolsos
            </Link>
            <Link 
              to="/information/layaway" 
              className={`p-2 rounded hover:bg-gray-100 ${location.pathname === '/information/layaway' ? 'bg-gray-100 font-semibold' : ''}`}
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
                  <h1 className="text-4xl font-bold mb-8">Información General</h1>
                  <p className="mb-4">
                    Bienvenido a la sección de información de Gatotaku. Aquí encontrarás todo lo que necesitas saber sobre:
                  </p>
                  <ul className="list-disc pl-6">
                    <li>Nuestros métodos de pago disponibles</li>
                    <li>Políticas de envío y tiempos de entrega</li>
                    <li>Política de reembolsos</li>
                    <li>Sistema de apartado</li>
                    <li>Y más información sobre nosotros</li>
                  </ul>
                  <p className="mt-4">
                    Selecciona una opción del menú para obtener información detallada sobre cada tema.
                  </p>
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
