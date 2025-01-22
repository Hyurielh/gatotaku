import { FaCalendarAlt, FaTruck, FaMapMarkedAlt } from 'react-icons/fa';

const Shipping = () => {
  return (
    <div className="space-y-8">
      <h1 className="section-title">Información de Envíos</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container">
              <FaCalendarAlt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Días de Entrega</h2>
              <p className="info-text">
                Realizamos entregas los siguientes días:
              </p>
              <ul className="space-y-2">
                <li className="list-item">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Domingo</span>
                </li>
                <li className="list-item">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Lunes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container">
              <FaTruck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Centro de Rivas</h2>
              <p className="info-text">
                Entregas gratuitas en el centro de Rivas.
              </p>
              <div className="mt-2 p-3 bg-orange-50 rounded-md border border-orange-200">
                <p className="text-sm text-orange-700">
                  ¡Sin costo adicional por entrega!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container">
              <FaMapMarkedAlt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Departamentos</h2>
              <p className="info-text">
                Envíos a otros departamentos disponibles con cargo adicional por transporte.
              </p>
              <div className="mt-2 p-3 bg-orange-50 rounded-md border border-orange-200">
                <p className="text-sm text-orange-700">
                  Contacta con nosotros para conocer las tarifas específicas de tu ubicación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;