import { useMemo, useState } from 'react';
import { Check, ChevronDown, SlidersHorizontal, Trash2, X } from 'lucide-react';
import type { Anime, Category, Filters } from '../types/database';

export interface ProductFiltersProps {
  onFilterChange: (filters: Partial<Filters>) => void;
  currentFilters: Filters;
  categories: Category[];
  animes: Anime[];
  onResetFilters?: () => void;
}

interface ActiveFilter {
  id: string;
  label: string;
  onRemove: () => void;
}

const PRICE_RANGES = [
  { label: 'Hasta C$250', minPrice: undefined, maxPrice: 250 },
  { label: 'C$250 - C$500', minPrice: 250, maxPrice: 500 },
  { label: 'C$500 - C$1000', minPrice: 500, maxPrice: 1000 },
  { label: 'Más de C$1000', minPrice: 1000, maxPrice: undefined },
] as const;

function matchesPriceRange(filters: Filters, range: (typeof PRICE_RANGES)[number]) {
  return filters.minPrice === range.minPrice && filters.maxPrice === range.maxPrice;
}

export function ProductFilters({
  onFilterChange,
  currentFilters,
  categories,
  animes,
  onResetFilters,
}: ProductFiltersProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [categories],
  );
  const sortedAnimes = useMemo(
    () => [...animes].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [animes],
  );

  const updateFilters = (nextFilters: Partial<Filters>) => {
    onFilterChange({ ...nextFilters, page: 1 });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      category: [],
      anime: [],
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
    };

    onFilterChange(clearedFilters);
    onResetFilters?.();
  };

  const selectedCategories = sortedCategories.filter((category) => currentFilters.category.includes(category.id));
  const selectedAnimes = sortedAnimes.filter((anime) => currentFilters.anime.includes(anime.id));

  const activeFilters: ActiveFilter[] = [];
  if (currentFilters.search) {
    activeFilters.push({
      id: 'search',
      label: `Búsqueda: ${currentFilters.search}`,
      onRemove: () => updateFilters({ search: '' }),
    });
  }
  selectedCategories.forEach((category) => {
    activeFilters.push({
      id: `category-${category.id}`,
      label: category.name,
      onRemove: () => updateFilters({
        category: currentFilters.category.filter((selectedId) => selectedId !== category.id),
      }),
    });
  });
  selectedAnimes.forEach((anime) => {
    activeFilters.push({
      id: `anime-${anime.id}`,
      label: anime.name,
      onRemove: () => updateFilters({
        anime: currentFilters.anime.filter((selectedId) => selectedId !== anime.id),
      }),
    });
  });
  if (currentFilters.minPrice !== undefined || currentFilters.maxPrice !== undefined) {
    const label = currentFilters.minPrice !== undefined && currentFilters.maxPrice !== undefined
      ? `C${currentFilters.minPrice} - C${currentFilters.maxPrice}`
      : currentFilters.minPrice !== undefined
        ? `Desde C$${currentFilters.minPrice}`
        : `Hasta C$${currentFilters.maxPrice}`;

    activeFilters.push({
      id: 'price',
      label,
      onRemove: () => updateFilters({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  const toggleArrayValue = (field: 'category' | 'anime', value: string) => {
    const selectedValues = currentFilters[field];
    updateFilters({
      [field]: selectedValues.includes(value)
        ? selectedValues.filter((selectedValue) => selectedValue !== value)
        : [...selectedValues, value],
    });
  };

  const handlePriceInput = (field: 'minPrice' | 'maxPrice', rawValue: string) => {
    const value = rawValue === '' ? undefined : Number(rawValue);
    updateFilters({ [field]: Number.isFinite(value) ? value : undefined });
  };

  const filterSections = (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Filtros</p>
          <p className="text-xs text-slate-500">{activeFilters.length} aplicados</p>
        </div>
        {activeFilters.length > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 transition hover:text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
          >
            <Trash2 size={14} aria-hidden="true" />
            Limpiar
          </button>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Filtros activos">
          {activeFilters.map((filter) => (
            <span key={filter.id} className="chip max-w-full">
              <span className="truncate">{filter.label}</span>
              <button
                type="button"
                onClick={filter.onRemove}
                className="chip-button"
                aria-label={`Quitar filtro ${filter.label}`}
              >
                <X size={12} strokeWidth={3} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      <details open className="group border-b border-slate-200 pb-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-200">
          Categorías
          <ChevronDown size={18} className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-3 max-h-56 space-y-1 overflow-y-auto pr-1">
          {sortedCategories.length === 0 ? (
            <p className="text-sm text-slate-500">No hay categorías disponibles.</p>
          ) : sortedCategories.map((category) => (
            <label key={category.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={currentFilters.category.includes(category.id)}
                onChange={() => toggleArrayValue('category', category.id)}
                className="h-4 w-4 rounded border-slate-300 accent-teal-600"
              />
              <span className="min-w-0 truncate">{category.name}</span>
            </label>
          ))}
        </div>
      </details>

      <details open className="group border-b border-slate-200 pb-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-200">
          Anime
          <ChevronDown size={18} className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-3 max-h-56 space-y-1 overflow-y-auto pr-1">
          {sortedAnimes.length === 0 ? (
            <p className="text-sm text-slate-500">No hay animes disponibles.</p>
          ) : sortedAnimes.map((anime) => (
            <label key={anime.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={currentFilters.anime.includes(anime.id)}
                onChange={() => toggleArrayValue('anime', anime.id)}
                className="h-4 w-4 rounded border-slate-300 accent-teal-600"
              />
              <span className="min-w-0 truncate">{anime.name}</span>
            </label>
          ))}
        </div>
      </details>

      <details open className="group border-b border-slate-200 pb-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-200">
          Precio
          <ChevronDown size={18} className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-3 space-y-2">
          {PRICE_RANGES.map((range) => {
            const checked = matchesPriceRange(currentFilters, range);
            return (
              <label key={range.label} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => updateFilters(checked
                    ? { minPrice: undefined, maxPrice: undefined }
                    : { minPrice: range.minPrice, maxPrice: range.maxPrice })}
                  className="h-4 w-4 rounded border-slate-300 accent-teal-600"
                />
                <span>{range.label}</span>
              </label>
            );
          })}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <label>
              <span className="sr-only">Precio mínimo</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentFilters.minPrice ?? ''}
                onChange={(event) => handlePriceInput('minPrice', event.target.value)}
                placeholder="Min"
                className="field"
                aria-label="Precio mínimo"
              />
            </label>
            <label>
              <span className="sr-only">Precio máximo</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentFilters.maxPrice ?? ''}
                onChange={(event) => handlePriceInput('maxPrice', event.target.value)}
                placeholder="Max"
                className="field"
                aria-label="Precio máximo"
              />
            </label>
          </div>
        </div>
      </details>

      <button type="button" onClick={clearAllFilters} className="btn-secondary w-full">
        <Check size={16} aria-hidden="true" />
        Restablecer filtros
      </button>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 self-start lg:sticky lg:top-6 lg:block" aria-label="Filtros de productos">
        <div className="panel p-4">{filterSections}</div>
      </aside>

      <div className="lg:hidden">
        <button type="button" onClick={() => setIsMobileFilterOpen(true)} className="btn-secondary w-full sm:w-auto">
          <SlidersHorizontal size={17} aria-hidden="true" />
          Filtros
          {activeFilters.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros de productos">
          <button type="button" className="absolute inset-0 bg-slate-900/45" aria-label="Cerrar filtros" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-full max-w-xs overflow-y-auto bg-white p-4 shadow-2xl animate-slide-in-left">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-slate-900">Filtros</p>
              <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="icon-button h-9 w-9" aria-label="Cerrar filtros">
                <X size={20} />
              </button>
            </div>
            {filterSections}
          </div>
        </div>
      )}
    </>
  );
}
