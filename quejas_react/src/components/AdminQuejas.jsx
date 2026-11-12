import { useState, useMemo, Fragment } from 'react';
import EstatusBadge from './EstatusBadge';
import { formatearFecha } from './MisQuejas';

const ESTATUS_OPCIONES = ['levantada', 'en proceso', 'atendida'];
const TIPOS_DE_QUEJA = ['infraestructura', 'hardware', 'software', 'insumos'];
const POR_PAGINA = 10;

const mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);

const comparar = (a, b, clave) => {
  if (clave === 'estatus') return ESTATUS_OPCIONES.indexOf(a.estatus) - ESTATUS_OPCIONES.indexOf(b.estatus);
  const va = a[clave] ?? '';
  const vb = b[clave] ?? '';
  if (typeof va === 'number' || typeof vb === 'number') return Number(va) - Number(vb);
  return String(va).localeCompare(String(vb), 'es');
};

const descargarCSV = (quejas) => {
  const columnas = [
    ['Folio', (q) => q.id_queja],
    ['Matrícula', (q) => q.matricula],
    ['Alumno', (q) => q.nombre_quejoso],
    ['Carrera', (q) => q.carrera_quejoso],
    ['Fecha', (q) => q.fecha],
    ['Tipo', (q) => q.tipo_queja],
    ['Ubicación', (q) => q.ubicacion],
    ['Detalle ubicación', (q) => q.ubicacion_descripcion],
    ['Descripción', (q) => q.descripcion],
    ['Estatus', (q) => q.estatus],
    ['Fecha de cierre', (q) => q.fecha_cierre],
    ['Nota de atención', (q) => q.nota_atencion],
  ];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const filas = [columnas.map(([t]) => esc(t)).join(',')];
  quejas.forEach((q) => filas.push(columnas.map(([, f]) => esc(f(q))).join(',')));

  // BOM para que Excel respete los acentos
  const blob = new Blob(['﻿' + filas.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `quejas_${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
};

export default function AdminQuejas({ quejas, salones, cargando, onRecargar, onActualizar }) {
  const [filtroEstatus, setFiltroEstatus] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroUbicacion, setFiltroUbicacion] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState({ clave: 'id_queja', dir: 'desc' });
  const [pagina, setPagina] = useState(1);
  const [actualizando, setActualizando] = useState(null);
  const [notaAbierta, setNotaAbierta] = useState(null);
  const [notaTexto, setNotaTexto] = useState('');

  const ubicaciones = useMemo(() => {
    const nombres = new Set(salones.map((s) => s.nombre_salon));
    quejas.forEach((q) => nombres.add(q.ubicacion));
    return [...nombres];
  }, [salones, quejas]);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const lista = quejas.filter(
      (q) =>
        (filtroEstatus === 'todas' || q.estatus === filtroEstatus) &&
        (filtroTipo === 'todos' || q.tipo_queja === filtroTipo) &&
        (filtroUbicacion === 'todas' || q.ubicacion === filtroUbicacion) &&
        (texto === '' ||
          [q.matricula, q.nombre_quejoso, q.descripcion, q.ubicacion, q.ubicacion_descripcion, q.nota_atencion, `#${q.id_queja}`]
            .some((v) => String(v ?? '').toLowerCase().includes(texto)))
    );
    const factor = orden.dir === 'asc' ? 1 : -1;
    return [...lista].sort((a, b) => factor * comparar(a, b, orden.clave));
  }, [quejas, filtroEstatus, filtroTipo, filtroUbicacion, busqueda, orden]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const conFiltro = (setter) => (e) => {
    setter(e.target.value);
    setPagina(1);
  };

  const ordenarPor = (clave) => {
    setOrden((o) => (o.clave === clave ? { clave, dir: o.dir === 'asc' ? 'desc' : 'asc' } : { clave, dir: 'asc' }));
  };

  const Encabezado = ({ clave, children }) => (
    <th className="th-ordenable" onClick={() => ordenarPor(clave)}>
      {children} {orden.clave === clave ? (orden.dir === 'asc' ? '▲' : '▼') : ''}
    </th>
  );

  const cambiarEstatus = async (q, nuevo) => {
    if (nuevo === 'atendida' && !window.confirm(`¿Marcar la queja #${q.id_queja} como ATENDIDA? Se registrará la fecha de cierre de hoy.`)) {
      return;
    }
    setActualizando(q.id_queja);
    await onActualizar(q.id_queja, { estatus: nuevo });
    setActualizando(null);
  };

  const abrirNota = (q) => {
    if (notaAbierta === q.id_queja) {
      setNotaAbierta(null);
      return;
    }
    setNotaAbierta(q.id_queja);
    setNotaTexto(q.nota_atencion || '');
  };

  const guardarNota = async (q) => {
    setActualizando(q.id_queja);
    const ok = await onActualizar(q.id_queja, { estatus: q.estatus, nota_atencion: notaTexto });
    setActualizando(null);
    if (ok) setNotaAbierta(null);
  };

  return (
    <section className="tarjeta">
      <div className="titulo-con-accion">
        <h2>Listado general de quejas ({filtradas.length})</h2>
        <div className="acciones">
          <button type="button" className="btn-secundario" onClick={() => descargarCSV(filtradas)} disabled={filtradas.length === 0}>
            ⬇ Exportar CSV
          </button>
          <button type="button" className="btn-secundario" onClick={onRecargar} disabled={cargando}>
            {cargando ? 'Actualizando...' : '↻ Actualizar'}
          </button>
        </div>
      </div>

      <div className="filtros filtros-4">
        <div className="campo">
          <label>Buscar</label>
          <input
            type="search"
            placeholder="Matrícula, nombre, descripción..."
            value={busqueda}
            onChange={conFiltro(setBusqueda)}
          />
        </div>

        <div className="campo">
          <label>Estatus</label>
          <select value={filtroEstatus} onChange={conFiltro(setFiltroEstatus)}>
            <option value="todas">Todas</option>
            {ESTATUS_OPCIONES.map((est) => (
              <option key={est} value={est}>{mayus(est)}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Tipo de queja</label>
          <select value={filtroTipo} onChange={conFiltro(setFiltroTipo)}>
            <option value="todos">Todos</option>
            {TIPOS_DE_QUEJA.map((t) => (
              <option key={t} value={t}>{mayus(t)}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Ubicación / Salón</label>
          <select value={filtroUbicacion} onChange={conFiltro(setFiltroUbicacion)}>
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
              <Encabezado clave="id_queja">Folio</Encabezado>
              <Encabezado clave="matricula">Alumno</Encabezado>
              <Encabezado clave="fecha">Fecha</Encabezado>
              <Encabezado clave="tipo_queja">Tipo</Encabezado>
              <Encabezado clave="ubicacion">Ubicación</Encabezado>
              <th>Descripción</th>
              <Encabezado clave="estatus">Estatus</Encabezado>
              <Encabezado clave="fecha_cierre">Fecha de cierre</Encabezado>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>
                  No hay quejas que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              visibles.map((q) => (
                <Fragment key={q.id_queja}>
                  <tr>
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
                        onChange={(e) => cambiarEstatus(q, e.target.value)}
                        aria-label={`Cambiar estatus de la queja ${q.id_queja}`}
                      >
                        {ESTATUS_OPCIONES.map((est) => (
                          <option key={est} value={est}>{est}</option>
                        ))}
                      </select>
                    </td>
                    <td>{q.estatus === 'atendida' ? formatearFecha(q.fecha_cierre, true) : '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-secundario"
                        onClick={() => abrirNota(q)}
                        aria-label={`Nota de la queja ${q.id_queja}`}
                      >
                        {q.nota_atencion ? '✎ Ver / editar' : '+ Nota'}
                      </button>
                    </td>
                  </tr>
                  {notaAbierta === q.id_queja && (
                    <tr className="fila-nota">
                      <td colSpan="9">
                        <label className="etiqueta-nota">Nota de atención (la verá el alumno en su historial)</label>
                        <textarea
                          rows="3"
                          value={notaTexto}
                          onChange={(e) => setNotaTexto(e.target.value)}
                          placeholder="Ej. Se reemplazó el cable HDMI del proyector."
                        />
                        <div className="acciones">
                          <button type="button" className="btn-guardar btn-chico" onClick={() => guardarNota(q)} disabled={actualizando === q.id_queja}>
                            Guardar nota
                          </button>
                          <button type="button" className="btn-secundario" onClick={() => setNotaAbierta(null)}>
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtradas.length > POR_PAGINA && (
        <div className="paginacion">
          <button type="button" className="btn-secundario" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>
            ← Anterior
          </button>
          <span>Página {paginaActual} de {totalPaginas}</span>
          <button type="button" className="btn-secundario" disabled={paginaActual === totalPaginas} onClick={() => setPagina(paginaActual + 1)}>
            Siguiente →
          </button>
        </div>
      )}
    </section>
  );
}
