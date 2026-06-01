import React, { useState, useEffect } from 'react';
import AtributosEspecificos from './AtributosEspecificos';
import { validarProducto, obtenerUnidadPorDefecto } from '../lib/validation';
import { UNIDADES_FERRETERIA, ATRIBUTOS_POR_CATEGORIA } from '../lib/constants';

/**
 * Formulario modal para crear o editar un producto de ferretería.
 *
 * @param {Object} props
 * @param {Object|null} props.producto - null = crear nuevo, Object = editar existente
 * @param {Array} props.categorias - Lista de categorías disponibles [{ id, nombre }]
 * @param {Array} props.productosExistentes - Productos registrados (para validar código duplicado)
 * @param {Function} props.onGuardar - async (payload) => void
 * @param {Function} props.onCancelar - () => void
 */
export default function ProductoForm({ producto, categorias, productosExistentes, onGuardar, onCancelar }) {
  const esEdicion = producto !== null && producto !== undefined;

  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    categoria_id: '',
    marca: '',
    precio_compra: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '',
    unidad: 'unidad',
  });

  const [atributos, setAtributos] = useState({});
  const [atributosConfig, setAtributosConfig] = useState([]);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Inicializar formulario cuando se abre para edición
  useEffect(() => {
    if (esEdicion && producto) {
      setForm({
        codigo: producto.codigo || '',
        nombre: producto.nombre || '',
        categoria_id: producto.categoria_id || '',
        marca: producto.marca || '',
        precio_compra: producto.precio_compra !== undefined ? String(producto.precio_compra) : '',
        precio_venta: producto.precio_venta !== undefined ? String(producto.precio_venta) : '',
        stock_actual: producto.stock_actual !== undefined ? String(producto.stock_actual) : '',
        stock_minimo: producto.stock_minimo !== undefined ? String(producto.stock_minimo) : '',
        unidad: producto.unidad || 'unidad',
      });

      // Cargar atributos existentes del producto
      if (producto.atributos) {
        setAtributos(producto.atributos);
      }

      // Cargar configuración de atributos de la categoría del producto
      if (producto.categoria_id) {
        const categoriaNombre = obtenerNombreCategoria(producto.categoria_id);
        if (categoriaNombre && ATRIBUTOS_POR_CATEGORIA[categoriaNombre]) {
          setAtributosConfig(ATRIBUTOS_POR_CATEGORIA[categoriaNombre]);
        }
      }
    }
    // eslint-disable-next-line
  }, [producto]);

  /**
   * Obtiene el nombre de una categoría a partir de su ID.
   */
  function obtenerNombreCategoria(categoriaId) {
    if (!categoriaId || !categorias) return null;
    const cat = categorias.find((c) => c.id === categoriaId);
    return cat ? cat.nombre : null;
  }

  /**
   * Maneja el cambio de categoría: actualiza unidad por defecto y atributos específicos.
   */
  function handleCategoriaChange(categoriaId) {
    setForm((prev) => ({ ...prev, categoria_id: categoriaId }));

    const categoriaNombre = categoriaId
      ? categorias.find((c) => c.id === categoriaId)?.nombre
      : null;

    // Pre-seleccionar unidad por defecto
    const unidadDefecto = obtenerUnidadPorDefecto(categoriaNombre);
    setForm((prev) => ({ ...prev, categoria_id: categoriaId, unidad: unidadDefecto }));

    // Cargar atributos específicos de la nueva categoría
    if (categoriaNombre && ATRIBUTOS_POR_CATEGORIA[categoriaNombre]) {
      setAtributosConfig(ATRIBUTOS_POR_CATEGORIA[categoriaNombre]);
    } else {
      setAtributosConfig([]);
    }

    // Resetear valores de atributos al cambiar categoría
    setAtributos({});

    // Limpiar errores de atributos previos
    setErrores((prev) => {
      const nuevosErrores = { ...prev };
      Object.keys(nuevosErrores).forEach((key) => {
        if (key.startsWith('atributo_')) {
          delete nuevosErrores[key];
        }
      });
      delete nuevosErrores.categoria_id;
      return nuevosErrores;
    });
  }

  /**
   * Maneja cambios en campos del formulario principal.
   */
  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    // Limpiar error del campo al modificarlo
    if (errores[campo]) {
      setErrores((prev) => {
        const nuevos = { ...prev };
        delete nuevos[campo];
        return nuevos;
      });
    }
  }

  /**
   * Maneja cambios en atributos específicos.
   */
  function handleAtributoChange(nombre, valor) {
    setAtributos((prev) => ({ ...prev, [nombre]: valor }));
    // Limpiar error del atributo al modificarlo
    const errorKey = `atributo_${nombre}`;
    if (errores[errorKey]) {
      setErrores((prev) => {
        const nuevos = { ...prev };
        delete nuevos[errorKey];
        return nuevos;
      });
    }
  }

  /**
   * Maneja el envío del formulario.
   */
  function handleSubmit(e) {
    e.preventDefault();

    const formData = {
      ...form,
      atributos,
    };

    const editandoId = esEdicion ? producto.id : null;
    const resultado = validarProducto(formData, productosExistentes, atributosConfig, editandoId);

    if (!resultado.valido) {
      setErrores(resultado.errores);
      return;
    }

    setErrores({});
    setGuardando(true);

    const payload = {
      nombre: form.nombre.trim(),
      categoria_id: form.categoria_id,
      marca: form.marca.trim(),
      precio_compra: Number(form.precio_compra),
      precio_venta: Number(form.precio_venta),
      stock_actual: Number(form.stock_actual),
      stock_minimo: Number(form.stock_minimo),
      unidad: form.unidad,
      atributos,
    };

    // Solo incluir código si es edición (en creación se autogenera)
    if (esEdicion) {
      payload.codigo = form.codigo.trim();
    }

    Promise.resolve(onGuardar(payload))
      .then(() => {
        setGuardando(false);
      })
      .catch(() => {
        setGuardando(false);
      });
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancelar()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button className="btn-icon" onClick={onCancelar} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Código (solo visible en edición, autogenerado en creación) */}
          {esEdicion && (
            <div className="form-group">
              <label htmlFor="producto-codigo">Código (SKU)</label>
              <input
                id="producto-codigo"
                type="text"
                value={form.codigo}
                disabled
                style={{ background: '#f5f0ea', color: '#6B5B4F', cursor: 'not-allowed' }}
              />
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                El código se genera automáticamente
              </span>
            </div>
          )}

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="producto-nombre">Nombre *</label>
            <input
              id="producto-nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Pintura vinilo blanco"
              maxLength={100}
              style={errores.nombre ? { borderColor: 'var(--red)' } : undefined}
            />
            {errores.nombre && (
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errores.nombre}</span>
            )}
          </div>

          {/* Categoría y Marca */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="producto-categoria">Categoría *</label>
              <select
                id="producto-categoria"
                value={form.categoria_id}
                onChange={(e) => handleCategoriaChange(e.target.value)}
                style={errores.categoria_id ? { borderColor: 'var(--red)' } : undefined}
              >
                <option value="">-- Seleccione categoría --</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {errores.categoria_id && (
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errores.categoria_id}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="producto-marca">Marca</label>
              <input
                id="producto-marca"
                type="text"
                value={form.marca}
                onChange={(e) => handleChange('marca', e.target.value)}
                placeholder="Pintuco, Corona..."
                maxLength={50}
                style={errores.marca ? { borderColor: 'var(--red)' } : undefined}
              />
              {errores.marca && (
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errores.marca}</span>
              )}
            </div>
          </div>

          {/* Precios */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="producto-precio-compra">Precio compra (COP) *</label>
              <input
                id="producto-precio-compra"
                type="number"
                value={form.precio_compra}
                onChange={(e) => handleChange('precio_compra', e.target.value)}
                min="1"
                max="999999999"
                placeholder="15000"
                style={errores.precio_compra ? { borderColor: 'var(--red)' } : undefined}
              />
              {errores.precio_compra && (
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errores.precio_compra}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="producto-precio-venta">Precio venta (COP) *</label>
              <input
                id="producto-precio-venta"
                type="number"
                value={form.precio_venta}
                onChange={(e) => handleChange('precio_venta', e.target.value)}
                min="1"
                max="999999999"
                placeholder="22000"
                style={errores.precio_venta ? { borderColor: 'var(--red)' } : undefined}
              />
              {errores.precio_venta && (
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errores.precio_venta}</span>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="producto-stock-actual">Stock actual *</label>
              <input
                id="producto-stock-actual"
                type="number"
                value={form.stock_actual}
                onChange={(e) => handleChange('stock_actual', e.target.value)}
                min="0"
                max="99999"
                step="1"
                placeholder="50"
                style={errores.stock_actual ? { borderColor: 'var(--red)' } : undefined}
              />
              {errores.stock_actual && (
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errores.stock_actual}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="producto-stock-minimo">Stock mínimo *</label>
              <input
                id="producto-stock-minimo"
                type="number"
                value={form.stock_minimo}
                onChange={(e) => handleChange('stock_minimo', e.target.value)}
                min="0"
                max="99999"
                step="1"
                placeholder="10"
                style={errores.stock_minimo ? { borderColor: 'var(--red)' } : undefined}
              />
              {errores.stock_minimo && (
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errores.stock_minimo}</span>
              )}
            </div>
          </div>

          {/* Unidad de medida */}
          <div className="form-group">
            <label htmlFor="producto-unidad">Unidad de medida *</label>
            <select
              id="producto-unidad"
              value={form.unidad}
              onChange={(e) => handleChange('unidad', e.target.value)}
              style={errores.unidad ? { borderColor: 'var(--red)' } : undefined}
            >
              {UNIDADES_FERRETERIA.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            {errores.unidad && (
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--red)', marginTop: '4px' }}>{errores.unidad}</span>
            )}
          </div>

          {/* Atributos específicos por categoría */}
          {atributosConfig.length > 0 && (
            <AtributosEspecificos
              categoriaId={form.categoria_id}
              atributosConfig={atributosConfig}
              valores={atributos}
              onChange={handleAtributoChange}
              errores={errores}
            />
          )}

          {/* Botones */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
