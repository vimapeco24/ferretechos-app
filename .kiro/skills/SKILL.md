---
name: inventario-pwa-ui
description: >
  Build elegant, modern, production-grade frontend UI for inventory management
  systems as a PWA. Use when creating any component, screen, page, form, table,
  dashboard, modal, or layout for an inventory, warehouse, stock, or CRUD
  management app. Applies to product lists, stock tables, KPI dashboards, add/edit
  forms, category pages, barcode lookup screens, sidebar nav, alerts, and reports.
compatibility: Bootstrap 5.3+, Web App Manifest, Service Worker, Vanilla JS or Vue 3
metadata:
  author: Victor
  version: 2.0.0
---

# Elegant Inventory PWA — Design & Frontend Skill

You are a senior product designer and frontend engineer building a **production-grade PWA** for inventory management. Every screen must look and feel like a real native mobile app AND a polished desktop dashboard — not a tutorial demo.

**Mobile-first is mandatory.** Design for 390px first, then scale up. The app must feel native on a phone: touch-friendly, swipeable, no tiny tap targets, no horizontal scroll.

---

## Breakpoints (Bootstrap 5.3)

| Name | Width | Layout |
|------|-------|--------|
| xs   | < 576px  | 1 col, bottom nav, no sidebar |
| sm   | ≥ 576px  | 1-2 col, bottom nav |
| md   | ≥ 768px  | 2 col, offcanvas sidebar |
| lg   | ≥ 992px  | sidebar visible, full layout |
| xl   | ≥ 1200px | sidebar + wide content |

---

## Adaptive Layout Strategy

### Mobile (xs/sm) — App shell
```
┌─────────────────────────┐
│  Header: hamburger + title + avatar  │  56px fixed top
├─────────────────────────┤
│                         │
│   Content (scrollable)  │
│                         │
├─────────────────────────┤
│  Bottom Nav: 5 tabs     │  60px fixed bottom, safe-area aware
└─────────────────────────┘
```

### Tablet (md) — Hybrid
```
┌────────┬────────────────┐
│Offcanvas│  Content       │
│sidebar │  (drawer mode) │
└────────┴────────────────┘
```

### Desktop (lg+) — Dashboard
```
┌──────────┬──────────────────────┐
│ Sidebar  │  Top bar             │
│ 260px    │  ─────────────────── │
│ fixed    │  Page content        │
└──────────┴──────────────────────┘
```

---

## Core Aesthetic

**Direction: Clean Enterprise Dark-Accent**
- Primary canvas: white (`#FFFFFF`) or off-white (`#F8FAFC`)
- Sidebar & header: deep navy `#0F172A` with white text
- Accent / CTA: vivid indigo `#4F46E5`
- Success / stock OK: `#10B981`
- Warning / stock low: `#F59E0B`
- Danger / out of stock: `#EF4444`
- Muted text: `#64748B`
- Card borders: `#E2E8F0`

**Typography stack**
```css
--font-display: 'Plus Jakarta Sans', sans-serif;   /* headings, labels */
--font-body:    'DM Sans', sans-serif;              /* body, tables */
--font-mono:    'JetBrains Mono', monospace;        /* SKUs, codes */
```
Load from Google Fonts:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## Tech Stack

- **Bootstrap 5.3** — layout grid, utilities, responsive breakpoints  
  ```html
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  ```
- **Bootstrap Icons 1.11** — consistent iconography  
  ```html
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  ```
- **Chart.js 4** — charts and KPIs (when needed)  
  ```html
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
  ```
- **Web App Manifest + Service Worker** — PWA required on every page

---

## PWA Requirements (mandatory on every project)

### `manifest.json`
```json
{
  "name": "Inventario",
  "short_name": "Inventario",
  "description": "Sistema de gestión de inventario",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#4F46E5",
  "orientation": "any",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable any" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable any" }
  ],
  "categories": ["business", "productivity"],
  "screenshots": [
    { "src": "screenshots/dashboard.png", "sizes": "1280x800", "type": "image/png", "form_factor": "wide" }
  ]
}
```

### `sw.js` — Service Worker base
```javascript
const CACHE = 'inventario-v1';
const SHELL = ['/', '/index.html', '/styles.css', '/app.js', '/manifest.json'];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)))
);
self.addEventListener('activate', e =>
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ))
);
self.addEventListener('fetch', e =>
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
);
```

### Registration (in every HTML file)
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }
</script>
```

### Meta tags (in `<head>`)
```html
<meta name="theme-color" content="#4F46E5">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Inventario">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```

---

## Layout Structure

```
┌──────────────────────────────────────────────────────┐
│  SIDEBAR (260px, bg #0F172A)  │  MAIN CONTENT        │
│                               │                      │
│  Logo + app name              │  Top bar             │
│  ─────────────────            │  ─────────────────── │
│  Nav items with icons         │  Page title + actions│
│  Active = indigo accent       │                      │
│  Hover = white/10%            │  Content area        │
│                               │                      │
│  ─────────────────            │                      │
│  User avatar + name           │                      │
│  Settings / Logout            │                      │
└──────────────────────────────────────────────────────┘
```

### Sidebar HTML pattern
```html
<aside class="sidebar d-flex flex-column" style="
  width:260px; min-height:100vh; background:#0F172A;
  position:fixed; top:0; left:0; padding:0;
  font-family:var(--font-display);
">
  <!-- Brand -->
  <div class="px-4 py-4 border-bottom border-white border-opacity-10">
    <div class="d-flex align-items-center gap-2">
      <div style="width:32px;height:32px;background:#4F46E5;border-radius:8px;
        display:grid;place-items:center;">
        <i class="bi bi-box-seam text-white" style="font-size:16px"></i>
      </div>
      <span style="color:#F8FAFC;font-weight:700;font-size:16px;">Inventario</span>
    </div>
  </div>
  <!-- Nav -->
  <nav class="flex-grow-1 px-3 py-3">
    <p style="color:#64748B;font-size:10px;font-weight:600;letter-spacing:.1em;
      text-transform:uppercase;padding:0 8px;margin-bottom:8px;">Principal</p>
    <a href="#" class="nav-item active">
      <i class="bi bi-grid-1x2"></i> Dashboard
    </a>
    <a href="#" class="nav-item">
      <i class="bi bi-boxes"></i> Productos
    </a>
    <a href="#" class="nav-item">
      <i class="bi bi-arrow-left-right"></i> Movimientos
    </a>
    <a href="#" class="nav-item">
      <i class="bi bi-bar-chart-line"></i> Reportes
    </a>
    <p style="color:#64748B;font-size:10px;font-weight:600;letter-spacing:.1em;
      text-transform:uppercase;padding:0 8px;margin:16px 0 8px;">Configuración</p>
    <a href="#" class="nav-item">
      <i class="bi bi-people"></i> Usuarios
    </a>
    <a href="#" class="nav-item">
      <i class="bi bi-sliders"></i> Ajustes
    </a>
  </nav>
  <!-- User -->
  <div class="px-3 py-3 border-top border-white border-opacity-10">
    <div class="d-flex align-items-center gap-2">
      <div style="width:36px;height:36px;border-radius:50%;background:#4F46E5;
        display:grid;place-items:center;font-weight:700;color:#fff;font-size:13px;">VP</div>
      <div>
        <p style="color:#F8FAFC;font-size:13px;font-weight:600;margin:0;">Victor P.</p>
        <p style="color:#64748B;font-size:11px;margin:0;">Administrador</p>
      </div>
      <i class="bi bi-box-arrow-right ms-auto" style="color:#64748B;cursor:pointer"></i>
    </div>
  </div>
</aside>
```

### Nav item CSS
```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  color: #94A3B8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
  margin-bottom: 2px;
}
.nav-item:hover { background: rgba(255,255,255,0.07); color: #F8FAFC; }
.nav-item.active { background: #4F46E5; color: #fff; }
.nav-item i { font-size: 17px; }
```

---

## Component Patterns

### KPI Cards
```html
<div class="row g-3 mb-4">
  <div class="col-sm-6 col-xl-3">
    <div class="card-kpi">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div class="kpi-icon" style="background:#EEF2FF;">
          <i class="bi bi-boxes" style="color:#4F46E5;font-size:20px;"></i>
        </div>
        <span class="badge-trend up"><i class="bi bi-arrow-up-short"></i> 12%</span>
      </div>
      <p class="kpi-value">1,842</p>
      <p class="kpi-label">Total productos</p>
    </div>
  </div>
</div>
```
```css
.card-kpi {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 20px;
}
.kpi-icon { width:44px; height:44px; border-radius:10px; display:grid; place-items:center; }
.kpi-value { font-size:28px; font-weight:700; color:#0F172A; margin:0; font-family:var(--font-display); }
.kpi-label { font-size:13px; color:#64748B; margin:0; }
.badge-trend { font-size:12px; font-weight:600; padding:3px 8px; border-radius:20px; }
.badge-trend.up { background:#DCFCE7; color:#16A34A; }
.badge-trend.down { background:#FEE2E2; color:#DC2626; }
```

### Inventory Table
```html
<div class="card-table">
  <div class="d-flex justify-content-between align-items-center mb-3 px-4 pt-4">
    <h6 style="font-weight:700;color:#0F172A;margin:0;">Productos</h6>
    <div class="d-flex gap-2">
      <div class="search-box">
        <i class="bi bi-search"></i>
        <input type="text" placeholder="Buscar producto...">
      </div>
      <button class="btn-primary-custom">
        <i class="bi bi-plus-lg"></i> Agregar
      </button>
    </div>
  </div>
  <div class="table-responsive">
    <table class="table-custom">
      <thead>
        <tr>
          <th>SKU</th><th>Producto</th><th>Categoría</th>
          <th>Stock</th><th>Estado</th><th>Precio</th><th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code style="font-family:var(--font-mono);font-size:12px;
            background:#F1F5F9;padding:2px 6px;border-radius:4px;">INV-0042</code></td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="product-thumb">P</div>
              <div>
                <p style="font-weight:600;font-size:14px;margin:0;">Producto Alfa</p>
                <p style="font-size:12px;color:#64748B;margin:0;">Proveedor XYZ</p>
              </div>
            </div>
          </td>
          <td><span class="badge-category">Electrónica</span></td>
          <td><span style="font-weight:600;">243</span></td>
          <td><span class="status-badge success">Disponible</span></td>
          <td style="font-weight:600;">$120.000</td>
          <td>
            <div class="d-flex gap-1">
              <button class="btn-icon"><i class="bi bi-pencil"></i></button>
              <button class="btn-icon danger"><i class="bi bi-trash3"></i></button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```
```css
.card-table { background:#fff; border:1px solid #E2E8F0; border-radius:14px; overflow:hidden; }
.table-custom { width:100%; border-collapse:collapse; }
.table-custom thead { background:#F8FAFC; }
.table-custom th { padding:11px 16px; font-size:11px; font-weight:600; color:#64748B;
  text-transform:uppercase; letter-spacing:.06em; border-bottom:1px solid #E2E8F0; }
.table-custom td { padding:14px 16px; font-size:14px; color:#0F172A;
  border-bottom:1px solid #F1F5F9; }
.table-custom tr:hover td { background:#F8FAFC; }
.product-thumb { width:34px; height:34px; border-radius:8px; background:#EEF2FF;
  display:grid; place-items:center; font-weight:700; color:#4F46E5; font-size:13px; }
.status-badge { padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; }
.status-badge.success { background:#DCFCE7; color:#16A34A; }
.status-badge.warning { background:#FEF9C3; color:#CA8A04; }
.status-badge.danger  { background:#FEE2E2; color:#DC2626; }
.badge-category { background:#EEF2FF; color:#4338CA; font-size:12px;
  font-weight:500; padding:3px 10px; border-radius:20px; }
.btn-icon { border:1px solid #E2E8F0; background:#fff; border-radius:8px;
  padding:5px 8px; color:#64748B; cursor:pointer; transition:all 0.15s; }
.btn-icon:hover { background:#F1F5F9; }
.btn-icon.danger:hover { background:#FEE2E2; border-color:#FCA5A5; color:#DC2626; }
.search-box { position:relative; }
.search-box i { position:absolute; left:10px; top:50%; transform:translateY(-50%);
  color:#94A3B8; font-size:14px; }
.search-box input { border:1px solid #E2E8F0; border-radius:8px; padding:7px 12px 7px 32px;
  font-size:13px; color:#0F172A; outline:none; width:220px; }
.search-box input:focus { border-color:#4F46E5; box-shadow:0 0 0 3px rgba(79,70,229,.1); }
.btn-primary-custom { background:#4F46E5; color:#fff; border:none; border-radius:8px;
  padding:7px 16px; font-size:13px; font-weight:600; cursor:pointer;
  display:flex; align-items:center; gap:6px; transition:background 0.15s; }
.btn-primary-custom:hover { background:#4338CA; }
```

### Add/Edit Modal
```html
<div class="modal fade" id="modalProducto" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content" style="border-radius:16px;border:none;
      box-shadow:0 25px 50px rgba(0,0,0,.15);">
      <div class="modal-header" style="border-bottom:1px solid #E2E8F0;padding:20px 24px;">
        <h5 style="font-weight:700;color:#0F172A;margin:0;font-family:var(--font-display);">
          <i class="bi bi-plus-circle me-2" style="color:#4F46E5;"></i>
          Agregar producto
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body" style="padding:24px;">
        <div class="row g-3">
          <div class="col-md-8">
            <label class="form-label-custom">Nombre del producto</label>
            <input type="text" class="form-control-custom" placeholder="Ej: Cable HDMI 2m">
          </div>
          <div class="col-md-4">
            <label class="form-label-custom">SKU</label>
            <input type="text" class="form-control-custom" placeholder="INV-0001"
              style="font-family:var(--font-mono);">
          </div>
          <div class="col-md-6">
            <label class="form-label-custom">Categoría</label>
            <select class="form-control-custom">
              <option>Seleccionar...</option>
              <option>Electrónica</option>
              <option>Insumos</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label-custom">Stock inicial</label>
            <input type="number" class="form-control-custom" placeholder="0">
          </div>
          <div class="col-md-3">
            <label class="form-label-custom">Stock mínimo</label>
            <input type="number" class="form-control-custom" placeholder="10">
          </div>
          <div class="col-12">
            <label class="form-label-custom">Descripción</label>
            <textarea class="form-control-custom" rows="3" placeholder="Descripción opcional..."></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="border-top:1px solid #E2E8F0;padding:16px 24px;">
        <button data-bs-dismiss="modal" style="background:transparent;border:1px solid #E2E8F0;
          border-radius:8px;padding:8px 20px;font-size:14px;font-weight:500;cursor:pointer;">
          Cancelar
        </button>
        <button class="btn-primary-custom" style="padding:8px 24px;font-size:14px;">
          <i class="bi bi-check-lg"></i> Guardar producto
        </button>
      </div>
    </div>
  </div>
</div>
```
```css
.form-label-custom { font-size:13px; font-weight:600; color:#374151; margin-bottom:6px;
  display:block; font-family:var(--font-display); }
.form-control-custom { width:100%; padding:9px 12px; border:1px solid #E2E8F0;
  border-radius:8px; font-size:14px; color:#0F172A; background:#fff;
  transition:border 0.15s, box-shadow 0.15s; outline:none; }
.form-control-custom:focus { border-color:#4F46E5; box-shadow:0 0 0 3px rgba(79,70,229,.1); }
```

### Low Stock Alert Banner
```html
<div class="alert-banner">
  <i class="bi bi-exclamation-triangle-fill" style="color:#F59E0B;font-size:18px;"></i>
  <div>
    <p style="font-weight:600;color:#92400E;margin:0;font-size:14px;">
      Stock bajo detectado
    </p>
    <p style="color:#B45309;margin:0;font-size:13px;">
      8 productos están por debajo del mínimo
    </p>
  </div>
  <a href="#" style="color:#4F46E5;font-size:13px;font-weight:600;
    text-decoration:none;margin-left:auto;white-space:nowrap;">
    Ver productos →
  </a>
</div>
```
```css
.alert-banner { background:#FFFBEB; border:1px solid #FDE68A; border-radius:12px;
  padding:14px 18px; display:flex; align-items:center; gap:12px; margin-bottom:20px; }
```

---

## Mobile-First Responsive Rules

### Touch targets
All interactive elements (buttons, nav items, rows) minimum **44px height** and **44px width**. Never smaller.

### Mobile Header (replaces sidebar on xs/sm)
```html
<!-- Fixed top header, mobile only -->
<header class="d-lg-none fixed-top" style="
  background:#0F172A; height:56px;
  display:flex; align-items:center; padding:0 16px;
  gap:12px; z-index:1030;
">
  <button class="btn p-0" data-bs-toggle="offcanvas" data-bs-target="#sidebarMobile"
    style="color:#fff; font-size:20px; border:none; background:none;">
    <i class="bi bi-list"></i>
  </button>
  <span style="color:#F8FAFC; font-weight:700; font-size:15px; flex:1;
    font-family:var(--font-display);">Inventario</span>
  <div style="width:32px;height:32px;border-radius:50%;background:#4F46E5;
    display:grid;place-items:center;font-weight:700;color:#fff;font-size:12px;">VP</div>
</header>

<!-- Offcanvas sidebar (mobile/tablet) -->
<div class="offcanvas offcanvas-start d-lg-none" tabindex="-1" id="sidebarMobile"
  style="width:280px; background:#0F172A;">
  <div class="offcanvas-header" style="border-bottom:1px solid rgba(255,255,255,.08);">
    <div class="d-flex align-items-center gap-2">
      <div style="width:28px;height:28px;background:#4F46E5;border-radius:7px;
        display:grid;place-items:center;">
        <i class="bi bi-box-seam text-white" style="font-size:14px"></i>
      </div>
      <span style="color:#F8FAFC;font-weight:700;font-size:15px;
        font-family:var(--font-display);">Inventario</span>
    </div>
    <button type="button" class="btn-close btn-close-white"
      data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body p-3">
    <!-- Same nav items as desktop sidebar -->
  </div>
</div>
```

### Bottom Navigation Bar (mobile only — mandatory)
```html
<nav class="d-lg-none fixed-bottom" style="
  background:#0F172A;
  border-top:1px solid rgba(255,255,255,.08);
  display:flex; justify-content:space-around; align-items:center;
  height:60px;
  padding-bottom:env(safe-area-inset-bottom);
  z-index:1030;
">
  <a href="#" class="bottom-nav-item active">
    <i class="bi bi-grid-1x2-fill" style="font-size:21px;"></i>
    <span>Inicio</span>
  </a>
  <a href="#" class="bottom-nav-item">
    <i class="bi bi-boxes" style="font-size:21px;"></i>
    <span>Stock</span>
  </a>
  <a href="#" class="bottom-nav-item" style="position:relative;top:-14px;">
    <div style="width:52px;height:52px;background:#4F46E5;border-radius:50%;
      display:grid;place-items:center;box-shadow:0 4px 14px rgba(79,70,229,.5);">
      <i class="bi bi-plus-lg text-white" style="font-size:22px;"></i>
    </div>
  </a>
  <a href="#" class="bottom-nav-item">
    <i class="bi bi-arrow-left-right" style="font-size:21px;"></i>
    <span>Movim.</span>
  </a>
  <a href="#" class="bottom-nav-item">
    <i class="bi bi-person" style="font-size:21px;"></i>
    <span>Perfil</span>
  </a>
</nav>
```
```css
.bottom-nav-item {
  display: flex; flex-direction: column; align-items: center;
  gap: 2px; color: #475569; text-decoration: none;
  font-size: 10px; font-weight: 500; min-width: 44px; padding: 4px 0;
  transition: color .15s;
}
.bottom-nav-item.active { color: #818CF8; }
.bottom-nav-item:hover { color: #94A3B8; }
```

### Content padding on mobile
```css
/* Push content below fixed header and above bottom nav */
.app-content {
  padding-top: calc(56px + 16px);        /* header + gap */
  padding-bottom: calc(60px + env(safe-area-inset-bottom) + 16px);
  padding-left: 16px;
  padding-right: 16px;
}
@media (min-width: 992px) {
  .app-content {
    padding-top: 24px;
    padding-bottom: 32px;
    padding-left: 32px;
    padding-right: 32px;
    margin-left: 260px; /* sidebar width */
  }
}
```

### Tables → Card list on mobile
Never show a wide table on mobile. Below `md`, convert each row to a card:
```html
<!-- Table: visible only md+ -->
<div class="d-none d-md-block">
  <table class="table-custom">...</table>
</div>

<!-- Card list: visible only on mobile -->
<div class="d-md-none">
  <div class="product-card-mobile">
    <div class="d-flex align-items-center gap-3 mb-2">
      <div class="prod-thumb">CA</div>
      <div class="flex-grow-1">
        <p style="font-weight:600;font-size:15px;margin:0;">Cable HDMI 2m</p>
        <p style="font-size:12px;color:#64748B;margin:0;">INV-0042 · TechSupplies</p>
      </div>
      <span class="status s-ok">Disponible</span>
    </div>
    <div class="d-flex justify-content-between align-items-center">
      <span style="font-size:13px;color:#64748B;">Stock: <strong style="color:#0F172A">243</strong></span>
      <span style="font-size:15px;font-weight:700;color:#0F172A;">$45.000</span>
      <div class="d-flex gap-2">
        <button class="btn-icon"><i class="bi bi-pencil"></i></button>
        <button class="btn-icon"><i class="bi bi-trash3"></i></button>
      </div>
    </div>
  </div>
</div>
```
```css
.product-card-mobile {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 10px;
}
```

### KPI grid — responsive columns
```html
<!-- Always: 2 cols on mobile, 4 on desktop -->
<div class="row g-3 mb-4">
  <div class="col-6 col-xl-3">...</div>
  <div class="col-6 col-xl-3">...</div>
  <div class="col-6 col-xl-3">...</div>
  <div class="col-6 col-xl-3">...</div>
</div>
```

### Forms — full width stacked on mobile
```html
<div class="row g-3">
  <!-- Desktop: 2 cols. Mobile: always full width -->
  <div class="col-12 col-md-8">...</div>
  <div class="col-12 col-md-4">...</div>
</div>
```

### Modals — full screen on mobile
```css
@media (max-width: 575px) {
  .modal-dialog {
    margin: 0;
    max-width: 100%;
    height: 100%;
  }
  .modal-content {
    border-radius: 20px 20px 0 0 !important;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 92vh;
    overflow-y: auto;
  }
}
```
This makes modals appear as **bottom sheets** on mobile — native app feel.

---

## DO — Always

- Usar los colores del sistema definidos arriba (no inventar paletas)
- Incluir empty state, loading skeleton y error state en toda tabla/lista
- Todos los botones de acción destructiva piden confirmación (modal o popover)
- Paginación visible en tablas con más de 20 registros
- Todos los inputs con label visible (nunca placeholder-only)
- Agregar `aria-label` a icon buttons sin texto visible

## DO NOT — Nunca

- No usar colores pastel/genéricos sin contexto
- No mezclar estilos Bootstrap puros con custom; siempre override consistente
- No omitir el manifest.json ni el service worker
- No tablas sin estrategia responsive
- No shadows pesadas; máximo `box-shadow: 0 1px 3px rgba(0,0,0,.08)`
