import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import {
  ShoppingBag,
  Newspaper,
  Info,
  Wrench,
  User,
  Shield,
  Ticket,
  ClipboardList,
  Heart,
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
  avatarUrl?: string;
}

const primaryItems: SidebarItem[] = [
  { label: 'Tienda', to: '/', icon: ShoppingBag },
  { label: 'Servicios', to: '/servicios', icon: Wrench },
  { label: 'Novedades', to: '/novedades', icon: Newspaper },
  { label: 'Información', to: '/information/general', icon: Info, activePrefix: '/information' },
];

function isItemActive(pathname: string, item: SidebarItem) {
  return item.activePrefix ? pathname.startsWith(item.activePrefix) : pathname === item.to;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { isAdmin, profile } = useAuth();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const accountItem: SidebarItem = {
    label: 'Cuenta',
    to: '/cuenta',
    icon: User,
    avatarUrl: profile?.avatar_url ?? undefined,
  };
  const accountItems: SidebarItem[] = [
    accountItem,
    { label: 'Mis Pedidos', to: '/mis-pedidos', icon: ClipboardList },
    { label: 'Mis Favoritos', to: '/mis-favoritos', icon: Heart },
    { label: 'Mis Cupones', to: '/mis-cupones', icon: Ticket },
    ...(isAdmin ? [{ label: 'Admin', to: '/admin', icon: Shield }] : []),
  ];

  const renderItems = (items: SidebarItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      const active = isItemActive(location.pathname, item);

      return (
        <Link
          key={item.to}
          to={item.to}
          className={`sidebar-link ${active ? 'active' : ''}`}
          aria-label={item.label}
          title={item.label}
          aria-current={active ? 'page' : undefined}
        >
          {item.avatarUrl ? (
            <img
              src={item.avatarUrl}
              alt=""
              className="h-5 w-5 shrink-0 rounded-full object-cover"
            />
          ) : (
            <Icon size={20} strokeWidth={2} className="shrink-0" />
          )}
          <span className="truncate">{item.label}</span>
        </Link>
      );
    });

  const renderNav = (showCloseButton = false) => (
    <div className="flex h-full w-full flex-col border-r border-slate-200 bg-white px-3 py-4">
      <div className="flex w-full items-center justify-between gap-2">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 rounded-xl p-1 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-teal-300"
          aria-label="Ir al inicio de Gatotaku"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('reset-store-filters'));
            onClose();
          }}
        >
          <img
            src="/logo.png"
            alt="Logo de Gatotaku"
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
          <span className="truncate text-lg font-bold text-slate-900">Gatotaku</span>
        </Link>

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="sidebar-icon shrink-0"
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        )}
      </div>

      <nav className="mt-6 flex w-full flex-col gap-1.5" aria-label="Navegación principal">
        {renderItems(primaryItems)}
      </nav>

      <div className="my-4 h-px w-full bg-slate-200" aria-hidden="true" />

      <nav className="flex w-full flex-col gap-1.5" aria-label="Cuenta">
        {renderItems(accountItems)}
      </nav>

      <div className="my-5 h-px w-full bg-slate-200" aria-hidden="true" />

      <nav className="flex w-full flex-col gap-1.5" aria-label="Redes sociales">
        <a
          href={SOCIAL_MEDIA.whatsapp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link-primary"
          aria-label="Pedir por WhatsApp"
          title="Pedir por WhatsApp"
        >
          <FaWhatsapp size={20} className="shrink-0" />
          <span>WhatsApp</span>
        </a>
        <a
          href={SOCIAL_MEDIA.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link"
          aria-label="Facebook"
          title="Facebook"
        >
          <FaFacebook size={18} className="shrink-0" />
          <span>Facebook</span>
        </a>
        <a
          href={SOCIAL_MEDIA.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link"
          aria-label="Instagram"
          title="Instagram"
        >
          <FaInstagram size={18} className="shrink-0" />
          <span>Instagram</span>
        </a>
        <a
          href={SOCIAL_MEDIA.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link"
          aria-label="TikTok"
          title="TikTok"
        >
          <FaTiktok size={18} className="shrink-0" />
          <span>TikTok</span>
        </a>
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden w-56 shrink-0 lg:block" aria-label="Barra lateral">
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
          <div className="absolute inset-y-0 left-0 w-64 animate-slide-in-left">
            {renderNav(true)}
          </div>
        </div>
      )}
    </>
  );
}
