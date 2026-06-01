import React from 'react';

/**
 * Diálogo modal de confirmación reutilizable.
 * Se usa para confirmar acciones destructivas como desactivación de productos
 * y eliminación de categorías.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla si el diálogo se muestra
 * @param {string} props.titulo - Título del diálogo
 * @param {string} props.mensaje - Mensaje/cuerpo del diálogo
 * @param {Function} props.onConfirmar - Callback al confirmar la acción
 * @param {Function} props.onCancelar - Callback al cancelar (también al hacer clic en overlay)
 */
export default function ConfirmDialog({ visible, titulo, mensaje, onConfirmar, onCancelar }) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div
        className="modal"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{titulo}</h2>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {mensaje}
        </p>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirmar}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
