import { FaMoneyBillWave, FaMobile, FaUniversity } from 'react-icons/fa';

const PaymentMethods = () => {
  return (
    <div className="space-y-8">
      <h1 className="section-title">Métodos de Pago</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container">
              <FaMoneyBillWave className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Efectivo</h2>
              <p className="info-text">
                Pago en efectivo al momento de la entrega de tu pedido.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container">
              <FaMobile className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Kash</h2>
              <p className="info-text">
                Realiza tu pago fácilmente a través de la aplicación Kash.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container">
              <FaUniversity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Transferencia Bancaria</h2>
              <p className="info-text">
                Aceptamos transferencias a través de BAC en dólares estadounidenses (USD).
              </p>
              <div className="mt-2 p-3 bg-orange-50 rounded-md border border-orange-200">
                <p className="text-sm text-orange-700">
                  Contacta con nosotros para obtener los detalles de la cuenta bancaria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;