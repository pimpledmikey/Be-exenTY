// Configuración de la URL base de la API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.DEV 
    ? '/api'  // En desarrollo usa el proxy de Vite
    : 'https://be-exenty.onrender.com/api'  // En producción usa la URL directa del backend
);

// Función helper para crear URLs de API completas
export const createApiUrl = (endpoint: string): string => {
  // Eliminar la barra inicial del endpoint si existe para evitar duplicados
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Si estamos en desarrollo con proxy, usar directamente /api/endpoint
  if (import.meta.env.DEV && API_BASE_URL === '/api') {
    return `/api/${cleanEndpoint}`;
  }
  
  // En producción, usar la URL completa
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
