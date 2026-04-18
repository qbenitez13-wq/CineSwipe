'use client';

import { useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

/**
 * Representa un favorito tal como se almacena en la BD de Supabase.
 */
interface FavoriteRow {
  movie_id: number;
  direction: 'left' | 'right';
}

/**
 * Hook que actúa de puente entre el estado local (reducer) y Supabase.
 *
 * - Al hacer login, carga los favoritos de la nube y los devuelve para
 *   hidratarlos en el contexto con la acción SYNC_FROM_CLOUD.
 * - Expone `upsertFavorite` para que el contexto lo llame después de
 *   cada swipe cuando hay sesión activa.
 */
export const useSyncFavorites = (
  user: User | null,
  onCloudSync: (liked: number[], disliked: number[]) => void,
) => {
  /**
   * Carga los favoritos de la nube cuando el usuario inicia sesión.
   */
  useEffect(() => {
    if (!user) return;

    const loadFromCloud = async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('movie_id, direction')
        .eq('user_id', user.id);

      if (error) {
        console.error('[useSyncFavorites] Error cargando favoritos:', error.message);
        return;
      }

      const rows = data as FavoriteRow[];
      const liked    = rows.filter(r => r.direction === 'right').map(r => r.movie_id);
      const disliked = rows.filter(r => r.direction === 'left').map(r => r.movie_id);

      onCloudSync(liked, disliked);
    };

    loadFromCloud();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Persiste un swipe en Supabase (upsert: si ya existe, lo actualiza).
   * Solo actúa si hay un usuario logueado.
   */
  const upsertFavorite = useCallback(
    async (movieId: number, direction: 'left' | 'right') => {
      if (!user) return;

      const { error } = await supabase.from('favorites').upsert(
        { user_id: user.id, movie_id: movieId, direction },
        { onConflict: 'user_id,movie_id' }
      );

      if (error) {
        console.error('[useSyncFavorites] Error guardando favorito:', error.message);
      }
    },
    [user]
  );

  /**
   * Elimina un favorito de la nube (para el Undo).
   */
  const deleteFavorite = useCallback(
    async (movieId: number) => {
      if (!user) return;

      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);
    },
    [user]
  );

  return { upsertFavorite, deleteFavorite };
};
