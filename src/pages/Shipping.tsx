const Shipping = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center transition-colors hover:text-orange-600">
        Información de Envíos
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-orange-500">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">Tiempos de Entrega</h2>
          <ul className="space-y-3">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span className="text-gray-700 hover:text-orange-600 transition-colors">Managua: 1-2 días hábiles</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span className="text-gray-700 hover:text-orange-600 transition-colors">Resto del país: 2-4 días hábiles</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-orange-500">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">Costos de Envío</h2>
          <p className="mb-4 text-gray-600">Los costos de envío se calculan según la ubicación y el peso del paquete.</p>
          <ul className="space-y-3">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span className="text-gray-700 hover:text-orange-600 transition-colors">Managua: C$100</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span className="text-gray-700 hover:text-orange-600 transition-colors">Departamentos: A partir de C$150</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-orange-500">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">Seguimiento de Pedidos</h2>
          <p className="text-gray-600 leading-relaxed">
            Una vez que tu pedido sea enviado, recibirás un código de seguimiento 
            para que puedas rastrear tu paquete en tiempo real.
          </p>
          <div className="mt-4 p-3 bg-orange-50 rounded-md border border-orange-200">
            <p className="text-sm text-orange-700">
              ¿Tienes preguntas sobre tu envío? Contáctanos y te ayudaremos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;