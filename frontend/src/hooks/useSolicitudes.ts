import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface SolicitudItem {
  article_id: number;
  cantidad: number;
  precio_unitario?: number;
  observaciones: string;
}

interface SolicitudData {
  tipo: 'ENTRADA' | 'SALIDA';
  fecha: string;
  usuario_solicita_id: number;
  observaciones: string;
  items: SolicitudItem[];
}

interface CreateSolicitudResponse {
  success: boolean;
  folio?: string;
  message?: string;
  solicitud_id?: number;
}

export const useSolicitudes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);

  const createSolicitud = async (data: SolicitudData): Promise<CreateSolicitudResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_URL}/solicitudes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear solicitud');
      }

      // Si es una solicitud de SALIDA, también crear las salidas automáticamente
      if (data.tipo === 'SALIDA' && result.success && result.solicitud_id) {
        try {
          await createSalidasAutomaticas(result.solicitud_id, data.items);
        } catch (salidaError) {
          console.warn('Error al crear salidas automáticas:', salidaError);
          // No fallar completamente si las salidas fallan
        }
      }

      // Actualizar la lista después de crear
      await fetchSolicitudes();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const createSalidasAutomaticas = async (solicitudId: number, items: SolicitudItem[]) => {
    try {
      const token = localStorage.getItem('token');
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

      const salidasPromises = items.map(async (item) => {
        if (item.article_id && item.cantidad > 0) {
          const salidaData = {
            article_id: item.article_id,
            quantity: item.cantidad, // Usar 'quantity' según el esquema de inventory_exits
            date: new Date().toISOString().split('T')[0],
            reason: `Salida automática por solicitud #${solicitudId} - ${item.observaciones}`,
            user_id: userInfo.user_id // Usar user_id según el esquema
          };

          const response = await fetch(`${API_URL}/almacen/exits`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(salidaData)
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Error en artículo ${item.article_id}: ${error.message}`);
          }

          return response.json();
        }
      });

      await Promise.all(salidasPromises.filter(Boolean));
      console.log('✅ Salidas automáticas creadas exitosamente');
    } catch (error) {
      console.error('❌ Error al crear salidas automáticas:', error);
      throw error;
    }
  };

  const getSolicitudes = async (filters?: any) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const queryParams = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) {
            queryParams.append(key, filters[key]);
          }
        });
      }

      const url = `${API_URL}/solicitudes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al obtener solicitudes');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchSolicitudes = async () => {
    try {
      const result = await getSolicitudes();
      setSolicitudes(result);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    }
  };

  const fetchSolicitudesPendientes = async () => {
    try {
      const result = await getSolicitudes({ estado: 'PENDIENTE' });
      return result;
    } catch (error) {
      console.error('Error al cargar solicitudes pendientes:', error);
      return [];
    }
  };

  const fetchSolicitudesAprobadas = async () => {
    try {
      const result = await getSolicitudes({ estado: 'AUTORIZADA' });
      return result;
    } catch (error) {
      console.error('Error al cargar solicitudes aprobadas:', error);
      return [];
    }
  };

  const autorizarSolicitud = async (solicitudId: number) => {
    return await updateSolicitudStatus(solicitudId, 'AUTORIZADA');
  };

  const procesarSolicitud = async (solicitudId: number) => {
    return await updateSolicitudStatus(solicitudId, 'COMPLETADA');
  };

  const updateSolicitudStatus = async (solicitudId: number, status: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_URL}/solicitudes/${solicitudId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar estado');
      }

      // Actualizar la lista después de cambiar estado
      await fetchSolicitudes();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createSolicitud,
    getSolicitudes,
    fetchSolicitudes,
    fetchSolicitudesPendientes,
    fetchSolicitudesAprobadas,
    autorizarSolicitud,
    procesarSolicitud,
    updateSolicitudStatus,
    solicitudes,
    loading,
    error
  };
};
