// Utility para manejar respuestas de la API con manejo automático de errores 403
export const fetchWithPermissions = async (
  url: string, 
  options: RequestInit = {},
  onPermissionError?: (message: string) => void
): Promise<Response> => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });

  // Manejar errores 403 (sin permisos) de forma centralizada
  if (response.status === 403) {
    try {
      const errorData = await response.json();
      const message = errorData.message || 'No tienes permisos para realizar esta acción';
      
      if (onPermissionError) {
        onPermissionError(message);
      } else {
        // Mostrar alerta por defecto
        alert(`❌ ${message}`);
      }
    } catch {
      const defaultMessage = 'No tienes permisos para realizar esta acción';
      if (onPermissionError) {
        onPermissionError(defaultMessage);
      } else {
        alert(`❌ ${defaultMessage}`);
      }
    }
  }

  return response;
};

// Hook para manejo de errores de permisos
import { useState } from 'react';

export const usePermissionError = () => {
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const showPermissionError = (message: string) => {
    setPermissionError(message);
  };

  const clearPermissionError = () => {
    setPermissionError(null);
  };

  return {
    permissionError,
    showPermissionError,
    clearPermissionError
  };
};
