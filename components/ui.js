'use client';

// Insignia de estado de tutoría con colores semánticos
export function StatusBadge({ estado }) {
  const mapa = {
    SOLICITADA: ['--st-solicitada-bg', '--st-solicitada-fg'],
    PENDIENTE: ['--st-pendiente-bg', '--st-pendiente-fg'],
    CONFIRMADA: ['--st-confirmada-bg', '--st-confirmada-fg'],
    ATENDIDA: ['--st-atendida-bg', '--st-atendida-fg'],
    CANCELADA: ['--st-cancelada-bg', '--st-cancelada-fg'],
    NO_ASISTIDA: ['--st-noasistida-bg', '--st-noasistida-fg'],
    ABIERTO: ['--st-pendiente-bg', '--st-pendiente-fg'],
    EN_PROCESO: ['--st-confirmada-bg', '--st-confirmada-fg'],
    CERRADO: ['--st-atendida-bg', '--st-atendida-fg'],
  };
  const [bg, fg] = mapa[estado] || ['--st-solicitada-bg', '--st-solicitada-fg'];
  return (
    <span
      className="badge-estado"
      style={{ background: `var(${bg})`, color: `var(${fg})` }}
    >
      {String(estado || '').replace('_', ' ')}
    </span>
  );
}

// Modal genérico accesible
export function Modal({ titulo, abierto, onCerrar, children, pie }) {
  if (!abierto) return null;
  return (
    <div className="modal-overlay" onClick={onCerrar} role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{titulo}</h3>
          <button className="modal-close" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {pie && <div className="modal-foot">{pie}</div>}
      </div>
    </div>
  );
}
