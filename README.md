# CineSwipe — Descubrimiento de Películas 🎬

CineSwipe es una aplicación web de descubrimiento de películas con una experiencia completamente táctil basada en gestos de *swipe*. Inspirada en la mecánica de apps de citas, permite a los cinéfilos explorar el catálogo de TMDB, guardar sus favoritos en la nube y sincronizarlos entre dispositivos.

![Stack](https://img.shields.io/badge/Stack-Next.js_14_%2B_Supabase_%2B_Framer_Motion_%2B_Tailwind-000?style=flat-square&logo=next.js)
![Auth](https://img.shields.io/badge/Auth-Supabase-3ecf8e?style=flat-square&logo=supabase)
![Animations](https://img.shields.io/badge/Animations-Framer_Motion-ff6bac?style=flat-square)

---

## ✨ Características

### Experiencia de Usuario
- **Swipe con Física Real**: Animaciones de spring, rebote y flick gracias a **Framer Motion**.
- **Feedback Visual Inmediato**: Badges de ❤️ LIKE / ✕ NOPE con opacidad y sombra de color que reaccionan en tiempo real al arrastre.
- **Teclas de Accesibilidad**: Soporte de teclado (`←` / `→`) para navegar sin tocar la pantalla.

### Datos y Seguridad
- **Integración TMDB v3**: Películas en tendencia con sistema de caché de 5 minutos en `sessionStorage`.
- **API Proxy Seguro**: Las llamadas a TMDB pasan por `/api/movies` (Next.js API Route). Tu API Key **nunca es expuesta** al navegador.
- **Favoritos en la Nube**: Autenticación con email/password via **Supabase Auth** y persistencia en **PostgreSQL** con Row Level Security.
- **Modo Anónimo**: Sin registro, los favoritos se guardan localmente en `localStorage`.
- **Fusión Inteligente**: Al iniciar sesión, los datos locales se fusionan automáticamente con los de la nube.

### Arquitectura
- **Next.js 14 App Router**: Renderizado estático de la UI y rutas de API en el servidor.
- **React Context + useReducer**: Estado global sin dependencias externas (Redux/Zustand).
- **TypeScript estricto** en todo el proyecto.

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <tu-url-de-github>
cd Sesion6
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto con las siguientes claves:

```env
# TMDB — Solo disponible en el SERVIDOR (no llevan prefijo NEXT_PUBLIC_)
TMDB_KEY=tu_api_key_de_tmdb
TMDB_TOKEN=tu_bearer_token_de_tmdb

# Supabase — Disponibles en el cliente (necesitan prefijo NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

> **Nota**: Las credenciales de TMDB **no** llevan el prefijo `NEXT_PUBLIC_` de forma intencional, para que solo puedan ser usadas desde el servidor (API Routes), protegiéndolas del navegador.

### 4. Iniciar en modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/movies/     # Proxy seguro para TMDB (Server-Side)
│   ├── layout.tsx      # Root Layout con metadatos SEO y Provider
│   └── page.tsx        # Página principal (Client Component)
├── components/
│   ├── auth/           # AuthModal (Login / Registro)
│   └── movies/         # SwipeCard con Framer Motion
├── context/            # MovieProvider + useReducer
├── hooks/              # useMovies, useAuth, useSyncFavorites
├── lib/                # supabaseClient (singleton)
└── types/              # Interfaces y tipos TypeScript
```

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|:--------|:------------|
| `npm run dev` | Servidor de desarrollo en `localhost:3000` |
| `npm run build` | Crea el bundle de producción optimizado |
| `npm run start` | Sirve el build de producción localmente |

---

## 📄 Documentación Técnica

- [ARCHITECTURE.md](./ARCHITECTURE.md): Detalle de la arquitectura, flujo de datos y módulos.
- [DECISIONS.md](./DECISIONS.md): Architecture Decision Records (ADRs) con el razonamiento técnico detrás de cada tecnología.

---

Desarrollado con ❤️ y **Google Antigravity** como proyecto Capstone.
