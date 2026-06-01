import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { supabase } from '../lib/supabase'
import { listarProductos } from '../lib/api'
import { esStockBajo } from '../lib/validation'
import { useIsMobile } from '../hooks/useIsMobile'

export default function Dashboard({ setPage, setAlerts }) {
  const [stats, setStats] = useState({ total: 0, alertas: 0, ventas_hoy: 0, valor_inventario: 0 })
  const [alertas, setAlertasList] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setLoading(true)
    try {
      const { data: productos } = await listarProductos(true)
      const bajos = (productos || []).filter(p => esStockBajo(p))
      const valorInventario = (productos || []).reduce((sum, p) => sum + (p.stock_actual * p.precio_compra), 0)

      const hoy = new Date().toISOString().split('T')[0]
      const { data: ventasHoy } = await supabase.from('ventas').select('total').gte('created_at', hoy)
      const totalVentasHoy = (ventasHoy || []).reduce((sum, v) => sum + v.total, 0)

      const hace7 = new Date(Date.now() - 7 * 86400000).toISOString()
      const { data: movs } = await supabase.from('movimientos').select('tipo, cantidad, created_at').gte('created_at', hace7)

      const byDay = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000)
        const key = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
        byDay[key] = { dia: key, entradas: 0, salidas: 0 }
      }
      ;(movs || []).forEach(m => {
        const key = new Date(m.created_at).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
        if (byDay[key]) {
          if (m.tipo === 'entrada') byDay[key].entradas += m.cantidad
          if (m.tipo === 'salida' || m.tipo === 'venta') byDay[key].salidas += m.cantidad
        }
      })

      setStats({ total: (productos || []).length, alertas: bajos.length, ventas_hoy: totalVentasHoy, valor_inventario: valorInventario })
      setAlertasList(bajos.slice(0, 5))
      setChartData(Object.values(byDay))
      setAlerts(bajos.length)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  if (loading) return <div className="loading-state">Cargando dashboard...</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn btn-secondary" onClick={cargarDatos}>↻ Actualizar</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total productos</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">en catálogo activo</div>
        </div>
        <div className={`stat-card ${stats.alertas > 0 ? 'danger' : 'success'}`}>
          <div className="stat-label">Stock bajo</div>
          <div className="stat-value" style={{ color: stats.alertas > 0 ? '#C0392B' : '#2E7D52' }}>{stats.alertas}</div>
          <div className="stat-sub">productos bajo mínimo</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Ventas hoy</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{fmt(stats.ventas_hoy)}</div>
          <div className="stat-sub">ingresos del día</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Valor inventario</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{fmt(stats.valor_inventario)}</div>
          <div className="stat-sub">costo de stock actual</div>
        </div>
      </div>

      {/* Gráfica + alertas */}
      <div className={isMobile ? '' : 'dashboard-grid'}>
        <div className="card" style={{ marginBottom: isMobile ? 16 : 0 }}>
          <div className="card-title">Movimientos últimos 7 días</div>
          <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
            <BarChart data={chartData} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DA" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#A08060' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#A08060' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E0CDB8', fontSize: 12 }} />
              <Bar dataKey="entradas" fill="#2E7D52" radius={[4,4,0,0]} name="Entradas" />
              <Bar dataKey="salidas" fill="#C0392B" radius={[4,4,0,0]} name="Salidas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>
            ⚠️ Alertas de stock bajo
            {stats.alertas > 0 && <span style={{ marginLeft: 8, color: '#C0392B' }}>{stats.alertas}</span>}
          </div>
          {alertas.length === 0 ? (
            <div style={{ color: '#2E7D52', fontSize: 13, padding: '16px 0' }}>✅ Todo el stock está en niveles normales.</div>
          ) : alertas.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F0E8DA' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.nombre}</div>
                <div style={{ fontSize: 11, color: '#A08060' }}>Mín: {p.stock_minimo} {p.unidad}</div>
              </div>
              <span className="badge badge-danger">{p.stock_actual} {p.unidad}</span>
            </div>
          ))}
          {stats.alertas > 0 && (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => setPage('inventario')}>
              Ver inventario →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
