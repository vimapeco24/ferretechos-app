import React from 'react'

const Icons = {
  dashboard: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  inventario: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>
  ),
  movimientos: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
    </svg>
  ),
  ventas: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
    </svg>
  ),
  proveedores: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
      <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"/>
    </svg>
  ),
  ordenes: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
    </svg>
  ),
  reportes: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  ),
}

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',         icon: 'dashboard' },
  { id: 'inventario',  label: 'Inventario',         icon: 'inventario' },
  { id: 'movimientos', label: 'Movimientos',        icon: 'movimientos' },
  { id: 'ventas',      label: 'Caja / Ventas',      icon: 'ventas' },
  { id: 'proveedores', label: 'Proveedores',        icon: 'proveedores' },
  { id: 'ordenes',     label: 'Órdenes de Compra',  icon: 'ordenes' },
  { id: 'reportes',    label: 'Reportes',            icon: 'reportes' },
]

export default function Sidebar({ page, setPage, alerts, open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand__mono">D</div>
        <div className="sidebar-brand__text">
          <div className="sidebar-brand__name">DISTRILACTEOS</div>
          <div className="sidebar-brand__sub">SANTANDER. H.</div>
        </div>
        <button onClick={onClose} className="sidebar-close-btn" aria-label="Cerrar menú">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="sidebar-ruler" />
      <div className="sidebar-section-label">Módulos</div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV.map(item => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`sidebar-nav-item ${active ? 'sidebar-nav-item--active' : ''}`}
            >
              <span className="sidebar-nav-icon">{Icons[item.icon]}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              {item.id === 'inventario' && alerts > 0 && (
                <span className="sidebar-nav-badge">{alerts}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer__brand">Distrilacteos Santander. H.</div>
        <div className="sidebar-footer__version">Sistema de Gestión · v1.0</div>
      </div>
    </aside>
  )
}
