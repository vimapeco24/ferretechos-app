/**
 * Módulo de filtrado, paginación y formato de precios.
 * Funciones puras para manipulación de listas de productos en el frontend.
 */

/**
 * Filtra productos según criterios combinados (AND).
 * Solo retorna productos activos que cumplan todos los filtros aplicados.
 *
 * @param {Array} productos - Lista completa de productos
 * @param {{ busqueda: string, categoriaId: string, marca: string }} filtros
 * @returns {Array} Productos que cumplen todos los criterios
 */
export function filtrarProductos(productos, { busqueda = '', categoriaId = '', marca = '' } = {}) {
  if (!Array.isArray(productos)) return [];

  return productos.filter((producto) => {
    // Solo productos activos
    if (producto.activo !== true) return false;

    // Filtro por búsqueda (nombre, código, marca - case insensitive)
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      const nombre = (producto.nombre || '').toLowerCase();
      const codigo = (producto.codigo || '').toLowerCase();
      const marcaProducto = (producto.marca || '').toLowerCase();

      if (!nombre.includes(termino) && !codigo.includes(termino) && !marcaProducto.includes(termino)) {
        return false;
      }
    }

    // Filtro por categoría
    if (categoriaId) {
      if (producto.categoria_id !== categoriaId) return false;
    }

    // Filtro por marca
    if (marca) {
      if (producto.marca !== marca) return false;
    }

    return true;
  });
}

/**
 * Pagina una lista de elementos.
 *
 * @param {Array} items - Lista completa
 * @param {Number} pagina - Página actual (1-indexed)
 * @param {Number} porPagina - Elementos por página (default 20)
 * @returns {{ items: Array, totalPaginas: Number, paginaActual: Number }}
 */
export function paginar(items, pagina, porPagina = 20) {
  if (!Array.isArray(items) || items.length === 0) {
    return { items: [], totalPaginas: 0, paginaActual: pagina };
  }

  const totalPaginas = Math.ceil(items.length / porPagina);

  // Si la página está fuera de rango, retornar items vacíos
  if (pagina < 1 || pagina > totalPaginas) {
    return { items: [], totalPaginas, paginaActual: pagina };
  }

  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;

  return {
    items: items.slice(inicio, fin),
    totalPaginas,
    paginaActual: pagina,
  };
}

/**
 * Formatea un número como precio en COP.
 * Usa "." como separador de miles, sin decimales.
 *
 * @param {Number} valor
 * @returns {String} Ej: "$15.000", "$1.500.000", "$0"
 */
export function formatearPrecioCOP(valor) {
  const numero = Math.round(Number(valor) || 0);
  const formateado = numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${formateado}`;
}
