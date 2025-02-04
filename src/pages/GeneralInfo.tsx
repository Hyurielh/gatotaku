import { FaInfoCircle, FaQuestionCircle, FaHandshake } from 'react-icons/fa';

const GeneralInfo = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <h1 className="section-title">Información General</h1>
        
        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container shrink-0">
              <FaInfoCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Sobre Nuestro Servicio</h2>
              <p className="info-text">
              En GATOTAKU nos dedicamos a traer los mejores productos de anime directamente hasta tu puerta. Nuestro objetivo es brindarte una experiencia de compra fácil y segura.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container shrink-0">
              <FaQuestionCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Preguntas Frecuentes</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">¿Cómo realizo un pedido?</h3>
                  <p className="info-text">
                  Puedes realizar tu pedido a través de nuestro catálogo en línea o contactándonos directamente por WhatsApp. 📱
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">¿Cuál es el tiempo de entrega?</h3>
                  <p className="info-text">
                  Los tiempos de entrega varían según tu ubicación. Para Rivas, realizamos entregas los Domingos y Lunes, para cualquier otro día por favor ponerse en contacto para ver disponibilidad. 🛵
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">¿Qué métodos de pago aceptan?</h3>
                  <p className="info-text">
                  Aceptamos pagos en efectivo, Kash y transferencias bancarias vía BAC en dólares. 💳
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">¿Tienen local físico?</h3>
                  <p className="info-text">
                  De momento no contamos con local físico, es un emprendimiento pequeño y solo operamos dos personas, con paciencia esperamos tener local pronto, atentos en la página de facebook 🤗
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container shrink-0">
              <FaHandshake className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Nuestro Compromiso</h2>
              <p className="info-text">
              Nos comprometemos a brindarte el mejor servicio posible. Tu satisfacción es nuestra prioridad, y estamos aquí para ayudarte en cada paso de tu compra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfo;
