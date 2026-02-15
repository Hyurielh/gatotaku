import { Link } from 'react-router-dom';
import { FaTimes, FaWhatsapp, FaUserShield } from 'react-icons/fa';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  session?: unknown;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  session
}) => {
  const whatsappUrl = `https://wa.me/+50578364365`;

  return isOpen ? (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40" 
      onClick={onClose}
    >
      <div 
        className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('reset-store-filters'));
              onClose();
            }}
          >
            <img 
              src="/logo.png" 
              alt="Logo de Gatotaku" 
              className="w-12 h-12 rounded-full" 
            />
            <span className="ml-3 text-2xl font-black tracking-wide text-black">
              GATOTAKU
            </span>
          </Link>
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <FaTimes size={18} />
          </button>
        </div>
        
        <nav className="flex flex-col p-4 space-y-4">
          <Link 
            to="/" 
            className="text-lg hover:text-orange-500 transition-colors"
            onClick={onClose}
          >
            Inicio
          </Link>
          <Link 
            to="/about" 
            className="text-lg hover:text-orange-500 transition-colors"
            onClick={onClose}
          >
            Sobre Nosotros
          </Link>
          <Link 
            to="/information" 
            className="text-lg hover:text-orange-500 transition-colors"
            onClick={onClose}
          >
            Información
          </Link>
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-lg hover:text-orange-500 transition-colors flex items-center"
          >
            <FaWhatsapp size={18} />
            WhatsApp
          </a>
          {session && (
            <Link 
              to="/admin" 
              className="text-lg hover:text-orange-500 transition-colors flex items-center"
              onClick={onClose}
            >
              <FaUserShield className="mr-2" />
              Panel Admin
            </Link>
          )}
        </nav>
      </div>
    </div>
  ) : null;
};