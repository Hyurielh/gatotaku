const Layaway = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Sistema de Apartado</h1>
      <div className="prose max-w-none">
        <p className="mb-4">
          Nuestro sistema de apartado te permite reservar tus productos favoritos:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Abona el 50% del valor total del producto para apartarlo</li>
          <li>Tienes hasta 30 días para completar el pago</li>
          <li>El apartado es personal e intransferible</li>
          <li>Recibirás actualizaciones sobre el estado de tu apartado</li>
        </ul>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Términos del Apartado:</h3>
          <ul className="list-disc pl-6">
            <li>El monto inicial no es reembolsable</li>
            <li>Si no se completa el pago en 30 días, el apartado se cancela</li>
            <li>Solo se puede tener un máximo de 3 productos en apartado simultáneamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Layaway;
