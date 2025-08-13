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
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab'
      })}
    >
      <div className="flex flex-col space-y-3">
        {/* WhatsApp - siempre visible */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(whatsappUrl, '_blank');
            }}
            className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group border-2 border-orange-300"
            title="WhatsApp"
          >
            <FaWhatsapp size={20} className="text-green-500 group-hover:text-green-600 transition-colors" />
          </button>
        </div>

        {/* Botón + para expandir/contraer */}
        {!isSocialMenuOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSocialMenu();
            }}
            className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
            title="Más redes sociales"
          >
            <FaPlus size={16} className="text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        )}

        {/* Redes sociales expandidas */}
        {isSocialMenuOpen && (
          <>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
              title="Facebook"
            >
              <FaFacebook size={20} className="text-blue-600 group-hover:text-blue-700 transition-colors" />
            </a>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
              title="TikTok"
            >
              <FaTiktok size={20} className="text-gray-800 group-hover:text-black transition-colors" />
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSocialMenu();
              }}
              className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
              title="Cerrar redes sociales"
            >
              <FaPlus className="text-white transform rotate-45 group-hover:rotate-90 transition-transform duration-300" size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};