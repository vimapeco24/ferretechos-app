import { supabase } from './supabase'

// ============================================================
// PRODUCTOS
// ============================================================

/**
 * Lista productos filtrados por estado activo/inactivo.
 * @param {boolean} activos - true para activos, false para inactivos
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function listarProductos(activos = true) {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', activos)
      .order('nombre')

    if (error) {
      return { data: null, error: { message: error.message || 'Error al listar productos' } }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al listar productos' } }
  }
}

/**
 * Genera un código SKU automático con formato FER-XXXXX.
 * Consulta el último código generado y lo incrementa.
 * @returns {Promise<string>}
 */
export async function generarCodigoSKU() {
  try {
    const { data } = await supabase
      .from('productos')
      .select('codigo')
      .order('created_at', { ascending: false })
      .limit(1)

    let siguiente = 1
    if (data && data.length > 0) {
      const ultimo = data[0].codigo
      const match = ultimo.match(/FER-(\d+)/)
      if (match) {
        siguiente = parseInt(match[1], 10) + 1
      } else {
        // Si el último código no sigue el patrón, contar todos los productos
        const { data: todos } = await supabase.from('productos').select('id')
        siguiente = (todos ? todos.length : 0) + 1
      }
    }

    return `FER-${String(siguiente).padStart(5, '0')}`
  } catch {
    // Fallback: usar timestamp
    return `FER-${Date.now().toString().slice(-5)}`
  }
}

/**
 * Crea un nuevo producto con código SKU autogenerado.
 * @param {Object} payload - Datos del producto (sin codigo, se genera automáticamente)
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function crearProducto(payload) {
  try {
    // Generar código SKU automático si no viene en el payload
    if (!payload.codigo) {
      payload.codigo = await generarCodigoSKU()
    }

    const { data, error } = await supabase
      .from('productos')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return { data: null, error: { message: error.message || 'Error al crear producto' } }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al crear producto' } }
  }
}

/**
 * Actualiza campos de un producto existente.
 * @param {string} id - ID del producto
 * @param {Object} payload - Campos a actualizar
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function actualizarProducto(id, payload) {
  try {
    const { data, error } = await supabase
      .from('productos')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { data: null, error: { message: error.message || 'Error al actualizar producto' } }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al actualizar producto' } }
  }
}

/**
 * Desactiva un producto (soft-delete).
 * @param {string} id - ID del producto
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function desactivarProducto(id) {
  try {
    const { data, error } = await supabase
      .from('productos')
      .update({ activo: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { data: null, error: { message: error.message || 'Error al desactivar producto' } }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al desactivar producto' } }
  }
}

/**
 * Reactiva un producto desactivado.
 * @param {string} id - ID del producto
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function reactivarProducto(id) {
  try {
    const { data, error } = await supabase
      .from('productos')
      .update({ activo: true, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { data: null, error: { message: error.message || 'Error al reactivar producto' } }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al reactivar producto' } }
  }
}

// ============================================================
// CATEGORÍAS
// ============================================================

/**
 * Lista todas las categorías ordenadas por nombre.
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function listarCategorias() {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre')

    if (error) {
      return { data: null, error: { message: error.message || 'Error al listar categorías' } }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al listar categorías' } }
  }
}

/**
 * Crea una nueva categoría.
 * @param {Object} payload - { nombre, descripcion }
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function crearCategoria(payload) {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return { data: null, error: { message: error.message || 'Error al crear categoría' } }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al crear categoría' } }
  }
}

/**
 * Actualiza una categoría existente.
 * @param {string} id - ID de la categoría
 * @param {Object} payload - Campos a actualizar
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function actualizarCategoria(id, payload) {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .update(payload)
      .eq('id', id)

    if (error) {
      return { data: null, error: { message: error.message || 'Error al actualizar categoría' } }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al actualizar categoría' } }
  }
}

/**
 * Elimina una categoría, verificando primero que no tenga productos asociados.
 * Rechaza la operación si existen productos (activos o inactivos) en la categoría.
 * @param {string} id - ID de la categoría
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function eliminarCategoria(id) {
  try {
    // Verificar si hay productos asociados (activos o inactivos)
    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('id')
      .eq('categoria_id', id)

    if (errorProductos) {
      return { data: null, error: { message: errorProductos.message || 'Error al verificar productos asociados' } }
    }

    if (productos && productos.length > 0) {
      return {
        data: null,
        error: {
          message: `No se puede eliminar: ${productos.length} producto${productos.length > 1 ? 's' : ''} asociado${productos.length > 1 ? 's' : ''}`,
          code: 'CATEGORIA_CON_PRODUCTOS',
          count: productos.length
        }
      }
    }

    // Sin productos asociados, marcar categoría como eliminada (soft-delete)
    const { data, error } = await supabase
      .from('categorias')
      .update({ activo: false })
      .eq('id', id)

    if (error) {
      return { data: null, error: { message: error.message || 'Error al eliminar categoría' } }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al eliminar categoría' } }
  }
}

// ============================================================
// ATRIBUTOS DE CATEGORÍA
// ============================================================

/**
 * Obtiene los atributos configurados para una categoría.
 * @param {string} categoriaId - ID de la categoría
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function obtenerAtributosCategoria(categoriaId) {
  try {
    const { data, error } = await supabase
      .from('categoria_atributos')
      .select('*')
      .eq('categoria_id', categoriaId)
      .order('orden')

    if (error) {
      return { data: null, error: { message: error.message || 'Error al obtener atributos de categoría' } }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al obtener atributos' } }
  }
}

// ============================================================
// ATRIBUTOS DE PRODUCTO
// ============================================================

/**
 * Guarda o actualiza los atributos específicos de un producto.
 * Recibe un objeto con los valores de atributos y los persiste.
 * @param {string} productoId - ID del producto
 * @param {Array<{categoria_atributo_id: string, valor: string}>} atributos - Atributos a guardar
 * @returns {Promise<{data: Array|null, error: Object|null}>}
 */
export async function guardarAtributosProducto(productoId, atributos) {
  try {
    const resultados = []

    for (const atributo of atributos) {
      // Intentar actualizar primero (si ya existe)
      const { data: existente, error: errorBusqueda } = await supabase
        .from('producto_atributos')
        .select('id')
        .eq('producto_id', productoId)
        .eq('categoria_atributo_id', atributo.categoria_atributo_id)
        .single()

      if (errorBusqueda && !existente) {
        // No existe, crear nuevo
        const { data, error } = await supabase
          .from('producto_atributos')
          .insert({
            producto_id: productoId,
            categoria_atributo_id: atributo.categoria_atributo_id,
            valor: atributo.valor
          })
          .select()
          .single()

        if (error) {
          return { data: null, error: { message: error.message || 'Error al guardar atributo de producto' } }
        }
        resultados.push(data)
      } else if (existente) {
        // Ya existe, actualizar
        const { data, error } = await supabase
          .from('producto_atributos')
          .update({ valor: atributo.valor })
          .eq('id', existente.id)

        if (error) {
          return { data: null, error: { message: error.message || 'Error al actualizar atributo de producto' } }
        }
        resultados.push(data)
      }
    }

    return { data: resultados, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al guardar atributos de producto' } }
  }
}

// ============================================================
// MOVIMIENTOS DE STOCK
// ============================================================

/**
 * Registra un movimiento de stock para un producto.
 * @param {string} productoId - ID del producto
 * @param {number} cantidadAnterior - Stock antes del cambio
 * @param {number} cantidadNueva - Stock después del cambio
 * @param {string|null} usuarioId - Identificador del usuario que realiza el cambio
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function registrarMovimientoStock(productoId, cantidadAnterior, cantidadNueva, usuarioId) {
  try {
    const { data, error } = await supabase
      .from('movimientos_stock')
      .insert({
        producto_id: productoId,
        cantidad_anterior: cantidadAnterior,
        cantidad_nueva: cantidadNueva,
        tipo: 'ajuste_manual',
        usuario_id: usuarioId || null
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: { message: error.message || 'Error al registrar movimiento de stock' } }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: { message: err.message || 'Error de red al registrar movimiento de stock' } }
  }
}
