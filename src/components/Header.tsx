import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaWhatsapp, FaBars, FaTimes, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const whatsappNumber = "+50578364365";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <header className="bg-black text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center"
            onClick={() => {
              // Dispatch a custom event to reset filters in StoreFront
              window.dispatchEvent(new CustomEvent('reset-store-filters'));
            }}
          >
            <img src="./logo.png" 
                 alt="Logo" 
                 className="w-12 h-12 rounded-full" />
            <span className="ml-3 text-2xl md:text-3xl font-black tracking-wide text-white" 
                  style={{ 
                    fontFamily: "Poppins",
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                  }}>
              GATOTAKU
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="relative group">
              <span className="hover:text-gray-300">Catálogo</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </Link>
            <Link to="/about" className="relative group">
              <span className="hover:text-gray-300">Sobre Nosotros</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </Link>
            <Link to="/information" className="relative group">
              <span className="hover:text-gray-300">Información</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </Link>
            <a href={whatsappUrl} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="relative group flex items-center">
              <span className="hover:text-gray-300 flex items-center">
                <FaWhatsapp className="mr-2" />
                WhatsApp
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
            </a>
            <Link to="/cart" className="hover:text-orange-500 transition-colors">
              <FaShoppingCart className="text-2xl" />
            </Link>
            {session && (
              <Link to="/admin" className="hover:text-orange-500 transition-colors">
                <FaUserShield className="text-2xl" />
              </Link>
            )}
            {location.pathname === '/admin' && session && (
              <button 
                onClick={handleLogout} 
                className="hover:text-orange-500 transition-colors flex items-center"
                title="Cerrar sesión"
              >
                <FaSignOutAlt className="text-2xl" />
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white focus:outline-none"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-white hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Catálogo
              </Link>
              <Link to="/about" className="text-white hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Sobre Nosotros
              </Link>
              <Link to="/information" className="text-white hover:text-orange-500 transition-colors" onClick={() => setIsMenuOpen(false)}>
                Información
              </Link>
              <a href={whatsappUrl} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-white hover:text-orange-500 transition-colors flex items-center"
                 onClick={() => setIsMenuOpen(false)}>
                <FaWhatsapp className="mr-2" />
                WhatsApp
              </a>
              {session && (
                <Link 
                  to="/admin" 
                  className="text-white hover:text-orange-500 transition-colors flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserShield className="mr-2" />
                  Panel de Admin
                </Link>
              )}
              {location.pathname === '/admin' && session && (
                <button 
                  onClick={handleLogout} 
                  className="text-white hover:text-orange-500 transition-colors flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Cerrar Sesión
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Icon (Mobile) */}
      <div className="fixed bottom-4 right-4 md:hidden z-50 bg-orange-500 rounded-full p-3 shadow-lg hover:bg-orange-600 transition-colors">
        <Link to="/cart">
          <FaShoppingCart className="text-white text-2xl" />
        </Link>
      </div>
    </header>
  );
};
