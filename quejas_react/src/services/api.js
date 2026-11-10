import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Convierte cualquier error de Axios en un mensaje legible para el usuario,
 * para que la interfaz nunca se caiga si PHP/MySQL no responden.
 */
export const mensajeError = (error, porDefecto = 'Ocurrió un error inesperado.') => {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response) return `${porDefecto} (código ${error.response.status})`;
  if (error?.request) {
    return 'No se pudo conectar con el servidor. Verifica que CodeIgniter 4 esté corriendo en http://localhost:8080.';
  }
  return porDefecto;
};

export default api;
