import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaWhatsapp, FaBars, FaTimes } from 'react-icons/fa';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const whatsappNumber = "+50578364365";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <header className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="./logo.png" 
                 alt="Logo" 
                 className="w-10 h-10 rounded-full" />
            <span className="ml-2 text-xl font-black tracking-wider" style={{ fontFamily: "'Bebas Neue', cursive" }}>
              GATOTAKU
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-gray-300">Inicio</Link>
            <Link to="/about" className="hover:text-gray-300">Sobre Nosotros</Link>
            <Link to="/information" className="hover:text-gray-300">Información</Link>
            <a href={whatsappUrl} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="flex items-center hover:text-gray-300">
              <FaWhatsapp className="mr-2" />
              WhatsApp
            </a>
            <Link to="/cart" className="hover:text-gray-300">
              <FaShoppingCart className="text-2xl" />
            </Link>
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
              <Link to="/" className="text-white hover:text-gray-300" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
              <Link to="/about" className="text-white hover:text-gray-300" onClick={() => setIsMenuOpen(false)}>Sobre Nosotros</Link>
              <Link to="/information" className="text-white hover:text-gray-300" onClick={() => setIsMenuOpen(false)}>Información</Link>
              <a href={whatsappUrl} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-white hover:text-gray-300 flex items-center"
                 onClick={() => setIsMenuOpen(false)}>
                <FaWhatsapp className="mr-2" />
                WhatsApp
              </a>
              <Link to="/cart" className="text-white hover:text-gray-300" onClick={() => setIsMenuOpen(false)}>
                <FaShoppingCart className="mr-2 inline" />
                Carrito
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Icon (Mobile) */}
      <div className="fixed bottom-4 right-4 md:hidden bg-black rounded-full p-3 shadow-lg">
        <Link to="/cart">
          <FaShoppingCart className="text-white text-2xl" />
        </Link>
      </div>
    </header>
  );
};
