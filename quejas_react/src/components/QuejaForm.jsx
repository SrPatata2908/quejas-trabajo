import { useState } from 'react';

const TIPOS_DE_QUEJA = ['infraestructura', 'hardware', 'software', 'insumos'];
const ESTATUS_OPCIONES = ['levantada', 'en proceso', 'atendida'];

export default function QuejaForm({ quejosos, onAgregarQueja }) {
  const hoy = new Date().toISOString().split('T')[0];

  const [formQueja, setFormQueja] = useState({
    matricula: '',
    fecha: hoy,
    descripcion: '',
    tipo_queja: 'infraestructura',
    estatus: 'levantada',
    fecha_cierre: '',
    ubicacion: '',
    ubicacion_descripcion: ''
  });

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
        ubicacion: '',
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
            placeholder="Selecciona o escribe matrícula registrada"
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

        <div className="campo">
          <label>Ubicación</label>
          <input
            type="text"
            name="ubicacion"
            placeholder="Ej. Edificio A, Aula 104"
            value={formQueja.ubicacion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="campo">
          <label>Descripción de la Ubicación (Opcional)</label>
          <input
            type="text"
            name="ubicacion_descripcion"
            placeholder="Ej. Segundo piso, junto al laboratorio de redes"
            value={formQueja.ubicacion_descripcion}
            onChange={handleChange}
          />
        </div>

        <div className="campo">
          <label>Descripción de la Queja</label>
          <textarea
            name="descripcion"
            rows="3"
            placeholder="Describe el problema detalladamente..."
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