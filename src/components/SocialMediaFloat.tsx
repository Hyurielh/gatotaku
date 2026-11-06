import { useState, useRef } from 'react';
import { FaWhatsapp, FaFacebook, FaTiktok, FaPlus } from 'react-icons/fa';
import { SOCIAL_MEDIA } from '../constants/social';

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

  const whatsappUrl = SOCIAL_MEDIA.whatsapp.url;
  const facebookUrl = SOCIAL_MEDIA.facebook;
  const tiktokUrl = SOCIAL_MEDIA.tiktok;

  return (
    <div
      ref={socialButtonRef}
      onMouseDown={dragHandlers.onMouseDown}
      onTouchStart={dragHandlers.onTouchStart}
      style={dragHandlers.mergeDragStyles({
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab'
      })}
    >
      {/* Flotación suave en reposo; NUNCA en wrapper (rompería drag) */}
      <div className={`flex flex-col space-y-3 ${isDragging ? '' : 'animate-bounce-soft'}`}>
        {/* WhatsApp - siempre visible */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(whatsappUrl, '_blank');
            }}
            className="w-12 h-12 bg-white rounded-full border border-teal-100 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md flex items-center justify-center group"
            title="WhatsApp"
          >
            <FaWhatsapp size={20} className="text-green-500 group-hover:text-green-600 transition-colors" />
          </button>

          {/* Botón pequeño + en la esquina para expandir/contraer */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSocialMenu();
            }}
            className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-teal-700 bg-teal-600 shadow-sm transition-all duration-300 hover:scale-110 hover:bg-teal-700"
            title={isSocialMenuOpen ? "Cerrar redes sociales" : "Más redes sociales"}
          >
            <FaPlus
              size={10}
              className={`text-white transition-transform duration-300 ${isSocialMenuOpen ? 'rotate-45' : 'group-hover:rotate-90'
                }`}
            />
          </button>
        </div>

        {/* Redes sociales expandidas */}
        {isSocialMenuOpen && (
          <>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group animate-pop"
              title="Facebook"
            >
              <FaFacebook size={20} className="text-blue-600 group-hover:text-blue-700 transition-colors" />
            </a>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group animate-pop"
              style={{ animationDelay: '60ms' }}
              title="TikTok"
            >
              <FaTiktok size={20} className="text-gray-800 group-hover:text-black transition-colors" />
            </a>

          </>
        )}
      </div>
    </div>
  );
};