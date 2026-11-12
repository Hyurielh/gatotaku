import { supabase } from './supabase';
import type { Product } from '../types/database';

export class FavoriteError extends Error {}

/** Productos favoritos del usuario, en orden del más reciente al más antiguo. */
export async function fetchFavoriteProducts(userId: string): Promise<Product[]> {
  const { data: favorites, error } = await supabase
    .from('favorites')
    .select('product_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new FavoriteError(error.message);

  const ids = (favorites ?? []).map((row) => row.product_id as string);
  if (ids.length === 0) return [];

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*, category_ref:categories(id, name), anime(id, name)')
    .in('id', ids);

  if (productsError) throw new FavoriteError(productsError.message);

  const byId = new Map((products ?? []).map((product) => [product.id, product as Product]));

  return ids
    .map((id) => byId.get(id))
    .filter((product): product is Product => Boolean(product));
}
