import { useState, useEffect } from 'react';
import api from '../services/api';

const TIPOS_DE_QUEJA = ['infraestructura', 'hardware', 'software', 'insumos'];

// Respaldo por si el endpoint /salones no responde
const SALONES_RESPALDO = [
  'Aula 103', 'Química 104', 'Aula 105', 'Lab 106C', 'Aula 107', 'Aula 118',
  'Metrología 102', 'Metrología 119', 'Cuarto Eléctrico 100E', 'Área de cubículos', 'Bodega y Aseo',
].map((nombre_salon, i) => ({ id_salon: i + 1, nombre_salon }));

const hoyLocal = () => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};

const estadoInicial = (ubicacion) => ({
  tipo_queja: 'infraestructura',
  ubicacion,
  ubicacion_descripcion: '',
  descripcion: '',
});

export default function QuejaForm({ usuario, onAgregarQueja }) {
  const [salones, setSalones] = useState(SALONES_RESPALDO);
  const [form, setForm] = useState(estadoInicial(SALONES_RESPALDO[0].nombre_salon));
  const [enviando, setEnviando] = useState(false);

  // Salones desde MySQL (si falla, se queda el listado de respaldo)
  useEffect(() => {
    const obtenerSalones = async () => {
      try {
        const res = await api.get('/salones');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSalones(res.data);
          setForm((prev) => ({ ...prev, ubicacion: res.data[0].nombre_salon }));
        }
      } catch (error) {
        console.warn('Usando salones locales de respaldo.');
      }
    };
    obtenerSalones();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.descripcion.trim() || !form.ubicacion) return;

    setEnviando(true);
    const exito = await onAgregarQueja({ ...form, matricula: usuario.clave });
    setEnviando(false);

    if (exito) setForm(estadoInicial(salones[0]?.nombre_salon || ''));
  };

  return (
    <section className="tarjeta">
      <h2>Levantar Queja</h2>
      <form onSubmit={handleSubmit} className="formulario">
        <div className="fila-doble">
          <div className="campo">
            <label>Matrícula</label>
            <input type="text" value={usuario.clave} readOnly disabled />
          </div>

          <div className="campo">
            <label>Fecha</label>
            <input type="date" value={hoyLocal()} readOnly disabled />
          </div>
        </div>

        <div className="campo">
          <label>Tipo de Queja</label>
          <select name="tipo_queja" value={form.tipo_queja} onChange={handleChange}>
            {TIPOS_DE_QUEJA.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Ubicación (Salón)</label>
          <select name="ubicacion" value={form.ubicacion} onChange={handleChange} required>
            {salones.map((s) => (
              <option key={s.id_salon || s.nombre_salon} value={s.nombre_salon}>
                {s.nombre_salon}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Detalles de la ubicación (opcional)</label>
          <input
            type="text"
            name="ubicacion_descripcion"
            placeholder="Ej. Proyector izquierdo, fila del fondo"
            value={form.ubicacion_descripcion}
            onChange={handleChange}
          />
        </div>

        <div className="campo">
          <label>Descripción del problema</label>
          <textarea
            name="descripcion"
            rows="4"
            placeholder="Detalla el problema..."
            value={form.descripcion}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-guardar" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Registrar Queja'}
        </button>
      </form>
    </section>
  );
}
