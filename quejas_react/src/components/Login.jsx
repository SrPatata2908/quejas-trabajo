import { useState } from 'react';
import api, { mensajeError } from '../services/api';

const CLAVE_ADMIN = 'admin';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ clave: '', nombre: '', carrera: '', anio: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const esAdmin = form.clave.trim().toLowerCase() === CLAVE_ADMIN;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await api.post('/login', {
        clave: form.clave.trim(),
        nombre: form.nombre.trim(),
        carrera: form.carrera.trim(),
        anio: form.anio.trim(),
      });
      onLogin({ rol: res.data.rol, ...res.data.quejoso });
    } catch (err) {
      setError(mensajeError(err, 'No se pudo iniciar sesión.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-pantalla">
      <section className="tarjeta login-tarjeta">
        <h1 className="login-titulo">Buzón de Quejas</h1>
        <p className="login-sub">Ingresa tus datos para continuar. Si es tu primera vez, te registramos automáticamente.</p>

        <form onSubmit={handleSubmit} className="formulario">
          <div className="campo">
            <label>Matrícula / Clave</label>
            <input
              type="text"
              name="clave"
              placeholder="Ej. 202412345"
              value={form.clave}
              onChange={handleChange}
              autoFocus
              required
            />
          </div>

          {!esAdmin && (
            <>
              <div className="campo">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre y apellidos"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="fila-doble">
                <div className="campo">
                  <label>Carrera</label>
                  <input
                    type="text"
                    name="carrera"
                    placeholder="Ej. Ing. en Sistemas"
                    value={form.carrera}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="campo">
                  <label>Año (semestre / generación)</label>
                  <input
                    type="text"
                    name="anio"
                    placeholder="Ej. 5to semestre"
                    value={form.anio}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {esAdmin && <p className="aviso-admin">Acceso de administrador: no necesitas más datos.</p>}

          {error && <div className="mensaje-error">{error}</div>}

          <button type="submit" className="btn-guardar" disabled={cargando}>
            {cargando ? 'Validando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </div>
  );
}
