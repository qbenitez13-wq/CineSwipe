'use client';

import React, { createContext, useContext, useReducer, useMemo, useEffect, ReactNode } from 'react';

// --- TIPOS ---

export type SwipeDirection = 'left' | 'right';

interface MovieAction {
  id: number;
  type: SwipeDirection;
}

interface MovieState {
  likedIds: Set<number>;
  dislikedIds: Set<number>;
  history: MovieAction[];
}

// Interfaz para la serialización en LocalStorage
interface PersistedState {
  likedIds: number[];
  dislikedIds: number[];
  history: MovieAction[];
}

type Action =
  | { type: 'SWIPE_RIGHT'; payload: number }
  | { type: 'SWIPE_LEFT';  payload: number }
  | { type: 'UNDO_LAST' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'RESET_STATE' }
  | { type: 'SYNC_FROM_CLOUD'; payload: { likedIds: number[]; dislikedIds: number[] } };

// --- CONSTANTES ---
const STORAGE_KEY = 'cineswipe_history';
const MAX_HISTORY = 50;

// --- INICIALIZADOR (Lazy Initialization) ---

const initialState: MovieState = {
  likedIds:    new Set(),
  dislikedIds: new Set(),
  history:     [],
};

const init = (initialArg: MovieState): MovieState => {
  if (typeof window === 'undefined') return initialArg;

  // Si quieres que siempre empiece limpio al "entrar por primera vez", 
  // podríamos comentar esta rehidratación, pero para mantener la 
  // funcionalidad anónima, solo la ejecutamos si existe el dato.
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialArg;

  try {
    const parsed: PersistedState = JSON.parse(saved);
    return {
      history:     parsed.history || [],
      likedIds:    new Set(parsed.likedIds || []),
      dislikedIds: new Set(parsed.dislikedIds || []),
    };
  } catch (e) {
    return initialArg;
  }
};

// --- REDUCER ---

function movieReducer(state: MovieState, action: Action): MovieState {
  switch (action.type) {
    case 'SWIPE_RIGHT':
    case 'SWIPE_LEFT': {
      const isRight = action.type === 'SWIPE_RIGHT';
      const type: SwipeDirection = isRight ? 'right' : 'left';
      const newAction: MovieAction = { id: action.payload, type };

      const nextHistory    = [...state.history, newAction];
      const nextLiked      = new Set(state.likedIds);
      const nextDisliked   = new Set(state.dislikedIds);

      if (isRight) nextLiked.add(action.payload);
      else         nextDisliked.add(action.payload);

      // FIFO: elimina el más antiguo al superar el límite
      if (nextHistory.length > MAX_HISTORY) {
        const removed = nextHistory.shift();
        if (removed) {
          if (removed.type === 'right') nextLiked.delete(removed.id);
          else                          nextDisliked.delete(removed.id);
        }
      }

      return { likedIds: nextLiked, dislikedIds: nextDisliked, history: nextHistory };
    }

    case 'UNDO_LAST': {
      if (state.history.length === 0) return state;

      const lastAction   = state.history[state.history.length - 1];
      const nextHistory  = state.history.slice(0, -1);
      const nextLiked    = new Set(state.likedIds);
      const nextDisliked = new Set(state.dislikedIds);

      if (lastAction.type === 'right') nextLiked.delete(lastAction.id);
      else                             nextDisliked.delete(lastAction.id);

      return { history: nextHistory, likedIds: nextLiked, dislikedIds: nextDisliked };
    }

    case 'CLEAR_HISTORY':
      return { likedIds: new Set(), dislikedIds: new Set(), history: [] };

    case 'RESET_STATE':
      if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
      return { likedIds: new Set(), dislikedIds: new Set(), history: [] };

    // ── NUEVA ACCIÓN: hidrata el estado desde Supabase al hacer login ──
    case 'SYNC_FROM_CLOUD': {
      const cloudLiked    = new Set(action.payload.likedIds);
      const cloudDisliked = new Set(action.payload.dislikedIds);

      // Fusión: unión de lo local + lo remoto
      const mergedLiked    = new Set([...state.likedIds,    ...cloudLiked]);
      const mergedDisliked = new Set([...state.dislikedIds, ...cloudDisliked]);

      // Reconstruir history básico a partir de los registros de la nube
      // (el history detallado no se persiste en la nube, pero la lista sí)
      return {
        likedIds:    mergedLiked,
        dislikedIds: mergedDisliked,
        history:     state.history, // mantenemos el historial local para el undo
      };
    }

    default:
      return state;
  }
}

// --- CONTEXTOS ---

const MovieStateContext    = createContext<MovieState | undefined>(undefined);
const MovieDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

// --- PROVIDER ---

export const MovieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState, init);

  // Persistencia automática en localStorage
  useEffect(() => {
    const stateToSave: PersistedState = {
      history:     state.history,
      likedIds:    Array.from(state.likedIds),
      dislikedIds: Array.from(state.dislikedIds),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [state]);

  const stateValue    = useMemo(() => state,    [state]);
  const dispatchValue = useMemo(() => dispatch, []);

  return (
    <MovieStateContext.Provider value={stateValue}>
      <MovieDispatchContext.Provider value={dispatchValue}>
        {children}
      </MovieDispatchContext.Provider>
    </MovieStateContext.Provider>
  );
};

// --- HOOKS ---

export const useMovieHistory = () => {
  const context = useContext(MovieStateContext);
  if (context === undefined) {
    throw new Error('useMovieHistory debe usarse dentro de un MovieProvider');
  }
  return context;
};

export const useMovieActions = () => {
  const dispatch = useContext(MovieDispatchContext);
  if (dispatch === undefined) {
    throw new Error('useMovieActions debe usarse dentro de un MovieProvider');
  }

  return useMemo(() => ({
    swipeRight:    (id: number) => dispatch({ type: 'SWIPE_RIGHT', payload: id }),
    swipeLeft:     (id: number) => dispatch({ type: 'SWIPE_LEFT',  payload: id }),
    undoLast:      ()           => dispatch({ type: 'UNDO_LAST' }),
    clearHistory:  ()           => dispatch({ type: 'CLEAR_HISTORY' }),
    resetState:    ()           => dispatch({ type: 'RESET_STATE' }),
    syncFromCloud: (likedIds: number[], dislikedIds: number[]) =>
      dispatch({ type: 'SYNC_FROM_CLOUD', payload: { likedIds, dislikedIds } }),
  }), [dispatch]);
};
