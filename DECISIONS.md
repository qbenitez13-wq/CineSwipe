# Architecture Decision Records (ADR) - CineSwipe Fase 1

Este documento registra las decisiones técnicas clave tomadas durante la fase inicial del proyecto CineSwipe para asegurar la transparencia arquitectónica y facilitar el mantenimiento futuro.

## Resumen de Decisiones

| ID | Decisión | Estado | Criterio Principal |
| :--- | :--- | :--- | :--- |
| ADR-001 | React Context + useReducer | Aceptado | Simplicidad y Cero Dependencias |
| ADR-002 | Vanilla Pointer Events | Aceptado | Performance y Control Total |
| ADR-003 | TMDB API v3 | Aceptado | Calidad de Datos y Estandarización |
| ADR-004 | Desarrollo basado en Agentes (AI-First) | Aceptado | Velocidad y Estructura Proactiva |

---

## ADR-001: React Context sobre Zustand/Redux

### Contexto
Se requería una gestión de estado global para persistir los "Likes" y "Dislikes" del usuario a través de la aplicación, con persistencia en `localStorage` y un máximo de 50 elementos.

### Decisión
Utilizar la API nativa de **React Context** combinada con **useReducer**. Se optó por una estructura de contextos divididos (State y Dispatch) para evitar re-renders innecesarios.

### Consecuencias Positivas
- **Cero dependencias externas**: Reduce el peso del bundle final.
- **Curva de aprendizaje**: Se utilizan patrones estándar de React 18.
- **Rendimiento**: La división de contextos asegura que los botones de acción no se rendericen de nuevo cuando la lista de IDs cambia.

### Consecuencias Negativas
- **Verbosidad**: Requiere más código "boilerplate" (tipos, dispatchers, providers) en comparación con Zustand.
- **Escalabilidad**: Si el estado crece masivamente, la gestión de múltiples contextos puede volverse compleja.

### Alternativas Consideradas
- **Zustand**: Considerada por su simplicidad, pero se descartó para mantener el proyecto dentro de los límites nativos de React y evitar "lock-in" de librerías en la Fase 1.

---

## ADR-002: Pointer Events sobre Librerías de Gestos

### Contexto
El núcleo de CineSwipe es el gesto de deslizamiento (swipe). Se necesitaba una solución que funcionara en móviles (touch) y escritorio (mouse).

### Decisión
Implementar la lógica de gestos mediante **Vanilla Pointer Events** (`onPointerDown`, `onPointerMove`, `onPointerUp`) y `setPointerCapture`.

### Consecuencias Positivas
- **Rendimiento Máximo**: No hay una capa de abstracción pesada procesando eventos en cada frame.
- **Control Total**: Permite definir umbrales de píxeles (80px) y cálculos de velocidad (flick) exactos según la necesidad del producto.

### Consecuencias Negativas
- **Complejidad de Lógica**: Tareas como el cálculo de inercia o el bloqueo del scroll vertical (`touch-action`) deben programarse manualmente.

### Alternativas Consideradas
- **Framer Motion**: Excelente para animaciones, pero se consideró excesivo para un único gesto core.
- **React-use-gesture**: Se descartó para reducir la deuda técnica de librerías externas.

---

## ADR-003: TMDB sobre Otras APIs de Cine

### Contexto
La aplicación necesita datos actualizados de películas, posters en alta resolución y metadatos (rating, géneros, años).

### Decisión
Utilizar la API de **The Movie Database (TMDB) v3** debido a su robustez y documentación.

### Consecuencias Positivas
- **Calidad Visual**: Acceso a un CDN optimizado para posters en múltiples tamaños.
- **Comunidad**: Amplia documentación y librerías de tipos disponibles.
- **Gratuidad**: El tier gratuito es suficiente para el desarrollo y Capstone.

### Consecuencias Negativas
- **Rate Limiting**: La API limita el número de peticiones (429), lo que obligó a implementar un sistema de caché en `sessionStorage`.

### Alternativas Consideradas
- **OMDb**: Más simple pero con imágenes de baja calidad y menos metadatos.
- **IMDb (RapidAPI)**: Costosa y con límites más estrictos en el tier gratuito.

---

## ADR-004: Delegación al Agente de IA (Google Antigravity)

### Contexto
El desarrollo se realizó en pareja con el agente Antigravity para acelerar la construcción de la Fase 1.

### Decisión
Delegar el 90% de la arquitectura de archivos y la lógica compleja (Hooks de API, Reducers) al agente, mientras que el usuario actúa como **Product Owner** y realiza el **Code Review** crítico.

### Consecuencias Positivas
- **Velocidad**: De cero a una arquitectura funcional en minutos.
- **Consistencia**: El agente mantiene las convenciones de naming y estructura definidas en el ADR inicial.
- **Optimización Proactiva**: El agente propuso e implementó mejoras de performance (Lazy Init, Sets) que no estaban en el requerimiento original.

### Consecuencias Negativas
- **Dependencia**: El desarrollador debe estar atento para no permitir lógica de "caja negra" sin documentación (mitigado por este ADR).

---

## Próximas Decisiones Pendientes (Fase 2)

1.  **Framework para el Landing**: ¿Continuar con Vite o migrar a Next.js para SEO?
2.  **Auth**: ¿Implementar Firebase o Supabase para sincronizar favoritos en la nube?
3.  **Animaciones Complejas**: ¿Incorporar Framer Motion para transiciones de página una vez que la lógica core es estable?
