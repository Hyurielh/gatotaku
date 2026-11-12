import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { ChevronRight, Menu, Search, ShoppingCart, User, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileDisplayName, profileInitials } from '../lib/profile';
import { useTheme } from '../hooks/useTheme';
import { useCart } from '../context/CartContext';
import { SOCIAL_MEDIA } from '../constants/social';

interface AppHeaderProps {
  onMenuToggle: () => void;
}

interface BreadcrumbItem {
  label: string;
  to?: string;
}

const informationLabels: Record<string, string> = {
  general: 'Información general',
  about: 'Sobre nosotros',
  'payment-methods': 'Métodos de pago',
  shipping: 'Envíos',
  refunds: 'Devoluciones',
  layaway: 'Apartado',
};

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === '/') return [{ label: 'Inicio' }];
  if (pathname === '/servicios') return [{ label: 'Inicio', to: '/' }, { label: 'Servicios' }];
  if (pathname === '/about') return [{ label: 'Inicio', to: '/' }, { label: 'Sobre nosotros' }];
  if (pathname === '/novedades') return [{ label: 'Inicio', to: '/' }, { label: 'Novedades' }];
  if (pathname === '/login') return [{ label: 'Inicio', to: '/' }, { label: 'Login' }];
  if (pathname === '/cuenta') return [{ label: 'Inicio', to: '/' }, { label: 'Mi cuenta' }];
  if (pathname === '/admin/login') return [{ label: 'Inicio', to: '/' }, { label: 'Acceso administrativo' }];
  if (pathname === '/admin') return [{ label: 'Inicio', to: '/' }, { label: 'Administración' }];

  if (pathname.startsWith('/information')) {
    const section = pathname.split('/')[2] ?? 'general';
    return [
      { label: 'Inicio', to: '/' },
      { label: 'Información', to: '/information/general' },
      { label: informationLabels[section] ?? 'Información general' },
    ];
  }

  return [{ label: 'Inicio', to: '/' }, { label: 'Página' }];
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { items, setIsOpen } = useCart();
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
  }, [searchParams]);

  const updateSearch = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const trimmedValue = value.trim();

    if (trimmedValue) {
      nextParams.set('q', value);
    } else {
      nextParams.delete('q');
    }

    setSearch(value);
    const queryString = nextParams.toString();
    navigate(queryString ? `/?${queryString}` : '/', { replace: true });
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearch(search);
  };

  const clearSearch = () => updateSearch('');
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const displayName = session ? profileDisplayName(profile) : '';

  return (
    <header className="border-b border-slate-200 bg-white" role="banner">
      <div className="relative flex h-14 items-center gap-2 px-3 sm:px-5 lg:h-16 lg:gap-4 lg:px-6">
        <button
          type="button"
          onClick={onMenuToggle}
          className="icon-button lg:hidden"
          aria-label="Abrir menú principal"
        >
          <Menu size={21} />
        </button>

        <nav className="hidden min-w-0 items-center gap-1.5 text-xs text-slate-500 md:flex" aria-label="Migas de pan">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                {index > 0 && <ChevronRight size={14} className="shrink-0 text-slate-300" aria-hidden="true" />}
                {item.to && !isLast ? (
                  <Link to={item.to} className="truncate transition hover:text-teal-700">
                    {item.label}
                  </Link>
                ) : (
                  <span className="truncate font-semibold text-slate-800" aria-current="page">
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>

        {displayName && (
          <span className="max-w-[6.5rem] shrink-0 truncate text-sm font-semibold text-slate-800 sm:max-w-[11rem]">
            {displayName}
          </span>
        )}

        <form
          onSubmit={submitSearch}
          className="mx-auto hidden w-full max-w-md items-center sm:flex"
          role="search"
        >
          <label className="relative flex w-full items-center">
            <Search size={18} className="pointer-events-none absolute left-3 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Buscar productos</span>
            <input
              type="search"
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Buscar productos..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
              aria-label="Buscar productos"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 rounded p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Borrar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </label>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <label className="hidden sm:block">
            <span className="sr-only">Idioma</span>
            <select aria-label="Idioma" defaultValue="ES" className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-600 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
              <option value="ES">ES</option>
            </select>
          </label>

          <button
            type="button"
            onClick={toggleTheme}
            className="icon-button"
            aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
          </button>

          <a
            href={SOCIAL_MEDIA.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-button"
            aria-label="Contactar por WhatsApp"
            title="WhatsApp"
          >
            <FaWhatsapp size={19} />
          </a>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="icon-button relative"
            aria-label={`Abrir carrito, ${items.length} ${items.length === 1 ? 'producto' : 'productos'}`}
            title="Abrir carrito"
          >
            <ShoppingCart size={20} />
            {items.length > 0 && (
              <span key={items.length} className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white animate-pop">
                {items.length}
              </span>
            )}
          </button>

          <Link
            to="/cuenta"
            className="icon-button"
            aria-label={session ? 'Ir a mi cuenta' : 'Iniciar sesión'}
            title={session ? 'Mi cuenta' : 'Iniciar sesión'}
          >
            {session && profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-7 w-7 rounded-full border border-slate-200 object-cover"
              />
            ) : session && profile ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-700">
                {profileInitials(profile)}
              </span>
            ) : (
              <User size={20} />
            )}
          </Link>
        </div>
      </div>

      <form onSubmit={submitSearch} className="border-t border-slate-100 px-3 py-2 sm:hidden" role="search">
        <label className="relative flex w-full items-center">
          <Search size={18} className="pointer-events-none absolute left-3 text-slate-400" aria-hidden="true" />
          <span className="sr-only">Buscar productos</span>
          <input
            type="search"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Buscar productos..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
            aria-label="Buscar productos"
          />
          {search && (
            <button type="button" onClick={clearSearch} className="absolute right-2 rounded p-1 text-slate-400" aria-label="Borrar búsqueda">
              <X size={16} />
            </button>
          )}
        </label>
      </form>
    </header>
  );
}
