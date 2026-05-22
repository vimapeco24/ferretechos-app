import React from 'react'

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',        icon: '🏠' },
  { id: 'inventario',  label: 'Inventario',        icon: '🧀' },
  { id: 'movimientos', label: 'Movimientos',        icon: '↕️' },
  { id: 'ventas',      label: 'Caja / Ventas',     icon: '💰' },
  { id: 'proveedores', label: 'Proveedores',        icon: '🚛' },
  { id: 'ordenes',     label: 'Órdenes de Compra', icon: '📋' },
  { id: 'reportes',    label: 'Reportes',           icon: '📊' },
]

export default function Sidebar({ page, setPage, alerts, open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      {/* Header del sidebar con botón cerrar (solo móvil) */}
      <div style={{
        padding: '28px 24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 22, marginBottom: 2 }}>🥩</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#F5E6C8', lineHeight: 1.2 }}>
            Charcutería
          </div>
          <div style={{ fontSize: 11, color: 'rgba(245,230,200,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
            Inventario Pro
          </div>
        </div>
        {/* Botón X solo visible en móvil */}
        <button
          onClick={onClose}
          className="sidebar-close-btn"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px', marginBottom: 2,
                border: 'none', borderRadius: 8, cursor: 'pointer',
                background: active ? 'rgba(245,230,200,0.15)' : 'transparent',
                color: active ? '#F5E6C8' : 'rgba(245,230,200,0.55)',
                fontSize: 13.5, fontFamily: "'DM Sans', sans-serif",
                fontWeight: active ? 500 : 400,
                textAlign: 'left',
                transition: 'all 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(245,230,200,0.08)'; e.currentTarget.style.color = '#F5E6C8'; }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(245,230,200,0.55)'; } }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'inventario' && alerts > 0 && (
                <span style={{
                  marginLeft: 'auto', background: '#C0392B', color: 'white',
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20
                }}>{alerts}</span>
              )}
              {active && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, background: '#C4956A', borderRadius: '0 3px 3px 0'
                }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.10)', fontSize: 11, color: 'rgba(245,230,200,0.35)' }}>
        v1.0 · Base de datos local
      </div>
    </aside>
  )
}
