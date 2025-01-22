import { FaClock, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';

const Layaway = () => {
  return (
    <div className="space-y-8">
      <h1 className="section-title">Sistema de Apartado</h1>

      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="icon-container">
            <FaClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Tiempo de Reserva</h2>
            <p className="info-text">
              Tu producto estará apartado por un máximo de una semana.
            </p>
            <div className="mt-2 p-3 bg-orange-50 rounded-md border border-orange-200">
              <p className="text-sm text-orange-700">
                Después de este período, el producto volverá a estar disponible para la venta.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="icon-container">
            <FaMoneyBillWave className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Pago</h2>
            <p className="info-text">
              El pago completo se realiza al momento de la entrega del producto.
            </p>
            <ul className="space-y-2 mt-2">
              <li className="list-item">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>No se requiere anticipo</span>
              </li>
              <li className="list-item">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Pago total al recibir el producto</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="icon-container">
            <FaInfoCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Información Adicional</h2>
            <ul className="space-y-2">
              <li className="list-item">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Puedes cancelar tu apartado en cualquier momento</span>
              </li>
              <li className="list-item">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>La reserva es personal e intransferible</span>
              </li>
              <li className="list-item">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Confirmamos disponibilidad antes de apartar</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layaway;
