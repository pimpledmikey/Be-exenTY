import { useState, useEffect } from 'react';

interface SolicitudItem {
  article_id: number;
  cantidad: number;
  precio_unitario?: number;
  observaciones?: string;
}

interface SolicitudData {
  tipo: 'ENTRADA' | 'SALIDA';
  fecha: string;
  usuario_solicita_id: number;
  observaciones?: string;
  items: SolicitudItem[];
}

interface Solicitud {
  solicitud_id: number;
  folio: string;
  tipo: 'ENTRADA' | 'SALIDA';
  fecha: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'PROCESADA';
  usuario_solicita_nombre: string;
  usuario_autoriza_nombre?: string;
  total_items: number;
  fecha_creacion: string;
  fecha_autorizacion?: string;
  fecha_procesado?: string;
  observaciones?: string;
}

export const useSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  // Obtener todas las solicitudes
  const fetchSolicitudes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/solicitudes`);
      
      if (!response.ok) {
        throw new Error('Error al obtener solicitudes');
      }
      
      const data = await response.json();
      setSolicitudes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Obtener solicitudes pendientes
  const fetchSolicitudesPendientes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/solicitudes/pendientes`);
      
      if (!response.ok) {
        throw new Error('Error al obtener solicitudes pendientes');
      }
      
      const data = await response.json();
      setSolicitudes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Obtener solicitudes aprobadas
  const fetchSolicitudesAprobadas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/solicitudes/aprobadas`);
      
      if (!response.ok) {
        throw new Error('Error al obtener solicitudes aprobadas');
      }
      
      const data = await response.json();
      setSolicitudes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva solicitud
  const createSolicitud = async (solicitudData: SolicitudData): Promise<{ success: boolean; solicitud_id?: number; folio?: string; message?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/solicitudes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(solicitudData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear solicitud');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Autorizar solicitud
  const autorizarSolicitud = async (
    solicitudId: number, 
    accion: 'APROBAR' | 'RECHAZAR', 
    usuarioAutorizaId: number,
    observaciones?: string
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/solicitudes/${solicitudId}/autorizar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accion,
          usuario_autoriza_id: usuarioAutorizaId,
          observaciones_autorizacion: observaciones
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al autorizar solicitud');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Procesar solicitud (ejecutar entrada/salida)
  const procesarSolicitud = async (
    solicitudId: number, 
    usuarioProcesaId: number
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/solicitudes/${solicitudId}/procesar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_procesa_id: usuarioProcesaId
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar solicitud');
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Obtener una solicitud específica
  const fetchSolicitudById = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/solicitudes/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener solicitud');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  return {
    solicitudes,
    loading,
    error,
    fetchSolicitudes,
    fetchSolicitudesPendientes,
    fetchSolicitudesAprobadas,
    createSolicitud,
    autorizarSolicitud,
    procesarSolicitud,
    fetchSolicitudById,
    setSolicitudes,
    setError
  };
};
