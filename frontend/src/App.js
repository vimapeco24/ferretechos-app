import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Categorias from './pages/Categorias'
import Movimientos from './pages/Movimientos'
import Ventas from './pages/Ventas'
import Proveedores from './pages/Proveedores'
import OrdCompra from './pages/OrdCompra'
import Reportes from './pages/Reportes'
import Videos from './pages/Videos'
import './App.css'

const NAV_MOBILE = [
  { id: 'home',         label: 'Inicio',   icon: 'bi-house-door-fill' },
  { id: 'inventario',   label: 'Stock',    icon: 'bi-boxes' },
  { id: 'categorias',   label: 'Categ.',   icon: 'bi-tags' },
  { id: 'ventas',       label: 'Caja',     icon: 'bi-cart3' },
  { id: 'dashboard',    label: 'Panel',    icon: 'bi-grid-1x2' },
]

const PAGE_TITLES = {
  home: 'Inicio',
  dashboard: 'Dashboard',
  inventario: 'Inventario',
  categorias: 'Categorías',
  movimientos: 'Movimientos',
  ventas: 'Caja / Ventas',
  proveedores: 'Proveedores',
  ordenes: 'Órdenes de Compra',
  reportes: 'Reportes',
  videos: 'Videos',
}

export default function App() {
  const [page, setPage] = useState('home')
  const [alerts, setAlerts] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function navigate(id) {
    setPage(id)
    setSidebarOpen(false)
  }

  return (
    <div className="app-root">
      {/* Sidebar */}
      <Sidebar
        page={page}
        setPage={navigate}
        alerts={alerts}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <i className="bi bi-list"></i>
        </button>
        <div className="mobile-topbar-brand">
          <span className="mobile-topbar-name">Ferretechos</span>
          <span className="mobile-topbar-page">{PAGE_TITLES[page]}</span>
        </div>
        <div className="mobile-topbar-avatar">VP</div>
      </div>

      {/* Main content */}
      <main className="app-main">
        {page === 'home'         && <Home setPage={navigate} />}
        {page === 'dashboard'    && <Dashboard setPage={navigate} setAlerts={setAlerts} />}
        {page === 'inventario'   && <Inventario />}
        {page === 'categorias'   && <Categorias />}
        {page === 'movimientos'  && <Movimientos />}
        {page === 'ventas'       && <Ventas />}
        {page === 'proveedores'  && <Proveedores />}
        {page === 'ordenes'      && <OrdCompra />}
        {page === 'reportes'     && <Reportes />}
        {page === 'videos'       && <Videos />}
      </main>

      {/* Bottom navigation (mobile) */}
      <nav className="bottom-nav">
        {NAV_MOBILE.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-icon"><i className={`bi ${item.icon}`}></i></span>
            <span>{item.label}</span>
            {item.id === 'inventario' && alerts > 0 && (
              <span className="nav-badge">{alerts}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
