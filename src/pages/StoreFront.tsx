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
    sortBy: 'name_asc',
    minPrice: 0,
    maxPrice: 10000
  }));

  // Fetch categories and animes with products
  const fetchCategoriesWithProducts = useCallback(async () => {
    const { data: categoriesWithProducts } = await supabase
      .from('categories')
      .select(`
        id, 
        name, 
        products:products(id)
      `);

    return categoriesWithProducts
      ?.filter(category => category.products.length > 0)
      .map(category => ({ id: category.id, name: category.name })) || [];
  }, []);

  const fetchAnimesWithProducts = useCallback(async () => {
    const { data: animesWithProducts } = await supabase
      .from('anime')
      .select(`
        id, 
        name, 
        products:products(id)
      `);

    return animesWithProducts
      ?.filter(anime => anime.products.length > 0)
      .map(anime => ({ id: anime.id, name: anime.name })) || [];
  }, []);

  // Memoize fetchProducts to prevent unnecessary re-renders
  const fetchProducts = useCallback(async ({ pageParam = 1 }) => {
    try {
      const ITEMS_PER_PAGE = 5;
      let query = supabase
        .from('products')
        .select(`
          *,
          category_ref:categories(id, name),
          anime:anime(id, name)
        `, { count: 'exact' })
        .range((pageParam - 1) * ITEMS_PER_PAGE, pageParam * ITEMS_PER_PAGE - 1);

      // Enhanced search across multiple fields
      if (filters.search) {
        query = query.or(`
          ilike(name, "%${filters.search}%"),
          ilike(description, "%${filters.search}%"),
          ilike(category_ref.name, "%${filters.search}%"),
          ilike(anime.name, "%${filters.search}%")
        `);
      }

      // Apply category and anime filters
      if (filters.category) query = query.eq('category_id', filters.category);
      if (filters.anime) query = query.eq('anime_id', filters.anime);

      // Price range filter
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Apply sorting
      switch(filters.sortBy) {
        case 'name_asc': 
          query = query.order('name', { ascending: true }); 
          break;
        case 'name_desc': 
          query = query.order('name', { ascending: false }); 
          break;
        case 'price_asc': 
          query = query.order('price', { ascending: true }); 
          break;
        case 'price_desc': 
          query = query.order('price', { ascending: false }); 
          break;
        default: 
          query = query.order('created_at', { ascending: false });
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

  // Fetch categories and animes with products
  const { data: categoriesWithProducts } = useQuery(
    'categoriesWithProducts', 
    fetchCategoriesWithProducts
  );

  const { data: animesWithProducts } = useQuery(
    'animesWithProducts', 
    fetchAnimesWithProducts
  );

  // Infinite query for products
  const { 
    data: productsData, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery(
    ['products', filters], 
    fetchProducts, 
    { 
      getNextPageParam: (lastPage) => lastPage.nextPage,
      keepPreviousData: true
    }
  );

  // Memoize filter change handler
  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  // Flatten products for rendering
  const flattenedProducts = useMemo(() => 
    productsData?.pages.flatMap(page => page.products) || [], 
    [productsData]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <SEO 
        title="GATOTAKU - Tu Tienda de Anime"
        description="Descubre nuestra colección de productos de anime. Figuras, mangas, accesorios y más."
      />
      
      <SearchAndFilters
        categories={categoriesWithProducts || []}
        animes={animesWithProducts || []}
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
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
        >
          {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
        </button>
      )}
    </div>
  );
}
