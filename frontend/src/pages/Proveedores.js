import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const { addToast, ToastContainer } = useToast()

  const FORM = { nombre: '', contacto: '', telefono: '', email: '', direccion: '', nit: '' }
  const [form, setForm] = useState(FORM)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    const { data } = await supabase.from('proveedores').select('*').eq('activo', true).order('nombre')
    setProveedores(data || [])
    setLoading(false)
  }

  function abrirNuevo() { setEditando(null); setForm(FORM); setModal(true) }
  function abrirEditar(p) { setEditando(p); setForm({ nombre: p.nombre, contacto: p.contacto || '', telefono: p.telefono || '', email: p.email || '', direccion: p.direccion || '', nit: p.nit || '' }); setModal(true) }

  async function guardar(e) {
    e.preventDefault()
    let error
    if (editando) {
      ({ error } = await supabase.from('proveedores').update(form).eq('id', editando.id))
    } else {
      ({ error } = await supabase.from('proveedores').insert(form))
    }
    if (error) { addToast('Error: ' + error.message, 'error'); return }
    addToast(editando ? 'Proveedor actualizado ✓' : 'Proveedor creado ✓', 'success')
    setModal(false)
    cargar()
  }

  async function eliminar(id) {
    if (!window.confirm('¿Desactivar este proveedor?')) return
    await supabase.from('proveedores').update({ activo: false }).eq('id', id)
    addToast('Proveedor desactivado', 'default')
    cargar()
  }

  return (
    <div>
      <ToastContainer />
      <div className="page-header">
        <div><h1>Proveedores</h1><p className="page-subtitle">{proveedores.length} proveedores activos</p></div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo proveedor</button>
      </div>

      {loading ? <div className="loading-state">Cargando...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {proveedores.map(p => (
            <div key={p.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3>{p.nombre}</h3>
                  {p.nit && <div style={{ fontSize: 11, color: '#A08060', marginTop: 2 }}>NIT: {p.nit}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-icon" onClick={() => abrirEditar(p)}>✏️</button>
                  <button className="btn-icon" onClick={() => eliminar(p.id)}>🗑️</button>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #F0E8DA', paddingTop: 12 }}>
                {p.contacto && <div style={{ fontSize: 13, marginBottom: 5 }}>👤 {p.contacto}</div>}
                {p.telefono && <div style={{ fontSize: 13, marginBottom: 5 }}>📞 {p.telefono}</div>}
                {p.email && <div style={{ fontSize: 13, marginBottom: 5 }}>✉️ <a href={`mailto:${p.email}`} style={{ color: '#8B5E3C' }}>{p.email}</a></div>}
                {p.direccion && <div style={{ fontSize: 12, color: '#A08060', marginTop: 6 }}>📍 {p.direccion}</div>}
              </div>
            </div>
          ))}
          {proveedores.length === 0 && <div className="empty-state">No hay proveedores registrados.</div>}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editando ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
              <button className="btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={guardar}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre empresa *</label>
                  <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>NIT</label>
                  <input value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} placeholder="900123456-1" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contacto</label>
                  <input value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="3001234567" />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
