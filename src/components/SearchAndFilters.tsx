import React, { useState } from 'react';
import { useCategoriesAndAnimes } from '../hooks/useProducts';
import { Category, Anime } from '../types/database';

export interface Filters {
  category?: string;
  anime?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc';
}

export interface SearchAndFiltersProps {
  onFilterChange: (filters: Filters) => void;
  currentFilters?: Filters;
  categories: Category[];
  animes: Anime[];
}

export function SearchAndFilters({ 
  onFilterChange, 
  currentFilters = {},
  categories,
  animes
}: SearchAndFiltersProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(currentFilters);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange({ search: e.target.value });
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

  const resetFilters = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  return (
    <div className="search-and-filters grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Filtros de búsqueda">
      <div className="filter-group">
        <label htmlFor="search-input" className="block text-sm font-medium text-gray-700">
          Buscar productos
        </label>
        <input 
          id="search-input"
          type="text" 
          placeholder="Buscar productos..." 
          value={localFilters.search || ''} 
          onChange={handleSearchChange}
          aria-label="Buscar productos por nombre o descripción"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">
          Categoría
        </label>
        <select 
          id="category-select"
          value={localFilters.category || ''} 
          onChange={handleCategoryChange}
          aria-label="Seleccionar categoría de producto"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="anime-select" className="block text-sm font-medium text-gray-700">
          Anime
        </label>
        <select 
          id="anime-select"
          value={localFilters.anime || ''} 
          onChange={handleAnimeChange}
          aria-label="Seleccionar anime"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Todos los Animes</option>
          {animes.map((anime) => (
            <option key={anime.id} value={anime.id}>
              {anime.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="min-price-input" className="block text-sm font-medium text-gray-700">
          Precio Mínimo
        </label>
        <input 
          id="min-price-input"
          type="number" 
          placeholder="Precio mínimo" 
          value={localFilters.minPrice || ''} 
          onChange={handleMinPriceChange}
          aria-label="Filtrar productos por precio mínimo"
          min="0"
          step="0.01"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="max-price-input" className="block text-sm font-medium text-gray-700">
          Precio Máximo
        </label>
        <input 
          id="max-price-input"
          type="number" 
          placeholder="Precio máximo" 
          value={localFilters.maxPrice} 
          onChange={handleMaxPriceChange}
          aria-label="Filtrar productos por precio máximo"
          min="0"
          step="0.01"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700">
          Ordenar por
        </label>
        <select 
          id="sort-select"
          value={localFilters.sortBy || 'name_asc'} 
          onChange={handleSortChange}
          aria-label="Ordenar productos"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="name_asc">Nombre A-Z</option>
          <option value="name_desc">Nombre Z-A</option>
          <option value="price_asc">Precio: Menor a Mayor</option>
          <option value="price_desc">Precio: Mayor a Menor</option>
        </select>
      </div>

      {Object.keys(localFilters).length > 0 && (
        <div className="col-span-full">
          <button 
            onClick={resetFilters} 
            aria-label="Restablecer filtros"
            className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Restablecer Filtros
          </button>
        </div>
      )}
    </div>
  );
}