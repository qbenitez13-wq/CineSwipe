'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AuthState } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth: AuthState;
}

type Mode = 'login' | 'register';

/**
 * Modal de autenticación con email + password.
 * Soporta modo Login y Registro, con animaciones Framer Motion.
 */
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, auth }) => {
  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  const reset = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const switchMode = (next: Mode) => {
    reset();
    setMode(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const errMsg = mode === 'login'
      ? await auth.signIn(email, password)
      : await auth.signUp(email, password);

    setLoading(false);

    if (errMsg) {
      setError(errMsg);
    } else if (mode === 'register') {
      setSuccess(true); // En Supabase sin confirmación de email, el usuario ya queda logueado
    } else {
      onClose(); // Login exitoso → cerrar modal
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Panel del modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 40,  scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 shadow-2xl w-full max-w-[400px] max-h-[90vh] overflow-y-auto pointer-events-auto custom-scrollbar">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
                  </h2>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    {mode === 'login'
                      ? 'Tus favoritos te esperan en la nube.'
                      : 'Guarda tus swipes para siempre.'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-neutral-400"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Éxito en registro */}
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-6 text-center"
                >
                  <CheckCircle2 className="text-green-500 w-14 h-14" />
                  <p className="text-white font-bold text-lg">¡Cuenta creada!</p>
                  <p className="text-neutral-400 text-sm">Ya estás logueado. Tus favoritos se sincronizarán automáticamente.</p>
                  <button
                    onClick={onClose}
                    className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold text-white transition-colors"
                  >
                    Empezar a hacer swipe
                  </button>
                </motion.div>
              ) : (
                /* Formulario */
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* Campo Email */}
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-neutral-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                    />
                  </div>

                  {/* Campo Contraseña */}
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="auth-password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="Contraseña (mín. 6 caracteres)"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-neutral-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 bg-red-900/30 border border-red-500/40 rounded-xl p-3 text-sm text-red-300"
                    >
                      <AlertCircle size={16} className="shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {/* Botón principal */}
                  <button
                    id="auth-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                  </button>

                  {/* Switch de modo */}
                  <p className="text-center text-sm text-neutral-400">
                    {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                      className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                    >
                      {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
                    </button>
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
