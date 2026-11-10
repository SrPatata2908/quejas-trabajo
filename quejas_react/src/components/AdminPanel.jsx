import { useState, useMemo } from 'react';
import EstatusBadge from './EstatusBadge';
import QuejosoList from './QuejosoList';
import { formatearFecha } from './MisQuejas';

const ESTATUS_OPCIONES = ['levantada', 'en proceso', 'atendida'];
const TIPOS_DE_QUEJA = ['infraestructura', 'hardware', 'software', 'insumos'];

export default function AdminPanel({ quejas, quejosos, salones, cargando, onRecargar, onCambiarEstatus }) {
  const [pestana, setPestana] = useState('quejas');
  const [filtroEstatus, setFiltroEstatus] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroUbicacion, setFiltroUbicacion] = useState('todas');
  const [actualizando, setActualizando] = useState(null);

  // Ubicaciones: las del catálogo + cualquiera que ya exista en las quejas
  const ubicaciones = useMemo(() => {
    const nombres = new Set(salones.map((s) => s.nombre_salon));
    quejas.forEach((q) => nombres.add(q.ubicacion));
    return [...nombres];
  }, [salones, quejas]);

  const filtradas = quejas.filter(
    (q) =>
      (filtroEstatus === 'todas' || q.estatus === filtroEstatus) &&
      (filtroTipo === 'todos' || q.tipo_queja === filtroTipo) &&
      (filtroUbicacion === 'todas' || q.ubicacion === filtroUbicacion)
  );

  const conteo = (estatus) => quejas.filter((q) => q.estatus === estatus).length;

  const cambiar = async (id, estatus) => {
    setActualizando(id);
    await onCambiarEstatus(id, estatus);
    setActualizando(null);
  };

  return (
    <div className="panel-admin">
      <div className="resumen-admin">
        {ESTATUS_OPCIONES.map((est) => (
          <div key={est} className={`resumen-item estatus-${est.replace(' ', '-')}`}>
            <strong>{conteo(est)}</strong>
            <span>{est}</span>
          </div>
        ))}
      </div>

      <nav className="navegacion pestanas">
        <button
          className={pestana === 'quejas' ? 'btn-nav activo' : 'btn-nav'}
          onClick={() => setPestana('quejas')}
        >
          Quejas ({quejas.length})
        </button>
        <button
          className={pestana === 'padron' ? 'btn-nav activo' : 'btn-nav'}
          onClick={() => setPestana('padron')}
        >
          Padrón de alumnos ({quejosos.length})
        </button>
      </nav>

      {pestana === 'padron' ? (
        <QuejosoList quejosos={quejosos} />
      ) : (
        <section className="tarjeta">
          <div className="titulo-con-accion">
            <h2>Listado general de quejas ({filtradas.length})</h2>
            <button type="button" className="btn-secundario" onClick={onRecargar} disabled={cargando}>
              {cargando ? 'Actualizando...' : '↻ Actualizar'}
            </button>
          </div>

          <div className="filtros">
            <div className="campo">
              <label>Estatus</label>
              <select value={filtroEstatus} onChange={(e) => setFiltroEstatus(e.target.value)}>
                <option value="todas">Todas</option>
                {ESTATUS_OPCIONES.map((est) => (
                  <option key={est} value={est}>{est.charAt(0).toUpperCase() + est.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Tipo de queja</label>
              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="todos">Todos</option>
                {TIPOS_DE_QUEJA.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Ubicación / Salón</label>
              <select value={filtroUbicacion} onChange={(e) => setFiltroUbicacion(e.target.value)}>
                <option value="todas">Todas</option>
                {ubicaciones.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tabla-responsive">
            <table>
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Alumno</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Ubicación</th>
                  <th>Descripción</th>
                  <th>Estatus</th>
                  <th>Fecha de cierre</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>
                      No hay quejas que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  filtradas.map((q) => (
                    <tr key={q.id_queja}>
                      <td>#{q.id_queja}</td>
                      <td>
                        <strong>{q.matricula}</strong>
                        {q.nombre_quejoso && <div><small className="texto-suave">{q.nombre_quejoso}</small></div>}
                      </td>
                      <td>{formatearFecha(q.fecha)}</td>
                      <td><span className="badge-tipo">{q.tipo_queja}</span></td>
                      <td>
                        <div>{q.ubicacion}</div>
                        {q.ubicacion_descripcion && <small className="texto-suave">{q.ubicacion_descripcion}</small>}
                      </td>
                      <td>{q.descripcion}</td>
                      <td>
                        <select
                          className={`select-estatus estatus-${q.estatus.replace(' ', '-')}`}
                          value={q.estatus}
                          disabled={actualizando === q.id_queja}
                          onChange={(e) => cambiar(q.id_queja, e.target.value)}
                          aria-label={`Cambiar estatus de la queja ${q.id_queja}`}
                        >
                          {ESTATUS_OPCIONES.map((est) => (
                            <option key={est} value={est}>{est}</option>
                          ))}
                        </select>
                      </td>
                      <td>{q.estatus === 'atendida' ? formatearFecha(q.fecha_cierre, true) : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
