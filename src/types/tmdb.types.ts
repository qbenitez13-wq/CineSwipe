/**
 * Interfaz para una película individual según la respuesta de TMDB
 */
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
}

/**
 * Envoltorio de respuesta paginada de TMDB
 */
export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

/**
 * Filtros aplicables a la búsqueda de películas
 */
export interface MovieFilters {
  genreId?: number;
  year?: number;
}

/**
 * Estructura para el guardado en caché local
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
