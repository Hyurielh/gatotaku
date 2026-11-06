import { Link } from 'react-router-dom';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';
import { SOCIAL_MEDIA } from '../constants/social';

export const Footer = () => {
  const whatsappNumber = '+505 7836 4365';

  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-700">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <Link to="/" className="inline-flex w-fit items-center gap-3" aria-label="Gatotaku, ir al inicio">
              <img src="/logo.png" alt="Logo de Gatotaku" className="h-10 w-10 rounded-xl object-cover" />
              <span className="text-xl font-bold tracking-tight text-slate-900">GATOTAKU</span>
            </Link>

            <div className="flex items-center gap-2" aria-label="Redes sociales">
              <a href={SOCIAL_MEDIA.tiktok} target="_blank" rel="noopener noreferrer" className="icon-button h-9 w-9" aria-label="TikTok" title="TikTok">
                <FaTiktok size={16} />
              </a>
              <a href={SOCIAL_MEDIA.facebook} target="_blank" rel="noopener noreferrer" className="icon-button h-9 w-9" aria-label="Facebook" title="Facebook">
                <FaFacebook size={16} />
              </a>
              <a href={SOCIAL_MEDIA.instagram} target="_blank" rel="noopener noreferrer" className="icon-button h-9 w-9" aria-label="Instagram" title="Instagram">
                <FaInstagram size={16} />
              </a>
              <a href={SOCIAL_MEDIA.whatsapp.url} target="_blank" rel="noopener noreferrer" className="icon-button h-9 w-9" aria-label="WhatsApp" title="WhatsApp">
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          <div className="grid gap-6 border-t border-slate-200 pt-6 text-sm sm:grid-cols-3">
            <nav aria-label="Enlaces rápidos">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Enlaces</h2>
              <ul className="mt-2 space-y-1.5">
                <li><Link to="/" className="inline-block py-1 transition hover:text-teal-700">Inicio</Link></li>
                <li><Link to="/about" className="inline-block py-1 transition hover:text-teal-700">Sobre nosotros</Link></li>
                <li><Link to="/information/general" className="inline-block py-1 transition hover:text-teal-700">Información</Link></li>
              </ul>
            </nav>

            <nav aria-label="Información de compra">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Compra</h2>
              <ul className="mt-2 space-y-1.5">
                <li><Link to="/information/payment-methods" className="inline-block py-1 transition hover:text-teal-700">Métodos de pago</Link></li>
                <li><Link to="/information/shipping" className="inline-block py-1 transition hover:text-teal-700">Envíos</Link></li>
                <li><Link to="/information/refunds" className="inline-block py-1 transition hover:text-teal-700">Reembolsos</Link></li>
              </ul>
            </nav>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contacto</h2>
              <ul className="mt-2 space-y-1.5">
                <li>WhatsApp: {whatsappNumber}</li>
                <li>Email: gatotaku2022@gmail.com</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
