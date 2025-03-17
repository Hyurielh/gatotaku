import { useState, useRef } from 'react';
import { FaWhatsapp, FaFacebook, FaTiktok, FaPlus } from 'react-icons/fa';

interface SocialMediaFloatProps {
  position: { x: number; y: number };
  isDragging: boolean;
  dragHandlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    mergeDragStyles: (styles?: React.CSSProperties) => React.CSSProperties;
  };
}

export const SocialMediaFloat: React.FC<SocialMediaFloatProps> = ({
  position,
  isDragging,
  dragHandlers
}) => {
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const socialButtonRef = useRef<HTMLDivElement>(null);

  const toggleSocialMenu = () => {
    setIsSocialMenuOpen(!isSocialMenuOpen);
  };

  const whatsappUrl = `https://wa.me/+50578364365`;
  const facebookUrl = "https://www.facebook.com/gatotaku.rivas";
  const tiktokUrl = "https://www.tiktok.com/@gatotaku2022";

  return (
    <div 
      ref={socialButtonRef}
      onMouseDown={dragHandlers.onMouseDown}
      onTouchStart={dragHandlers.onTouchStart}
      style={dragHandlers.mergeDragStyles({
        position: 'fixed',
        left: `${position.x}px`, 
        top: `${position.y}px`,
        zIndex: 30,
        cursor: isDragging ? 'grabbing' : 'grab'
      })}
    >
      <div className="flex flex-col space-y-1 bg-white bg-opacity-70 rounded-lg shadow-lg p-2 backdrop-blur-sm">
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
  );
};