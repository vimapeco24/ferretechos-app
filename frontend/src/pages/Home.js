import React from 'react'

export default function Home({ setPage }) {
  return (
    <div className="home-page">
      {/* Hero Banner */}
      <div className="home-hero">
        <img src="/media/banner.png" alt="Ferretechos - Tu ferretería de confianza" />
        <div className="home-hero__overlay">
          <h1 className="home-hero__title">Ferretechos</h1>
          <p className="home-hero__subtitle">Sistema de Gestión de Inventario</p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="home-grid">
        <button className="home-card" onClick={() => setPage('inventario')}>
          <div className="home-card__icon">
            <i className="bi bi-boxes"></i>
          </div>
          <div className="home-card__text">
            <h3>Inventario</h3>
            <p>Gestiona tus productos</p>
          </div>
          <i className="bi bi-chevron-right home-card__arrow"></i>
        </button>

        <button className="home-card" onClick={() => setPage('categorias')}>
          <div className="home-card__icon" style={{ background: '#FFF7ED' }}>
            <i className="bi bi-tags" style={{ color: '#EA580C' }}></i>
          </div>
          <div className="home-card__text">
            <h3>Categorías</h3>
            <p>Pinturas, Drywall, PVC...</p>
          </div>
          <i className="bi bi-chevron-right home-card__arrow"></i>
        </button>

        <button className="home-card" onClick={() => setPage('ventas')}>
          <div className="home-card__icon" style={{ background: '#ECFDF5' }}>
            <i className="bi bi-cart3" style={{ color: '#059669' }}></i>
          </div>
          <div className="home-card__text">
            <h3>Ventas</h3>
            <p>Registra tus ventas</p>
          </div>
          <i className="bi bi-chevron-right home-card__arrow"></i>
        </button>

        <button className="home-card" onClick={() => setPage('movimientos')}>
          <div className="home-card__icon" style={{ background: '#EFF6FF' }}>
            <i className="bi bi-arrow-left-right" style={{ color: '#2563EB' }}></i>
          </div>
          <div className="home-card__text">
            <h3>Movimientos</h3>
            <p>Entradas y salidas</p>
          </div>
          <i className="bi bi-chevron-right home-card__arrow"></i>
        </button>

        <button className="home-card" onClick={() => setPage('proveedores')}>
          <div className="home-card__icon" style={{ background: '#F5F3FF' }}>
            <i className="bi bi-truck" style={{ color: '#7C3AED' }}></i>
          </div>
          <div className="home-card__text">
            <h3>Proveedores</h3>
            <p>Gestiona proveedores</p>
          </div>
          <i className="bi bi-chevron-right home-card__arrow"></i>
        </button>

        <button className="home-card" onClick={() => setPage('reportes')}>
          <div className="home-card__icon" style={{ background: '#FEF2F2' }}>
            <i className="bi bi-bar-chart-line" style={{ color: '#DC2626' }}></i>
          </div>
          <div className="home-card__text">
            <h3>Reportes</h3>
            <p>Estadísticas y análisis</p>
          </div>
          <i className="bi bi-chevron-right home-card__arrow"></i>
        </button>
      </div>

      {/* Footer info */}
      <div className="home-footer">
        <p><i className="bi bi-geo-alt"></i> Ferretechos — Tu ferretería de confianza</p>
      </div>
    </div>
  )
}
