const ESTATUS_OPCIONES = ['levantada', 'en proceso', 'atendida'];

export default function QuejaList({ quejas, onCambiarEstatus }) {
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Pendiente';
    return fechaStr.split(' ')[0];
  };

  return (
    <section className="tarjeta">
      <h2>Listado de Quejas ({quejas.length})</h2>
      <div className="tabla-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Matrícula</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Ubicación</th>
              <th>Descripción</th>
              <th>Estatus</th>
              <th>Fecha Cierre</th>
            </tr>
          </thead>
          <tbody>
            {quejas.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  No hay quejas registradas en la base de datos.
                </td>
              </tr>
            ) : (
              quejas.map((q) => (
                <tr key={q.id_queja}>
                  <td>#{q.id_queja}</td>
                  <td><strong>{q.matricula}</strong></td>
                  <td>{formatearFecha(q.fecha)}</td>
                  <td>
                    <span className="badge-tipo">{q.tipo_queja}</span>
                  </td>
                  <td>
                    <div>{q.ubicacion}</div>
                    {q.ubicacion_descripcion && (
                      <small style={{ color: '#64748b' }}>{q.ubicacion_descripcion}</small>
                    )}
                  </td>
                  <td>{q.descripcion}</td>
                  <td>
                    <select
                      className={`select-estatus estatus-${q.estatus.replace(' ', '-')}`}
                      value={q.estatus}
                      onChange={(e) => onCambiarEstatus(q.id_queja, e.target.value)}
                    >
                      {ESTATUS_OPCIONES.map((est) => (
                        <option key={est} value={est}>
                          {est}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatearFecha(q.fecha_cierre)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}