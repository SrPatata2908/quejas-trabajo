import { useState, useEffect } from 'react';
import api from './services/api';
import QuejosoForm from './components/QuejosoForm';
import QuejosoList from './components/QuejosoList';
import QuejaForm from './components/QuejaForm';
import QuejaList from './components/QuejaList';
import './App.css';

export default function App() {
  const [vistaActiva, setVistaActiva] = useState('quejas');
  const [quejosos, setQuejosos] = useState([]);
  const [quejas, setQuejas] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // Cargar datos reales desde CodeIgniter 4 y MySQL
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resQuejosos, resQuejas] = await Promise.all([
          api.get('/quejosos'),
          api.get('/quejas')
        ]);
        setQuejosos(resQuejosos.data);
        setQuejas(resQuejas.data);
      } catch (error) {
        setMensaje('No se pudo conectar con CodeIgniter 4 en http://localhost:8080/api');
      }
    };
    cargarDatos();
  }, []);

  // Registrar nuevo Quejoso en MySQL (POST)
  const agregarQuejoso = async (nuevoQuejoso) => {
    try {
      setMensaje('');
      const res = await api.post('/quejosos', nuevoQuejoso);
      setQuejosos([res.data, ...quejosos]);
      alert('Quejoso registrado correctamente en MySQL.');
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al registrar quejoso.';
      alert(msg);
    }
  };

  // Registrar nueva Queja en MySQL (POST)
  const agregarQueja = async (nuevaQueja) => {
    try {
      setMensaje('');
      const res = await api.post('/quejas', nuevaQueja);
      setQuejas([res.data, ...quejas]);
      alert('Queja registrada correctamente en MySQL.');
      return true;
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        'Error al guardar la queja. Verifica que la matrícula exista en Quejosos.';
      alert(msg);
      return false;
    }
  };

  // Actualizar estatus y fecha de cierre en MySQL (PUT)
  const cambiarEstatusQueja = async (id_queja, nuevoEstatus) => {
    const fecha_cierre =
      nuevoEstatus === 'atendida' ? new Date().toISOString().split('T')[0] : '';

    try {
      const res = await api.put(`/quejas/${id_queja}`, {
        estatus: nuevoEstatus,
        fecha_cierre
      });
      setQuejas(quejas.map((q) => (q.id_queja === id_queja ? res.data : q)));
    } catch (error) {
      alert('No se pudo actualizar el estatus en la base de datos.');
    }
  };

  return (
    <div className="contenedor-principal">
      <header className="encabezado">
        <h1>Buzón de Quejas</h1>
        <nav className="navegacion">
          <button
            className={vistaActiva === 'quejas' ? 'btn-nav activo' : 'btn-nav'}
            onClick={() => setVistaActiva('quejas')}
          >
            Gestión de Quejas
          </button>
          <button
            className={vistaActiva === 'quejosos' ? 'btn-nav activo' : 'btn-nav'}
            onClick={() => setVistaActiva('quejosos')}
          >
            Registro de Quejosos ({quejosos.length})
          </button>
        </nav>
      </header>

      {mensaje && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {mensaje}
        </div>
      )}

      {vistaActiva === 'quejas' ? (
        <main className="grid-layout">
          <QuejaForm quejosos={quejosos} onAgregarQueja={agregarQueja} />
          <QuejaList quejas={quejas} onCambiarEstatus={cambiarEstatusQueja} />
        </main>
      ) : (
        <main className="grid-layout">
          <QuejosoForm onAgregarQuejoso={agregarQuejoso} />
          <QuejosoList quejosos={quejosos} />
        </main>
      )}
    </div>
  );
}