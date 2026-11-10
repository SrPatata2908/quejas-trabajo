import axios from 'axios';

const api = axios.create({
  // Ajusta esta URL cuando tu equipo defina la ruta en CodeIgniter 4
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;