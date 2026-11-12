import { useState } from 'react';
import AdminQuejas from './AdminQuejas';
import AdminEstadisticas from './AdminEstadisticas';
import AdminSalones from './AdminSalones';
import QuejosoList from './QuejosoList';

const ESTATUS_OPCIONES = ['levantada', 'en proceso', 'atendida'];

export default function AdminPanel({ quejas, quejosos, salones, cargando, onRecargar, onRecargarCatalogos, onActualizar }) {
  const [pestana, setPestana] = useState('quejas');

  const conteo = (estatus) => quejas.filter((q) => q.estatus === estatus).length;

  const pestanas = [
    ['quejas', `Quejas (${quejas.length})`],
    ['estadisticas', 'Estadísticas'],
    ['padron', `Padrón de alumnos (${quejosos.length})`],
    ['salones', `Salones (${salones.length})`],
  ];

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
        {pestanas.map(([clave, texto]) => (
          <button
            key={clave}
            className={pestana === clave ? 'btn-nav activo' : 'btn-nav'}
            onClick={() => setPestana(clave)}
          >
            {texto}
          </button>
        ))}
      </nav>

      {pestana === 'quejas' && (
        <AdminQuejas
          quejas={quejas}
          salones={salones}
          cargando={cargando}
          onRecargar={onRecargar}
          onActualizar={onActualizar}
        />
      )}
      {pestana === 'estadisticas' && <AdminEstadisticas quejas={quejas} />}
      {pestana === 'padron' && <QuejosoList quejosos={quejosos} />}
      {pestana === 'salones' && <AdminSalones salones={salones} quejas={quejas} onCambio={onRecargarCatalogos} />}
    </div>
  );
}
