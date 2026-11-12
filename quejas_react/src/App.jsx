import { useState, useEffect, useCallback } from 'react';
import api, { mensajeError, CLAVE_SESION } from './services/api';
import Login from './components/Login';
import QuejaForm from './components/QuejaForm';
import MisQuejas from './components/MisQuejas';
import AdminPanel from './components/AdminPanel';
import './App.css';

const INTERVALO_ACTUALIZACION_MS = 15000; // refresco periódico para ver cambios de estatus

const leerSesion = () => {
  try {
    const guardada = localStorage.getItem(CLAVE_SESION);
    return guardada ? JSON.parse(guardada) : null;
  } catch {
    return null;
  }
};

export default function App() {
  const [usuario, setUsuario] = useState(leerSesion);
  const [quejas, setQuejas] = useState([]);
  const [quejosos, setQuejosos] = useState([]);
  const [salones, setSalones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [avisoLogin, setAvisoLogin] = useState('');

  const esAdmin = usuario?.rol === 'admin';

  const avisar = (tipo, texto) => setMensaje({ tipo, texto });

  // ---- Sesión -------------------------------------------------------------
  const iniciarSesion = (datos) => {
    try {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(datos));
    } catch {
      /* si localStorage no está disponible, la sesión vive solo en memoria */
    }
    setMensaje({ tipo: '', texto: '' });
    setAvisoLogin('');
    setUsuario(datos);
  };

  const cerrarSesion = (aviso = '') => {
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch {
      /* noop */
    }
    setUsuario(null);
    setQuejas([]);
    setQuejosos([]);
    setMensaje({ tipo: '', texto: '' });
    setAvisoLogin(typeof aviso === 'string' ? aviso : '');
  };

  // Si el token de administrador venció o es inválido, se regresa al login
  const sesionExpirada = (error) => {
    if (esAdmin && error?.response?.status === 401) {
      cerrarSesion('Tu sesión de administrador expiró. Vuelve a iniciar sesión.');
      return true;
    }
    return false;
  };

  // ---- Carga de datos -----------------------------------------------------
  const cargarQuejas = useCallback(async () => {
    if (!usuario) return;
    setCargando(true);
    try {
      const params = esAdmin ? {} : { matricula: usuario.clave };
      const res = await api.get('/quejas', { params });
      setQuejas(Array.isArray(res.data) ? res.data : []);
      setMensaje((m) => (m.tipo === 'error' ? { tipo: '', texto: '' } : m));
    } catch (error) {
      if (sesionExpirada(error)) return;
      avisar('error', mensajeError(error, 'No se pudieron cargar las quejas.'));
    } finally {
      setCargando(false);
    }
  }, [usuario, esAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarCatalogosAdmin = useCallback(async () => {
    try {
      const [resQuejosos, resSalones] = await Promise.all([api.get('/quejosos'), api.get('/salones')]);
      setQuejosos(resQuejosos.data);
      setSalones(resSalones.data);
    } catch (error) {
      if (sesionExpirada(error)) return;
      avisar('error', mensajeError(error, 'No se pudieron cargar los catálogos.'));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!usuario) return undefined;

    cargarQuejas();
    if (esAdmin) cargarCatalogosAdmin();

    const id = setInterval(cargarQuejas, INTERVALO_ACTUALIZACION_MS);
    return () => clearInterval(id);
  }, [usuario, esAdmin, cargarQuejas, cargarCatalogosAdmin]);

  // ---- Acciones -----------------------------------------------------------
  const agregarQueja = async (nuevaQueja) => {
    try {
      const res = await api.post('/quejas', nuevaQueja);
      setQuejas((prev) => [res.data, ...prev]);
      avisar('exito', `Queja #${res.data.id_queja} registrada correctamente.`);
      return true;
    } catch (error) {
      avisar('error', mensajeError(error, 'No se pudo registrar la queja.'));
      return false;
    }
  };

  // Actualiza estatus y/o nota. El servidor fija la fecha de cierre cuando el estatus pasa a "atendida".
  const actualizarQueja = async (id_queja, cambios) => {
    try {
      const res = await api.put(`/quejas/${id_queja}`, cambios);
      setQuejas((prev) => prev.map((q) => (q.id_queja === id_queja ? { ...q, ...res.data } : q)));
      setMensaje({ tipo: '', texto: '' });
      return true;
    } catch (error) {
      if (sesionExpirada(error)) return false;
      avisar('error', mensajeError(error, 'No se pudo actualizar la queja.'));
      return false;
    }
  };

  // ---- Render -------------------------------------------------------------
  if (!usuario) return <Login onLogin={iniciarSesion} aviso={avisoLogin} />;

  return (
    <div className="contenedor-principal">
      <header className="encabezado">
        <div>
          <h1>Buzón de Quejas</h1>
          <small className="usuario-info">
            {esAdmin ? 'Panel de Administración' : `${usuario.nombre} · ${usuario.clave}`}
          </small>
        </div>
        <button className="btn-nav" onClick={() => cerrarSesion()}>Cerrar sesión</button>
      </header>

      {mensaje.texto && (
        <div className={mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}>{mensaje.texto}</div>
      )}

      {esAdmin ? (
        <AdminPanel
          quejas={quejas}
          quejosos={quejosos}
          salones={salones}
          cargando={cargando}
          onRecargar={cargarQuejas}
          onRecargarCatalogos={cargarCatalogosAdmin}
          onActualizar={actualizarQueja}
        />
      ) : (
        <main className="grid-layout">
          <QuejaForm usuario={usuario} onAgregarQueja={agregarQueja} />
          <MisQuejas quejas={quejas} cargando={cargando} onRecargar={cargarQuejas} />
        </main>
      )}
    </div>
  );
}
