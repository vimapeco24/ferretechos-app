import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import { useIsMobile } from '../hooks/useIsMobile'

const ESTADOS = {
  pendiente: { label: 'Pendiente', badge: 'badge-warn' },
  enviada:   { label: 'Enviada',   badge: 'badge-info' },
  recibida:  { label: 'Recibida',  badge: 'badge-success' },
  cancelada: { label: 'Cancelada', badge: 'badge-danger' },
}

export default function OrdCompra() {
  const [ordenes, setOrdenes] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [detalleItems, setDetalleItems] = useState([])

  async function abrirDetalle(orden) {
    setDetalle(orden)
    // Cargar items de la orden por separado
    const { data } = await supabase
      .from('ordenes_compra_items')
      .select('*')
      .eq('orden_compra_id', orden.id)
    setDetalleItems(data || [])
  }
  const { addToast, ToastContainer } = useToast()
  const isMobile = useIsMobile()

  const FORM = { proveedor_id: '', fecha_entrega: '', notas: '' }
  const [form, setForm] = useState(FORM)
  const [items, setItems] = useState([{ producto_id: '', cantidad: 1, precio_unitario: 0 }])

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    const [{ data: o }, { data: p }, { data: prod }] = await Promise.all([
      supabase.from('ordenes_compra').select('*, proveedores(nombre), ordenes_compra_items(*, productos(nombre, unidad))').order('created_at', { ascending: false }),
      supabase.from('proveedores').select('*').eq('activo', true),
      supabase.from('productos').select('id, nombre, codigo, precio_compra, unidad').eq('activo', true).order('nombre'),
    ])
    setOrdenes(o || [])
    setProveedores(p || [])
    setProductos(prod || [])
    setLoading(false)
  }

  function addItem() { setItems(prev => [...prev, { producto_id: '', cantidad: 1, precio_unitario: 0 }]) }
  function removeItem(i) { setItems(prev => prev.filter((_, n) => n !== i)) }
  function updateItem(i, key, val) {
    setItems(prev => prev.map((item, n) => {
      if (n !== i) return item
      const updated = { ...item, [key]: val }
      if (key === 'producto_id') { const prod = productos.find(p => p.id === val); if (prod) updated.precio_unitario = prod.precio_compra }
      return updated
    }))
  }

  const totalOrden = items.reduce((sum, i) => sum + Number(i.cantidad) * Number(i.precio_unitario), 0)

  async function crearOrden(e) {
    e.preventDefault()
    const numero = 'OC-' + Date.now()
    const { data: orden, error } = await supabase.from('ordenes_compra').insert({ numero, proveedor_id: form.proveedor_id, fecha_entrega: form.fecha_entrega || null, notas: form.notas, total: totalOrden }).select().single()
    if (error) { addToast('Error: ' + error.message, 'error'); return }
    const ords = items.filter(i => i.producto_id).map(i => ({ orden_compra_id: orden.id, producto_id: i.producto_id, cantidad: Number(i.cantidad), precio_unitario: Number(i.precio_unitario) }))
    // Insertar items uno por uno para evitar errores de batch
    for (const item of ords) {
      await supabase.from('ordenes_compra_items').insert(item)
    }
    addToast('Orden de compra creada ✓', 'success')
    setModal(false); setForm(FORM); setItems([{ producto_id: '', cantidad: 1, precio_unitario: 0 }]); cargar()
  }

  async function cambiarEstado(id, estado) {
    await supabase.from('ordenes_compra').update({ estado, updated_at: new Date().toISOString() }).eq('id', id)
    if (estado === 'recibida') {
      const orden = ordenes.find(o => o.id === id)
      if (orden?.ordenes_compra_items) {
        await Promise.all(orden.ordenes_compra_items.map(item =>
          supabase.from('movimientos').insert({ producto_id: item.producto_id, tipo: 'entrada', cantidad: item.cantidad, precio_unitario: item.precio_unitario, motivo: `Orden de compra ${orden.numero}` })
        ))
        addToast('Orden recibida — inventario actualizado ✓', 'success')
      }
    } else { addToast('Estado actualizado ✓', 'success') }
    cargar()
  }

  const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
  const fmtDate = d => d ? new Date(d).toLocaleDateString('es-CO') : '—'

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div><h1>Órdenes de Compra</h1><p className="page-subtitle">Pedidos a proveedores</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nueva orden</button>
      </div>

      {loading ? <div className="loading-state">Cargando...</div> : (
        isMobile ? (
          /* ── Tarjetas móvil ── */
          <div className="card-list">
            {ordenes.map(o => {
              const est = ESTADOS[o.estado] || ESTADOS.pendiente
              return (
                <div key={o.id} className="orden-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <code className="orden-card__num">{o.numero}</code>
                      <div className="orden-card__proveedor">{o.proveedores?.nombre || '—'}</div>
                      <div className="orden-card__date">Pedido: {fmtDate(o.created_at)} · Entrega: {fmtDate(o.fecha_entrega)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${est.badge}`}>{est.label}</span>
                      <div style={{ fontWeight: 700, fontSize: 15, marginTop: 6, color: '#3D1F0E' }}>{fmt(o.total)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#A08060', marginBottom: 10 }}>
                    {(o.ordenes_compra_items || []).length} producto(s)
                    {(o.ordenes_compra_items || []).length > 0 && ': ' + (o.ordenes_compra_items || []).map(i => i.productos?.nombre).slice(0, 3).join(', ')}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => abrirDetalle(o)}>Ver detalle</button>
                    {o.estado === 'pendiente' && <button className="btn btn-sm btn-secondary" onClick={() => cambiarEstado(o.id, 'enviada')}>Enviar</button>}
                    {o.estado === 'enviada' && <button className="btn btn-sm btn-primary" onClick={() => cambiarEstado(o.id, 'recibida')}>✓ Recibir</button>}
                    {(o.estado === 'pendiente' || o.estado === 'enviada') && <button className="btn btn-sm btn-danger" onClick={() => cambiarEstado(o.id, 'cancelada')}>Cancelar</button>}
                  </div>
                </div>
              )
            })}
            {ordenes.length === 0 && <div className="empty-state">No hay órdenes de compra.</div>}
          </div>
        ) : (
          /* ── Tabla desktop ── */
          <div className="table-wrap">
            <table>
              <thead><tr><th>Número</th><th>Proveedor</th><th>F. Pedido</th><th>F. Entrega</th><th>Estado</th><th>Productos</th><th>Total</th><th>Acciones</th></tr></thead>
              <tbody>
                {ordenes.map(o => {
                  const est = ESTADOS[o.estado] || ESTADOS.pendiente
                  return (
                    <tr key={o.id}>
                      <td><code style={{ fontSize: 11, background: '#F0EBE3', padding: '2px 7px', borderRadius: 5 }}>{o.numero}</code></td>
                      <td style={{ fontWeight: 500 }}>{o.proveedores?.nombre || '—'}</td>
                      <td style={{ fontSize: 12 }}>{fmtDate(o.created_at)}</td>
                      <td style={{ fontSize: 12 }}>{fmtDate(o.fecha_entrega)}</td>
                      <td><span className={`badge ${est.badge}`}>{est.label}</span></td>
                      <td style={{ fontSize: 12 }}>{(o.ordenes_compra_items || []).length} ítem(s)</td>
                      <td style={{ fontWeight: 600 }}>{fmt(o.total)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-secondary" onClick={() => abrirDetalle(o)}>Ver</button>
                          {o.estado === 'pendiente' && <button className="btn btn-sm btn-secondary" onClick={() => cambiarEstado(o.id, 'enviada')}>Enviar</button>}
                          {o.estado === 'enviada' && <button className="btn btn-sm btn-primary" onClick={() => cambiarEstado(o.id, 'recibida')}>✓ Recibir</button>}
                          {(o.estado === 'pendiente' || o.estado === 'enviada') && <button className="btn btn-sm btn-danger" onClick={() => cambiarEstado(o.id, 'cancelada')}>✕</button>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {ordenes.length === 0 && <div className="empty-state">No hay órdenes de compra.</div>}
          </div>
        )
      )}

      {/* Modal nueva orden */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Nueva orden de compra</h2>
              <button className="btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={crearOrden}>
              <div className="form-row">
                <div className="form-group">
                  <label>Proveedor *</label>
                  <select required value={form.proveedor_id} onChange={e => setForm({ ...form, proveedor_id: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha de entrega esperada</label>
                  <input type="date" value={form.fecha_entrega} onChange={e => setForm({ ...form, fecha_entrega: e.target.value })} />
                </div>
              </div>

              <h3 style={{ margin: '16px 0 12px' }}>Productos a pedir</h3>
              {items.map((item, i) => (
                <div key={i} className="orden-item-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    {i === 0 && <label>Producto</label>}
                    <select value={item.producto_id} onChange={e => updateItem(i, 'producto_id', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    {i === 0 && <label>Cant.</label>}
                    <input type="number" step="0.001" min="0.001" value={item.cantidad} onChange={e => updateItem(i, 'cantidad', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    {i === 0 && <label>P. Unitario</label>}
                    <input type="number" min="0" value={item.precio_unitario} onChange={e => updateItem(i, 'precio_unitario', e.target.value)} />
                  </div>
                  <button type="button" className="btn-icon" onClick={() => removeItem(i)} style={{ alignSelf: 'flex-end', marginBottom: 2 }}>✕</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginTop: 4 }}>+ Agregar producto</button>
              <div style={{ marginTop: 12, textAlign: 'right', fontSize: 15, fontWeight: 600, color: '#5C3D2E' }}>Total estimado: {fmt(totalOrden)}</div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Notas / observaciones</label>
                <textarea rows={2} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear orden</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detalle orden */}
      {detalle && (
        <div className="modal-overlay" onClick={() => setDetalle(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Orden {detalle.numero}</h2>
              <button className="btn-icon" onClick={() => setDetalle(null)}>✕</button>
            </div>
            <div style={{ padding: '0 24px 16px' }}>
              <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Proveedor: <strong style={{ color: 'var(--text)' }}>{detalle.proveedores?.nombre || '—'}</strong></p>
              <div className="table-wrap" style={{ margin: 0 }}>
                <table>
                  <thead><tr><th>Producto</th><th>Cantidad</th><th>P. Unitario</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    {detalleItems.map(item => {
                      const prod = productos.find(p => p.id === item.producto_id)
                      const nombre = prod?.nombre || 'Producto'
                      const unidad = prod?.unidad || ''
                      const sub = item.subtotal || (Number(item.cantidad) * Number(item.precio_unitario))
                      return (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 500 }}>{nombre}</td>
                          <td>{item.cantidad} {unidad}</td>
                          <td>{fmt(item.precio_unitario)}</td>
                          <td style={{ fontWeight: 600 }}>{fmt(sub)}</td>
                        </tr>
                      )
                    })}
                    {detalleItems.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>Cargando items...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Total: {fmt(detalle.total)}</div>
              {detalle.notas && <p style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>Notas: {detalle.notas}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
