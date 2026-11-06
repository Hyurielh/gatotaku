import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import {
  Home,
  Info,
  FileText,
  User,
  Shield,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SOCIAL_MEDIA } from '../constants/social';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarItem {
  label: string;
  to: string;
  icon: LucideIcon;
  activePrefix?: string;
}

const primaryItems: SidebarItem[] = [
  { label: 'Inicio', to: '/', icon: Home },
  { label: 'Sobre nosotros', to: '/about', icon: Info },
  { label: 'Información', to: '/information/general', icon: FileText, activePrefix: '/information' },
];

function isItemActive(pathname: string, item: SidebarItem) {
  return item.activePrefix ? pathname.startsWith(item.activePrefix) : pathname === item.to;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { session } = useAuth();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const accountItem: SidebarItem = session
    ? { label: 'Administración', to: '/admin', icon: Shield }
    : { label: 'Login', to: '/login', icon: User };
  const navigationItems = [...primaryItems, accountItem];

  const renderNav = (showCloseButton = false) => (
    <div className="flex h-full flex-col items-center border-r border-slate-200 bg-white px-2 py-4">
      <div className="flex h-12 w-12 items-center justify-center">
        {showCloseButton ? (
          <button type="button" onClick={onClose} className="sidebar-icon" aria-label="Cerrar menú">
            <X size={22} />
          </button>
        ) : (
          <Link
            to="/"
            className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:rotate-6 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-teal-300"
            aria-label="Ir al inicio de Gatotaku"
            onClick={() => window.dispatchEvent(new CustomEvent('reset-store-filters'))}
          >
            <img src="/logo.png" alt="Logo de Gatotaku" className="h-11 w-11 rounded-xl object-cover" />
          </Link>
        )}
      </div>

      <nav className="mt-6 flex w-full flex-col items-center gap-2" aria-label="Navegación principal">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(location.pathname, item);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-icon ${active ? 'active' : ''}`}
              aria-label={item.label}
              title={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={2} />
            </Link>
          );
        })}
      </nav>

      <div className="my-5 h-px w-10 bg-slate-200" aria-hidden="true" />

      <nav className="flex w-full flex-col items-center gap-2" aria-label="Redes sociales">
        <a
          href={SOCIAL_MEDIA.whatsapp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-110 hover:bg-teal-700 active:scale-90 focus:outline-none focus:ring-2 focus:ring-teal-200"
          aria-label="Pedir por WhatsApp"
          title="Pedir por WhatsApp"
        >
          <FaWhatsapp size={24} />
        </a>
        <a
          href={SOCIAL_MEDIA.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-icon"
          aria-label="Facebook"
          title="Facebook"
        >
          <FaFacebook size={20} />
        </a>
        <a
          href={SOCIAL_MEDIA.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-icon"
          aria-label="Instagram"
          title="Instagram"
        >
          <FaInstagram size={20} />
        </a>
        <a
          href={SOCIAL_MEDIA.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-icon"
          aria-label="TikTok"
          title="TikTok"
        >
          <FaTiktok size={20} />
        </a>
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden w-20 shrink-0 lg:block" aria-label="Barra lateral">
        {renderNav()}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú principal">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Cerrar menú"
            onClick={onClose}
          />
          <div className="absolute inset-y-0 left-0 w-20 animate-slide-in-left">
            {renderNav(true)}
          </div>
        </div>
      )}
    </>
  );
}
