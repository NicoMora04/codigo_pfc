# Frontend web — Voluntariado Geolocalizado

Frontend web público y responsive del Proyecto Final de Carrera
**Diseño y desarrollo de una aplicación móvil de voluntariado geolocalizado**.

Este cliente forma parte de la arquitectura multicliente incorporada mediante
la Solicitud de Cambio SC-01.

Actualmente implementa la base del portal público correspondiente al
Incremento 2.

## Stack tecnológico

- React
- Vite
- React Router
- JavaScript
- CSS responsive con enfoque mobile-first
- ESLint

## Arquitectura

El frontend web constituye un cliente independiente de la aplicación móvil.

Tanto la aplicación móvil como el portal web consumen la misma API REST,
implementada mediante Node.js y Express, y utilizan la misma base de datos
PostgreSQL.

Las reglas de negocio, autenticación, autorización y persistencia permanecen
centralizadas en el backend.

## Estructura principal

```text
src/
├── components/
├── config/
├── pages/
├── routes/
├── services/
├── App.jsx
├── index.css
└── main.jsx

Requisitos

Para ejecutar el frontend se requiere:

Node.js.
npm.
Backend del proyecto disponible.
Variable de entorno VITE_API_URL configurada.
Configuración

Crear un archivo .env dentro de la carpeta web.

Puede utilizarse .env.example como referencia.

Ejemplo para desarrollo local:

VITE_API_URL=http://localhost:3000/api

El archivo .env no debe versionarse.

Instalación

Desde la carpeta web:

npm install
Ejecución en desarrollo
npm run dev

Por defecto, Vite expone el portal en:

http://localhost:5173
Validaciones del frontend

Para ejecutar el análisis estático:

npm run lint

Para generar la compilación de producción:

npm run build
Rutas implementadas
Inicio
/

Presenta el portal público, acceso al directorio de organizaciones,
búsqueda y organizaciones publicadas.

Directorio de organizaciones
/organizaciones

Permite consultar organizaciones públicas y aplicar filtros por:

nombre;
tipo de actividad;
ubicación aproximada.

Los filtros consumen directamente la API compartida y no mantienen una
copia local de los datos del backend.

API pública utilizada

El frontend consume actualmente los siguientes endpoints públicos:

GET /api/public/tipos-actividad
GET /api/public/organizaciones

Estas rutas no requieren autenticación.

El directorio solamente recibe información autorizada para exposición
pública. No se muestran identificadores internos, coordenadas exactas,
credenciales ni información privada de las organizaciones.

Seguridad y configuración

El portal utiliza variables de entorno para definir la URL de la API.

Los archivos .env reales no se encuentran versionados.

El backend utiliza una lista configurable de orígenes CORS permitidos.
En desarrollo local, el origen web esperado es:

http://localhost:5173

Los contenidos obtenidos desde la API se renderizan mediante JSX normal.
No se utiliza inserción directa de HTML para mostrar contenido configurable.

Las operaciones privadas y de administración permanecen protegidas en el
backend mediante autenticación y autorización según rol.

Responsive y compatibilidad

El frontend utiliza un enfoque mobile-first.

Durante la integración se verificaron las vistas actualmente implementadas
en anchos de:

390 px
768 px
1366 px

También se realizaron comprobaciones en navegadores basados en Chromium y
Firefox, incluyendo navegación mediante teclado y estados con y sin
resultados en el directorio.

Estado actual

La versión actual implementa la base pública del portal correspondiente al
bloque 2.5:

estructura del frontend web;
integración con la API compartida;
endpoints públicos base;
página de inicio;
directorio público responsive;
filtros de organizaciones;
controles básicos de integración y seguridad.

Los perfiles públicos individuales, el editor autenticado, las imágenes
configurables, las plantillas, la previsualización, la publicación y la
moderación se implementarán en las actividades correspondientes al bloque
3.6.

Proyecto

Este frontend forma parte del sistema Voluntariado Geolocalizado y no
constituye una aplicación independiente del backend y de la base de datos
compartida del proyecto.