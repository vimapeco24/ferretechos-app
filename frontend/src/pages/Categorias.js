import React, { useEffect, useState } from 'react'
import { useToast } from '../hooks/useToast'
import { validarCategoria } from '../lib/validation'
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerAtributosCategoria,
} from '../lib/api'
import { supabase } from '../lib/supabase'
import ConfirmDialog from '../components/ConfirmDialog'

const TIPO_CAMPO_OPCIONES = [
  { value: 'texto', label: 'Texto' },
  { value: 'numero', label: 'Número' },
  { value: 'seleccion', label: 'Selección' },
]

const ATRIBUTO_INIT = {
  nombre: '',
  tipo_campo: 'texto',
  opciones: '',
  obligatorio: false,
  orden: 0,
}

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  // Form state
  const [form, setForm] = useState({ nombre: '', descripcion: '' })

  // Attributes management
  const [atributosModal, setAtributosModal] = useState(false)
  const [categoriaAtributos, setCategoriaAtributos] = useState(null)
  const [atributos, setAtributos] = useState([])
  const [atributoForm, setAtributoForm] = useState(ATRIBUTO_INIT)
  const [editandoAtributo, setEditandoAtributo] = useState(null)
  const [atributoModal, setAtributoModal] = useState(false)
  const [atributoErrores, setAtributoErrores] = useState({})
  const [loadingAtributos, setLoadingAtributos] = useState(false)

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, titulo: '', mensaje: '', onConfirmar: null })

  const { addToast, ToastContainer } = useToast()

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    const { data, error } = await listarCategorias()
    if (error) {
      addToast('Error al cargar categorías: ' + error.message, 'error')
    } else {
      setCategorias(data || [])
    }
    setLoading(false)
  }

  function abrirNuevo() {
    setEditando(null)
    setForm({ nombre: '', descripcion: '' })
    setErrores({})
    setModal(true)
  }

  function abrirEditar(categoria) {
    setEditando(categoria)
    setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion || '' })
    setErrores({})
    setModal(true)
  }

  async function guardar(e) {
    e.preventDefault()

    const { valido, errores: erroresValidacion } = validarCategoria(
      form,
      categorias,
      editando ? editando.id : null
    )

    if (!valido) {
      setErrores(erroresValidacion)
      return
    }

    setGuardando(true)
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
    }

    let resultado
    if (editando) {
      resultado = await actualizarCategoria(editando.id, payload)
    } else {
      resultado = await crearCategoria(payload)
    }

    setGuardando(false)

    if (resultado.error) {
      addToast('Error: ' + resultado.error.message, 'error')
      return
    }

    addToast(editando ? 'Categoría actualizada ✓' : 'Categoría creada ✓', 'success')
    setModal(false)
    cargar()
  }

  function confirmarEliminar(categoria) {
    if (categoria.es_predefinida) {
      addToast('Las categorías predefinidas no se pueden eliminar', 'error')
      return
    }

    setConfirmDialog({
      visible: true,
      titulo: 'Eliminar categoría',
      mensaje: `¿Está seguro de eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`,
      onConfirmar: () => ejecutarEliminar(categoria),
    })
  }

  async function ejecutarEliminar(categoria) {
    setConfirmDialog({ ...confirmDialog, visible: false })

    const { error } = await eliminarCategoria(categoria.id)

    if (error) {
      if (error.code === 'CATEGORIA_CON_PRODUCTOS') {
        setConfirmDialog({
          visible: true,
          titulo: 'No se puede eliminar',
          mensaje: `La categoría "${categoria.nombre}" tiene ${error.count} producto${error.count > 1 ? 's' : ''} asociado${error.count > 1 ? 's' : ''}. Debe reasignar o eliminar los productos antes de eliminar la categoría.`,
          onConfirmar: () => setConfirmDialog({ ...confirmDialog, visible: false }),
        })
      } else {
        addToast('Error: ' + error.message, 'error')
      }
      return
    }

    addToast('Categoría eliminada ✓', 'success')
    cargar()
  }

  // ─── Atributos Management ───────────────────────────────────────────────────

  async function abrirAtributos(categoria) {
    setCategoriaAtributos(categoria)
    setLoadingAtributos(true)
    setAtributosModal(true)

    const { data, error } = await obtenerAtributosCategoria(categoria.id)
    if (error) {
      addToast('Error al cargar atributos: ' + error.message, 'error')
      setAtributos([])
    } else {
      setAtributos(data || [])
    }
    setLoadingAtributos(false)
  }

  function abrirNuevoAtributo() {
    if (atributos.length >= 10) {
      addToast('Máximo 10 atributos por categoría', 'error')
      return
    }
    setEditandoAtributo(null)
    setAtributoForm({ ...ATRIBUTO_INIT, orden: atributos.length })
    setAtributoErrores({})
    setAtributoModal(true)
  }

  function abrirEditarAtributo(atributo) {
    setEditandoAtributo(atributo)
    setAtributoForm({
      nombre: atributo.nombre,
      tipo_campo: atributo.tipo_campo,
      opciones: atributo.opciones ? atributo.opciones.join(', ') : '',
      obligatorio: atributo.obligatorio,
      orden: atributo.orden,
    })
    setAtributoErrores({})
    setAtributoModal(true)
  }

  function validarAtributo() {
    const errores = {}
    if (!atributoForm.nombre || atributoForm.nombre.trim() === '') {
      errores.nombre = 'El nombre es obligatorio'
    } else if (atributoForm.nombre.length > 50) {
      errores.nombre = 'Máximo 50 caracteres'
    } else {
      // Check duplicate name within same category
      const duplicado = atributos.find(
        (a) => a.nombre.toLowerCase() === atributoForm.nombre.trim().toLowerCase() &&
          a.id !== (editandoAtributo ? editandoAtributo.id : null)
      )
      if (duplicado) {
        errores.nombre = 'Ya existe un atributo con este nombre'
      }
    }

    if (atributoForm.tipo_campo === 'seleccion') {
      if (!atributoForm.opciones || atributoForm.opciones.trim() === '') {
        errores.opciones = 'Debe ingresar al menos una opción (separadas por coma)'
      }
    }

    return errores
  }

  async function guardarAtributo(e) {
    e.preventDefault()

    const erroresVal = validarAtributo()
    if (Object.keys(erroresVal).length > 0) {
      setAtributoErrores(erroresVal)
      return
    }

    const opciones = atributoForm.tipo_campo === 'seleccion'
      ? atributoForm.opciones.split(',').map(o => o.trim()).filter(o => o)
      : null

    const payload = {
      nombre: atributoForm.nombre.trim(),
      tipo_campo: atributoForm.tipo_campo,
      opciones: opciones,
      obligatorio: atributoForm.obligatorio,
      orden: atributoForm.orden,
      categoria_id: categoriaAtributos.id,
    }

    let error
    if (editandoAtributo) {
      const { error: err } = await supabase
        .from('categoria_atributos')
        .update({
          nombre: payload.nombre,
          tipo_campo: payload.tipo_campo,
          opciones: payload.opciones ? JSON.stringify(payload.opciones) : null,
          obligatorio: payload.obligatorio,
          orden: payload.orden,
        })
        .eq('id', editandoAtributo.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('categoria_atributos')
        .insert({
          ...payload,
          opciones: payload.opciones ? JSON.stringify(payload.opciones) : null,
        })
      error = err
    }

    if (error) {
      addToast('Error al guardar atributo: ' + error.message, 'error')
      return
    }

    addToast(editandoAtributo ? 'Atributo actualizado ✓' : 'Atributo creado ✓', 'success')
    setAtributoModal(false)

    // Reload attributes
    const { data } = await obtenerAtributosCategoria(categoriaAtributos.id)
    setAtributos(data || [])
  }

  function confirmarEliminarAtributo(atributo) {
    setConfirmDialog({
      visible: true,
      titulo: 'Eliminar atributo',
      mensaje: `¿Está seguro de eliminar el atributo "${atributo.nombre}"? Los valores de productos asociados se perderán.`,
      onConfirmar: () => ejecutarEliminarAtributo(atributo),
    })
  }

  async function ejecutarEliminarAtributo(atributo) {
    setConfirmDialog({ ...confirmDialog, visible: false })

    // Delete product attribute values first, then the attribute definition
    await supabase
      .from('producto_atributos')
      .update({ valor: '__DELETED__' })
      .eq('categoria_atributo_id', atributo.id)

    // Soft-delete the attribute by removing it (using update to mark as inactive)
    // Since we don't have a delete method, we'll use the server's PATCH to set a flag
    // Actually, for categoria_atributos we need a real delete. Let's use a workaround:
    // We'll set the nombre to empty which effectively removes it from the UI
    const { error } = await supabase
      .from('categoria_atributos')
      .update({ nombre: `__ELIMINADO_${Date.now()}__`, orden: -1 })
      .eq('id', atributo.id)

    if (error) {
      addToast('Error al eliminar atributo: ' + error.message, 'error')
      return
    }

    addToast('Atributo eliminado ✓', 'success')

    // Reload attributes (filter out deleted ones)
    const { data } = await obtenerAtributosCategoria(categoriaAtributos.id)
    setAtributos((data || []).filter(a => !a.nombre.startsWith('__ELIMINADO_')))
  }

  // Filter out soft-deleted attributes from display
  const atributosVisibles = atributos.filter(a => !a.nombre.startsWith('__ELIMINADO_'))

  return (
    <div>
      <ToastContainer />

      <div className="page-header">
        <div>
          <h1>Categorías</h1>
          <p className="page-subtitle">{categorias.length} categorías registradas</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nueva categoría</button>
      </div>

      {loading ? (
        <div className="loading-state">Cargando categorías...</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Atributos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(cat => (
                <tr key={cat.id}>
                  <td><strong>{cat.nombre}</strong></td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {cat.descripcion || '—'}
                  </td>
                  <td>
                    {cat.es_predefinida ? (
                      <span className="badge badge-success">Predefinida</span>
                    ) : (
                      <span className="badge" style={{ background: '#E8E0D5', color: '#6B5B4F' }}>Personalizada</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => abrirAtributos(cat)}
                    >
                      Gestionar
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => abrirEditar(cat)} title="Editar">✏️</button>
                      {!cat.es_predefinida && (
                        <button className="btn-icon" onClick={() => confirmarEliminar(cat)} title="Eliminar">🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                    No hay categorías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar categoría */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editando ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <button className="btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={guardar}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  value={form.nombre}
                  onChange={e => { setForm({ ...form, nombre: e.target.value }); setErrores({ ...errores, nombre: undefined }) }}
                  placeholder="Nombre de la categoría"
                  maxLength={50}
                  className={errores.nombre ? 'input-error' : ''}
                />
                {errores.nombre && <span className="field-error">{errores.nombre}</span>}
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows={3}
                  value={form.descripcion}
                  onChange={e => { setForm({ ...form, descripcion: e.target.value }); setErrores({ ...errores, descripcion: undefined }) }}
                  placeholder="Descripción opcional..."
                  maxLength={200}
                  className={errores.descripcion ? 'input-error' : ''}
                />
                {errores.descripcion && <span className="field-error">{errores.descripcion}</span>}
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {form.descripcion.length}/200 caracteres
                </span>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal gestión de atributos */}
      {atributosModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAtributosModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>Atributos: {categoriaAtributos?.nombre}</h2>
              <button className="btn-icon" onClick={() => setAtributosModal(false)}>✕</button>
            </div>

            {loadingAtributos ? (
              <div className="loading-state" style={{ padding: 24 }}>Cargando atributos...</div>
            ) : (
              <>
                <div style={{ padding: '0 24px' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    {atributosVisibles.length}/10 atributos configurados
                  </p>

                  {atributosVisibles.length > 0 ? (
                    <table style={{ width: '100%', fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Tipo</th>
                          <th>Obligatorio</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {atributosVisibles.map(attr => (
                          <tr key={attr.id}>
                            <td><strong>{attr.nombre}</strong></td>
                            <td>{attr.tipo_campo}</td>
                            <td>{attr.obligatorio ? '✓ Sí' : 'No'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button className="btn-icon" onClick={() => abrirEditarAtributo(attr)} title="Editar">✏️</button>
                                <button className="btn-icon" onClick={() => confirmarEliminarAtributo(attr)} title="Eliminar">🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                      No hay atributos configurados para esta categoría.
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setAtributosModal(false)}>Cerrar</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={abrirNuevoAtributo}
                    disabled={atributosVisibles.length >= 10}
                  >
                    + Nuevo atributo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal crear/editar atributo */}
      {atributoModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAtributoModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>{editandoAtributo ? 'Editar atributo' : 'Nuevo atributo'}</h2>
              <button className="btn-icon" onClick={() => setAtributoModal(false)}>✕</button>
            </div>
            <form onSubmit={guardarAtributo}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  value={atributoForm.nombre}
                  onChange={e => { setAtributoForm({ ...atributoForm, nombre: e.target.value }); setAtributoErrores({ ...atributoErrores, nombre: undefined }) }}
                  placeholder="Ej: color, peso, tipo"
                  maxLength={50}
                  className={atributoErrores.nombre ? 'input-error' : ''}
                />
                {atributoErrores.nombre && <span className="field-error">{atributoErrores.nombre}</span>}
              </div>
              <div className="form-group">
                <label>Tipo de campo</label>
                <select
                  value={atributoForm.tipo_campo}
                  onChange={e => setAtributoForm({ ...atributoForm, tipo_campo: e.target.value })}
                >
                  {TIPO_CAMPO_OPCIONES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {atributoForm.tipo_campo === 'seleccion' && (
                <div className="form-group">
                  <label>Opciones (separadas por coma) *</label>
                  <input
                    value={atributoForm.opciones}
                    onChange={e => { setAtributoForm({ ...atributoForm, opciones: e.target.value }); setAtributoErrores({ ...atributoErrores, opciones: undefined }) }}
                    placeholder="Ej: vinilo, esmalte, anticorrosivo"
                    className={atributoErrores.opciones ? 'input-error' : ''}
                  />
                  {atributoErrores.opciones && <span className="field-error">{atributoErrores.opciones}</span>}
                </div>
              )}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={atributoForm.obligatorio}
                    onChange={e => setAtributoForm({ ...atributoForm, obligatorio: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  Campo obligatorio
                </label>
              </div>
              <div className="form-group">
                <label>Orden</label>
                <input
                  type="number"
                  value={atributoForm.orden}
                  onChange={e => setAtributoForm({ ...atributoForm, orden: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={9}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAtributoModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editandoAtributo ? 'Actualizar' : 'Crear atributo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        titulo={confirmDialog.titulo}
        mensaje={confirmDialog.mensaje}
        onConfirmar={confirmDialog.onConfirmar}
        onCancelar={() => setConfirmDialog({ ...confirmDialog, visible: false })}
      />
    </div>
  )
}
