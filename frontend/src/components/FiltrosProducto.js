import React from 'react'

/**
 * Componente de filtros para la lista de productos.
 * Permite buscar por texto (nombre/código/marca) y filtrar por categoría y marca.
 *
 * Props:
 * - busqueda: String - texto de búsqueda actual
 * - onBusquedaChange: Function - callback al cambiar texto de búsqueda
 * - categoriaSeleccionada: String - ID de categoría seleccionada ('' = Todas)
 * - onCategoriaChange: Function - callback al cambiar categoría
 * - marcaSeleccionada: String - marca seleccionada ('' = Todas)
 * - onMarcaChange: Function - callback al cambiar marca
 * - categorias: Array - lista de categorías [{ id, nombre }]
 * - marcas: Array - lista de marcas (strings)
 */
export default function FiltrosProducto({
  busqueda,
  onBusquedaChange,
  categoriaSeleccionada,
  onCategoriaChange,
  marcaSeleccionada,
  onMarcaChange,
  categorias,
  marcas,
}) {
  return (
    <div className="filtros-producto">
      <input
        type="text"
        className="filtros-producto__busqueda"
        placeholder="Buscar por nombre, código o marca..."
        value={busqueda}
        onChange={(e) => onBusquedaChange(e.target.value)}
        aria-label="Buscar productos"
      />

      <select
        className="filtros-producto__categoria"
        value={categoriaSeleccionada}
        onChange={(e) => onCategoriaChange(e.target.value)}
        aria-label="Filtrar por categoría"
      >
        <option value="">Todas las categorías</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre}
          </option>
        ))}
      </select>

      <select
        className="filtros-producto__marca"
        value={marcaSeleccionada}
        onChange={(e) => onMarcaChange(e.target.value)}
        aria-label="Filtrar por marca"
      >
        <option value="">Todas las marcas</option>
        {marcas.map((marca) => (
          <option key={marca} value={marca}>
            {marca}
          </option>
        ))}
      </select>
    </div>
  )
}
