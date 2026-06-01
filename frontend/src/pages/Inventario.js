import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useToast } from '../hooks/useToast'
import { useIsMobile } from '../hooks/useIsMobile'
import FiltrosProducto from '../components/FiltrosProducto'
import ProductoForm from '../components/ProductoForm'
import Paginacion from '../components/Paginacion'
import ConfirmDialog from '../components/ConfirmDialog'
import { esStockBajo } from '../lib/validation'
import { filtrarProductos, paginar, formatearPrecioCOP } from '../lib/filters'
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  desactivarProducto,
  reactivarProducto,
  listarCategorias,
  guardarAtributosProducto,
  registrarMovimientoStock,
} from '../lib/api'

export default function Inventario() {
  // Data state
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('')
  const [verDesactivados, setVerDesactivados] = useState(false)

  // Pagination state
  const [paginaActual, setPaginaActual] = useState(1)

  // Modal state
  const [mostrarForm, setMostrarForm] = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    titulo: '',
    mensaje: '',
    productoId: null,
  })

  const { addToast, ToastContainer } = useToast()
  const isMobile = useIsMobile()

  // Load data on mount and when toggling active/deactivated view
  useEffect(() => {
    cargarDatos()
    // eslint-disable-next-line
  }, [verDesactivados])

  async function cargarDatos() {
    setLoading(true)
    const [productosRes, categoriasRes] = await Promise.all([
      listarProductos(!verDesactivados ? true : false),
      listarCategorias(),
    ])

    if (productosRes.error) {
      addToast('Error al cargar productos: ' + productosRes.error.message, 'error')
    } else {
      setProductos(productosRes.data || [])
    }

    if (categoriasRes.error) {
      addToast('Error al cargar categorías: ' + categoriasRes.error.message, 'error')
    } else {
      setCategorias(categoriasRes.data || [])
    }

    setLoading(false)
  }

  // Extract unique brands from products
  const marcas = useMemo(() => {
    const marcasSet = new Set()
    productos.forEach((p) => {
      if (p.marca && p.marca.trim()) {
        marcasSet.add(p.marca)
      }
    })
    return Array.from(marcasSet).sort()
  }, [productos])

  // Apply filters and pagination
  const productosFiltrados = useMemo(() => {
    if (verDesactivados) {
      // For deactivated products, apply text/category/brand filters manually
      // since filtrarProductos only returns activo=true
      let resultado = productos
      if (busqueda) {
        const termino = busqueda.toLowerCase()
        resultado = resultado.filter((p) => {
          const nombre = (p.nombre || '').toLowerCase()
          const codigo = (p.codigo || '').toLowerCase()
          const marcaProd = (p.marca || '').toLowerCase()
          return nombre.includes(termino) || codigo.includes(termino) || marcaProd.includes(termino)
        })
      }
      if (categoriaSeleccionada) {
        resultado = resultado.filter((p) => p.categoria_id === categoriaSeleccionada)
      }
      if (marcaSeleccionada) {
        resultado = resultado.filter((p) => p.marca === marcaSeleccionada)
      }
      return resultado
    }
    return filtrarProductos(productos, {
      busqueda,
      categoriaId: categoriaSeleccionada,
      marca: marcaSeleccionada,
    })
  }, [productos, busqueda, categoriaSeleccionada, marcaSeleccionada, verDesactivados])

  const paginacion = useMemo(() => {
    return paginar(productosFiltrados, paginaActual, 20)
  }, [productosFiltrados, paginaActual])

  // Reset page when filters change
  const handleBusquedaChange = useCallback((valor) => {
    setBusqueda(valor)
    setPaginaActual(1)
  }, [])

  const handleCategoriaChange = useCallback((valor) => {
    setCategoriaSeleccionada(valor)
    setPaginaActual(1)
  }, [])

  const handleMarcaChange = useCallback((valor) => {
    setMarcaSeleccionada(valor)
    setPaginaActual(1)
  }, [])

  // CRUD operations
  function abrirNuevo() {
    setProductoEditar(null)
    setMostrarForm(true)
  }

  function abrirEditar(producto) {
    setProductoEditar(producto)
    setMostrarForm(true)
  }

  async function handleGuardar(payload) {
    const { atributos, ...datosProducto } = payload

    if (productoEditar) {
      // Editing existing product
      const stockAnterior = productoEditar.stock_actual
      const stockNuevo = datosProducto.stock_actual

      const { error } = await actualizarProducto(productoEditar.id, datosProducto)
      if (error) {
        addToast('Error al actualizar: ' + error.message, 'error')
        return
      }

      // Register stock movement if quantity changed
      if (stockAnterior !== stockNuevo) {
        await registrarMovimientoStock(productoEditar.id, stockAnterior, stockNuevo, null)
      }

      // Save category-specific attributes if present
      if (atributos && Object.keys(atributos).length > 0) {
        const atributosArray = Object.entries(atributos).map(([nombre, valor]) => ({
          categoria_atributo_id: nombre,
          valor: String(valor),
        }))
        await guardarAtributosProducto(productoEditar.id, atributosArray)
      }

      addToast('Producto actualizado ✓', 'success')
    } else {
      // Creating new product
      const { data, error } = await crearProducto(datosProducto)
      if (error) {
        addToast('Error al crear: ' + error.message, 'error')
        return
      }

      // Save category-specific attributes if present
      if (data && atributos && Object.keys(atributos).length > 0) {
        const atributosArray = Object.entries(atributos).map(([nombre, valor]) => ({
          categoria_atributo_id: nombre,
          valor: String(valor),
        }))
        await guardarAtributosProducto(data.id, atributosArray)
      }

      addToast('Producto creado ✓', 'success')
    }

    setMostrarForm(false)
    setProductoEditar(null)
    cargarDatos()
  }

  function confirmarDesactivar(producto) {
    setConfirmDialog({
      visible: true,
      titulo: 'Desactivar producto',
      mensaje: `¿Está seguro de desactivar "${producto.nombre}" (${producto.codigo})? El producto no aparecerá en el inventario activo pero podrá reactivarse después.`,
      productoId: producto.id,
    })
  }

  async function handleDesactivar() {
    const { productoId } = confirmDialog
    setConfirmDialog({ visible: false, titulo: '', mensaje: '', productoId: null })

    const { error } = await desactivarProducto(productoId)
    if (error) {
      addToast('Error al desactivar: ' + error.message, 'error')
      return
    }

    addToast('Producto desactivado', 'success')
    cargarDatos()
  }

  async function handleReactivar(producto) {
    const { error } = await reactivarProducto(producto.id)
    if (error) {
      addToast('Error al reactivar: ' + error.message, 'error')
      return
    }

    addToast('Producto reactivado ✓', 'success')
    cargarDatos()
  }

  function toggleVerDesactivados() {
    setVerDesactivados((prev) => !prev)
    setPaginaActual(1)
    setBusqueda('')
    setCategoriaSeleccionada('')
    setMarcaSeleccionada('')
  }

  // Get category name by ID
  function obtenerNombreCategoria(categoriaId) {
    if (!categoriaId) return '—'
    const cat = categorias.find((c) => c.id === categoriaId)
    return cat ? cat.nombre : '—'
  }

  return (
    <div>
      <ToastContainer />

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Inventario</h1>
          <p className="page-subtitle">
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}{' '}
            {verDesactivados ? 'desactivados' : 'activos'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${verDesactivados ? 'btn-danger' : 'btn-secondary'}`}
            onClick={toggleVerDesactivados}
          >
            {verDesactivados ? '📋 Ver activos' : '🗃️ Ver desactivados'}
          </button>
          {!verDesactivados && (
            <button className="btn btn-primary" onClick={abrirNuevo}>
              + Nuevo producto
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <FiltrosProducto
        busqueda={busqueda}
        onBusquedaChange={handleBusquedaChange}
        categoriaSeleccionada={categoriaSeleccionada}
        onCategoriaChange={handleCategoriaChange}
        marcaSeleccionada={marcaSeleccionada}
        onMarcaChange={handleMarcaChange}
        categorias={categorias}
        marcas={marcas}
      />

      {/* Content */}
      {loading ? (
        <div className="loading-state">Cargando inventario...</div>
      ) : paginacion.items.length === 0 ? (
        <div className="empty-state">No se encontraron resultados</div>
      ) : isMobile ? (
        /* ── Card view (mobile ≤ 768px) ── */
        <div className="card-list">
          {paginacion.items.map((p) => {
            const stockBajo = esStockBajo(p)
            return (
              <div key={p.id} className={`product-card ${stockBajo ? 'product-card--alert' : ''}`}>
                <div className="product-card__header">
                  <div>
                    <span className="product-card__code">{p.codigo}</span>
                    <div className="product-card__name">{p.nombre}</div>
                    <div className="product-card__cat">{obtenerNombreCategoria(p.categoria_id)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge ${stockBajo ? 'badge-danger' : 'badge-success'}`}>
                      {stockBajo ? '⚠ Bajo' : '✓ OK'}
                    </span>
                    {verDesactivados ? (
                      <button className="btn-icon" onClick={() => handleReactivar(p)} title="Reactivar">
                        🔄
                      </button>
                    ) : (
                      <>
                        <button className="btn-icon" onClick={() => abrirEditar(p)} title="Editar">
                          ✏️
                        </button>
                        <button className="btn-icon" onClick={() => confirmarDesactivar(p)} title="Desactivar">
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="product-card__body">
                  <div className="product-card__stat">
                    <span className="product-card__stat-label">P. Venta</span>
                    <span className="product-card__stat-val">{formatearPrecioCOP(p.precio_venta)}</span>
                  </div>
                  <div className="product-card__stat">
                    <span className="product-card__stat-label">Stock</span>
                    <span
                      className="product-card__stat-val"
                      style={{ color: stockBajo ? '#C0392B' : '#2E7D52', fontWeight: 700 }}
                    >
                      {p.stock_actual} {p.unidad}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Table view (desktop > 768px) ── */
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>P. Compra</th>
                <th>P. Venta</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Estado</th>
                <th>Registrado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginacion.items.map((p) => {
                const stockBajo = esStockBajo(p)
                return (
                  <tr key={p.id} className={stockBajo ? 'alert-row' : ''}>
                    <td>
                      <code
                        style={{
                          fontSize: 11,
                          background: '#F0EBE3',
                          padding: '2px 7px',
                          borderRadius: 5,
                        }}
                      >
                        {p.codigo}
                      </code>
                    </td>
                    <td>
                      <strong>{p.nombre}</strong>
                    </td>
                    <td>{obtenerNombreCategoria(p.categoria_id)}</td>
                    <td style={{ fontSize: 12 }}>{p.marca || '—'}</td>
                    <td>{formatearPrecioCOP(p.precio_compra)}</td>
                    <td>{formatearPrecioCOP(p.precio_venta)}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: stockBajo ? '#C0392B' : '#2E7D52' }}>
                        {p.stock_actual} {p.unidad}
                      </span>
                    </td>
                    <td style={{ color: '#A08060' }}>
                      {p.stock_minimo} {p.unidad}
                    </td>
                    <td>
                      <span className={`badge ${stockBajo ? 'badge-danger' : 'badge-success'}`}>
                        {stockBajo ? '⚠ Bajo' : '✓ Normal'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: '#A08060' }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {verDesactivados ? (
                          <button
                            className="btn-icon"
                            onClick={() => handleReactivar(p)}
                            title="Reactivar"
                          >
                            🔄
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn-icon"
                              onClick={() => abrirEditar(p)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => confirmarDesactivar(p)}
                              title="Desactivar"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination - show when more than 20 products */}
      {paginacion.totalPaginas > 1 && (
        <Paginacion
          paginaActual={paginacion.paginaActual}
          totalPaginas={paginacion.totalPaginas}
          onCambiarPagina={setPaginaActual}
        />
      )}

      {/* Product form modal */}
      {mostrarForm && (
        <ProductoForm
          producto={productoEditar}
          categorias={categorias}
          productosExistentes={productos}
          onGuardar={handleGuardar}
          onCancelar={() => {
            setMostrarForm(false)
            setProductoEditar(null)
          }}
        />
      )}

      {/* Confirm dialog for deactivation */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        titulo={confirmDialog.titulo}
        mensaje={confirmDialog.mensaje}
        onConfirmar={handleDesactivar}
        onCancelar={() =>
          setConfirmDialog({ visible: false, titulo: '', mensaje: '', productoId: null })
        }
      />
    </div>
  )
}
