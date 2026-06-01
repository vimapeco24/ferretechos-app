import React from 'react'

export default function Home({ setPage }) {
  return (
    <div className="home-page">
      {/* Hero Banner - muestra la imagen completa sin overlay */}
      <div className="home-hero">
        <img src="/media/banner.png" alt="Ferretechos - Importadores PVC Techos, Drywall, Superboard, Muros, Ferretería" />
      </div>

      {/* Info bar */}
      <div className="home-info-bar">
        <div className="home-info-bar__item">
          <i className="bi bi-telephone-fill"></i>
          <span>310 802 2348</span>
        </div>
        <div className="home-info-bar__item">
          <i className="bi bi-envelope-fill"></i>
          <span>gaferretechos@gmail.com</span>
        </div>
      </div>

      {/* Section title */}
      <div className="home-section-title">
        <h2>Acceso rápido</h2>
        <p>Gestiona tu inventario desde aquí</p>
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

        <button className="home-card" onClick={() => setPage('videos')}>
          <div className="home-card__icon" style={{ background: '#FEF2F2' }}>
            <i className="bi bi-play-circle" style={{ color: '#B91C1C' }}></i>
          </div>
          <div className="home-card__text">
            <h3>Videos</h3>
            <p>Galería multimedia</p>
          </div>
          <i className="bi bi-chevron-right home-card__arrow"></i>
        </button>

        <button className="home-card" onClick={() => setPage('dashboard')}>
          <div className="home-card__icon" style={{ background: '#F0FDF4' }}>
            <i className="bi bi-grid-1x2" style={{ color: '#16A34A' }}></i>
          </div>
          <div className="home-card__text">
            <h3>Dashboard</h3>
            <p>Panel de control</p>
          </div>
          <i className="bi bi-chevron-right home-card__arrow"></i>
        </button>
      </div>

      {/* Footer */}
      <div className="home-footer">
        <p><i className="bi bi-geo-alt"></i> Diag. 48 Sur No. 18-14, Esquina</p>
        <p style={{ marginTop: 4 }}>Ferretechos — Importadores PVC Techos</p>
      </div>
    </div>
  )
}
