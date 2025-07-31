import axios from 'axios';

// Determinar la URL base de la API según el entorno
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://be-exenty.onrender.com/api' 
  : '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para añadir el token de autenticación a todas las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
