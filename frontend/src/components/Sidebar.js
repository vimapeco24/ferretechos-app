import React from 'react'

const NAV = [
  { id: 'home',        label: 'Inicio',            icon: 'bi-house-door' },
  { id: 'dashboard',   label: 'Dashboard',         icon: 'bi-grid-1x2' },
  { id: 'inventario',  label: 'Inventario',        icon: 'bi-boxes' },
  { id: 'categorias',  label: 'Categorías',        icon: 'bi-tags' },
  { id: 'movimientos', label: 'Movimientos',       icon: 'bi-arrow-left-right' },
  { id: 'ventas',      label: 'Caja / Ventas',     icon: 'bi-cart3' },
  { id: 'proveedores', label: 'Proveedores',       icon: 'bi-truck' },
  { id: 'ordenes',     label: 'Órdenes de Compra', icon: 'bi-clipboard-check' },
  { id: 'reportes',    label: 'Reportes',          icon: 'bi-bar-chart-line' },
  { id: 'videos',      label: 'Videos',            icon: 'bi-play-circle' },
]

export default function Sidebar({ page, setPage, alerts, open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand__icon">
          <i className="bi bi-box-seam"></i>
        </div>
        <span className="sidebar-brand__name">Ferretechos</span>
        <button onClick={onClose} className="sidebar-close-btn" aria-label="Cerrar menú">
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <div className="sidebar-section-label">Principal</div>

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
              <span className="sidebar-nav-icon"><i className={`bi ${item.icon}`}></i></span>
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
        <div className="sidebar-footer__user">
          <div className="sidebar-footer__avatar">VP</div>
          <div>
            <div className="sidebar-footer__name">Victor P.</div>
            <div className="sidebar-footer__role">Administrador</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
