import { useState } from 'react';
import api, { mensajeError } from '../services/api';

export default function AdminSalones({ salones, quejas, onCambio }) {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const quejasDe = (n) => quejas.filter((q) => q.ubicacion === n).length;

  const agregar = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError('');
    setGuardando(true);
    try {
      await api.post('/salones', { nombre_salon: nombre.trim() });
      setNombre('');
      await onCambio();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo agregar el salón.'));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (s) => {
    if (!window.confirm(`¿Eliminar "${s.nombre_salon}" del catálogo? Las quejas ya registradas conservarán su ubicación.`)) return;
    setError('');
    try {
      await api.delete(`/salones/${s.id_salon}`);
      await onCambio();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar el salón.'));
    }
  };

  return (
    <section className="tarjeta">
      <h2>Catálogo de salones ({salones.length})</h2>

      <form onSubmit={agregar} className="form-inline">
        <input
          type="text"
          placeholder="Nombre del nuevo salón (ej. Aula 120)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={150}
        />
        <button type="submit" className="btn-guardar btn-chico" disabled={guardando}>
          Agregar
        </button>
      </form>

      {error && <div className="mensaje-error">{error}</div>}

      <div className="tabla-responsive">
        <table>
          <thead>
            <tr><th>ID</th><th>Salón</th><th>Quejas</th><th></th></tr>
          </thead>
          <tbody>
            {salones.map((s) => (
              <tr key={s.id_salon}>
                <td>#{s.id_salon}</td>
                <td>{s.nombre_salon}</td>
                <td>{quejasDe(s.nombre_salon)}</td>
                <td style={{ textAlign: 'right' }}>
                  <button type="button" className="btn-secundario btn-peligro" onClick={() => eliminar(s)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
