import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Movimientos from './pages/Movimientos'
import Ventas from './pages/Ventas'
import Proveedores from './pages/Proveedores'
import OrdCompra from './pages/OrdCompra'
import Reportes from './pages/Reportes'
import './App.css'

const NAV_MOBILE = [
  { id: 'dashboard',   label: 'Inicio',    icon: '🏠' },
  { id: 'inventario',  label: 'Stock',     icon: '🧀' },
  { id: 'ventas',      label: 'Caja',      icon: '💰' },
  { id: 'movimientos', label: 'Movim.',    icon: '↕️' },
  { id: 'reportes',    label: 'Reportes',  icon: '📊' },
  { id: 'proveedores', label: 'Proveed.',  icon: '🚛' },
  { id: 'ordenes',     label: 'Órdenes',   icon: '📋' },
]

const PAGE_TITLES = {
  dashboard: 'Dashboard', inventario: 'Inventario', movimientos: 'Movimientos',
  ventas: 'Caja / Ventas', proveedores: 'Proveedores', ordenes: 'Órdenes de Compra', reportes: 'Reportes'
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [alerts, setAlerts] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function navigate(id) {
    setPage(id)
    setSidebarOpen(false)
  }

  return (
    <div className="app-root">
      {/* Sidebar: fijo en desktop, drawer en móvil */}
      <Sidebar
        page={page}
        setPage={navigate}
        alerts={alerts}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Overlay oscuro cuando el drawer está abierto en móvil */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <span /><span /><span />
        </button>
        <div className="mobile-topbar-brand">
          <span className="mobile-topbar-name">DISTRILACTEOS</span>
          <span className="mobile-topbar-page">{PAGE_TITLES[page]}</span>
        </div>
        <span style={{ width: 40 }} />
      </div>

      <main className="app-main">
        {page === 'dashboard'    && <Dashboard setPage={navigate} setAlerts={setAlerts} />}
        {page === 'inventario'   && <Inventario />}
        {page === 'movimientos'  && <Movimientos />}
        {page === 'ventas'       && <Ventas />}
        {page === 'proveedores'  && <Proveedores />}
        {page === 'ordenes'      && <OrdCompra />}
        {page === 'reportes'     && <Reportes />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {NAV_MOBILE.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
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
