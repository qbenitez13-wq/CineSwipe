import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TMDBMovie, TMDBResponse, MovieFilters, CacheEntry } from '../types/tmdb.types';

const API_TOKEN = import.meta.env.VITE_TMDB_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en ms

/**
 * Hook personalizado para obtener y gestionar películas de TMDB con scroll infinito.
 * 
 * @param filters - Criterios de filtrado (género, año)
 * @returns Estados de carga, datos, errores y función para cargar más páginas
 */
export const useMovies = (filters: MovieFilters = {}) => {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Type Guard para validar la respuesta de TMDB
   */
  const isValidTMDBResponse = (data: any): data is TMDBResponse => {
    return (
      data &&
      typeof data.page === 'number' &&
      Array.isArray(data.results) &&
      typeof data.total_pages === 'number'
    );
  };

  /**
   * Obtiene películas desde la API o caché
   */
  const fetchMovies = useCallback(async (targetPage: number, isNewSearch: boolean) => {
    // Cancelar petición previa si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const cacheKey = `cineswipe_cache_${targetPage}_${filters.genreId || 'all'}_${filters.year || 'all'}`;
    
    // 1. Intentar obtener de caché
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const entry: CacheEntry<TMDBMovie[]> = JSON.parse(cached);
      if (Date.now() - entry.timestamp < CACHE_TTL) {
        setMovies(prev => isNewSearch ? entry.data : [...prev, ...entry.data]);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL(`${BASE_URL}/discover/movie`);
      url.searchParams.append('page', targetPage.toString());
      url.searchParams.append('sort_by', 'popularity.desc');
      url.searchParams.append('include_adult', 'false');
      url.searchParams.append('language', 'es-ES'); // Añadimos lenguaje por defecto
      
      if (filters.genreId) url.searchParams.append('with_genres', filters.genreId.toString());
      if (filters.year) url.searchParams.append('primary_release_year', filters.year.toString());

      console.log(`[useMovies] Fetching page ${targetPage}...`);

      const response = await fetch(url.toString(), {
        signal: abortControllerRef.current.signal,
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        switch (response.status) {
          case 401: throw new Error('Error de autenticación: Verifica tu API Key.');
          case 404: throw new Error('Recurso no encontrado en TMDB.');
          case 429: throw new Error('Demasiadas peticiones. Por favor, espera un momento.');
          default: throw new Error('Error inesperado al conectar con TMDB.');
        }
      }

      const data = await response.json();

      if (!isValidTMDBResponse(data)) {
        throw new Error('La respuesta de la API no tiene un formato válido.');
      }

      // 2. Guardar en caché
      const cacheEntry: CacheEntry<TMDBMovie[]> = {
        data: data.results,
        timestamp: Date.now()
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

      // 3. Actualizar estado
      setMovies(prev => isNewSearch ? data.results : [...prev, ...data.results]);
      setHasMore(data.page < data.total_pages);
      
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.genreId, filters.year]);

  /**
   * Resetear y buscar cuando cambian los filtros
   */
  useEffect(() => {
    setMovies([]);
    setPage(1);
    fetchMovies(1, true);

    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [filters.genreId, filters.year, fetchMovies]);

  /**
   * Cargar la siguiente página
   */
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(nextPage, false);
  }, [loading, hasMore, page, fetchMovies]);

  /**
   * Mapea y memoriza películas para evitar cambios de referencia innecesarios (Solución Bucle Infinito)
   */
  const formattedMovies = useMemo(() => {
    return movies.map(tmdbMovie => ({
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      year: new Date(tmdbMovie.release_date).getFullYear() || 0,
      rating: tmdbMovie.vote_average,
      posterUrl: tmdbMovie.poster_path 
        ? `${IMAGE_BASE_URL}${tmdbMovie.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Poster'
    }));
  }, [movies]);

  return {
    movies: formattedMovies,
    loading,
    error,
    hasMore,
    loadMore
  };
};
