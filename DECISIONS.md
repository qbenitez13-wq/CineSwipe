# Architecture Decision Records (ADR) - CineSwipe

Este documento registra las decisiones técnicas clave tomadas durante la evolución del proyecto CineSwipe (Fase 1 y Fase 2) para asegurar la transparencia arquitectónica y facilitar el mantenimiento futuro.

## Resumen de Decisiones

| ID | Decisión | Estado | Criterio Principal |
| :--- | :--- | :--- | :--- |
| ADR-001 | React Context + useReducer | Aceptado | Simplicidad y Cero Dependencias |
| ADR-002 | Evolución a Framer Motion | Aceptado | Experiencia Premium y Física Real |
| ADR-003 | TMDB API v3 | Aceptado | Calidad de Datos y Estandarización |
| ADR-004 | Desarrollo basado en Agentes (AI-First) | Aceptado | Velocidad y Estructura Proactiva |
| ADR-005 | Migración a Next.js 14 (App Router) | Aceptado | SEO, Performance y Seguridad (Proxy API) |
| ADR-006 | Persistencia en Supabase | Aceptado | Sync en Tiempo Real y Auth Out-of-the-box |

---

## ADR-001: React Context sobre Zustand/Redux

### Contexto
Se requería una gestión de estado global para persistir los "Likes" y "Dislikes" del usuario a través de la aplicación, con persistencia en `localStorage` y un máximo de 50 elementos.

### Decisión
Utilizar la API nativa de **React Context** combinada con **useReducer**. Se optó por una estructura de contextos divididos (State y Dispatch) para evitar re-renders innecesarios.

### Consecuencias
- **Positivas**: Cero dependencias externas, curva de aprendizaje inexistente para devs React, y rendimiento optimizado mediante la división de contextos.
- **Negativas**: Mayor verbosidad (boilerplate) inicial en comparación con librerías como Zustand.

---

## ADR-002: De Vanilla Pointer Events a Framer Motion

### Contexto
Originalmente se usó Vanilla Pointer Events para control total. Sin embargo, para la Fase 2 se buscaba una sensación de "App Premium" con físicas de rebote, inercia y feedback visual dinámico.

### Decisión
Migrar la lógica de gestos de `SwipeCard.tsx` a **Framer Motion**.

### Consecuencias
- **Positivas**: Reducción drástica de código manual de cálculos físicos. Animaciones de salida fluidas y gestos altamente reactivos con `useMotionValue`.
- **Negativas**: Añade 30kb+ al bundle (mitigado mediante *Route Splitting* y configuración de chunks en la migración a Next.js).

---

## ADR-003: TMDB sobre Otras APIs de Cine

### Contexto
La aplicación necesita datos actualizados de películas, posters en alta resolución y metadatos (rating, géneros, años).

### Decisión
Utilizar la API de **The Movie Database (TMDB) v3**.

### Consecuencias
- **Positivas**: Calidad visual superior y amplia cobertura de catálogo.
- **Negativas**: Riesgo de exposición de la API Key en el cliente (solucionado en el ADR-005 mediante Proxy API).

---

## ADR-004: Delegación al Agente de IA (Google Antigravity)

### Contexto
El desarrollo se realizó en pareja con el agente Antigravity para acelerar la construcción y asegurar mejores prácticas.

### Decisión
Delegar el diseño de arquitectura y la implementación técnica al agente, manteniendo al usuario como **Product Owner** supervisor.

### Consecuencias
- **Positivas**: Velocidad de desarrollo extrema y consistencia arquitectónica. Implementación proactiva de soluciones complejas (Proxy API, Sync de Supabase).

---

## ADR-005: Migración a Next.js 14 (App Router)

### Contexto
La arquitectura original en Vite limitaba el SEO y exponía las claves de API en el cliente.

### Decisión
Migrar el proyecto completo a **Next.js 14**.

### Consecuencias
- **Positivas**:
  - **Seguridad**: Implementación de una API Route (`/api/movies`) que actúa como proxy secreto para TMDB.
  - **SEO**: Capacidad de manejar metadatos dinámicos y SSR.
  - **Optimización**: Manejo nativo de fuentes (Inter) y carga de imágenes.
- **Negativas**: Cambio en el paradigma de desarrollo (Client vs Server Components).

---

## ADR-006: Supabase para Cloud Sync y Autenticación

### Contexto
Se necesitaba que los usuarios pudieran guardar sus favoritos de forma permanente y acceder a ellos desde cualquier dispositivo.

### Decisión
Integrar **Supabase** como backend-as-a-service.

### Consecuencias
- **Positivas**: Gestión de usuarios inmediata, persistencia en base de datos PostgreSQL con políticas RLS y sincronización fluida entre el estado local y remoto.
- **Negativas**: Introducción de una dependencia externa crítica para las funcionalidades "Cloud".
