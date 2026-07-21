import React, { useState } from 'react';
import { Category, Anime } from '../types/database';
import { FaFilter } from 'react-icons/fa';

export interface Filters {
  search?: string;
  category?: string;
  anime?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc';
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

  const _handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange({
      sortBy: e.target.value as Filters['sortBy']
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;

    setLocalFilters(prev => ({
      ...prev,
      search: searchValue === '' ? undefined : searchValue
    }));

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

    if (onResetFilters) {
      onResetFilters();
    }
  };

  return (
    <div className="search-and-filters-container pt-4">
      {/* Búsqueda (siempre visible) */}
      <div className="filter-group mb-6 relative">
        <input
          id="search-input-desktop"
          type="text"
          placeholder="Buscar productos..."
          value={localFilters.search || ''}
          onChange={handleSearchChange}
          aria-label="Buscar productos por nombre o descripción"
          className="block w-full px-4 py-3 bg-white text-gray-800 font-medium border-2 border-black rounded-xl shadow-hard-sm focus:outline-none focus:ring-0 focus:border-orange-500 focus:shadow-hard-orange transition-all duration-200"
        />
      </div>

      {/* Botón de filtros para móvil */}
      <div className="md:hidden flex justify-end mb-4">
        <button
          onClick={toggleMobileFilters}
          className="flex items-center px-4 py-2.5 bg-orange-400 text-black font-bold border-2 border-black rounded-xl shadow-hard-sm hover:bg-orange-300 active:translate-y-1 active:shadow-none transition-all duration-200"
        >
          <FaFilter className={`mr-2 transition-transform duration-300 ${isMobileFilterOpen ? 'rotate-180' : ''}`} /> Filtros
        </button>
      </div>

      <div className={`
        additional-filters
        grid grid-cols-1 
        ${isMobileFilterOpen ? 'grid animate-fade-up' : 'hidden'} 
        md:grid md:grid-cols-2 md:gap-4
      `}>
        <div className="md:flex md:space-x-4 md:col-span-2">
          <div className="filter-group flex-1">
            <label htmlFor="category-select" className=" my-2 block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="category-select"
              value={localFilters.category || ''}
              onChange={handleCategoryChange}
              aria-label="Seleccionar categoría de producto"
              className="block w-full px-3 py-2.5 bg-white text-gray-800 font-medium border-2 border-black rounded-xl shadow-hard-sm focus:outline-none focus:ring-0 focus:border-orange-500 focus:shadow-hard-orange transition-all duration-200"
            >
              <option value="">Todas las categorías</option>
              {categories.sort((a, b) => a.name.localeCompare(b.name)).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group flex-1 ">
            <label htmlFor="anime-select" className=" my-2 block text-sm font-medium text-gray-700 mb-1">
              Anime
            </label>
            <select
              id="anime-select"
              value={localFilters.anime || ''}
              onChange={handleAnimeChange}
              aria-label="Seleccionar anime"
              className="block w-full px-3 py-2.5 bg-white text-gray-800 font-medium border-2 border-black rounded-xl shadow-hard-sm focus:outline-none focus:ring-0 focus:border-orange-500 focus:shadow-hard-orange transition-all duration-200"
            >
              <option value="">Todos los Animes</option>
              {animes.sort((a, b) => a.name.localeCompare(b.name)).map((anime) => (
                <option key={anime.id} value={anime.id}>
                  {anime.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:flex md:space-x-4 md:col-span-2 my-4">
          <div className="filter-group flex-1">
            <input
              id="min-price-input"
              type="number"
              placeholder="Precio mínimo"
              value={localFilters.minPrice !== undefined ? localFilters.minPrice : ''}
              onChange={handleMinPriceChange}
              aria-label="Filtrar productos por precio mínimo"
              min="0"
              step="0.01"
              className="block w-full px-4 py-2.5 bg-white text-gray-800 font-medium border-2 border-black rounded-xl shadow-hard-sm focus:outline-none focus:ring-0 focus:border-orange-500 focus:shadow-hard-orange transition-all duration-200"
            />
          </div>

          <div className="filter-group flex-1">
            <input
              id="max-price-input"
              type="number"
              placeholder="Precio máximo"
              value={localFilters.maxPrice !== undefined ? localFilters.maxPrice : ''}
              onChange={handleMaxPriceChange}
              aria-label="Filtrar productos por precio máximo"
              min="0"
              step="0.01"
              className="block w-full px-4 py-2.5 bg-white text-gray-800 font-medium border-2 border-black rounded-xl shadow-hard-sm focus:outline-none focus:ring-0 focus:border-orange-500 focus:shadow-hard-orange transition-all duration-200"
            />
          </div>
        </div>

        <div className="filter-group col-span-full">
          <button
            onClick={resetFilters}
            className="w-full px-4 py-3 mt-4 bg-white text-black font-bold border-2 border-black rounded-xl shadow-hard-sm hover:bg-gray-50 active:translate-y-1 active:shadow-none transition-all duration-200"
          >
            Restablecer Filtros
          </button>
        </div>
      </div>
    </div>
  );
}