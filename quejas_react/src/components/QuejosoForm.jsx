import { useState } from 'react';

export default function QuejosoForm({ onAgregarQuejoso }) {
  const [formQuejoso, setFormQuejoso] = useState({
    clave: '',
    nombre: '',
    carrera: ''
  });

  const handleChange = (e) => {
    setFormQuejoso({ ...formQuejoso, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formQuejoso.clave || !formQuejoso.nombre || !formQuejoso.carrera) return;

    onAgregarQuejoso(formQuejoso);
    setFormQuejoso({ clave: '', nombre: '', carrera: '' });
  };

  return (
    <section className="tarjeta">
      <h2>Registrar Quejoso</h2>
      <form onSubmit={handleSubmit} className="formulario">
        <div className="campo">
          <label>Clave / Matrícula</label>
          <input
            type="text"
            name="clave"
            placeholder="Ej. 202412345"
            value={formQuejoso.clave}
            onChange={handleChange}
            required
          />
        </div>

        <div className="campo">
          <label>Nombre Completo</label>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del quejoso"
            value={formQuejoso.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="campo">
          <label>Carrera</label>
          <input
            type="text"
            name="carrera"
            placeholder="Ej. Ingeniería en Sistemas"
            value={formQuejoso.carrera}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-guardar">
          Guardar Quejoso
        </button>
      </form>
    </section>
  );
}