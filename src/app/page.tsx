'use client';

import React, { useState, useEffect } from 'react';
import { useMovies } from '../hooks/useMovies';
import { useMovieActions, useMovieHistory } from '../context/MovieContext';
import { useAuth } from '../hooks/useAuth';
import { useSyncFavorites } from '../hooks/useSyncFavorites';
import { SwipeCard } from '../components/movies/SwipeCard';
import { AuthModal } from '../components/auth/AuthModal';
import { Undo2, History, RotateCcw, AlertCircle, Loader2, LogIn, LogOut, User } from 'lucide-react';

export default function Home() {
  const { movies, loading, error, hasMore, loadMore } = useMovies();
  const { swipeRight, swipeLeft, undoLast, clearHistory, resetState, syncFromCloud } = useMovieActions();
  const { likedIds, history } = useMovieHistory();

  const auth = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [authOpen, setAuthOpen]         = useState(false);

  // ── Sincronización con la nube ──────────────────────────────────────────
  const { upsertFavorite, deleteFavorite } = useSyncFavorites(
    auth.user,
    // Callback: cuando carga desde la nube, hidrata el reducer
    (liked, disliked) => syncFromCloud(liked, disliked)
  );

  // ── Auto-carga de más películas cuando quedan pocas cartas ──────────────
  useEffect(() => {
    const shouldLoadMore =
      movies.length > 0 &&
      movies.length - currentIndex < 5 &&
      hasMore &&
      !loading;

    if (shouldLoadMore) loadMore();
  }, [currentIndex, movies.length, hasMore, loading]); // eslint-disable-line

  // ── Handlers de acción ─────────────────────────────────────────────────

  const handleSwipe = (direction: 'left' | 'right') => {
    const movie = movies[currentIndex];
    if (!movie) return;

    if (direction === 'right') swipeRight(movie.id);
    else                       swipeLeft(movie.id);

    // Persiste en Supabase si hay sesión activa
    upsertFavorite(movie.id, direction);

    setCurrentIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (currentIndex === 0 || history.length === 0) return;

    const lastAction = history[history.length - 1];
    undoLast();

    // Borra en Supabase si hay sesión activa
    deleteFavorite(lastAction.id);

    setCurrentIndex(prev => prev - 1);
  };

  const handleSignOut = async () => {
    resetState(); // Limpia estado local
    await auth.signOut();
  };

  const currentMovie = movies[currentIndex];

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-neutral-950 text-white font-sans overflow-hidden">

      {/* HEADER */}
      <header className="w-full max-w-md flex justify-between items-center p-6 pb-2">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">C</div>
          <h1 className="text-xl font-bold tracking-tight">CineSwipe</h1>
        </div>

        {/* Lado derecho: contador + auth */}
        <div className="flex gap-3 items-center">
          {/* Contador de likes */}
          <div className="flex items-center gap-1.5 text-green-500 font-medium">
            <History size={16} />
            <span>{likedIds.size}</span>
          </div>

          {/* Limpiar historial */}
          <button
            onClick={() => { if (typeof window !== 'undefined' && confirm('¿Limpiar historial?')) clearHistory(); }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Limpiar historial"
          >
            <RotateCcw size={18} className="text-neutral-400" />
          </button>

          {/* Auth: Login / Avatar + Logout */}
          {auth.loading ? (
            <Loader2 size={18} className="text-neutral-500 animate-spin" />
          ) : auth.user ? (
            <div className="flex items-center gap-2">
              {/* Avatar con inicial del email */}
              <div
                className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold uppercase"
                title={auth.user.email ?? ''}
              >
                {auth.user.email?.[0] ?? <User size={14} />}
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={18} className="text-neutral-400" />
              </button>
            </div>
          ) : (
            <button
              id="open-auth-modal"
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-bold transition-all"
            >
              <LogIn size={14} />
              Login
            </button>
          )}
        </div>
      </header>

      {/* MAIN — STACK DE CARTAS */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md relative px-4">

        {/* CARGANDO INICIAL */}
        {loading && movies.length === 0 && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <p className="text-neutral-400 font-medium tracking-wide">Buscando joyas cinematográficas...</p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl flex flex-col items-center gap-3 text-center">
            <AlertCircle className="text-red-500 w-10 h-10" />
            <p className="text-red-200 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-500 rounded-full font-bold transition-all text-sm"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* CARTA ACTUAL */}
        {!loading && !error && currentMovie ? (
          <div className="relative w-full flex justify-center py-8">
            <SwipeCard
              key={currentMovie.id}
              movie={currentMovie}
              onSwipe={handleSwipe}
            />
          </div>
        ) : !loading && !error && !hasMore && (
          <div className="text-center p-8">
            <p className="text-2xl font-bold mb-2">¡Es todo por ahora!</p>
            <p className="text-neutral-400">Has revisado todas las películas disponibles.</p>
          </div>
        )}

        {/* CARGANDO MÁS */}
        {loading && movies.length > 0 && movies.length === currentIndex && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-neutral-500 text-sm">Cargando más...</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-md flex justify-center gap-12 p-10 pb-16">
        <button
          onClick={handleUndo}
          disabled={currentIndex === 0}
          className={`
            flex flex-col items-center gap-2 transition-all group
            ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed grayscale' : 'opacity-100 hover:scale-110 active:scale-95'}
          `}
        >
          <div className="w-14 h-14 rounded-full border-2 border-yellow-500/50 flex items-center justify-center text-yellow-500 transition-all group-hover:bg-yellow-500/10">
            <Undo2 size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500/70">Deshacer</span>
        </button>
      </footer>

      {/* FONDO DECORATIVO */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-purple-900/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-blue-900/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        auth={auth}
      />
    </div>
  );
}
