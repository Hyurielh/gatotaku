import { Link } from 'react-router-dom';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { SOCIAL_MEDIA } from '../constants/social';

export const Footer = () => {
  const whatsappNumber = "+50578364365";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="bg-black text-white !mt-0 relative z-30 border-t-4 border-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.png" 
                 alt="Logo" 
                 className="w-10 h-10 rounded-full transition-transform duration-300 hover:rotate-12" />
            <span className="text-3xl font-black tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
              GATOTAKU
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            <div>
              <h3 className="text-lg font-semibold mb-2">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="inline-block hover:text-orange-400 transition-all duration-200 hover:translate-x-1">Inicio</Link></li>
                <li><Link to="/about" className="inline-block hover:text-orange-400 transition-all duration-200 hover:translate-x-1">Sobre Nosotros</Link></li>
                <li>
                  <a href={SOCIAL_MEDIA.tiktok}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center hover:text-orange-400 transition-all duration-200 hover:translate-x-1">
                    <FaTiktok className="mr-2" />
                    TikTok
                  </a>
                </li>
                <li>
                  <a href={SOCIAL_MEDIA.facebook}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center hover:text-orange-400 transition-all duration-200 hover:translate-x-1">
                    <FaFacebook className="mr-2" />
                    Facebook
                  </a>
                </li>
                <li>
                  <a href={SOCIAL_MEDIA.instagram}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center hover:text-orange-400 transition-all duration-200 hover:translate-x-1">
                    <FaInstagram className="mr-2" />
                    Instagram
                  </a>
                </li>
                <li>
                  <a href={whatsappUrl} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="flex items-center hover:text-orange-400 transition-all duration-200 hover:translate-x-1">
                    <FaWhatsapp className="mr-2" />
                    Contáctenos
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Información</h3>
              <ul className="space-y-2">
                <li><Link to="/information/payment-methods" className="inline-block hover:text-orange-400 transition-all duration-200 hover:translate-x-1">Métodos de pago</Link></li>
                <li><Link to="/information/shipping" className="inline-block hover:text-orange-400 transition-all duration-200 hover:translate-x-1">Envíos</Link></li>
                <li><Link to="/information/refunds" className="inline-block hover:text-orange-400 transition-all duration-200 hover:translate-x-1">Reembolsos</Link></li>
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
