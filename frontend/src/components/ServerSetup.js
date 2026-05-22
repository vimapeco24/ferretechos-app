import React, { useState, useEffect } from 'react'

// Detecta si corre como app nativa Capacitor
function isNative() {
  return !!(window.Capacitor?.isNativePlatform?.())
}

export default function ServerSetup({ children }) {
  const [needsSetup, setNeedsSetup] = useState(false)
  const [ip, setIp] = useState('')
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNative()) return

    // Si ya hay servidor guardado, la app carga directo con datos reales
    if (localStorage.getItem('api_server')) return

    // En simulador iOS (misma máquina) usa localhost; en emulador Android usa 10.0.2.2
    const candidates = [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://10.0.2.2:3001',
    ]
    ;(async () => {
      for (const url of candidates) {
        try {
          const r = await fetch(`${url}/api/categorias?limit=1`, {
            signal: AbortSignal.timeout(2000),
          })
          if (r.ok) {
            localStorage.setItem('api_server', url)
            // Recarga para que getApiBase() lea el servidor correcto desde el inicio
            window.location.reload()
            return
          }
        } catch {}
      }
      // Ningún candidato respondió → mostrar pantalla de configuración manual
      setNeedsSetup(true)
    })()
  }, [])

  async function probar() {
    setError('')
    if (!ip.trim()) { setError('Ingresa la IP de tu Mac'); return }
    const url = ip.startsWith('http') ? ip.trim() : `http://${ip.trim()}:3001`
    setTesting(true)
    try {
      const r = await fetch(`${url}/api/categorias?limit=1`, { signal: AbortSignal.timeout(4000) })
      if (!r.ok) throw new Error('Respuesta inválida')
      localStorage.setItem('api_server', url)
      setNeedsSetup(false)
      window.location.reload()
    } catch {
      setError('No se pudo conectar. Verifica que el servidor esté corriendo y que la IP sea correcta.')
    }
    setTesting(false)
  }

  function cambiarServidor() {
    localStorage.removeItem('api_server')
    setIp('')
    setError('')
    setNeedsSetup(true)
  }

  if (!needsSetup) {
    return (
      <>
        {children}
        {/* Botón flotante para cambiar servidor (solo en móvil) */}
        {isNative() && (
          <button
            onClick={cambiarServidor}
            style={{
              position: 'fixed', bottom: 80, right: 16, zIndex: 9999,
              background: 'rgba(61,31,14,0.85)', color: '#F5E6C8',
              border: 'none', borderRadius: 20, padding: '7px 14px',
              fontSize: 11, cursor: 'pointer', backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
          >
            ⚙ Servidor
          </button>
        )}
      </>
    )
  }

  const serverStored = localStorage.getItem('api_server')

  return (
    <div style={{
      minHeight: '100vh', background: '#3D1F0E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: '#FAF6F0', borderRadius: 20, padding: 32,
        width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🥩</div>
          <h1 style={{ fontSize: 22, color: '#3D1F0E', margin: 0, fontFamily: "'DM Serif Display', serif" }}>
            Charcutería
          </h1>
          <p style={{ color: '#A08060', fontSize: 13, margin: '6px 0 0' }}>
            Configura la conexión al servidor
          </p>
        </div>

        <div style={{ background: '#F0E8DA', borderRadius: 12, padding: '14px 16px', marginBottom: 24, fontSize: 13, color: '#5C3D2E', lineHeight: 1.6 }}>
          <strong>¿Cómo encontrar la IP de tu Mac?</strong><br />
          Ajustes del sistema → Wi-Fi → clic en la red → <em>Dirección IP</em>
          <br />
          <span style={{ color: '#A08060', fontSize: 12 }}>Ejemplo: 192.168.1.25</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#5C3D2E', display: 'block', marginBottom: 6 }}>
            IP del servidor (Mac)
          </label>
          <input
            value={ip}
            onChange={e => setIp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && probar()}
            placeholder="192.168.1.25"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 10,
              border: '1.5px solid #E0CDB8', fontSize: 15, color: '#3D1F0E',
              background: 'white', boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          <p style={{ fontSize: 11, color: '#A08060', margin: '4px 0 0' }}>
            El servidor corre en el puerto 3001
          </p>
        </div>

        {error && (
          <div style={{ background: '#FFF0EE', border: '1px solid #F5C6C0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#C0392B' }}>
            {error}
          </div>
        )}

        <button
          onClick={probar}
          disabled={testing}
          style={{
            width: '100%', padding: '13px', background: testing ? '#C4A882' : '#8B5E3C',
            color: 'white', border: 'none', borderRadius: 10, fontSize: 15,
            fontWeight: 600, cursor: testing ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {testing ? 'Conectando...' : 'Conectar y continuar →'}
        </button>

        {serverStored && (
          <button
            onClick={() => setNeedsSetup(false)}
            style={{
              width: '100%', marginTop: 10, padding: '10px', background: 'transparent',
              color: '#A08060', border: '1px solid #E0CDB8', borderRadius: 10,
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}
