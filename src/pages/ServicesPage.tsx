import { useQuery } from '@tanstack/react-query';
import { Wrench, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import type { Product } from '../types/database';

export default function ServicesPage() {
  const {
    data: services = [],
    isLoading,
    isError,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('products')
        .select('*, category_ref:categories(id, name), anime(id, name)')
        .eq('is_service', true)
        .order('name', { ascending: true });

      if (queryError) throw queryError;

      return (data as Product[] | null) ?? [];
    },
    staleTime: 5_000,
    gcTime: 10_000,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <SEO
        title="GATOTAKU - Servicios"
        description="Conoce los servicios de Gatotaku."
      />

      <section className="mb-5 flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Servicios</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Servicios Gatotaku</h1>
        <p className="max-w-2xl text-sm text-slate-500">
          Diseño, personalización, mantenimiento y diagnóstico de computadoras y otros servicios!
        </p>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ServiceSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <div className="panel flex flex-col items-center px-4 py-14 text-center" role="alert">
          <AlertCircle className="mb-4 h-12 w-12 text-red-300" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-900">No se pudieron cargar los servicios</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">{error.message}</p>
        </div>
      ) : services.length === 0 ? (
        <div className="panel flex flex-col items-center px-4 py-14 text-center">
          <Wrench className="mb-4 h-12 w-12 text-slate-300" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-900">Aún no hay servicios</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">Pronto agregaremos servicios disponibles para clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 40} className="h-full">
              <ProductCard product={service} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceSkeleton() {
  return (
    <div className="panel h-full overflow-hidden">
      <div className="relative aspect-[4/3] w-full bg-[#F0F0F0]">
        <div className="absolute inset-0 animate-shimmer bg-white/60" />
      </div>
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-200" />
        <div className="h-10 w-full rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}
