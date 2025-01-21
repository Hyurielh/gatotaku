export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Anime {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  category_id?: string;
  anime_id?: string;
  description: string;
  images: string[];
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
}

export interface Filters {
  search: string;
  category: string;
  anime: string;
  sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
}