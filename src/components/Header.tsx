import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaWhatsapp, FaFacebook, FaTiktok, FaBars, FaTimes, FaSignOutAlt, FaUserShield, FaHandPaper } from 'react-icons/fa';
import { AiTwotoneMessage } from "react-icons/ai";
import { useAuth } from '../context/AuthContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const [isDraggingSocial, setIsDraggingSocial] = useState(false);
  const [isDraggingCart, setIsDraggingCart] = useState(false);
  const [socialPosition, setSocialPosition] = useState<{ x: number; y: number }>({ 
    x: 16, 
    y: window.innerHeight / 2 
  });
  const [cartPosition, setCartPosition] = useState<{ x: number; y: number }>({ 
    x: window.innerWidth - 80, 
    y: window.innerHeight - 80 
  });
  const socialButtonRef = useRef<HTMLDivElement>(null);
  const cartButtonRef = useRef<HTMLDivElement>(null);
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const createDragHandler = (
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>, 
    setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  ) => (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    // Prevenir el comportamiento predeterminado para evitar scrolling o selección
    e.preventDefault();
    
    setIsDragging(true);
    
    const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
      const clientX = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : (event as React.MouseEvent).clientY;
      return { clientX, clientY };
    };

    const startCoords = getCoordinates(e);
    const target = e.currentTarget.parentElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const offsetX = startCoords.clientX - rect.left;
    const offsetY = startCoords.clientY - rect.top;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault(); // Prevenir scroll durante el arrastre
      
      const moveCoords = 'touches' in moveEvent 
        ? { clientX: moveEvent.touches[0].clientX, clientY: moveEvent.touches[0].clientY }
        : { clientX: moveEvent.clientX, clientY: moveEvent.clientY };

      setPosition({
        x: moveCoords.clientX - offsetX,
        y: moveCoords.clientY - offsetY
      });
    };

    const handleEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMove as EventListener);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove as EventListener);
      document.removeEventListener('touchend', handleEnd);
    };

    // Añadir listeners para mouse y touch
    document.addEventListener('mousemove', handleMove as EventListener);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove as EventListener, { passive: false });
    document.addEventListener('touchend', handleEnd);
  };

  const handleSocialMouseDown = createDragHandler(setIsDraggingSocial, setSocialPosition);
  const handleCartMouseDown = createDragHandler(setIsDraggingCart, setCartPosition);

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

  const toggleSocialMenu = () => {
    setIsSocialMenuOpen(!isSocialMenuOpen);
  };

  const whatsappNumber = "+50578364365";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const facebookUrl = "https://www.facebook.com/gatotaku.rivas";
  const tiktokUrl = "https://www.tiktok.com/@gatotaku2022";

  return (
    <>
      <header className="bg-black text-white fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center"
              onClick={() => {
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
              <Link to="/" className="menu-desktop-link group">
                <span>Inicio</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
              </Link>
              <Link to="/about" className="menu-desktop-link group">
                <span>Sobre Nosotros</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
              </Link>
              <Link to="/information" className="menu-desktop-link group">
                <span>Información</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
              </Link>
              <a href={whatsappUrl} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="relative group flex items-center font-baloo">
                <span className="hover:text-gray-300 flex items-center">
                  <FaWhatsapp className="mr-2" />
                  WhatsApp
                </span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
              </a>
              {session && (
                <Link to="/admin" className="hover:text-orange-500 transition-colors font-baloo">
                  <FaUserShield className="text-2xl" />
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-white hover:text-orange-500 transition-colors"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Social Media Toggle */}
      <div 
        ref={socialButtonRef}
        className="fixed z-50" 
        style={{ 
          left: `${socialPosition.x}px`, 
          top: `${socialPosition.y}px`,
          cursor: isDraggingSocial ? 'grabbing' : 'grab'
        }}
      >
        <button 
          onMouseDown={handleSocialMouseDown}
          onTouchStart={handleSocialMouseDown}
          onClick={toggleSocialMenu}
          className="bg-white text-black rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          title="Arrastrar para mover"
        >
          <AiTwotoneMessage size={20} />
        </button>

        {isSocialMenuOpen && (
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-green-500 hover:text-green-400 transition-colors duration-300 bg-white rounded-full p-2 shadow-lg"
            >
              <FaWhatsapp size={24} />
            </a>
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-500 transition-colors duration-300 bg-white rounded-full p-2 shadow-lg"
            >
              <FaFacebook size={24} />
            </a>
            <a 
              href={tiktokUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-black hover:text-gray-700 transition-colors duration-300 bg-white rounded-full p-2 shadow-lg"
            >
              <FaTiktok size={24} />
            </a>
          </div>
        )}
      </div>

      {/* Floating Cart Icon */}
      <div 
        className="fixed bottom-4 right-4 z-50" 
        style={{ 
          left: `${cartPosition.x}px`, 
          top: `${cartPosition.y}px`,
          cursor: isDraggingCart ? 'grabbing' : 'grab',
          pointerEvents: 'none' // Evita interferir con el contenido
        }}
      >
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu}>
          <div 
            className="fixed top-0 right-0 w-64 h-full bg-black text-white p-6 transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-4">
              <Link to="/" className="menu-mobile-link" onClick={() => setIsMenuOpen(false)}>
                Catálogo
              </Link>
              <Link to="/about" className="menu-mobile-link" onClick={() => setIsMenuOpen(false)}>
                Sobre Nosotros
              </Link>
              <Link to="/information" className="menu-mobile-link" onClick={() => setIsMenuOpen(false)}>
                Información
              </Link>
              <a href={whatsappUrl} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="menu-mobile-icon"
                 onClick={() => setIsMenuOpen(false)}>
                <FaWhatsapp className="mr-2" />
                WhatsApp
              </a>
              {session && (
                <Link 
                  to="/admin" 
                  className="menu-mobile-icon"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserShield className="mr-2" />
                  Admin
                </Link>
              )}
              {location.pathname === '/admin' && session && (
                <button 
                  onClick={handleLogout} 
                  className="menu-mobile-icon"
                >
                  <FaSignOutAlt className="mr-2" />
                  Cerrar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
