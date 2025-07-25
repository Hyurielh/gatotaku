
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserShield, FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { MobileMenu } from './MobileMenu';
import { SocialMediaFloat } from './SocialMediaFloat';
import { SOCIAL_MEDIA } from '../constants/social';
import { useDraggable } from '../hooks/useDraggable';

export const Header: React.FC = React.memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  
  const { isDragging, position, dragHandlers } = useDraggable({ // Changed here
    x: 16, 
    y: window.innerHeight / 2 
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      toast.error('Error al cerrar sesión. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <>
      <header className="bg-black h-[10vh] text-white fixed top-0 left-0 right-0 z-20 shadow-lg" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full" >
          <div className="flex justify-between items-center h-full">
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
                className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg" 
              />
              <span 
                className="ml-3 text-2xl lg:text-4xl font-black tracking-wide text-white" 
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
              <a href={SOCIAL_MEDIA.whatsapp.url}
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="relative group px-2 rounded-full hover:bg-green-500/20 transition-all duration-200"
                 title="Contáctanos por WhatsApp"
              >
                <FaWhatsapp size={24} className="text-green-400 hover:text-green-300 transition-colors" />
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      <SocialMediaFloat 
        position={position}
        isDragging={isDragging}
        dragHandlers={dragHandlers}
      />

      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        session={session}
      />
    </>
  );
});
