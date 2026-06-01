import React from 'react'

const VIDEOS = [
  { id: 1, src: '/media/video-1.mp4', titulo: 'Video 1' },
  { id: 2, src: '/media/video-2.mp4', titulo: 'Video 2' },
  { id: 3, src: '/media/video-3.mp4', titulo: 'Video 3' },
  { id: 4, src: '/media/video-4.mp4', titulo: 'Video 4' },
]

const IMAGENES = [
  { id: 1, src: '/media/imagen-1.jpeg', titulo: 'Imagen 1' },
  { id: 2, src: '/media/imagen-2.jpeg', titulo: 'Imagen 2' },
]

export default function Videos() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Videos e Imágenes</h1>
          <p className="page-subtitle">Galería de contenido multimedia</p>
        </div>
      </div>

      {/* Sección de Videos */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--text)',
        marginBottom: '16px',
      }}>
        <i className="bi bi-play-circle" style={{ marginRight: 8, color: 'var(--primary)' }}></i>
        Videos
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {VIDEOS.map(video => (
          <div key={video.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <video
              controls
              preload="metadata"
              style={{ width: '100%', display: 'block', borderRadius: '14px 14px 0 0' }}
            >
              <source src={video.src} type="video/mp4" />
              Tu navegador no soporta video HTML5.
            </video>
            <div style={{ padding: '12px 16px' }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--text)',
                margin: 0,
              }}>
                {video.titulo}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Imágenes */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--text)',
        marginBottom: '16px',
      }}>
        <i className="bi bi-image" style={{ marginRight: 8, color: 'var(--primary)' }}></i>
        Imágenes
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {IMAGENES.map(img => (
          <div key={img.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img
              src={img.src}
              alt={img.titulo}
              style={{ width: '100%', display: 'block', borderRadius: '14px 14px 0 0', objectFit: 'cover' }}
            />
            <div style={{ padding: '12px 16px' }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--text)',
                margin: 0,
              }}>
                {img.titulo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
