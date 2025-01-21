import React from 'react';
import type { Category, Anime, Filters } from '../types/database';
import { Search } from 'lucide-react';

interface SearchAndFiltersProps {
  categories: Category[];
  animes: Anime[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export function SearchAndFilters({ categories, animes, filters, onFilterChange }: SearchAndFiltersProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="search"
          placeholder="Buscar productos..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          aria-label="Buscar productos"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={filters.anime}
          onChange={(e) => handleChange('anime', e.target.value)}
          className="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          aria-label="Filtrar por anime"
        >
          <option value="">Todos los animes</option>
          {animes.map((anime) => (
            <option key={anime.id} value={anime.id}>
              {anime.name}
            </option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value as Filters['sortBy'])}
          className="block w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          aria-label="Ordenar por"
        >
          <option value="name_asc">Nombre (A-Z)</option>
          <option value="name_desc">Nombre (Z-A)</option>
          <option value="price_asc">Precio (Menor a Mayor)</option>
          <option value="price_desc">Precio (Mayor a Menor)</option>
        </select>
      </div>
    </div>
  );
}