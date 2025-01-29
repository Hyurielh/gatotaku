export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface Anime {
  id: string;
  name: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category_id: string;
  anime_id: string;
  stock: number;
  created_at: string;
  updated_at: string;
  anime?: Anime;
  category_ref?: Category;
}

export interface ProductInput {
  name: string;
  price: string;
  category_id: string;
  anime_id: string;
  description: string;
  images: string[];
  stock: number;
}

export type Filters = {
  search: string;
  category: string;
  anime: string;
  sortBy: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'created_at';
  minPrice?: number;
  maxPrice?: number;
  page?: number;
};