import React, { useState, useEffect } from 'react';
import { IconCheck, IconX, IconEye, IconFileText, IconClock, IconUser } from '@tabler/icons-react';

interface SolicitudItem {
  id: number;
  article_id: number;
  article_code: string;
  article_name: string;
  cantidad: number;
  precio_unitario?: number;
  observaciones?: string;
  stock_actual: number;
}

interface Solicitud {
  id: number;
  folio: string;
  tipo: 'ENTRADA' | 'SALIDA';
  fecha: string;
  usuario_solicita_id: number;
  usuario_solicita_nombre: string;
  estado: 'PENDIENTE' | 'AUTORIZADA' | 'RECHAZADA' | 'COMPLETADA';
  observaciones?: string;
  created_at: string;
  items: SolicitudItem[];
  total_items: number;
  valor_total?: number;
}

const AutorizacionSolicitudes: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [solicitudDetalle, setSolicitudDetalle] = useState<Solicitud | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [observacionesAutorizacion, setObservacionesAutorizacion] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    fetchSolicitudesPendientes();
  }, []);

  const fetchSolicitudesPendientes = async () => {
    try {
      setLoading(true);
      let currentToken = localStorage.getItem('token');
      
      // Si no hay token, mostrar error
      if (!currentToken) {
        console.error('No hay token de autenticación. Por favor, inicie sesión.');
        setLoading(false);
        return;
      }

      // Intentar hasta 3 veces con un retraso entre intentos
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          currentToken = localStorage.getItem('token');
          if (!currentToken) {
            console.error('Token no disponible después de múltiples intentos');
            break;
          }
          
          const response = await fetch('/api/solicitudes/pendientes', {
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.solicitudes && Array.isArray(data.solicitudes)) {
              console.log(`Solicitudes pendientes obtenidas: ${data.solicitudes.length}`);
              setSolicitudes(data.solicitudes);
              return; // Salir del bucle si fue exitoso
            } else {
              console.warn('Respuesta inválida del servidor:', data);
            }
          } else {
            console.warn(`Intento ${attempt + 1} fallido. Status: ${response.status}`);
            if (response.status === 401) {
              // Si es error de autenticación, limpiar token y mostrar error
              localStorage.removeItem('token');
              currentToken = null;
              console.error('Token de autenticación inválido. Por favor, inicie sesión nuevamente.');
              break;
            }
          }
        } catch (fetchError) {
          console.error(`Error en intento ${attempt + 1}:`, fetchError);
        }

        // Esperar un poco antes del siguiente intento (aumentando con cada intento)
        if (attempt < 2) { // No esperar después del último intento
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    } catch (error) {
      console.error('Error fetching solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const verDetalleSolicitud = async (solicitudId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/solicitudes/${solicitudId}/detalle`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSolicitudDetalle(data.solicitud);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching detalle:', error);
    }
  };

  const procesarAutorizacion = async (solicitudId: number, accion: 'AUTORIZADA' | 'RECHAZADA') => {
    try {
      setProcesando(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/solicitudes/${solicitudId}/autorizar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: accion,
          observaciones_autorizacion: observacionesAutorizacion
        })
      });

      if (response.ok) {
        // Actualizar la lista de solicitudes
        setSolicitudes(prev => prev.filter(s => s.id !== solicitudId));
        setShowModal(false);
        setObservacionesAutorizacion('');
        
        // Mostrar mensaje de éxito
        alert(`Solicitud ${accion.toLowerCase()} exitosamente`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error procesando autorización:', error);
      alert('Error al procesar la autorización');
    } finally {
      setProcesando(false);
    }
  };

  const generarPDF = async (solicitudId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/solicitudes/${solicitudId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `solicitud-${solicitudDetalle?.folio}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'ENTRADA' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <IconClock className="h-6 w-6" />
          Solicitudes Pendientes de Autorización
        </h1>
        <p className="text-gray-600 mt-1">
          {solicitudes.length} solicitudes esperando tu autorización
        </p>
      </div>

      {solicitudes.length === 0 ? (
        <div className="text-center py-12">
          <IconCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes pendientes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Todas las solicitudes han sido procesadas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {solicitud.folio}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(solicitud.tipo)}`}>
                        {solicitud.tipo}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <IconUser className="h-4 w-4" />
                        <span>Solicitante: {solicitud.usuario_solicita_nombre}</span>
                      </div>
                      <div>
                        <span>Fecha: {new Date(solicitud.fecha).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span>Artículos: {solicitud.total_items}</span>
                      </div>
                    </div>

                    {solicitud.observaciones && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Observaciones:</strong> {solicitud.observaciones}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => verDetalleSolicitud(solicitud.id)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <IconEye className="h-4 w-4" />
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalle */}
      {showModal && solicitudDetalle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <IconFileText className="h-5 w-5" />
                    Detalle de Solicitud - {solicitudDetalle.folio}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(solicitudDetalle.tipo)}`}>
                      {solicitudDetalle.tipo}
                    </span>
                    <span>Solicitante: {solicitudDetalle.usuario_solicita_nombre}</span>
                    <span>Fecha: {new Date(solicitudDetalle.fecha).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IconX className="h-6 w-6" />
                </button>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-3">Artículos Solicitados</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Artículo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock Actual
                        </th>
                        {solicitudDetalle.tipo === 'SALIDA' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado Stock
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {solicitudDetalle.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.article_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.article_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.cantidad}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.stock_actual}
                          </td>
                          {solicitudDetalle.tipo === 'SALIDA' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.stock_actual >= item.cantidad ? (
                                <span className="text-green-600 font-medium">✓ Disponible</span>
                              ) : (
                                <span className="text-red-600 font-medium">⚠ Insuficiente</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observaciones de Autorización */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones de Autorización (Opcional)
                </label>
                <textarea
                  value={observacionesAutorizacion}
                  onChange={(e) => setObservacionesAutorizacion(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Agregar comentarios sobre la autorización..."
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => generarPDF(solicitudDetalle.id)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <IconFileText className="h-4 w-4" />
                    Generar PDF
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => procesarAutorizacion(solicitudDetalle.id, 'RECHAZADA')}
                    disabled={procesando}
                    className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <IconX className="h-4 w-4" />
                    {procesando ? 'Procesando...' : 'Rechazar'}
                  </button>
                  
                  <button
                    onClick={() => procesarAutorizacion(solicitudDetalle.id, 'AUTORIZADA')}
                    disabled={procesando}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <IconCheck className="h-4 w-4" />
                    {procesando ? 'Procesando...' : 'Autorizar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutorizacionSolicitudes;
