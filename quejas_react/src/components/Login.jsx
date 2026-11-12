import { useState } from 'react';
import api, { mensajeError } from '../services/api';

export default function Login({ onLogin, aviso = '' }) {
  const [modo, setModo] = useState('alumno'); // 'alumno' | 'admin'
  const [form, setForm] = useState({ clave: '', nombre: '', carrera: '', anio: '', password: '' });
  const [error, setError] = useState(aviso);
  const [cargando, setCargando] = useState(false);

  const esAdmin = modo === 'admin';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cambiarModo = (nuevo) => {
    setModo(nuevo);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const datos = { clave: form.clave.trim() };
      if (esAdmin) {
        datos.password = form.password;
      } else {
        datos.nombre = form.nombre.trim();
        datos.carrera = form.carrera.trim();
        datos.anio = form.anio.trim();
      }

      const res = await api.post('/login', datos);
      onLogin({ rol: res.data.rol, token: res.data.token, ...res.data.quejoso });
    } catch (err) {
      // Si la clave pertenece a un administrador, el backend lo avisa y pasamos al modo admin
      if (err?.response?.data?.requiere_password) {
        setModo('admin');
        setError('Esa clave es de un administrador. Ingresa tu contraseña.');
      } else {
        setError(mensajeError(err, 'No se pudo iniciar sesión.'));
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-pantalla">
      <section className="tarjeta login-tarjeta">
        <h1 className="login-titulo">Buzón de Quejas</h1>

        <div className="selector-modo">
          <button type="button" className={!esAdmin ? 'activo' : ''} onClick={() => cambiarModo('alumno')}>
            Alumno
          </button>
          <button type="button" className={esAdmin ? 'activo' : ''} onClick={() => cambiarModo('admin')}>
            Administrador
          </button>
        </div>

        <p className="login-sub">
          {esAdmin
            ? 'Ingresa con tu usuario y contraseña de administrador.'
            : 'Ingresa tus datos para continuar. Si es tu primera vez, te registramos automáticamente.'}
        </p>

        <form onSubmit={handleSubmit} className="formulario">
          <div className="campo">
            <label>{esAdmin ? 'Usuario' : 'Matrícula / Clave'}</label>
            <input
              type="text"
              name="clave"
              placeholder={esAdmin ? 'Usuario de administrador' : 'Ej. 202412345'}
              value={form.clave}
              onChange={handleChange}
              autoFocus
              required
            />
          </div>

          {esAdmin ? (
            <div className="campo">
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          ) : (
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

          {error && <div className="mensaje-error">{error}</div>}

          <button type="submit" className="btn-guardar" disabled={cargando}>
            {cargando ? 'Validando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </div>
  );
}
