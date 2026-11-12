import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  isLoading: boolean;
  reload: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userId = session?.user.id ?? null;

  const reload = useCallback(async () => {
    if (!userId) {
      setFavoriteIds([]);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', userId);

      if (error) throw error;

      setFavoriteIds((data ?? []).map((row) => row.product_id as string));
    } catch {
      // sin sesión válida o sin red: se queda vacío
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!userId) {
        toast.info('Inicia sesión para guardar tus favoritos');
        return;
      }

      const wasFavorite = favoriteIds.includes(productId);

      // Optimista: el corazón responde al instante
      setFavoriteIds((current) =>
        wasFavorite ? current.filter((id) => id !== productId) : [...current, productId],
      );

      const { error } = wasFavorite
        ? await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId)
        : await supabase.from('favorites').insert({ user_id: userId, product_id: productId });

      if (error) {
        // Revertir si falla
        setFavoriteIds((current) =>
          wasFavorite ? [...current, productId] : current.filter((id) => id !== productId),
        );
        toast.error('No se pudo guardar el favorito');
        return;
      }

      if (!wasFavorite) {
        toast.success('Agregado a Mis Favoritos');
      }

      window.dispatchEvent(new CustomEvent('favorites-changed'));
    },
    [favoriteIds, userId],
  );

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite, isLoading, reload }),
    [favoriteIds, isFavorite, toggleFavorite, isLoading, reload],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
