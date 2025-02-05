import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';

export const Footer = () => {
  const whatsappNumber = "+50578364365";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="bg-black text-white !mt-0 relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.png" 
                 alt="Logo" 
                 className="w-10 h-10 rounded-full" />
            <span className="text-3xl font-black tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
              GATOTAKU
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            <div>
              <h3 className="text-lg font-semibold mb-2">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-gray-300">Inicio</Link></li>
                <li><Link to="/about" className="hover:text-gray-300">Sobre Nosotros</Link></li>
                <li>
                  <a href={whatsappUrl} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="flex items-center hover:text-gray-300">
                    <FaWhatsapp className="mr-2" />
                    Contáctenos
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Información</h3>
              <ul className="space-y-2">
                <li><Link to="/information/payment-methods" className="hover:text-gray-300">Métodos de pago</Link></li>
                <li><Link to="/information/shipping" className="hover:text-gray-300">Envíos</Link></li>
                <li><Link to="/information/refunds" className="hover:text-gray-300">Reembolsos</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Contacto</h3>
              <ul className="space-y-2">
                <li>WhatsApp: {whatsappNumber}</li>
                <li>Email: gatotaku2022@gmail.com</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
