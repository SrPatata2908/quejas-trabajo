import { useState, useEffect } from 'react';
import api from '../services/api';

const TIPOS_DE_QUEJA = ['infraestructura', 'hardware', 'software', 'insumos'];
const ESTATUS_OPCIONES = ['levantada', 'en proceso', 'atendida'];

export default function QuejaForm({ quejosos, onAgregarQueja }) {
  const hoy = new Date().toISOString().split('T')[0];

  // Estado para los salones que vienen de MySQL
  const [salones, setSalones] = useState([
    { id_salon: 1, nombre_salon: 'Aula 103' },
    { id_salon: 2, nombre_salon: 'Química 104' },
    { id_salon: 3, nombre_salon: 'Aula 105' },
    { id_salon: 4, nombre_salon: 'Lab 106C' },
    { id_salon: 5, nombre_salon: 'Aula 107' },
    { id_salon: 6, nombre_salon: 'Aula 118' }
  ]);

  const [formQueja, setFormQueja] = useState({
    matricula: '',
    fecha: hoy,
    descripcion: '',
    tipo_queja: 'infraestructura',
    estatus: 'levantada',
    fecha_cierre: '',
    ubicacion: 'Aula 103',
    ubicacion_descripcion: ''
  });

  // Consultar los salones del backend al abrir el formulario
  useEffect(() => {
    const obtenerSalones = async () => {
      try {
        const res = await api.get('/salones');
        if (res.data && res.data.length > 0) {
          setSalones(res.data);
          setFormQueja((prev) => ({ ...prev, ubicacion: res.data[0].nombre_salon }));
        }
      } catch (error) {
        console.warn('Usando salones locales de respaldo.');
      }
    };
    obtenerSalones();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cierre = formQueja.fecha_cierre;

    if (name === 'estatus' && value === 'atendida' && !cierre) {
      cierre = hoy;
    } else if (name === 'estatus' && value !== 'atendida') {
      cierre = '';
    }

    setFormQueja({ ...formQueja, [name]: value, fecha_cierre: cierre });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formQueja.matricula || !formQueja.descripcion || !formQueja.ubicacion) return;

    const exito = await onAgregarQueja(formQueja);
    if (exito) {
      setFormQueja({
        matricula: '',
        fecha: hoy,
        descripcion: '',
        tipo_queja: 'infraestructura',
        estatus: 'levantada',
        fecha_cierre: '',
        ubicacion: salones[0]?.nombre_salon || 'Aula 103',
        ubicacion_descripcion: ''
      });
    }
  };

  return (
    <section className="tarjeta">
      <h2>Levantar Queja</h2>
      <form onSubmit={handleSubmit} className="formulario">
        <div className="campo">
          <label>Matrícula (Clave del Quejoso)</label>
          <input
            type="text"
            name="matricula"
            list="lista-matriculas"
            placeholder="Selecciona o escribe matrícula"
            value={formQueja.matricula}
            onChange={handleChange}
            required
          />
          <datalist id="lista-matriculas">
            {quejosos.map((q) => (
              <option key={q.id_quejoso} value={q.clave}>
                {q.nombre} ({q.carrera})
              </option>
            ))}
          </datalist>
        </div>

        <div className="fila-doble">
          <div className="campo">
            <label>Fecha</label>
            <input
              type="date"
              name="fecha"
              value={formQueja.fecha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="campo">
            <label>Tipo de Queja</label>
            <select
              name="tipo_queja"
              value={formQueja.tipo_queja}
              onChange={handleChange}
            >
              {TIPOS_DE_QUEJA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CUADRO COMBINADO (SELECT) DINÁMICO DESDE MYSQL */}
        <div className="campo">
          <label>Ubicación (Selecciona el Salón)</label>
          <select
            name="ubicacion"
            value={formQueja.ubicacion}
            onChange={handleChange}
            required
            style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
          >
            {salones.map((s) => (
              <option key={s.id_salon || s.nombre_salon} value={s.nombre_salon}>
                {s.nombre_salon}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Detalles adicionales de Ubicación (Opcional)</label>
          <input
            type="text"
            name="ubicacion_descripcion"
            placeholder="Ej. Proyector izquierdo, fila del fondo"
            value={formQueja.ubicacion_descripcion}
            onChange={handleChange}
          />
        </div>

        <div className="campo">
          <label>Descripción de la Queja</label>
          <textarea
            name="descripcion"
            rows="3"
            placeholder="Detalla el problema..."
            value={formQueja.descripcion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="fila-doble">
          <div className="campo">
            <label>Estatus</label>
            <select
              name="estatus"
              value={formQueja.estatus}
              onChange={handleChange}
            >
              {ESTATUS_OPCIONES.map((est) => (
                <option key={est} value={est}>
                  {est.charAt(0).toUpperCase() + est.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Fecha de Cierre</label>
            <input
              type="date"
              name="fecha_cierre"
              value={formQueja.fecha_cierre}
              onChange={handleChange}
              disabled={formQueja.estatus !== 'atendida'}
            />
          </div>
        </div>

        <button type="submit" className="btn-guardar">
          Registrar Queja
        </button>
      </form>
    </section>
  );
}