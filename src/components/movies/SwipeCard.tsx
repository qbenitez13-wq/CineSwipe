'use client';

import React, { useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimate,
  PanInfo,
} from 'framer-motion';

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

// --- CONFIGURACIÓN ---
const SWIPE_THRESHOLD = 80;    // Píxeles para activar la acción
const SWIPE_OUT_X    = 600;    // Distancia de salida fuera de pantalla
const VELOCITY_THRESHOLD = 500; // Velocidad de flick en px/s (unidad de Framer)

/**
 * SwipeCard: Componente de descubrimiento de películas con Framer Motion.
 * Reemplaza la lógica Vanilla Pointer Events por motion values para conseguir:
 * - Física de spring en el rebote al soltar
 * - Animación de salida fluida con rotación
 * - Badges LIKE/NOPE con opacidad reactiva al arrastre
 */
export const SwipeCard = React.memo<SwipeCardProps>(({ movie, onSwipe }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scope, animate] = useAnimate();

  // Motion values: valores que Framer Motion actualiza en el hilo de composición
  const x = useMotionValue(0);

  // Derivados en tiempo real del desplazamiento en X
  const rotate = useTransform(x, [-SWIPE_OUT_X, 0, SWIPE_OUT_X], [-20, 0, 20]);
  const likeOpacity  = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity  = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  // Sombra de color que crece con el arrastre
  const likeBoxShadow  = useTransform(x, [0, SWIPE_THRESHOLD * 2], ['0 0 0px rgba(34,197,94,0)', '0 0 60px rgba(34,197,94,0.4)']);
  const nopeBoxShadow  = useTransform(x, [-SWIPE_THRESHOLD * 2, 0], ['0 0 60px rgba(239,68,68,0.4)', '0 0 0px rgba(239,68,68,0)']);
  const boxShadow = useTransform(
    [likeBoxShadow, nopeBoxShadow],
    ([like, nope]) => x.get() >= 0 ? like : nope
  );

  /**
   * Se llama cuando el usuario suelta la carta después de arrastrar.
   * Decide si completar el swipe o rebotar de vuelta al origen.
   */
  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    const shouldSwipe =
      Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
      Math.abs(info.velocity.x) > VELOCITY_THRESHOLD;

    if (shouldSwipe) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      const targetX   = direction === 'right' ? SWIPE_OUT_X : -SWIPE_OUT_X;
      const targetRot = direction === 'right' ? 20 : -20;

      // Animación de salida: vuela hacia el lado con fade
      await animate(scope.current, {
        x: targetX,
        rotate: targetRot,
        opacity: 0,
      }, {
        duration: 0.35,
        ease: [0.32, 0, 0.67, 0],
      });

      onSwipe(direction);
    }
    // Si NO supera el umbral, Framer Motion aplica automáticamente
    // el spring de rebote porque dragSnapToOrigin está activo.
  };

  /**
   * Accesibilidad: teclas de flecha para like/nope
   */
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const direction = e.key === 'ArrowRight' ? 'right' : 'left';
    const targetX   = direction === 'right' ? SWIPE_OUT_X : -SWIPE_OUT_X;

    await animate(scope.current, { x: targetX, opacity: 0 }, { duration: 0.3 });
    onSwipe(direction);
  };

  return (
    <motion.div
      ref={scope}
      role="button"
      tabIndex={0}
      aria-label={`Película: ${movie.title}. Usa flechas para Like o Nope.`}
      onKeyDown={handleKeyDown}
      // Framer Motion drag API
      drag="x"
      dragSnapToOrigin            // Rebote spring automático si no supera umbral
      dragElastic={0.12}          // Suavidad al arrastrar más allá de los límites
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      // Motion values calculados
      style={{ x, rotate, boxShadow }}
      // Animación de entrada: la carta emerge desde abajo
      initial={{ scale: 0.95, opacity: 0, y: 30 }}
      animate={{ scale: 1,    opacity: 1, y: 0    }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative w-80 h-[480px] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none outline-none focus-visible:ring-4 focus-visible:ring-purple-500"
    >
      {/* SKELETON SCREEN (Estado de carga) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-neutral-700 border-t-purple-500 rounded-full animate-spin" />
        </div>
      )}

      {/* IMAGEN DEL POSTER */}
      <img
        src={movie.posterUrl}
        alt={`Poster de ${movie.title}`}
        onLoad={() => setIsLoaded(true)}
        draggable={false}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* GRADIENTE INFERIOR */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      {/* BADGE: LIKE ❤️ */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-8 left-6 border-4 border-green-500 rounded-xl px-4 py-1.5 -rotate-12 pointer-events-none"
      >
        <span className="text-green-400 font-black text-3xl tracking-widest uppercase">Like</span>
      </motion.div>

      {/* BADGE: NOPE ✕ */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-8 right-6 border-4 border-red-500 rounded-xl px-4 py-1.5 rotate-12 pointer-events-none"
      >
        <span className="text-red-400 font-black text-3xl tracking-widest uppercase">Nope</span>
      </motion.div>

      {/* INFO DE LA PELÍCULA */}
      <div className="absolute bottom-0 w-full p-6 text-white pointer-events-none">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="bg-yellow-500 text-black font-bold px-2.5 py-0.5 rounded-md text-xs">
            ★ {movie.rating.toFixed(1)}
          </span>
          <span className="text-sm font-medium opacity-70">{movie.year}</span>
        </div>
        <h2 className="text-2xl font-bold leading-tight">{movie.title}</h2>
      </div>
    </motion.div>
  );
});
