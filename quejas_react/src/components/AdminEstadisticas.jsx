const ESTATUS = ['levantada', 'en proceso', 'atendida'];

const parseFecha = (s) => (s ? new Date(s.replace(' ', 'T')) : null);

const formatearDuracion = (ms) => {
  const horas = ms / 3600000;
  if (horas < 1) return `${Math.max(1, Math.round(ms / 60000))} min`;
  if (horas < 48) return `${horas.toFixed(1)} h`;
  return `${(horas / 24).toFixed(1)} días`;
};

const contar = (quejas, campo) => {
  const mapa = new Map();
  quejas.forEach((q) => mapa.set(q[campo], (mapa.get(q[campo]) || 0) + 1));
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
};

function Barras({ titulo, datos, clase = '' }) {
  const max = Math.max(1, ...datos.map(([, n]) => n));
  return (
    <div className="stat-bloque">
      <h3>{titulo}</h3>
      {datos.length === 0 ? (
        <p className="texto-suave">Sin datos todavía.</p>
      ) : (
        <ul className="barras">
          {datos.map(([nombre, n]) => (
            <li key={nombre}>
              <span className="barra-etiqueta">{nombre}</span>
              <span className="barra-pista">
                <span className={`barra-relleno ${clase}`} style={{ width: `${(n / max) * 100}%` }} />
              </span>
              <span className="barra-valor">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminEstadisticas({ quejas }) {
  const atendidas = quejas.filter((q) => q.estatus === 'atendida');
  const duraciones = atendidas
    .map((q) => {
      const ini = parseFecha(q.fecha);
      const fin = parseFecha(q.fecha_cierre);
      return ini && fin ? fin - ini : null;
    })
    .filter((d) => d !== null && d >= 0);

  const promedio = duraciones.length ? duraciones.reduce((a, b) => a + b, 0) / duraciones.length : null;
  const tasa = quejas.length ? Math.round((atendidas.length / quejas.length) * 100) : 0;

  return (
    <section className="tarjeta">
      <h2>Estadísticas</h2>

      <div className="stat-kpis">
        <div className="stat-kpi"><strong>{quejas.length}</strong><span>Quejas totales</span></div>
        <div className="stat-kpi"><strong>{tasa}%</strong><span>Atendidas</span></div>
        <div className="stat-kpi">
          <strong>{promedio === null ? '—' : formatearDuracion(promedio)}</strong>
          <span>Tiempo promedio de atención</span>
        </div>
        <div className="stat-kpi">
          <strong>{quejas.filter((q) => q.estatus !== 'atendida').length}</strong>
          <span>Pendientes</span>
        </div>
      </div>

      <div className="stat-grid">
        <Barras titulo="Por estatus" datos={ESTATUS.map((e) => [e, quejas.filter((q) => q.estatus === e).length])} />
        <Barras titulo="Por tipo de queja" datos={contar(quejas, 'tipo_queja')} />
        <Barras titulo="Por salón (más quejas primero)" datos={contar(quejas, 'ubicacion').slice(0, 8)} />
      </div>
    </section>
  );
}
