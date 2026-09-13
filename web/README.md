# Frontend web — Voluntariado Geolocalizado

Frontend web público y responsive del Proyecto Final de Carrera
**Diseño y desarrollo de una aplicación móvil de voluntariado geolocalizado**.

Este proyecto forma parte de la arquitectura multicliente incorporada mediante
la Solicitud de Cambio SC-01.

## Stack tecnológico

- React
- Vite
- React Router
- JavaScript
- CSS responsive con enfoque mobile-first
- ESLint

## Arquitectura

El frontend web constituye un cliente independiente de la aplicación móvil.

Ambos clientes consumen:

- la misma API REST;
- el mismo backend Node.js + Express;
- la misma base de datos PostgreSQL.

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