import { FaClock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const Refunds = () => {
  return (
    <div className="space-y-8">
      <h1 className="section-title">Política de Reembolsos</h1>

      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="icon-container">
            <FaClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Tiempo Límite</h2>
            <p className="info-text">
              Tienes hasta 3 días después de recibir tu producto para solicitar un reembolso.
            </p>
            <div className="mt-2 p-3 bg-orange-50 rounded-md border border-orange-200">
              <p className="text-sm text-orange-700">
                No se aceptarán solicitudes de reembolso después de este período.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="icon-container">
            <FaExclamationTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Condiciones</h2>
            <ul className="space-y-2">
              <li className="list-item">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>El producto debe estar en su empaque original</span>
              </li>
              <li className="list-item">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>No debe mostrar señales de uso o daño</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="icon-container">
            <FaCheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Proceso de Reembolso</h2>
            <p className="info-text">
              Una vez aprobada tu solicitud, el reembolso se realizará por el mismo método 
              que utilizaste para realizar la compra.
            </p>
            <div className="mt-2 p-3 bg-orange-50 rounded-md border border-orange-200">
              <p className="text-sm text-orange-700">
                El tiempo de procesamiento puede variar según el método de pago utilizado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refunds;
