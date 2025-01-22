import { FaStore, FaMapMarkerAlt, FaTruck } from 'react-icons/fa';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <h1 className="section-title">Sobre Nosotros</h1>
        
        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container shrink-0">
              <FaStore className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Tu Tienda de Anime en Nicaragua</h2>
              <p className="info-text">
                Somos una tienda online especializada en productos de anime, manga y cultura japonesa.
                Nos dedicamos a traer la mejor mercancía directamente hasta tu puerta.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container shrink-0">
              <FaMapMarkerAlt className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Ubicados en Rivas</h2>
              <p className="info-text">
                Operamos desde la ciudad de Rivas, Nicaragua, brindando un servicio personalizado
                y cercano a nuestros clientes.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="icon-container shrink-0">
              <FaTruck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Entregas a Domicilio</h2>
              <p className="info-text">
                Nos especializamos en entregas a domicilio, llevando tus productos favoritos
                directamente hasta la puerta de tu casa, garantizando una experiencia de compra
                cómoda y segura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
