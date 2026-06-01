# Convenciones Ferretechos

## Proyecto
- Sistema de inventario para ferretería (Ferretechos)
- Stack: React + Capacitor (móvil) + Node.js backend + Supabase (PostgreSQL)
- Despliegue: Render (frontend estático + backend web service)

## Idioma
- Responder siempre en español
- Interfaz de usuario en español
- Nombres de variables y funciones en español (camelCase)

## Base de datos
- Supabase como base de datos (PostgreSQL hosted)
- Migraciones SQL se ejecutan en el SQL Editor de Supabase
- RLS habilitado con políticas permisivas (app interna sin auth)

## Código
- Los SKU se generan automáticamente con formato FER-XXXXX
- Los precios se manejan en COP (pesos colombianos) sin decimales
- Separador de miles con punto: $15.000
- Stock como enteros (no decimales)
- Soft-delete con campo `activo` (nunca eliminar registros)
- Fecha y hora se registran automáticamente con `created_at DEFAULT now()`

## Despliegue
- Frontend: Render Static Site (build de React)
- Backend: Render Web Service (Node.js)
- Variables de entorno: SUPABASE_URL, SUPABASE_ANON_KEY, REACT_APP_API_URL
