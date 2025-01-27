import { useReducer, useCallback } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { Product, Category, Anime } from '../types/database';

// Define types for filters and state
type FiltersState = {
  category?: string;
  anime?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc';
};

type ProductsState = {
  filters: FiltersState;
  products: Product[];
  isLoading: boolean;
  error: string | null;
};

type ProductsAction = 
  | { type: 'SET_FILTERS'; payload: Partial<FiltersState> }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Product[] }
  | { type: 'FETCH_ERROR'; payload: string };

// Reducer function for managing products state
function productsReducer(state: ProductsState, action: ProductsAction): ProductsState {
  switch (action.type) {
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, isLoading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

// Custom hook for fetching products with advanced filtering
export const useProducts = (initialFilters: FiltersState = {}) => {
  const [state, dispatch] = useReducer(productsReducer, {
    filters: initialFilters,
    products: [],
    isLoading: false,
    error: null
  });

  // Fetch products with dynamic filtering
  const fetchProducts = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      let query = supabase
        .from('products')
        .select('*, category_ref(*), anime(*)');
      
      // Apply dynamic filters
      if (state.filters.category) {
        query = query.eq('category_id', state.filters.category);
      }
      
      if (state.filters.anime) {
        query = query.eq('anime_id', state.filters.anime);
      }
      
      if (state.filters.minPrice !== undefined) {
        query = query.gte('price', state.filters.minPrice);
      }

      if (state.filters.maxPrice !== undefined) {
        query = query.lte('price', state.filters.maxPrice);
      }

      if (state.filters.search) {
        query = query.or(
          `name.ilike.%${state.filters.search}%,description.ilike.%${state.filters.search}%`
        );
      }

      if (state.filters.sortBy === 'name_asc') {
        query = query.order('name', { ascending: true });
      } else if (state.filters.sortBy === 'name_desc') {
        query = query.order('name', { ascending: false });
      } else if (state.filters.sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (state.filters.sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      dispatch({ type: 'FETCH_SUCCESS', payload: data || [] });
      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.filters]);

  // Use react-query for caching and background updates
  const query = useQuery(['products', state.filters], fetchProducts, {
    keepPreviousData: true
  });

  // Method to update filters
  const setFilters = useCallback((newFilters: Partial<FiltersState>) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  }, []);

  return {
    ...query,
    filters: state.filters,
    setFilters
  };
};

// Combine fetching of categories and animes
export const useCategoriesAndAnimes = () => {
  return useQuery('categories-and-animes', async () => {
    const [categoriesResponse, animesResponse] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('anime').select('*')
    ]);

    if (categoriesResponse.error) throw categoriesResponse.error;
    if (animesResponse.error) throw animesResponse.error;

    return {
      categories: categoriesResponse.data || [],
      animes: animesResponse.data || []
    };
  });
};
