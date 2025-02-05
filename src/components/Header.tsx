import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaWhatsapp, FaFacebook, FaTiktok, FaBars, FaTimes, FaUserShield, FaPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import React from 'react';
import { toast } from 'react-toastify';  

export const Header: React.FC = React.memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const [isDraggingSocial, setIsDraggingSocial] = useState(false);
  const [socialPosition, setSocialPosition] = useState<{ x: number; y: number }>({ 
    x: 16, 
    y: window.innerHeight / 2 
  });
  const socialButtonRef = useRef<HTMLDivElement>(null);
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const createDragHandler = (
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>, 
    setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  ) => {
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let dragElement: HTMLElement | null = null;

    const handleStart = (clientX: number, clientY: number, target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      startX = clientX - rect.left;
      startY = clientY - rect.top;
      
      isDragging = false;
      dragElement = target;
      
      // Añadir listeners globales
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    };

    const handleMouseStart = (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY, e.currentTarget as HTMLElement);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
      // Desactivar passive listener para permitir preventDefault
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY, e.currentTarget as HTMLElement);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragElement) return;

      // Comenzar arrastre solo si hay movimiento significativo
      if (!isDragging) {
        isDragging = true;
        setIsDragging(true);
      }

      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragElement) return;

      // Prevenir scroll
      e.preventDefault();

      // Comenzar arrastre solo si hay movimiento significativo
      if (!isDragging) {
        isDragging = true;
        setIsDragging(true);
      }

      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - startX,
        y: touch.clientY - startY
      });
    };

    const handleEnd = () => {
      // Limpiar listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);

      // Restablecer estados
      isDragging = false;
      dragElement = null;
      setIsDragging(false);
    };

    // Método para combinar estilos de manera segura
    const mergeDragStyles = (existingStyles?: React.CSSProperties): React.CSSProperties => {
      const dragStyles: React.CSSProperties = {
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'none',
        cursor: 'move'
      };

      return existingStyles 
        ? { ...existingStyles, ...dragStyles } 
        : dragStyles;
    };

    return {
      onMouseDown: handleMouseStart,
      onTouchStart: handleTouchStart,
      mergeDragStyles  // Devolver la función para combinar estilos
    };
  };

  const socialDragHandlers = createDragHandler(setIsDraggingSocial, setSocialPosition);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      toast.error('Error al cerrar sesión. Por favor, inténtalo de nuevo.');
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
      <header 
        className="bg-black text-white fixed top-0 left-0 right-0 z-20" 
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center"
              aria-label="Página de inicio de Gatotaku"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('reset-store-filters'));
              }}
            >
              <img 
                src="/logo.png" 
                alt="Logo de Gatotaku" 
                className="w-12 h-12 rounded-full" 
              />
              <span 
                className="ml-3 text-2xl md:text-3xl font-black tracking-wide text-white" 
                style={{ 
                  fontFamily: "Poppins",
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              >
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
                 className="relative group flex items-center font-baloo"
              >
                <span className="hover:text-gray-300 flex items-center">
                  <FaWhatsapp size={18} />
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

            {/* Botón de menú móvil */}
            <button 
              className="md:hidden"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      {/* Social Media Toggle */}
      <div 
        ref={socialButtonRef}
        onMouseDown={socialDragHandlers.onMouseDown}
        onTouchStart={socialDragHandlers.onTouchStart}
        style={socialDragHandlers.mergeDragStyles({
          position: 'fixed',
          left: `${socialPosition.x}px`, 
          top: `${socialPosition.y}px`,
          zIndex: 30,
          cursor: isDraggingSocial ? 'grabbing' : 'grab'
        })}
      >
        <div className="flex flex-col space-y-1 bg-white bg-opacity-70 rounded-lg shadow-lg p-2 backdrop-blur-sm"
        >
          <button 
            onClick={() => window.open(whatsappUrl, '_blank')}
            className="text-green-600 hover:text-green-500 transition-colors duration-300 bg-opacity-30 rounded-full p-2"
            title="WhatsApp"
          >
            <FaWhatsapp size={18} className="drop-shadow-md" />
          </button>
          
          {!isSocialMenuOpen && (
            <button 
              onClick={toggleSocialMenu}
              className="text-black hover:text-gray-800 transition-colors duration-300 bg-opacity-30 rounded-full p-2"
              title="Más redes sociales"
            >
              <FaPlus size={18} />
            </button>
          )}

          {isSocialMenuOpen && (
            <>
              <a 
                href={facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-500 transition-colors duration-300 bg-opacity-70 rounded-full p-2"
              >
                <FaFacebook size={18} />
              </a>
              <a 
                href={tiktokUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-black hover:text-gray-800 transition-colors duration-300 bg-opacity-70 rounded-full p-2"
              >
                <FaTiktok size={18} />
              </a>
              <button 
                onClick={toggleSocialMenu}
                className="text-black hover:text-gray-800 transition-colors duration-300 bg-opacity-70 rounded-full p-2 self-center"
                title="Cerrar redes sociales"
              >
                <FaPlus className="transform rotate-45" size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={toggleMenu}
        >
          <div 
            className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()} // Prevenir cierre al hacer clic dentro del menú
          >
            <div className="p-4 border-b flex justify-between items-center">
              <Link 
                to="/" 
                className="flex items-center"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('reset-store-filters'));
                  toggleMenu();
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
                onClick={toggleMenu}
                className="text-gray-600 hover:text-gray-900"
              >
                <FaTimes size={18} />
              </button>
            </div>
            
            <nav className="flex flex-col p-4 space-y-4">
              <Link 
                to="/" 
                className="text-lg hover:text-orange-500 transition-colors"
                onClick={toggleMenu}
              >
                Inicio
              </Link>
              <Link 
                to="/about" 
                className="text-lg hover:text-orange-500 transition-colors"
                onClick={toggleMenu}
              >
                Sobre Nosotros
              </Link>
              <Link 
                to="/information" 
                className="text-lg hover:text-orange-500 transition-colors"
                onClick={toggleMenu}
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
                  onClick={toggleMenu}
                >
                  <FaUserShield className="mr-2" />
                  Panel Admin
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
});
