import { UNIDAD_POR_DEFECTO } from './constants.js';

/**
 * Valida un formulario de producto completo.
 * @param {Object} form - Datos del formulario
 * @param {Array} productosExistentes - Productos ya registrados (para código duplicado)
 * @param {Array} atributosConfig - Configuración de atributos de la categoría
 * @param {String|null} editandoId - ID del producto en edición (null si es nuevo)
 * @returns {{ valido: boolean, errores: Object }}
 */
export function validarProducto(form, productosExistentes = [], atributosConfig = [], editandoId = null) {
  const errores = {};

  // Código: solo validar si se proporciona (en creación se autogenera)
  if (form.codigo !== undefined && form.codigo !== null && String(form.codigo).trim() !== '') {
    if (String(form.codigo).length > 20) {
      errores.codigo = 'Máximo 20 caracteres';
    }
    // Código único (excluyendo el producto en edición)
    if (!errores.codigo && productosExistentes.length > 0) {
      const codigoDuplicado = productosExistentes.find(
        (p) => p.codigo === String(form.codigo).trim() && p.id !== editandoId
      );
      if (codigoDuplicado) {
        errores.codigo = `Ya existe un producto con el código '${form.codigo}'`;
      }
    }
  }

  if (!form.nombre || String(form.nombre).trim() === '') {
    errores.nombre = 'Este campo es obligatorio';
  } else if (String(form.nombre).length > 100) {
    errores.nombre = 'Máximo 100 caracteres';
  }

  if (!form.categoria_id || String(form.categoria_id).trim() === '') {
    errores.categoria_id = 'Este campo es obligatorio';
  }

  // Precio de compra: rango [1, 999.999.999]
  const precioCompra = Number(form.precio_compra);
  if (form.precio_compra === '' || form.precio_compra === null || form.precio_compra === undefined) {
    errores.precio_compra = 'Este campo es obligatorio';
  } else if (isNaN(precioCompra) || precioCompra < 1 || precioCompra > 999999999) {
    errores.precio_compra = 'El valor debe estar entre 1 y 999.999.999';
  }

  // Precio de venta: rango [1, 999.999.999]
  const precioVenta = Number(form.precio_venta);
  if (form.precio_venta === '' || form.precio_venta === null || form.precio_venta === undefined) {
    errores.precio_venta = 'Este campo es obligatorio';
  } else if (isNaN(precioVenta) || precioVenta < 1 || precioVenta > 999999999) {
    errores.precio_venta = 'El valor debe estar entre 1 y 999.999.999';
  }

  // Precio venta >= precio compra
  if (!errores.precio_compra && !errores.precio_venta && precioVenta < precioCompra) {
    errores.precio_venta = 'El precio de venta debe ser mayor o igual al precio de compra';
  }

  // Stock actual: entero en [0, 99.999]
  const stockActual = Number(form.stock_actual);
  if (form.stock_actual === '' || form.stock_actual === null || form.stock_actual === undefined) {
    errores.stock_actual = 'Este campo es obligatorio';
  } else if (isNaN(stockActual) || !Number.isInteger(stockActual) || stockActual < 0 || stockActual > 99999) {
    errores.stock_actual = 'El valor debe estar entre 0 y 99.999';
  }

  // Stock mínimo: entero en [0, 99.999]
  const stockMinimo = Number(form.stock_minimo);
  if (form.stock_minimo === '' || form.stock_minimo === null || form.stock_minimo === undefined) {
    errores.stock_minimo = 'Este campo es obligatorio';
  } else if (isNaN(stockMinimo) || !Number.isInteger(stockMinimo) || stockMinimo < 0 || stockMinimo > 99999) {
    errores.stock_minimo = 'El valor debe estar entre 0 y 99.999';
  }

  // Unidad de medida obligatoria
  if (!form.unidad || String(form.unidad).trim() === '') {
    errores.unidad = 'Este campo es obligatorio';
  }

  // Marca: máximo 50 caracteres (campo opcional)
  if (form.marca && String(form.marca).length > 50) {
    errores.marca = 'Máximo 50 caracteres';
  }

  // Validación de atributos específicos
  if (atributosConfig && atributosConfig.length > 0) {
    const atributos = form.atributos || {};

    atributosConfig.forEach((atributo) => {
      const valor = atributos[atributo.nombre];

      // Atributos obligatorios no vacíos
      if (atributo.obligatorio) {
        if (valor === undefined || valor === null || String(valor).trim() === '') {
          errores[`atributo_${atributo.nombre}`] = 'Este campo es obligatorio';
        }
      }

      // Atributos numéricos > 0 (solo si tienen valor)
      if (atributo.tipo_campo === 'numero' && valor !== undefined && valor !== null && String(valor).trim() !== '') {
        const numVal = Number(valor);
        if (isNaN(numVal) || numVal <= 0) {
          errores[`atributo_${atributo.nombre}`] = 'El valor debe ser mayor a cero';
        }
      }
    });
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  };
}

/**
 * Valida un formulario de categoría.
 * @param {Object} form - { nombre, descripcion, atributos }
 * @param {Array} categoriasExistentes - Categorías ya registradas
 * @param {String|null} editandoId - ID de la categoría en edición
 * @returns {{ valido: boolean, errores: Object }}
 */
export function validarCategoria(form, categoriasExistentes = [], editandoId = null) {
  const errores = {};

  // Nombre obligatorio, máximo 50 caracteres
  if (!form.nombre || String(form.nombre).trim() === '') {
    errores.nombre = 'Este campo es obligatorio';
  } else if (String(form.nombre).length > 50) {
    errores.nombre = 'Máximo 50 caracteres';
  }

  // Descripción máximo 200 caracteres (campo opcional)
  if (form.descripcion && String(form.descripcion).length > 200) {
    errores.descripcion = 'Máximo 200 caracteres';
  }

  // Nombre único case-insensitive (excluyendo la categoría en edición)
  if (!errores.nombre && categoriasExistentes.length > 0) {
    const nombreNormalizado = String(form.nombre).trim().toLowerCase();
    const duplicado = categoriasExistentes.find(
      (c) => c.nombre.toLowerCase() === nombreNormalizado && c.id !== editandoId
    );
    if (duplicado) {
      errores.nombre = 'Ya existe una categoría con este nombre';
    }
  }

  // Máximo 10 atributos
  if (form.atributos && Array.isArray(form.atributos) && form.atributos.length > 10) {
    errores.atributos = 'Máximo 10 atributos por categoría';
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  };
}

/**
 * Obtiene la unidad de medida por defecto para una categoría.
 * @param {String} nombreCategoria
 * @returns {String}
 */
export function obtenerUnidadPorDefecto(nombreCategoria) {
  if (!nombreCategoria) return 'unidad';
  return UNIDAD_POR_DEFECTO[nombreCategoria] || 'unidad';
}

/**
 * Determina si un producto tiene stock bajo.
 * @param {Object} producto - { stock_actual, stock_minimo }
 * @returns {boolean}
 */
export function esStockBajo(producto) {
  if (!producto) return false;
  return producto.stock_actual <= producto.stock_minimo;
}

/**
 * Valida un valor de stock.
 * @param {any} valor
 * @returns {{ valido: boolean, error: String|null }}
 */
export function validarStock(valor) {
  if (valor === '' || valor === null || valor === undefined) {
    return { valido: false, error: 'Este campo es obligatorio' };
  }

  const num = Number(valor);

  if (isNaN(num) || !Number.isInteger(num)) {
    return { valido: false, error: 'El valor debe ser un número entero' };
  }

  if (num < 0 || num > 999999) {
    return { valido: false, error: 'El valor debe estar entre 0 y 999999' };
  }

  return { valido: true, error: null };
}
