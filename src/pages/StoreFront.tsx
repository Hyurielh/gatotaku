import * as React from 'react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { SearchAndFilters } from '../components/SearchAndFilters';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
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
        // Soft reset instead of full page reload
        window.history.go(0);
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
    minPrice: undefined,
    maxPrice: undefined,
    page: 1
  }));

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
    };

    window.addEventListener('reset-store-filters', resetFiltersHandler);

    return () => {
      window.removeEventListener('reset-store-filters', resetFiltersHandler);
    };
  }, []);

  // Fetch categories and animes with products in a single query
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

  // Función auxiliar para búsqueda flexible
  const createFlexibleSearch = async (searchTerm: string): Promise<string> => {
    try {
      // Limpiar y preparar el término de búsqueda
      const cleanSearchTerm = searchTerm.trim().toLowerCase();
      
      // Condiciones de búsqueda
      const searchConditions: string[] = [];

      // Agregar condiciones de búsqueda
      searchConditions.push(`name.ilike.%${cleanSearchTerm}%`);
      searchConditions.push(`description.ilike.%${cleanSearchTerm}%`);
      searchConditions.push(`category.ilike.%${cleanSearchTerm}%`);

      // Buscar ID de anime de manera más segura
      const { data: animeData } = await supabase
        .from('anime')
        .select('id')
        .ilike('name', `%${cleanSearchTerm}%`)
        .limit(1);  

      // Si hay un anime encontrado, agregar su ID a las condiciones
      if (animeData && animeData.length > 0) {
        searchConditions.push(`anime_id.eq.${animeData[0].id}`);
      }

      // Devolver las condiciones como un string, o un string vacío si no hay condiciones
      return searchConditions.length > 0 ? searchConditions.join(',') : '';
    } catch (error) {
      console.error('Error en búsqueda flexible:', error);
      return '';
    }
  };

  // Función de fetchProducts actualizada
  const fetchProducts = useCallback(async ({ pageParam = 1 }): Promise<{ 
    products: Product[], 
    totalPages: number 
  }> => {
    try {
  
      // Calcular offset y límite
      const from = (pageParam - 1) * 12;
      const to = from + 12 - 1;

      // Consulta base
      let query = supabase
        .from('products')
        .select('*, categories(id, name), anime(id, name)', { count: 'exact' });

      // Aplicar búsqueda si hay término de búsqueda
      if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.toLowerCase().trim();
        
        try {
          const searchConditions = await createFlexibleSearch(searchTerm);
          if (searchConditions) {
            query = query.or(searchConditions);
          }
        } catch (error) {
          console.error('Error en búsqueda de productos:', error);
        }
      }

      // Aplicar filtros adicionales
      if (filters.category && filters.category.trim() !== '') {
        query = query.eq('category_id', filters.category);
      }

      if (filters.anime && filters.anime.trim() !== '') {
        query = query.eq('anime_id', filters.anime);
      }

      // Filtros de precio
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      // Ordenamiento
      query = query.order(
        filters.sortBy.split('_')[0], 
        { ascending: filters.sortBy.endsWith('_asc') }
      );

      // Ejecutar consulta con paginación
      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      // Calcular total de páginas
      const totalPages = count ? Math.ceil(count / 12) : 0;

      return { 
        products: data || [], 
        totalPages 
      };
    } catch (error) {
      console.error('🚨 Error en búsqueda de productos:', error);
      return { products: [], totalPages: 0 };
    }
  }, [filters]);

  // Single query for categories, animes, and products
  const { 
    data: queryData, 
    isLoading,
    error, 
    isError, 
    refetch 
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

  // Update handleFilterChange to include page property
  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      return updatedFilters;
    });
  }, []);

  // Actualizar renderizado y manejo de páginas
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleResetFilters = () => {
    // Volver al estado inicial de filtros, incluyendo la primera página
    setFilters({
      search: '',
      category: '',
      anime: '',
      sortBy: 'name_asc',
      minPrice: undefined,
      maxPrice: undefined,
      page: 1  // Forzar a la primera página
    });
  };

  // Renderizado de productos con grid responsivo de Tailwind
  const renderProducts = () => {
    if (isLoading) return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );

    if (error) return (
      <div className="text-center text-red-500 py-8">
        Error al cargar productos
      </div>
    );

    if (!queryData?.products.length) return (
      <div className="text-center text-gray-500 py-8">
        No hay productos disponibles
      </div>
    );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
                    gap-2 sm:gap-3 md:gap-4 
                    w-full px-1 sm:px-2 md:px-4">
        {queryData.products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            className="w-full h-full" 
          />
        ))}
      </div>
    );
  };

  // Render pagination controls
  const renderPagination = () => {
    const totalPages = queryData?.totalPages || 0;
    const currentPage = filters.page || 1;

    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-4 py-2 rounded-md ${
              currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {number}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SEO 
          title="GATOTAKU - Tu Tienda de Anime"
          description="Descubre nuestra colección de productos de anime. Figuras, mangas, accesorios y más."
        />
        
        {/* Redesigned Filter Section */}
        <div className="mb-8 bg-gray-50 rounded-lg shadow-md p-6">
          {isLoading ? (
            <h1 className="text-3xl font-bold text-gray-800 border-b-2 border-orange-200 pb-2">
              GATOTAKU
            </h1>
          ) : (
            <SearchAndFilters 
              onFilterChange={handleFilterChange}
              currentFilters={filters}
              categories={queryData?.categoriesWithProducts || []}
              animes={queryData?.animesWithProducts || []}
              onResetFilters={handleResetFilters}
            />
          )}
        </div>
        
        {/* Product Grid */}
        {renderProducts()}
        
        {/* Pagination Controls */}
        {renderPagination()}
      </div>
      
      <Cart />
    </div>
  );
}
