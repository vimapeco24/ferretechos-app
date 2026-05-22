import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import { useIsMobile } from '../hooks/useIsMobile'

const UNIDADES = ['kg', 'g', 'lb', 'unidad', 'paquete', 'caja', 'lata']

export default function Inventario() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const { addToast, ToastContainer } = useToast()
  const isMobile = useIsMobile()

  const FORM_INIT = { codigo: '', nombre: '', descripcion: '', categoria_id: '', proveedor_id: '', precio_compra: '', precio_venta: '', stock_actual: '', stock_minimo: '', unidad: 'kg' }
  const [form, setForm] = useState(FORM_INIT)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    const [{ data: prods }, { data: cats }, { data: provs }] = await Promise.all([
      supabase.from('productos').select('*, categorias(nombre), proveedores(nombre)').eq('activo', true).order('nombre'),
      supabase.from('categorias').select('*').order('nombre'),
      supabase.from('proveedores').select('*').eq('activo', true).order('nombre'),
    ])
    setProductos(prods || [])
    setCategorias(cats || [])
    setProveedores(provs || [])
    setLoading(false)
  }

  function abrirNuevo() { setEditando(null); setForm(FORM_INIT); setModal(true) }
  function abrirEditar(p) {
    setEditando(p)
    setForm({ codigo: p.codigo, nombre: p.nombre, descripcion: p.descripcion || '', categoria_id: p.categoria_id || '', proveedor_id: p.proveedor_id || '', precio_compra: p.precio_compra, precio_venta: p.precio_venta, stock_actual: p.stock_actual, stock_minimo: p.stock_minimo, unidad: p.unidad })
    setModal(true)
  }

  async function guardar(e) {
    e.preventDefault()
    const payload = { ...form, precio_compra: Number(form.precio_compra), precio_venta: Number(form.precio_venta), stock_actual: Number(form.stock_actual), stock_minimo: Number(form.stock_minimo) }
    let error
    if (editando) {
      ({ error } = await supabase.from('productos').update(payload).eq('id', editando.id))
    } else {
      ({ error } = await supabase.from('productos').insert(payload))
    }
    if (error) { addToast('Error: ' + error.message, 'error'); return }
    addToast(editando ? 'Producto actualizado ✓' : 'Producto creado ✓', 'success')
    setModal(false)
    cargar()
  }

  async function eliminar(id) {
    if (!window.confirm('¿Desactivar este producto?')) return
    await supabase.from('productos').update({ activo: false }).eq('id', id)
    addToast('Producto desactivado', 'default')
    cargar()
  }

  const fmt = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
  const filtrados = productos.filter(p => {
    const textOk = p.nombre.toLowerCase().includes(buscar.toLowerCase()) || p.codigo.toLowerCase().includes(buscar.toLowerCase())
    const alertaOk = filtro === 'alerta' ? p.stock_actual <= p.stock_minimo : true
    return textOk && alertaOk
  })

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div><h1>Inventario</h1><p className="page-subtitle">{productos.length} productos activos</p></div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo producto</button>
      </div>

      <div className="search-bar">
        <input placeholder="Buscar nombre o código..." value={buscar} onChange={e => setBuscar(e.target.value)} style={{ flex: 1, minWidth: 0 }} />
        <button className={`btn btn-sm ${filtro === 'todos' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro('todos')}>Todos</button>
        <button className={`btn btn-sm ${filtro === 'alerta' ? 'btn-danger' : 'btn-secondary'}`} onClick={() => setFiltro('alerta')}>⚠ Bajo</button>
      </div>

      {loading ? <div className="loading-state">Cargando inventario...</div> : (
        isMobile ? (
          /* ── Vista tarjetas (móvil) ── */
          <div className="card-list">
            {filtrados.map(p => {
              const alerta = p.stock_actual <= p.stock_minimo
              return (
                <div key={p.id} className={`product-card ${alerta ? 'product-card--alert' : ''}`}>
                  <div className="product-card__header">
                    <div>
                      <span className="product-card__code">{p.codigo}</span>
                      <div className="product-card__name">{p.nombre}</div>
                      {p.categorias?.nombre && <div className="product-card__cat">{p.categorias.nombre}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge ${alerta ? 'badge-danger' : 'badge-success'}`}>{alerta ? '⚠ Bajo' : '✓ OK'}</span>
                      <button className="btn-icon" onClick={() => abrirEditar(p)}>✏️</button>
                      <button className="btn-icon" onClick={() => eliminar(p.id)}>🗑️</button>
                    </div>
                  </div>
                  <div className="product-card__body">
                    <div className="product-card__stat">
                      <span className="product-card__stat-label">Stock</span>
                      <span className="product-card__stat-val" style={{ color: alerta ? '#C0392B' : '#2E7D52', fontWeight: 700 }}>{p.stock_actual} {p.unidad}</span>
                    </div>
                    <div className="product-card__stat">
                      <span className="product-card__stat-label">Mínimo</span>
                      <span className="product-card__stat-val">{p.stock_minimo} {p.unidad}</span>
                    </div>
                    <div className="product-card__stat">
                      <span className="product-card__stat-label">P. Venta</span>
                      <span className="product-card__stat-val">{fmt(p.precio_venta)}</span>
                    </div>
                    <div className="product-card__stat">
                      <span className="product-card__stat-label">P. Compra</span>
                      <span className="product-card__stat-val">{fmt(p.precio_compra)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {filtrados.length === 0 && <div className="empty-state">No hay productos que coincidan.</div>}
          </div>
        ) : (
          /* ── Vista tabla (desktop) ── */
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Código</th><th>Producto</th><th>Categoría</th><th>Proveedor</th>
                  <th>P. Compra</th><th>P. Venta</th><th>Stock</th><th>Mínimo</th><th>Estado</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(p => {
                  const alerta = p.stock_actual <= p.stock_minimo
                  return (
                    <tr key={p.id} className={alerta ? 'alert-row' : ''}>
                      <td><code style={{ fontSize: 11, background: '#F0EBE3', padding: '2px 7px', borderRadius: 5 }}>{p.codigo}</code></td>
                      <td><strong>{p.nombre}</strong>{p.descripcion && <div style={{ fontSize: 11, color: '#A08060' }}>{p.descripcion.slice(0, 50)}</div>}</td>
                      <td>{p.categorias?.nombre || '—'}</td>
                      <td style={{ fontSize: 12 }}>{p.proveedores?.nombre || '—'}</td>
                      <td>{fmt(p.precio_compra)}</td>
                      <td>{fmt(p.precio_venta)}</td>
                      <td><span style={{ fontWeight: 600, color: alerta ? '#C0392B' : '#2E7D52' }}>{p.stock_actual} {p.unidad}</span></td>
                      <td style={{ color: '#A08060' }}>{p.stock_minimo} {p.unidad}</td>
                      <td><span className={`badge ${alerta ? 'badge-danger' : 'badge-success'}`}>{alerta ? '⚠ Bajo' : '✓ Normal'}</span></td>
                      <td><div style={{ display: 'flex', gap: 6 }}><button className="btn-icon" onClick={() => abrirEditar(p)}>✏️</button><button className="btn-icon" onClick={() => eliminar(p.id)}>🗑️</button></div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtrados.length === 0 && <div className="empty-state">No hay productos que coincidan.</div>}
          </div>
        )
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editando ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button className="btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={guardar}>
              <div className="form-row">
                <div className="form-group"><label>Código *</label><input required value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} placeholder="CHO-001" /></div>
                <div className="form-group"><label>Nombre *</label><input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Chorizo corriente" /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <select value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
                    <option value="">Sin categoría</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Proveedor</label>
                  <select value={form.proveedor_id} onChange={e => setForm({ ...form, proveedor_id: e.target.value })}>
                    <option value="">Sin proveedor</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>P. Compra (COP)</label><input type="number" required value={form.precio_compra} onChange={e => setForm({ ...form, precio_compra: e.target.value })} min="0" /></div>
                <div className="form-group"><label>P. Venta (COP)</label><input type="number" required value={form.precio_venta} onChange={e => setForm({ ...form, precio_venta: e.target.value })} min="0" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Stock actual</label><input type="number" step="0.001" value={form.stock_actual} onChange={e => setForm({ ...form, stock_actual: e.target.value })} min="0" /></div>
                <div className="form-group"><label>Stock mínimo</label><input type="number" step="0.001" value={form.stock_minimo} onChange={e => setForm({ ...form, stock_minimo: e.target.value })} min="0" /></div>
              </div>
              <div className="form-group">
                <label>Unidad</label>
                <select value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}>
                  {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Descripción</label><textarea rows={2} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción opcional..." /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
