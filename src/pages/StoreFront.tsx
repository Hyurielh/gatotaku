import * as React from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { SearchAndFilters } from '../components/SearchAndFilters';
import { ProductCard } from '../components/ProductCard';
import type { Product, Category, Anime, Filters } from '../types/database';
import { ErrorBoundary } from 'react-error-boundary';

// Error Fallback Component
function StoreFrontErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  useEffect(() => {
    console.error('StoreFront Component Error:', error);
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
        // Reset any necessary state
        window.location.reload();
      }}
    >
      <StoreFrontContent />
    </ErrorBoundary>
  );
}

function StoreFrontContent() {
  const [filters, setFilters] = useState<Filters>(() => ({
    search: '',
    category: '',
    anime: '',
    sortBy: 'name_asc'
  }));

  // Memoize fetchProducts to prevent unnecessary re-renders
  const fetchProducts = useCallback(async ({ pageParam = 1 }) => {
    try {
      const ITEMS_PER_PAGE = 50;
      let query = supabase
        .from('products')
        .select(`
          *,
          category_ref:categories(id, name),
          anime:anime(id, name)
        `, { count: 'exact' })
        .range((pageParam - 1) * ITEMS_PER_PAGE, pageParam * ITEMS_PER_PAGE - 1);

      // Apply existing filters
      if (filters.category) query = query.eq('category_id', filters.category);
      if (filters.anime) query = query.eq('anime_id', filters.anime);
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);

      // Apply sorting
      switch(filters.sortBy) {
        case 'name_asc': query = query.order('name', { ascending: true }); break;
        case 'price_asc': query = query.order('price', { ascending: true }); break;
        case 'price_desc': query = query.order('price', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { 
        products: data || [], 
        nextPage: data && data.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined,
        totalCount: count
      };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }, [filters]);

  // Memoize filter change handler
  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetching 
  } = useInfiniteQuery(
    ['products', filters], 
    fetchProducts, 
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000 // 30 minutes
    }
  );

  const { data: categories } = useQuery('categories', async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    return data || [];
  }, {
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000 // 24 hours
  });

  const { data: animes } = useQuery('animes', async () => {
    const { data } = await supabase.from('anime').select('*').order('name');
    return data || [];
  }, {
    staleTime: 1 * 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000 // 24 hours
  });

  const flattenedProducts = useMemo(() => 
    data?.pages.flatMap(page => page.products) || [], 
    [data]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <SEO 
        title="GATOTAKU - Tu Tienda de Anime"
        description="Descubre nuestra colección de productos de anime. Figuras, mangas, accesorios y más."
      />
      
      <SearchAndFilters
        categories={categories || []}
        animes={animes || []}
        currentFilters={filters}
        onFilterChange={handleFilterChange}
      />
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {flattenedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {hasNextPage && (
        <button 
          disabled={isFetching}
          onClick={() => fetchNextPage()}
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
        >
          {isFetching ? 'Cargando...' : 'Cargar más'}
        </button>
      )}
    </div>
  );
}
