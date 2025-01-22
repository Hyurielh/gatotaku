const Refunds = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Política de Reembolsos</h1>
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Condiciones para Reembolso</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>El producto debe estar sin usar y en su empaque original</li>
            <li>Debes notificarnos dentro de los primeros 7 días después de recibir tu pedido</li>
            <li>Debes presentar el comprobante de compra</li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Proceso de Reembolso</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Contacta a nuestro servicio al cliente</li>
            <li>Proporciona el número de orden y razón del reembolso</li>
            <li>Recibirás instrucciones para devolver el producto</li>
            <li>Una vez recibido y verificado, procesaremos tu reembolso</li>
          </ol>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tiempo de Procesamiento</h2>
          <p>
            Los reembolsos suelen procesarse en un plazo de 5-7 días hábiles 
            después de recibir y verificar el producto devuelto.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Refunds;
