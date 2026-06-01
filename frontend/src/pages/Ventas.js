import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import { useIsMobile } from '../hooks/useIsMobile'

const METODOS = ['efectivo', 'transferencia', 'tarjeta', 'nequi']

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [carrito, setCarrito] = useState([])
  const [metodo, setMetodo] = useState('efectivo')
  const [cliente, setCliente] = useState('')
  const [descuento, setDescuento] = useState(0)
  const [prodSel, setProdSel] = useState('')
  const [cantSel, setCantSel] = useState(1)
  const { addToast, ToastContainer } = useToast()
  const isMobile = useIsMobile()

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    const [{ data: v }, { data: p }] = await Promise.all([
      supabase.from('ventas').select('*, ventas_items(*, productos(nombre, unidad))').order('created_at', { ascending: false }).limit(100),
      supabase.from('productos').select('id, nombre, codigo, precio_venta, stock_actual, unidad').eq('activo', true).order('nombre'),
    ])
    setVentas(v || [])
    setProductos(p || [])
    setLoading(false)
  }

  function agregarAlCarrito() {
    const prod = productos.find(p => p.id === prodSel)
    if (!prod || cantSel <= 0) return
    setCarrito(prev => {
      const idx = prev.findIndex(i => i.id === prod.id)
      if (idx >= 0) return prev.map((i, n) => n === idx ? { ...i, cantidad: i.cantidad + Number(cantSel) } : i)
      return [...prev, { id: prod.id, nombre: prod.nombre, unidad: prod.unidad, precio_venta: prod.precio_venta, cantidad: Number(cantSel) }]
    })
    setProdSel(''); setCantSel(1)
  }

  function quitarItem(id) { setCarrito(prev => prev.filter(i => i.id !== id)) }

  const subtotal = carrito.reduce((sum, i) => sum + i.precio_venta * i.cantidad, 0)
  const total = Math.max(0, subtotal - Number(descuento))

  async function cobrar() {
    if (carrito.length === 0) { addToast('Agrega productos al carrito', 'error'); return }
    const numero = 'VTA-' + Date.now()
    const { data: venta, error } = await supabase.from('ventas').insert({ numero, subtotal, descuento: Number(descuento), total, metodo_pago: metodo, cliente: cliente || null }).select().single()
    if (error) { addToast('Error al crear venta: ' + error.message, 'error'); return }
    const items = carrito.map(i => ({ venta_id: venta.id, producto_id: i.id, cantidad: i.cantidad, precio_unitario: i.precio_venta }))
    for (const item of items) {
      await supabase.from('ventas_items').insert(item)
    }
    for (const i of carrito) {
      await supabase.from('movimientos').insert({ producto_id: i.id, tipo: 'venta', cantidad: i.cantidad, precio_unitario: i.precio_venta, motivo: `Venta ${numero}` })
    }
    addToast(`Venta ${numero} registrada ✓`, 'success')
    setCarrito([]); setMetodo('efectivo'); setCliente(''); setDescuento(0); setModal(false); cargar()
  }

  const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
  const fmtDate = d => new Date(d).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div><h1>Caja / Ventas</h1><p className="page-subtitle">Registro de ventas al mostrador</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nueva venta</button>
      </div>

      {loading ? <div className="loading-state">Cargando...</div> : (
        isMobile ? (
          /* ── Tarjetas móvil ── */
          <div className="card-list">
            {ventas.map(v => (
              <div key={v.id} className="venta-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <code className="venta-card__num">{v.numero}</code>
                    <div className="venta-card__date">{fmtDate(v.created_at)}</div>
                    <div className="venta-card__client">{v.cliente || 'Mostrador'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="venta-card__total">{fmt(v.total)}</div>
                    <span className="badge badge-info" style={{ marginTop: 4 }}>{v.metodo_pago}</span>
                  </div>
                </div>
                {(v.ventas_items || []).length > 0 && (
                  <div className="venta-card__items">
                    {(v.ventas_items || []).map(i => i.productos?.nombre).join(' · ')}
                  </div>
                )}
              </div>
            ))}
            {ventas.length === 0 && <div className="empty-state">No hay ventas registradas aún.</div>}
          </div>
        ) : (
          /* ── Tabla desktop ── */
          <div className="table-wrap">
            <table>
              <thead><tr><th>Número</th><th>Fecha</th><th>Cliente</th><th>Método pago</th><th>Productos</th><th>Subtotal</th><th>Descuento</th><th>Total</th></tr></thead>
              <tbody>
                {ventas.map(v => (
                  <tr key={v.id}>
                    <td><code style={{ fontSize: 11, background: '#F0EBE3', padding: '2px 7px', borderRadius: 5 }}>{v.numero}</code></td>
                    <td style={{ fontSize: 12, color: '#A08060' }}>{fmtDate(v.created_at)}</td>
                    <td>{v.cliente || <span style={{ color: '#C4A882' }}>Mostrador</span>}</td>
                    <td><span className="badge badge-info">{v.metodo_pago}</span></td>
                    <td style={{ fontSize: 12 }}>{(v.ventas_items || []).map(i => i.productos?.nombre).join(', ')}</td>
                    <td>{fmt(v.subtotal)}</td>
                    <td>{v.descuento > 0 ? <span style={{ color: '#C0392B' }}>-{fmt(v.descuento)}</span> : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(v.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ventas.length === 0 && <div className="empty-state">No hay ventas registradas aún.</div>}
          </div>
        )
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Nueva venta</h2>
              <button className="btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>

            {/* Selector de producto */}
            <div className="form-group">
              <label>Producto</label>
              <select value={prodSel} onChange={e => setProdSel(e.target.value)}>
                <option value="">Seleccionar...</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} — {fmt(p.precio_venta)}/{p.unidad}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Cantidad</label>
                <input type="number" step="0.001" min="0.001" value={cantSel} onChange={e => setCantSel(e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 0 }}>
                <button type="button" className="btn btn-secondary" style={{ whiteSpace: 'nowrap', marginBottom: 0 }} onClick={agregarAlCarrito}>+ Agregar</button>
              </div>
            </div>

            {/* Carrito */}
            {carrito.length > 0 && (
              <div className="carrito-box">
                <div className="carrito-title">Carrito</div>
                {carrito.map(item => (
                  <div key={item.id} className="carrito-item">
                    <div className="carrito-item__info">
                      <strong>{item.nombre}</strong>
                      <span>{item.cantidad} {item.unidad} × {fmt(item.precio_venta)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 600 }}>{fmt(item.precio_venta * item.cantidad)}</span>
                      <button className="btn-icon" onClick={() => quitarItem(item.id)}>✕</button>
                    </div>
                  </div>
                ))}
                <div className="carrito-totales">
                  <div className="carrito-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                  <div className="carrito-row">
                    <span>Descuento</span>
                    <input type="number" min="0" value={descuento} onChange={e => setDescuento(e.target.value)} className="descuento-input" />
                  </div>
                  <div className="carrito-row carrito-total"><span>Total</span><span>{fmt(total)}</span></div>
                </div>
              </div>
            )}

            <div className="form-row" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label>Método de pago</label>
                <select value={metodo} onChange={e => setMetodo(e.target.value)}>
                  {METODOS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Cliente (opcional)</label>
                <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nombre del cliente..." />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={cobrar} style={{ background: '#2E7D52', borderColor: '#2E7D52' }}>
                💰 Cobrar {fmt(total)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
