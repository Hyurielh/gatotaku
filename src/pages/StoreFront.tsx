import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { SearchAndFilters } from '../components/SearchAndFilters';
import { ProductCard } from '../components/ProductCard';
import type { Product, Filters } from '../types/database';
import { ErrorBoundary } from 'react-error-boundary';

// Error Fallback Component
function StoreFrontErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  useEffect(() => {
    // Error is already handled by ErrorBoundary
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
      <main className="store-front">
        <StoreFrontContent />
      </main>
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
  
  const [isPageChanging, setIsPageChanging] = useState(false);

  useEffect(() => {
    const resetFiltersHandler = () => {
      setFilters({
        search: '',
        category: '',
        anime: '',
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
      return '';
    }
  };

  // Función de fetchProducts actualizada
  const fetchProducts = useCallback(async ({ pageParam = 1 }): Promise<{ 
    products: Product[], 
    totalPages: number 
  }> => {
    try {
      // 12 productos por página en todas las pantallas
      const productsPerPage = 12;
      const from = (pageParam - 1) * productsPerPage;
      const to = from + productsPerPage - 1;

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
          // Error handled silently
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

      // Ejecutar consulta con paginación
      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      // Calcular total de páginas
      const totalPages = count ? Math.ceil(count / productsPerPage) : 0;

      return { 
        products: data || [], 
        totalPages 
      };
    } catch (error) {
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

  // Actualizar renderizado y manejo de páginas con mejor transición
  const handlePageChange = (newPage: number) => {
    // Activar estado de transición
    setIsPageChanging(true);
    
    // Pequeño delay para mostrar el efecto de fade
    setTimeout(() => {
      setFilters(prev => ({ ...prev, page: newPage }));
      
      // Scroll al inicio de los productos con mejor timing
      setTimeout(() => {
        const productsSection = document.querySelector('.products-grid-wrapper');
        if (productsSection) {
          productsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        } else {
          // Fallback: scroll al main content
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            mainContent.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }
        
        // Desactivar estado de transición después del scroll
        setTimeout(() => {
          setIsPageChanging(false);
        }, 300);
      }, 100);
    }, 150);
  };

  const handleResetFilters = () => {
    // Volver al estado inicial de filtros, incluyendo la primera página
    setFilters({
      search: '',
      category: '',
      anime: '',
      minPrice: undefined,
      maxPrice: undefined,
      page: 1  // Forzar a la primera página
    });
  };

  // Renderizado de productos con grid responsivo de Tailwind
  const renderProducts = () => {
    if (isLoading) return <p>Cargando productos...</p>;
    if (!queryData?.products || queryData.products.length === 0) {
      return <p className="text-center text-gray-500">No se encontraron productos</p>;
    }

    return (
      <div className="relative products-grid-wrapper">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {queryData.products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
            />
          ))}
        </div>
      </div>
    );
  };

  const [paginationOffset, setPaginationOffset] = useState(0);

  useEffect(() => {
    let ticking = false;
    
    const updatePaginationPosition = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const footer = document.querySelector('footer');
          const viewportHeight = window.innerHeight;
          
          if (footer) {
            const footerRect = footer.getBoundingClientRect();
            
            // Si el footer está visible, pegar la paginación al footer sin separación
            if (footerRect.top < viewportHeight) {
              const overlap = viewportHeight - footerRect.top;
              setPaginationOffset(overlap); // Sin margen adicional para pegarlo
            } else {
              setPaginationOffset(0);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // Verificar al inicio
    updatePaginationPosition();
    
    // Throttled scroll listener
    window.addEventListener('scroll', updatePaginationPosition, { passive: true });
    window.addEventListener('resize', updatePaginationPosition);

    return () => {
      window.removeEventListener('scroll', updatePaginationPosition);
      window.removeEventListener('resize', updatePaginationPosition);
    };
  }, []);

  const renderPagination = () => {
    const totalPages = queryData?.totalPages || 0;
    const currentPage = filters.page || 1;

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const maxVisiblePages = 5;
      
      // Casos especiales para las primeras 3 y últimas 3 páginas
      if (currentPage <= 3) {
        return Array.from({ length: Math.min(maxVisiblePages, totalPages) }, (_, i) => i + 1);
      }
      
      if (currentPage >= totalPages - 2) {
        return Array.from({ length: maxVisiblePages }, (_, i) => totalPages - maxVisiblePages + i + 1);
      }
      
      // Caso general: centrar la página actual
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
      <div 
        className="fixed bottom-0 left-0 right-0 flex justify-center items-center py-2 z-50 bg-white/95 backdrop-blur-sm transition-transform duration-200 ease-out shadow-lg border-t border-gray-200"
        style={{
          transform: `translateY(-${paginationOffset}px)`
        }}
      >
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Texto de página solo en desktop */}
          <span className="hidden md:block text-xs text-gray-500 mr-2">
            {currentPage}/{totalPages}
          </span>
          
          {/* Botón anterior */}
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-gray-100 hover:bg-orange-100 disabled:opacity-50 transition-colors flex items-center justify-center text-sm"
          >
            ←
          </button>

          {/* Botones de números */}
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md transition-colors flex items-center justify-center text-sm font-medium ${
                currentPage === number 
                  ? 'bg-orange-500 text-white shadow-sm' 
                  : 'bg-gray-100 hover:bg-orange-100 text-gray-700'
              }`}
            >
              {number}
            </button>
          ))}

          {/* Botón siguiente */}
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-gray-100 hover:bg-orange-100 disabled:opacity-50 transition-colors flex items-center justify-center text-sm"
          >
            →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <SEO 
          title="GATOTAKU - Tu Tienda de Anime"
          description="Descubre nuestra colección de productos de anime. Figuras, accesorios y más."
        />
        
        {/* Redesigned Filter Section */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
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
        
        {/* Product Grid - Wrapper con ID para scroll */}
        <div id="products-section" className="relative products-grid-wrapper">
          {/* Overlay de transición */}
          {isPageChanging && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center space-x-2 text-orange-600">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-600 border-t-transparent"></div>
                <span className="text-sm font-medium">Cargando...</span>
              </div>
            </div>
          )}
          
          <div 
            className={`grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-6 transition-opacity duration-300 ${
              isPageChanging ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {queryData?.products?.map((product, index) => (
              <div 
                key={product.id} 
                className="transition-all duration-300"
                style={{ 
                  transitionDelay: `${index * 50}ms`,
                  willChange: 'transform, opacity'
                }}
              >
                <ProductCard 
                  product={product} 
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Pagination Controls */}
        {renderPagination()}
      </div>
    </div>
  );
}
