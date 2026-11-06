import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { ProductFilters } from '../components/ProductFilters';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { SearchX } from 'lucide-react';
import type { Product, Filters } from '../types/database';
import { ErrorBoundary } from 'react-error-boundary';

function StoreFrontErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  useEffect(() => {
  }, [error]);

  return (
    <div role="alert" className="p-4 text-center bg-red-100">
      <h2 className="text-xl font-bold text-red-600">Error Loading Store Front</h2>
      <p className="text-red-500">{error.message}</p>
      <button 
        onClick={resetErrorBoundary} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try Again
      </button>
    </div>
  );
}

export default function StoreFront() {
  return (
    <ErrorBoundary 
      FallbackComponent={StoreFrontErrorFallback}
      onReset={() => {
        window.history.go(0);
      }}
    >
      <main className="store-front">
        <StoreFrontContent />
      </main>
    </ErrorBoundary>
  );
}

function StoreFrontContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => ({
    search: searchParams.get('q') ?? '',
    category: '',
    anime: '',
    sortBy: 'name_asc',
    minPrice: undefined,
    maxPrice: undefined,
    page: 1
  }));

  useEffect(() => {
    const querySearch = searchParams.get('q') ?? '';

    setFilters(previousFilters =>
      previousFilters.search === querySearch
        ? previousFilters
        : { ...previousFilters, search: querySearch, page: 1 }
    );
  }, [searchParams]);

  const updateSearchParam = useCallback((search: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (search.trim()) {
      nextParams.set('q', search);
    } else {
      nextParams.delete('q');
    }

    const queryString = nextParams.toString();
    setSearchParams(queryString ? nextParams : {}, { replace: true });
  }, [searchParams, setSearchParams]);
  
  const [isPageChanging, setIsPageChanging] = useState(false);

  useEffect(() => {
    const resetFiltersHandler = () => {
      setFilters({
        search: '',
        category: '',
        anime: '',
        sortBy: 'name_asc',
        minPrice: undefined,
        maxPrice: undefined,
        page: 1
      });
      setSearchParams({}, { replace: true });
    };

    window.addEventListener('reset-store-filters', resetFiltersHandler);

    return () => {
      window.removeEventListener('reset-store-filters', resetFiltersHandler);
    };
  }, [setSearchParams]);

  const fetchCategoriesAndAnimes = useCallback(async () => {
    const [categoriesResponse, animesResponse] = await Promise.all([
      supabase
        .from('categories')
        .select(`
          id, 
          name, 
          products:products(id)
        `),
      supabase
        .from('anime')
        .select(`
          id, 
          name, 
          products:products(id)
        `)
    ]);

    const categoriesWithProducts = categoriesResponse.data
      ?.filter(category => category.products.length > 0)
      .map(category => ({ id: category.id, name: category.name })) || [];

    const animesWithProducts = animesResponse.data
      ?.filter(anime => anime.products.length > 0)
      .map(anime => ({ id: anime.id, name: anime.name })) || [];

    return { categoriesWithProducts, animesWithProducts };
  }, []);

  const createFlexibleSearch = async (searchTerm: string): Promise<string> => {
    try {
      const cleanSearchTerm = searchTerm.trim().toLowerCase();
      
      const searchConditions: string[] = [];

      searchConditions.push(`name.ilike.%${cleanSearchTerm}%`);
      searchConditions.push(`description.ilike.%${cleanSearchTerm}%`);
      searchConditions.push(`category.ilike.%${cleanSearchTerm}%`);

      const { data: animeData } = await supabase
        .from('anime')
        .select('id')
        .ilike('name', `%${cleanSearchTerm}%`)
        .limit(1);  

      if (animeData && animeData.length > 0) {
        searchConditions.push(`anime_id.eq.${animeData[0].id}`);
      }

      return searchConditions.length > 0 ? searchConditions.join(',') : '';
    } catch{
      return '';
    }
  };

  const fetchProducts = useCallback(async ({ pageParam = 1 }): Promise<{
    products: Product[],
    totalPages: number,
    totalCount: number
  }> => {
    try {
      const productsPerPage = 12;
      const from = (pageParam - 1) * productsPerPage;
      const to = from + productsPerPage - 1;

      let query = supabase
        .from('products')
        .select('*, category_ref:categories(id, name), anime(id, name)', { count: 'exact' });

      if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.toLowerCase().trim();
        
        try {
          const searchConditions = await createFlexibleSearch(searchTerm);
          if (searchConditions) {
            query = query.or(searchConditions);
          }
        } catch{
        }
      }

      if (filters.category && filters.category.trim() !== '') {
        query = query.eq('category_id', filters.category);
      }

      if (filters.anime && filters.anime.trim() !== '') {
        query = query.eq('anime_id', filters.anime);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      switch (filters.sortBy) {
        case 'name_desc':
          query = query.order('name', { ascending: false });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name_asc':
        default:
          query = query.order('name', { ascending: true });
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      const totalCount = count ?? 0;
      const totalPages = Math.ceil(totalCount / productsPerPage);

      return {
        products: (data as Product[] | null) ?? [],
        totalPages,
        totalCount
      };
    } catch{
      return { products: [], totalPages: 0, totalCount: 0 };
    }
  }, [filters]);

  const { 
    data: queryData, 
    isLoading,
    error, 
    isError: _isError, 
    refetch: _refetch 
  } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const { categoriesWithProducts, animesWithProducts } = await fetchCategoriesAndAnimes();
      const productsData = await fetchProducts({ pageParam: filters.page || 1 });

      return {
        categoriesWithProducts,
        animesWithProducts,
        ...productsData
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5000,  // 5 segundos
    gcTime: 10000,    // Reemplaza cacheTime
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    if (Object.prototype.hasOwnProperty.call(newFilters, 'search')) {
      updateSearchParam(newFilters.search ?? '');
    }

    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      return updatedFilters;
    });
  }, [updateSearchParam]);

  const handlePageChange = (newPage: number) => {
    setIsPageChanging(true);
    setFilters(prev => ({ ...prev, page: newPage }));

    window.requestAnimationFrame(() => {
      document.getElementById('products-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      window.setTimeout(() => setIsPageChanging(false), 300);
    });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      anime: '',
      sortBy: 'name_asc',
      minPrice: undefined,
      maxPrice: undefined,
      page: 1
    });
    updateSearchParam('');
  };

  const renderPagination = () => {
    const totalPages = queryData?.totalPages || 0;
    const currentPage = filters.page || 1;

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const maxVisiblePages = 5;
      
      if (currentPage <= 3) {
        return Array.from({ length: Math.min(maxVisiblePages, totalPages) }, (_, i) => i + 1);
      }
      
      if (currentPage >= totalPages - 2) {
        return Array.from({ length: maxVisiblePages }, (_, i) => totalPages - maxVisiblePages + i + 1);
      }
      
      return [
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2
      ];
    };

    const pageNumbers = getPageNumbers();

    return (
      <nav className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-slate-200 pt-5" aria-label="Paginación de productos">
        <span className="mr-1 text-xs font-medium text-slate-500">
          Página {currentPage} de {totalPages}
        </span>

        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn-secondary h-9 px-3"
          aria-label="Página anterior"
        >
          <span aria-hidden="true">←</span>
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => handlePageChange(number)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-200 ${
              currentPage === number
                ? 'bg-teal-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700'
            }`}
            aria-current={currentPage === number ? 'page' : undefined}
            aria-label={`Página ${number}`}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn-secondary h-9 px-3"
          aria-label="Página siguiente"
        >
          <span aria-hidden="true">→</span>
        </button>
      </nav>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col">
      <SEO
        title="GATOTAKU - Tu Tienda de Anime"
        description="Descubre nuestra colección de productos de anime. Figuras, accesorios y más."
      />

      <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">Catálogo</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Productos de anime</h1>
          <p className="mt-1 text-sm text-slate-500">Figuras, peluches, manga y accesorios para fans.</p>
        </div>

        <label className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ordenar</span>
          <select
            value={filters.sortBy ?? 'name_asc'}
            onChange={(event) => handleFilterChange({ sortBy: event.target.value as Filters['sortBy'] })}
            className="field h-10 w-44"
            aria-label="Ordenar productos"
          >
            <option value="name_asc">Nombre A-Z</option>
            <option value="name_desc">Nombre Z-A</option>
            <option value="price_asc">Precio menor</option>
            <option value="price_desc">Precio mayor</option>
          </select>
        </label>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <ProductFilters
          onFilterChange={handleFilterChange}
          currentFilters={filters}
          categories={queryData?.categoriesWithProducts || []}
          animes={queryData?.animesWithProducts || []}
          onResetFilters={handleResetFilters}
        />

        <section id="products-section" className="min-w-0 flex-1" aria-label="Catálogo de productos">
          <div className="mb-3 flex min-h-6 items-center justify-between gap-3">
            <p className="text-sm text-slate-500" role="status">
              {isLoading ? 'Cargando catálogo...' : `${queryData?.totalCount ?? 0} productos encontrados`}
            </p>
            {filters.search && (
              <span className="chip max-w-[50%]">
                <span className="truncate">{filters.search}</span>
              </span>
            )}
          </div>

          <div className="relative products-grid-wrapper">
            {isPageChanging && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-teal-700">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
                  <span className="text-sm font-medium">Cargando...</span>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonProductCard key={`skeleton-${index}`} />
                ))}
              </div>
            ) : queryData?.products?.length ? (
              <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 transition-opacity duration-300 ${isPageChanging ? 'opacity-50' : 'opacity-100'}`}>
                {queryData.products.map((product, index) => (
                  <Reveal key={product.id} delay={index * 40} className="h-full">
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="panel flex flex-col items-center justify-center px-4 py-14 text-center">
                <SearchX className="mb-4 h-12 w-12 text-slate-300" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-slate-900">Sin resultados</h2>
                <p className="mt-1 max-w-sm text-sm text-slate-500">Prueba con otro término o elimina los filtros activos.</p>
                <button type="button" onClick={handleResetFilters} className="btn-primary mt-5">
                  Restablecer filtros
                </button>
              </div>
            )}
          </div>

          {renderPagination()}
        </section>
      </div>
    </div>
  );
}

/* Skeleton de carga inicial: misma silueta que ProductCard, shimmer sólido */
function SkeletonProductCard() {
  return (
    <div className="panel h-full overflow-hidden">
      <div className="relative aspect-[4/3] w-full bg-[#F0F0F0] overflow-hidden">
        <div className="absolute inset-0 animate-shimmer bg-white/60" />
      </div>
      <div className="space-y-3 p-3 sm:p-4">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-200" />
        <div className="h-6 w-1/3 rounded bg-slate-200" />
        <div className="h-10 w-full rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}
