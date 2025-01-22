const PaymentMethods = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Métodos de Pago</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Efectivo</h2>
          <p>Aceptamos pagos en efectivo al momento de la entrega para pedidos locales.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Transferencia Bancaria</h2>
          <p>Realizamos transferencias a través de los principales bancos de Nicaragua.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tarjetas de Crédito/Débito</h2>
          <p>Aceptamos todas las tarjetas principales: Visa, MasterCard, American Express.</p>
        </div>
      </div>
    </div>
  );
};
export { PaymentMethods };
export default PaymentMethods;