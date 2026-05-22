# 🥩 Charcutería Inventario Pro

App React para gestión de inventario de charcutería con Supabase como base de datos.

## Estructura del proyecto

```
charcuteria-app/
├── backend/              ← API Node.js (Render Web Service)
│   ├── index.js
│   ├── package.json
│   └── .env.example
├── frontend/             ← React PWA (Render Static Site)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── supabase_schema.sql   ← SQL para crear la base de datos
└── render.yaml           ← Configuración de despliegue
```

## Módulos incluidos
- **Dashboard** — resumen ejecutivo, alertas de stock, gráficas
- **Inventario** — catálogo de productos con CRUD y alertas de stock bajo
- **Movimientos** — entradas, salidas y ajustes de inventario
- **Caja / Ventas** — punto de venta con carrito y descuentos
- **Proveedores** — directorio de proveedores
- **Órdenes de Compra** — gestión de pedidos a proveedores
- **Reportes** — gráficas de ventas, top productos, distribución

---

## 🚀 Despliegue en Render + Supabase (TODO GRATIS)

### Paso 1: Crear base de datos en Supabase

1. Ve a [supabase.com](https://supabase.com) → crea cuenta → **New Project**
2. Espera ~2 min a que se aprovisione
3. Ve a **SQL Editor** → pega el contenido de `supabase_schema.sql` → **Run**
4. Ve a **Settings → API** y copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...`

### Paso 2: Subir a GitHub

```bash
git init
git add .
git commit -m "charcuteria app - backend y frontend separados"
git remote add origin https://github.com/TU-USUARIO/charcuteria-app.git
git push -u origin main
```

### Paso 3: Desplegar el BACKEND en Render

1. Ve a [render.com](https://render.com) → **New** → **Web Service**
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. En **Environment Variables** agrega:
   - `SUPABASE_URL` = `https://tu-proyecto.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJ...tu-key...`
   - `ALLOWED_ORIGINS` = `https://charcuteria-app.onrender.com` (la URL de tu frontend, la sabrás después del paso 4)
5. Click **Deploy**
6. Copia la URL del servicio (ej: `https://charcuteria-backend.onrender.com`)

### Paso 4: Desplegar el FRONTEND en Render

1. Ve a Render → **New** → **Static Site**
2. Conecta el mismo repositorio
3. Configura:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. En **Environment Variables** agrega:
   - `REACT_APP_API_URL` = `https://charcuteria-backend.onrender.com` (la URL del paso 3)
5. Click **Deploy**

### Paso 5: Actualizar CORS del backend

1. Vuelve al backend en Render → **Environment**
2. Actualiza `ALLOWED_ORIGINS` con la URL real de tu frontend
3. El backend se redesplegará automáticamente

---

## 💡 Desarrollo local

```bash
# Terminal 1: Backend
cd backend
SUPABASE_URL=https://tu-proyecto.supabase.co SUPABASE_ANON_KEY=tu-key node index.js

# Terminal 2: Frontend
cd frontend
npm start
```

El frontend en desarrollo usa el proxy (`localhost:3001`) así que no necesitas `REACT_APP_API_URL`.

---

## 📱 Usar como PWA

Una vez desplegada, abre la URL del frontend en tu celular:
- **Android Chrome**: menú ⋮ → "Instalar aplicación"
- **iOS Safari**: compartir → "Agregar a pantalla de inicio"

---

## 📝 Notas

| Servicio | Plan | Límites |
|----------|------|---------|
| Supabase | Free | 500MB DB, 50K filas, sin expiración |
| Render Backend | Free | Se duerme tras 15 min inactividad (~30s en despertar) |
| Render Frontend | Free (Static) | Sin límite, NO se duerme, CDN global |

- El frontend como Static Site **nunca se duerme** (es solo HTML/CSS/JS en CDN)
- Solo el backend se duerme, pero la primera petición lo despierta
- No necesitas disco persistente ni Node 22

## Tecnologías
- React 18 + PWA (Service Worker)
- Supabase (PostgreSQL gratuito)
- Node.js (API server)
- Recharts (gráficas)
- Capacitor (app móvil nativa)
