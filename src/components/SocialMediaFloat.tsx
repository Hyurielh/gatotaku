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
      <div className="flex flex-col space-y-2 bg-white/90 rounded-xl shadow-xl p-3 backdrop-blur-lg border border-white/20">
        <button 
          onClick={() => window.open(whatsappUrl, '_blank')}
          className="text-green-600 hover:text-white hover:bg-green-500 transition-all duration-300 rounded-full p-3 hover:scale-110 hover:shadow-lg group"
          title="WhatsApp"
        >
          <FaWhatsapp size={20} className="drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300" />
        </button>
        
        {!isSocialMenuOpen && (
          <button 
            onClick={toggleSocialMenu}
            className="text-orange-500 hover:text-white hover:bg-orange-500 transition-all duration-300 rounded-full p-3 hover:scale-110 hover:shadow-lg group"
            title="Más redes sociales"
          >
            <FaPlus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}

        {isSocialMenuOpen && (
          <>
            <a 
              href={facebookUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-white hover:bg-blue-500 transition-all duration-300 rounded-full p-3 hover:scale-110 hover:shadow-lg group"
              title="Facebook"
            >
              <FaFacebook size={20} className="group-hover:drop-shadow-xl transition-all duration-300" />
            </a>
            <a 
              href={tiktokUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-800 hover:text-white hover:bg-gray-800 transition-all duration-300 rounded-full p-3 hover:scale-110 hover:shadow-lg group"
              title="TikTok"
            >
              <FaTiktok size={20} className="group-hover:drop-shadow-xl transition-all duration-300" />
            </a>
            <button 
              onClick={toggleSocialMenu}
              className="text-orange-500 hover:text-white hover:bg-orange-500 transition-all duration-300 rounded-full p-3 hover:scale-110 hover:shadow-lg group self-center"
              title="Cerrar redes sociales"
            >
              <FaPlus className="transform rotate-45 group-hover:rotate-90 transition-transform duration-300" size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};