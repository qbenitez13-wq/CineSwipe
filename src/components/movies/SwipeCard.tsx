import React, { useState, useRef, KeyboardEvent, PointerEvent } from 'react';

/**
 * Interface para los datos de la película
 */
interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
}

/**
 * Props del componente SwipeCard
 */
interface SwipeCardProps {
  movie: Movie;
  onSwipe: (direction: 'left' | 'right') => void;
}

/**
 * SwipeCard: Componente interactivo para descubrimiento de películas.
 * Implementa gestos de swipe nativos con Pointer Events.
 */
export const SwipeCard: React.FC<SwipeCardProps> = ({ movie, onSwipe }) => {
  // --- ESTADO ---
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwipingOut, setIsSwipingOut] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- REFERENCIAS ---
  const startX = useRef(0);
  const startTime = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // --- CONFIGURACIÓN ---
  const THRESHOLD = 80; // Píxeles para activar la acción
  const MAX_ROTATION = 15; // Grados máximos de rotación
  const SWIPE_OUT_DISTANCE = 500; // Distancia para animar la salida
  const VELOCITY_THRESHOLD = 0.5; // Píxeles por milisegundo (flick)

  // --- HANDLERS DE GESTOS ---

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (isSwipingOut) return;
    
    setIsDragging(true);
    startX.current = e.clientX;
    startTime.current = Date.now();
    
    // Capturamos el puntero para seguir el rastro incluso fuera de la card
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isSwipingOut) return;

    const currentX = e.clientX;
    const deltaX = currentX - startX.current;
    setOffsetX(deltaX);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isSwipingOut) return;

    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const duration = Date.now() - startTime.current;
    const velocity = Math.abs(offsetX) / duration;

    // Se dispara por umbral de distancia O por velocidad (flick)
    if (Math.abs(offsetX) > THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      const direction = offsetX > 0 ? 'right' : 'left';
      completeSwipe(direction);
    } else {
      // Resetear posición si no superó el umbral
      setOffsetX(0);
    }
  };

  /**
   * Ejecuta la animación final y llama al callback
   */
  const completeSwipe = (direction: 'left' | 'right') => {
    setIsSwipingOut(true);
    const finalX = direction === 'right' ? SWIPE_OUT_DISTANCE : -SWIPE_OUT_DISTANCE;
    setOffsetX(finalX);

    // Esperar a que termine la transición de CSS (300ms)
    setTimeout(() => {
      onSwipe(direction);
    }, 300);
  };

  // --- ACCESIBILIDAD (TECLADO) ---

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isSwipingOut) return;

    if (e.key === 'ArrowRight') {
      completeSwipe('right');
    } else if (e.key === 'ArrowLeft') {
      completeSwipe('left');
    }
  };

  // --- CÁLCULOS DINÁMICOS ---

  // La rotación es proporcional al desplazamiento
  const rotation = (offsetX / THRESHOLD) * 5; 
  const limitedRotation = Math.max(Math.min(rotation, MAX_ROTATION), -MAX_ROTATION);

  // Opacidad de los indicadores (LIKE / DISLIKE)
  const likeOpacity = Math.max(0, Math.min(offsetX / THRESHOLD, 1));
  const dislikeOpacity = Math.max(0, Math.min(-offsetX / THRESHOLD, 1));

  return (
    <div 
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`Película: ${movie.title}. Usa flechas para Like o Dislike.`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      style={{
        transform: `translateX(${offsetX}px) rotate(${limitedRotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        touchAction: 'none' // P1: Evita el scroll vertical durante el gesto
      }}
      className={`
        relative w-80 h-[480px] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none
        outline-none focus-visible:ring-4 focus-visible:ring-purple-500
        ${isSwipingOut ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* P2: SKELETON SCREEN (Estado de carga) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-neutral-700 border-t-purple-500 rounded-full animate-spin" />
        </div>
      )}

      {/* IMAGEN DE POSTER */}
      <img 
        src={movie.posterUrl} 
        alt="" 
        onLoad={() => setIsLoaded(true)}
        className={`
          absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* GRADIENTE INFERIOR */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

      {/* INDICADORES VISUALES (BADGES) */}
      <div 
        style={{ opacity: likeOpacity }}
        className="absolute top-8 left-6 border-4 border-green-500 rounded-lg px-4 py-1 -rotate-12 pointer-events-none"
      >
        <span className="text-green-500 font-bold text-3xl tracking-widest uppercase">Like</span>
      </div>

      <div 
        style={{ opacity: dislikeOpacity }}
        className="absolute top-8 right-6 border-4 border-red-500 rounded-lg px-4 py-1 rotate-12 pointer-events-none"
      >
        <span className="text-red-500 font-bold text-3xl tracking-widest uppercase">Nope</span>
      </div>

      {/* INFORMACIÓN DE LA PELÍCULA */}
      <div className="absolute bottom-0 w-full p-6 text-white pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-yellow-500 text-black font-bold px-2 py-0.5 rounded text-xs">
            ★ {movie.rating.toFixed(1)}
          </span>
          <span className="text-sm font-medium opacity-80">{movie.year}</span>
        </div>
        <h2 className="text-2xl font-bold leading-tight">{movie.title}</h2>
      </div>
    </div>
  );
};

/* 
// EJEMPLO DE USO:
// 
// <SwipeCard 
//   movie={{
//     id: 1,
//     title: "Dune: Part Two",
//     year: 2024,
//     rating: 8.9,
//     posterUrl: "https://image.tmdb.org/t/p/w500/8b8R8lS831SH4Xba0qQ7S9CHm66.jpg"
//   }} 
//   onSwipe={(direction) => console.log('Acción:', direction)} 
// />
*/
