import React from 'react';

/**
 * Componente de paginación con navegación entre páginas.
 * Muestra botones anterior/siguiente y números de página.
 * Solo se renderiza cuando hay más de una página.
 *
 * @param {Object} props
 * @param {number} props.paginaActual - Página actual (1-indexed)
 * @param {number} props.totalPaginas - Total de páginas disponibles
 * @param {Function} props.onCambiarPagina - Callback al cambiar de página (numeroPagina) => void
 */
export default function Paginacion({ paginaActual, totalPaginas, onCambiarPagina }) {
  if (totalPaginas <= 1) return null;

  /**
   * Calcula los números de página a mostrar.
   * Muestra máximo 5 páginas alrededor de la página actual para listas grandes.
   */
  function obtenerNumerosPagina() {
    const maxVisible = 5;

    if (totalPaginas <= maxVisible) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }

    let inicio = Math.max(1, paginaActual - Math.floor(maxVisible / 2));
    let fin = inicio + maxVisible - 1;

    if (fin > totalPaginas) {
      fin = totalPaginas;
      inicio = fin - maxVisible + 1;
    }

    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  }

  const numeros = obtenerNumerosPagina();
  const enPrimeraPagina = paginaActual === 1;
  const enUltimaPagina = paginaActual === totalPaginas;

  return (
    <div className="paginacion" role="navigation" aria-label="Paginación">
      <button
        className="paginacion__btn"
        onClick={() => onCambiarPagina(paginaActual - 1)}
        disabled={enPrimeraPagina}
        aria-label="Página anterior"
      >
        Anterior
      </button>

      <div className="paginacion__numeros">
        {numeros[0] > 1 && (
          <>
            <button
              className="paginacion__numero"
              onClick={() => onCambiarPagina(1)}
            >
              1
            </button>
            {numeros[0] > 2 && (
              <span className="paginacion__ellipsis">…</span>
            )}
          </>
        )}

        {numeros.map((numero) => (
          <button
            key={numero}
            className={`paginacion__numero ${numero === paginaActual ? 'paginacion__numero--activo' : ''}`}
            onClick={() => onCambiarPagina(numero)}
            aria-current={numero === paginaActual ? 'page' : undefined}
          >
            {numero}
          </button>
        ))}

        {numeros[numeros.length - 1] < totalPaginas && (
          <>
            {numeros[numeros.length - 1] < totalPaginas - 1 && (
              <span className="paginacion__ellipsis">…</span>
            )}
            <button
              className="paginacion__numero"
              onClick={() => onCambiarPagina(totalPaginas)}
            >
              {totalPaginas}
            </button>
          </>
        )}
      </div>

      <button
        className="paginacion__btn"
        onClick={() => onCambiarPagina(paginaActual + 1)}
        disabled={enUltimaPagina}
        aria-label="Página siguiente"
      >
        Siguiente
      </button>
    </div>
  );
}
