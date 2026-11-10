import EstatusBadge from './EstatusBadge';

export const formatearFecha = (fechaStr, conHora = false) => {
  if (!fechaStr) return '—';
  const [fecha, hora = ''] = fechaStr.split(' ');
  return conHora && hora ? `${fecha} ${hora.slice(0, 5)}` : fecha;
};

export default function MisQuejas({ quejas, cargando, onRecargar }) {
  return (
    <section className="tarjeta">
      <div className="titulo-con-accion">
        <h2>Mis Quejas ({quejas.length})</h2>
        <button type="button" className="btn-secundario" onClick={onRecargar} disabled={cargando}>
          {cargando ? 'Actualizando...' : '↻ Actualizar'}
        </button>
      </div>

      <div className="tabla-responsive">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Ubicación</th>
              <th>Descripción</th>
              <th>Estatus</th>
              <th>Fecha de cierre</th>
            </tr>
          </thead>
          <tbody>
            {quejas.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  Aún no has levantado ninguna queja.
                </td>
              </tr>
            ) : (
              quejas.map((q) => (
                <tr key={q.id_queja}>
                  <td>#{q.id_queja}</td>
                  <td>{formatearFecha(q.fecha)}</td>
                  <td><span className="badge-tipo">{q.tipo_queja}</span></td>
                  <td>
                    <div>{q.ubicacion}</div>
                    {q.ubicacion_descripcion && <small className="texto-suave">{q.ubicacion_descripcion}</small>}
                  </td>
                  <td>{q.descripcion}</td>
                  <td><EstatusBadge estatus={q.estatus} /></td>
                  <td>{q.estatus === 'atendida' ? formatearFecha(q.fecha_cierre, true) : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
