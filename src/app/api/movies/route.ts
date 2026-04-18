import { NextResponse } from 'next/server';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_TOKEN = process.env.TMDB_TOKEN;

/**
 * Route Handler que actúa como proxy para TMDB.
 * Esto permite ocultar la API Key/Token del navegador.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  try {
    const url = new URL(`${BASE_URL}/discover/movie`);
    
    // Pasar todos los parámetros recibidos (page, genres, year, etc.)
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    // Inyectar lenguaje y sort si no vienen
    if (!url.searchParams.has('language')) url.searchParams.append('language', 'es-ES');
    if (!url.searchParams.has('sort_by')) url.searchParams.append('sort_by', 'popularity.desc');
    if (!url.searchParams.has('include_adult')) url.searchParams.append('include_adult', 'false');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cachear resultados por 1 hora en el servidor
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error calling TMDB API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[API Proxy Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
