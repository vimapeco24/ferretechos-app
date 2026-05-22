import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import { supabase } from '../lib/supabase'
import { useIsMobile } from '../hooks/useIsMobile'

const COLORS = ['#8B5E3C', '#C4956A', '#2E7D52', '#C0392B', '#E8A020', '#5C3D2E', '#A08060']

export default function Reportes() {
  const [loading, setLoading] = useState(true)
  const [ventasMes, setVentasMes] = useState([])
  const [topProductos, setTopProductos] = useState([])
  const [stockValor, setStockValor] = useState([])
  const [resumen, setResumen] = useState({ totalVentas: 0, unidadesVendidas: 0, ordenes: 0, valorStock: 0 })
  const [rango, setRango] = useState(30)
  const isMobile = useIsMobile()

  useEffect(() => { cargar() }, [rango])

  async function cargar() {
    setLoading(true)
    const desde = new Date(Date.now() - rango * 86400000).toISOString()
    const [{ data: ventas }, { data: vItems }, { data: productos }, { data: ordenes }] = await Promise.all([
      supabase.from('ventas').select('total, created_at').gte('created_at', desde),
      supabase.from('ventas_items').select('cantidad, subtotal, producto_id, productos(nombre)').gte('created_at', desde),
      supabase.from('productos').select('nombre, stock_actual, precio_compra, precio_venta').eq('activo', true),
      supabase.from('ordenes_compra').select('total').gte('created_at', desde),
    ])

    const byDay = {}
    for (let i = rango - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const key = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
      byDay[key] = { dia: key, ventas: 0 }
    }
    ;(ventas || []).forEach(v => {
      const key = new Date(v.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
      if (byDay[key]) byDay[key].ventas += v.total
    })
    setVentasMes(Object.values(byDay))

    const prodMap = {}
    ;(vItems || []).forEach(i => {
      const nombre = i.productos?.nombre || 'Desconocido'
      if (!prodMap[nombre]) prodMap[nombre] = { nombre, cantidad: 0, ingresos: 0 }
      prodMap[nombre].cantidad += i.cantidad
      prodMap[nombre].ingresos += i.subtotal || 0
    })
    setTopProductos(Object.values(prodMap).sort((a, b) => b.ingresos - a.ingresos).slice(0, 8))

    const stockData = (productos || []).map(p => ({ nombre: p.nombre.slice(0, 18), valor: p.stock_actual * p.precio_compra, stock: p.stock_actual })).filter(p => p.valor > 0).sort((a, b) => b.valor - a.valor).slice(0, 8)
    setStockValor(stockData)

    const totalVentas = (ventas || []).reduce((s, v) => s + v.total, 0)
    const unidadesVendidas = (vItems || []).reduce((s, i) => s + i.cantidad, 0)
    const valorStock = (productos || []).reduce((s, p) => s + p.stock_actual * p.precio_compra, 0)
    setResumen({ totalVentas, unidadesVendidas, ordenes: (ordenes || []).length, valorStock })
    setLoading(false)
  }

  const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
  const fmtK = n => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : Math.round(n)

  if (loading) return <div className="loading-state">Cargando reportes...</div>

  return (
    <div>
      <div className="page-header">
        <div><h1>Reportes</h1><p className="page-subtitle">Análisis de ventas e inventario</p></div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[7, 30, 90].map(d => (
            <button key={d} className={`btn btn-sm ${rango === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRango(d)}>
              {d === 7 ? '7d' : d === 30 ? '30d' : '90d'}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-label">Ventas totales</div>
          <div className="stat-value" style={{ fontSize: 18, color: '#2E7D52' }}>{fmt(resumen.totalVentas)}</div>
          <div className="stat-sub">últimos {rango} días</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unidades vendidas</div>
          <div className="stat-value">{resumen.unidadesVendidas.toFixed(1)}</div>
          <div className="stat-sub">kg / unidades</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Órdenes de compra</div>
          <div className="stat-value">{resumen.ordenes}</div>
          <div className="stat-sub">en el período</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-label">Valor en stock</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{fmt(resumen.valorStock)}</div>
          <div className="stat-sub">costo total inventario</div>
        </div>
      </div>

      {/* Ventas por día */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Ventas diarias — últimos {rango} días</div>
        <ResponsiveContainer width="100%" height={isMobile ? 160 : 220}>
          <LineChart data={ventasMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DA" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#A08060' }} axisLine={false} tickLine={false} interval={rango > 30 ? 6 : rango > 7 ? 3 : 0} />
            <YAxis tick={{ fontSize: 10, fill: '#A08060' }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={36} />
            <Tooltip formatter={v => fmt(v)} labelStyle={{ fontSize: 12 }} contentStyle={{ borderRadius: 8, border: '1px solid #E0CDB8', fontSize: 12 }} />
            <Line type="monotone" dataKey="ventas" stroke="#8B5E3C" strokeWidth={2} dot={false} name="Ventas" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top productos + distribución stock */}
      <div className="reportes-grid">
        <div className="card">
          <div className="card-title">Top productos por ingresos</div>
          {topProductos.length === 0 ? (
            <div style={{ color: '#A08060', padding: '20px 0', fontSize: 13 }}>Sin ventas en el período.</div>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
              <BarChart data={topProductos} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#A08060' }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: isMobile ? 10 : 11, fill: '#6B4F3A' }} axisLine={false} tickLine={false} width={isMobile ? 90 : 120} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 8, border: '1px solid #E0CDB8', fontSize: 12 }} />
                <Bar dataKey="ingresos" fill="#C4956A" radius={[0, 4, 4, 0]} name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-title">Distribución valor en stock</div>
          {stockValor.length === 0 ? (
            <div style={{ color: '#A08060', padding: '20px 0', fontSize: 13 }}>Sin datos.</div>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
              <PieChart>
                <Pie data={stockValor} dataKey="valor" nameKey="nombre" cx="50%" cy="50%" outerRadius={isMobile ? 65 : 80} label={({ nombre, percent }) => percent > 0.1 ? nombre.slice(0, 10) : ''} labelLine={false}>
                  {stockValor.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 8, border: '1px solid #E0CDB8', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
