import { Newspaper } from 'lucide-react';
import { SEO } from '../components/SEO';

export default function NewsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <SEO
        title="Novedades - Gatotaku"
        description="Noticias, novedades y promociones de Gatotaku."
      />

      <div className="mb-4 flex items-center gap-2">
        <Newspaper className="text-teal-600" size={22} aria-hidden="true" />
        <h1 className="section-title">Novedades</h1>
      </div>

      <div className="panel p-8 text-center">
        <Newspaper className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden="true" />
        <p className="text-sm font-semibold text-slate-700">Muy pronto</p>
        <p className="mt-1 text-sm text-slate-500">
          Aquí publicaremos noticias, nuevos productos y promociones.
        </p>
      </div>
    </div>
  );
}
