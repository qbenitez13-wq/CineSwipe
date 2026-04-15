# CineSwipe - Descubrimiento de Películas 🎬

CineSwipe es una aplicación web moderna diseñada para descubrir películas de manera fluida y táctil mediante gestos de *swipe*. Inspirada en la experiencia de usuario de apps de citas, CineSwipe permite a los cinéfilos filtrar por género y año, y construir su propio historial de gustos de forma rápida y visual.

![Stack](https://img.shields.io/badge/Stack-React_18_%2B_Vite_%2B_TS_%2B_Tailwind-61dafb?style=flat-square)

## 🚀 Características de la Fase 1

- **Interfaz "Swipe" Nativa**: Implementada con Pointer Events para máxima respuesta táctil y de ratón.
- **Detección de Velocidad**: Soporte para gestos rápidos (*flicks*) que agilizan la navegación.
- **Capa de Datos Robusta**: Integración con la API de TMDB v3 con sistema de caché dinámico en `sessionStorage`.
- **Estado Global Persistente**: Uso de React Context + useReducer con rehidratación síncrona desde `localStorage`.
- **Arquitectura Optimizada**: División de contextos (State/Dispatch) y lógica de Sets para búsquedas $O(1)$.

## 🛠️ Instalación y Configuración

1.  **Clonar el repositorio**:
    ```bash
    git clone <tu-url-de-github>
    cd CineSwipe
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de TMDB:
    ```env
    VITE_TMDB_KEY=tu_api_key
    VITE_TMDB_TOKEN=tu_bearer_token
    ```

4.  **Iniciar Desarrollo**:
    ```bash
    npm run dev
    ```

## 📁 Estructura del Proyecto

- `/src/components`: UI pura y lógica de presentación.
- `/src/context`: Gestión de estado global y persistencia.
- `/src/hooks`: Lógica de negocio y consumo de APIs.
- `/src/types`: Definiciones estrictas de TypeScript.

## 📄 Documentación Técnica

- [ARCHITECTURE.md](./ARCHITECTURE.md): Detalle de la estructura de carpetas.
- [DECISIONS.md](./DECISIONS.md): Architecture Decision Records (ADRs) con el razonamiento tras cada tecnología.

---
Desarrollado con ❤️ y **Google Antigravity** como proyecto Capstone.
