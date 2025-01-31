import React, { useState } from 'react';
import { useCategoriesAndAnimes } from '../hooks/useProducts';
import { Category, Anime } from '../types/database';
import { FaFilter } from 'react-icons/fa';

export interface Filters {
  search?: string;
  category?: string;
  anime?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'created_at';
  page?: number;
}

export interface SearchAndFiltersProps {
  onFilterChange: (filters: Filters) => void;
  currentFilters?: Filters;
  categories: Category[];
  animes: Anime[];
  onResetFilters?: () => void;
}

export function SearchAndFilters({ 
  onFilterChange, 
  currentFilters = {},
  categories,
  animes,
  onResetFilters
}: SearchAndFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(currentFilters);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    const updatedFilters = { 
      ...currentFilters, 
      ...newFilters,
      page: 1  // Siempre resetear a la primera página cuando se cambia un filtro
    };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange({ 
      category: e.target.value === '' ? undefined : e.target.value 
    });
  };

  const handleAnimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange({ 
      anime: e.target.value === '' ? undefined : e.target.value 
    });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = e.target.value ? parseFloat(e.target.value) : undefined;
    handleFilterChange({ minPrice: price });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = e.target.value ? parseFloat(e.target.value) : undefined;
    handleFilterChange({ maxPrice: price });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange({ 
      sortBy: e.target.value as Filters['sortBy'] 
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    
    // Update local state
    setLocalFilters(prev => ({
      ...prev,
      search: searchValue === '' ? undefined : searchValue
    }));
    
    // Notify parent component
    onFilterChange({ 
      search: searchValue === '' ? undefined : searchValue 
    });
  };

  const toggleMobileFilters = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  const resetFilters = () => {
    const initialFilters: Filters = {
      search: undefined,
      category: undefined,
      anime: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'name_asc'
    };
    setLocalFilters(initialFilters);
    onFilterChange(initialFilters);
    
    // Llamar a la función de restablecimiento si está definida
    if (onResetFilters) {
      onResetFilters();
    }
  };

  return (
    <div className="search-and-filters-container">
      {/* Búsqueda (siempre visible) */}
      <div className="filter-group mb-4">
        <label htmlFor="search-input-desktop" className="block text-sm font-medium text-gray-700 mb-1">
          Buscar productos
        </label>
        <input 
          id="search-input-desktop"
          type="text" 
          placeholder="Buscar productos..." 
          value={localFilters.search || ''} 
          onChange={handleSearchChange}
          aria-label="Buscar productos por nombre o descripción"
          className="block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Botón de filtros para móvil */}
      <div className="md:hidden flex justify-end mb-4">
        <button 
          onClick={toggleMobileFilters} 
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md"
        >
          <FaFilter className="mr-2" /> Filtros
        </button>
      </div>

      <div className={`
        additional-filters
        grid grid-cols-1 
        ${isMobileFilterOpen ? 'grid' : 'hidden'} 
        md:grid md:grid-cols-2 md:gap-4
      `}>
        <div className="md:flex md:space-x-4 md:col-span-2">
          <div className="filter-group flex-1">
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select 
              id="category-select"
              value={localFilters.category || ''} 
              onChange={handleCategoryChange}
              aria-label="Seleccionar categoría de producto"
              className="block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group flex-1 ">
            <label htmlFor="anime-select" className="block text-sm font-medium text-gray-700 mb-1">
              Anime
            </label>
            <select 
              id="anime-select"
              value={localFilters.anime || ''} 
              onChange={handleAnimeChange}
              aria-label="Seleccionar anime"
              className="block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Todos los Animes</option>
              {animes.map((anime) => (
                <option key={anime.id} value={anime.id}>
                  {anime.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:flex md:space-x-4 md:col-span-2">
          <div className="filter-group flex-1">
            <label htmlFor="min-price-input" className="block text-sm font-medium text-gray-700 mb-1">
              Precio Mínimo
            </label>
            <input 
              id="min-price-input"
              type="number" 
              placeholder="Precio mínimo" 
              value={localFilters.minPrice !== undefined ? localFilters.minPrice : ''} 
              onChange={handleMinPriceChange}
              aria-label="Filtrar productos por precio mínimo"
              min="0"
              step="0.01"
              className="block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="filter-group flex-1">
            <label htmlFor="max-price-input" className="block text-sm font-medium text-gray-700 mb-1">
              Precio Máximo
            </label>
            <input 
              id="max-price-input"
              type="number" 
              placeholder="Precio máximo" 
              value={localFilters.maxPrice !== undefined ? localFilters.maxPrice : ''} 
              onChange={handleMaxPriceChange}
              aria-label="Filtrar productos por precio máximo"
              min="0"
              step="0.01"
              className="block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="col-span-full">
          <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-1">
            Ordenar por
          </label>
          <select 
            id="sort-select"
            value={localFilters.sortBy || 'name_asc'} 
            onChange={handleSortChange}
            aria-label="Ordenar productos"
            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="name_asc">Nombre A-Z</option>
            <option value="name_desc">Nombre Z-A</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="created_at">Más Recientes</option>
          </select>
        </div>

        <div className="filter-group col-span-full">
          <button 
            onClick={resetFilters}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Restablecer Filtros
          </button>
        </div>
      </div>
    </div>
  );
}