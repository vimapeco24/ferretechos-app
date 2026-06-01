import React from 'react';

/**
 * Componente de atributos específicos por categoría.
 * Renderiza dinámicamente campos de formulario según la configuración de atributos
 * de la categoría seleccionada (texto, número, selección).
 *
 * @param {Object} props
 * @param {string} props.categoriaId - ID de la categoría seleccionada
 * @param {Array} props.atributosConfig - Configuración de atributos de la categoría
 * @param {Object} props.valores - Valores actuales { color: "Blanco", tipo: "vinilo" }
 * @param {Function} props.onChange - Callback (nombre, valor) al cambiar un campo
 * @param {Object} props.errores - Errores de validación { atributo_color: "Campo obligatorio" }
 */
export default function AtributosEspecificos({ categoriaId, atributosConfig, valores, onChange, errores }) {
  if (!atributosConfig || atributosConfig.length === 0) {
    return null;
  }

  /**
   * Capitaliza la primera letra de un string y reemplaza guiones bajos con espacios.
   */
  function formatLabel(nombre) {
    const formatted = nombre.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  /**
   * Maneja el cambio de valor de un campo numérico.
   * Previene valores ≤ 0 para campos de dimensiones/peso.
   */
  function handleNumeroChange(nombre, rawValue) {
    const value = rawValue === '' ? '' : rawValue;
    onChange(nombre, value);
  }

  function renderCampo(atributo) {
    const { nombre, tipo_campo, opciones, obligatorio, max_length } = atributo;
    const valor = valores[nombre] || '';
    const errorKey = `atributo_${nombre}`;
    const error = errores && errores[errorKey];
    const fieldId = `atributo-${categoriaId}-${nombre}`;

    return (
      <div className="form-group" key={nombre}>
        <label htmlFor={fieldId}>
          {formatLabel(nombre)}{obligatorio ? ' *' : ''}
        </label>

        {tipo_campo === 'texto' && (
          <input
            id={fieldId}
            type="text"
            value={valor}
            maxLength={max_length || undefined}
            onChange={(e) => onChange(nombre, e.target.value)}
            placeholder={`Ingrese ${formatLabel(nombre).toLowerCase()}`}
            style={error ? { borderColor: 'var(--red)' } : undefined}
          />
        )}

        {tipo_campo === 'numero' && (
          <input
            id={fieldId}
            type="number"
            value={valor}
            min="0.01"
            step="any"
            onChange={(e) => handleNumeroChange(nombre, e.target.value)}
            placeholder={`Ingrese ${formatLabel(nombre).toLowerCase()}`}
            style={error ? { borderColor: 'var(--red)' } : undefined}
          />
        )}

        {tipo_campo === 'seleccion' && (
          <select
            id={fieldId}
            value={valor}
            onChange={(e) => onChange(nombre, e.target.value)}
            style={error ? { borderColor: 'var(--red)' } : undefined}
          >
            <option value="">-- Seleccione --</option>
            {opciones && opciones.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
              </option>
            ))}
          </select>
        )}

        {error && (
          <span style={{
            display: 'block',
            fontSize: '11px',
            color: 'var(--red)',
            marginTop: '4px',
          }}>
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="atributos-especificos">
      <h3 style={{ marginBottom: '14px', marginTop: '8px' }}>
        Atributos específicos
      </h3>
      {atributosConfig.map(renderCampo)}
    </div>
  );
}
