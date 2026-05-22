import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import { useIsMobile } from '../hooks/useIsMobile'

const TIPOS = [
  { value: 'entrada', label: 'Entrada', icon: '↑', color: '#2E7D52' },
  { value: 'salida',  label: 'Salida',  icon: '↓', color: '#C0392B' },
  { value: 'ajuste',  label: 'Ajuste',  icon: '⟳', color: '#7A5000' },
]

export default function Movimientos() {
  const [movs, setMovs] = useState([])
  const [productos, setProductos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const { addToast, ToastContainer } = useToast()
  const isMobile = useIsMobile()

  const FORM = { producto_id: '', tipo: 'entrada', cantidad: '', precio_unitario: '', motivo: '', proveedor_id: '' }
  const [form, setForm] = useState(FORM)
  const [prodSel, setProdSel] = useState(null)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    const [{ data: m }, { data: p }, { data: prov }] = await Promise.all([
      supabase.from('movimientos').select('*, productos(nombre, unidad, codigo), proveedores(nombre)').order('created_at', { ascending: false }).limit(200),
      supabase.from('productos').select('id, nombre, codigo, unidad, precio_compra, precio_venta, stock_actual').eq('activo', true).order('nombre'),
      supabase.from('proveedores').select('id, nombre').eq('activo', true),
    ])
    setMovs(m || [])
    setProductos(p || [])
    setProveedores(prov || [])
    setLoading(false)
  }

  function selProd(id) {
    const p = productos.find(x => x.id === id)
    setProdSel(p)
    setForm(f => ({ ...f, producto_id: id, precio_unitario: p ? p.precio_compra : '' }))
  }

  async function guardar(e) {
    e.preventDefault()
    if (!form.producto_id) { addToast('Selecciona un producto', 'error'); return }
    const { error } = await supabase.from('movimientos').insert({
      producto_id: form.producto_id, tipo: form.tipo, cantidad: Number(form.cantidad),
      precio_unitario: form.precio_unitario ? Number(form.precio_unitario) : null,
      motivo: form.motivo, proveedor_id: form.proveedor_id || null,
    })
    if (error) { addToast('Error: ' + error.message, 'error'); return }
    addToast('Movimiento registrado ✓', 'success')
    setModal(false); setForm(FORM); setProdSel(null); cargar()
  }

  const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
  const fmtDate = d => new Date(d).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  const filtrados = filtroTipo === 'todos' ? movs : movs.filter(m => m.tipo === filtroTipo)

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div><h1>Movimientos</h1><p className="page-subtitle">Entradas, salidas y ajustes de inventario</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Registrar</button>
      </div>

      <div className="search-bar">
        {['todos', 'entrada', 'salida', 'ajuste'].map(t => (
          <button key={t} className={`btn btn-sm ${filtroTipo === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroTipo(t)}>
            {t === 'todos' ? 'Todos' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-state">Cargando...</div> : (
        isMobile ? (
          /* ── Tarjetas móvil ── */
          <div className="card-list">
            {filtrados.map(m => {
              const tipo = TIPOS.find(t => t.value === m.tipo) || { label: m.tipo, icon: '·', color: '#A08060' }
              const signo = (m.tipo === 'salida' || m.tipo === 'venta') ? '-' : '+'
              return (
                <div key={m.id} className="mov-card">
                  <div className="mov-card__left">
                    <span className="mov-card__badge" style={{ background: tipo.color + '20', color: tipo.color }}>
                      {tipo.icon} {tipo.label}
                    </span>
                    <div className="mov-card__product">{m.productos?.nombre || '—'}</div>
                    <div className="mov-card__code">{m.productos?.codigo} · {fmtDate(m.created_at)}</div>
                    {m.motivo && <div className="mov-card__motivo">{m.motivo}</div>}
                  </div>
                  <div className="mov-card__right">
                    <span className="mov-card__qty" style={{ color: signo === '+' ? '#2E7D52' : '#C0392B' }}>
                      {signo}{m.cantidad} {m.productos?.unidad}
                    </span>
                    {m.precio_unitario > 0 && <span className="mov-card__price">{fmt(m.precio_unitario)}</span>}
                  </div>
                </div>
              )
            })}
            {filtrados.length === 0 && <div className="empty-state">No hay movimientos registrados.</div>}
          </div>
        ) : (
          /* ── Tabla desktop ── */
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>P. Unitario</th><th>Subtotal</th><th>Proveedor</th><th>Motivo</th></tr>
              </thead>
              <tbody>
                {filtrados.map(m => {
                  const tipo = TIPOS.find(t => t.value === m.tipo) || {}
                  const subtotal = m.cantidad * (m.precio_unitario || 0)
                  return (
                    <tr key={m.id}>
                      <td style={{ fontSize: 12, color: '#A08060', whiteSpace: 'nowrap' }}>{fmtDate(m.created_at)}</td>
                      <td><span className="badge" style={{ background: (tipo.color || '#888') + '20', color: tipo.color || '#888' }}>{tipo.icon} {tipo.label || m.tipo}</span></td>
                      <td><strong>{m.productos?.nombre || '—'}</strong><div style={{ fontSize: 11, color: '#A08060' }}>{m.productos?.codigo}</div></td>
                      <td style={{ fontWeight: 600, color: m.tipo === 'entrada' ? '#2E7D52' : '#C0392B' }}>{m.tipo === 'salida' || m.tipo === 'venta' ? '-' : '+'}{m.cantidad} {m.productos?.unidad}</td>
                      <td>{m.precio_unitario ? fmt(m.precio_unitario) : '—'}</td>
                      <td>{subtotal > 0 ? fmt(subtotal) : '—'}</td>
                      <td style={{ fontSize: 12 }}>{m.proveedores?.nombre || '—'}</td>
                      <td style={{ fontSize: 12, color: '#A08060' }}>{m.motivo || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtrados.length === 0 && <div className="empty-state">No hay movimientos registrados.</div>}
          </div>
        )
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Registrar movimiento</h2>
              <button className="btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={guardar}>
              <div className="form-group">
                <label>Tipo de movimiento *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {TIPOS.map(t => (
                    <button key={t.value} type="button"
                      style={{ flex: 1, padding: '10px 8px', border: `2px solid ${form.tipo === t.value ? t.color : '#E0CDB8'}`, borderRadius: 8, background: form.tipo === t.value ? t.color + '15' : 'white', color: form.tipo === t.value ? t.color : '#6B4F3A', fontWeight: 500, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s' }}
                      onClick={() => setForm(f => ({ ...f, tipo: t.value }))}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Producto *</label>
                <select required value={form.producto_id} onChange={e => selProd(e.target.value)}>
                  <option value="">Seleccionar producto...</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.codigo}) — Stock: {p.stock_actual} {p.unidad}</option>)}
                </select>
              </div>
              {prodSel && (
                <div style={{ background: '#F0E8DA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#5C3D2E' }}>
                  Stock actual: <strong>{prodSel.stock_actual} {prodSel.unidad}</strong> · P. Compra: <strong>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(prodSel.precio_compra)}</strong>
                </div>
              )}
              <div className="form-row">
                <div className="form-group"><label>Cantidad *</label><input type="number" step="0.001" min="0.001" required value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} /></div>
                <div className="form-group"><label>Precio unitario (COP)</label><input type="number" min="0" value={form.precio_unitario} onChange={e => setForm(f => ({ ...f, precio_unitario: e.target.value }))} /></div>
              </div>
              {form.tipo === 'entrada' && (
                <div className="form-group">
                  <label>Proveedor</label>
                  <select value={form.proveedor_id} onChange={e => setForm(f => ({ ...f, proveedor_id: e.target.value }))}>
                    <option value="">Sin proveedor</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group"><label>Motivo / observación</label><input value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} placeholder="Ej: Compra quincenal, devolución..." /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
