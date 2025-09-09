import React, { useState, useEffect } from 'react';
import { IconCheck, IconX, IconEye, IconFileText, IconClock, IconUser, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { createApiUrl } from '../../config/api';

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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

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
          
          const response = await fetch(createApiUrl('solicitudes/pendientes'), {
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
      const response = await fetch(createApiUrl(`solicitudes/${solicitudId}/detalle`), {
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
      
      const response = await fetch(createApiUrl(`solicitudes/${solicitudId}/autorizar`), {
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
      const response = await fetch(createApiUrl(`solicitudes/${solicitudId}/pdf`), {
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

  const toggleExpanded = (solicitudId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(solicitudId)) {
      newExpanded.delete(solicitudId);
    } else {
      newExpanded.add(solicitudId);
    }
    setExpandedRows(newExpanded);
  };

  const formatTiempoEspera = (fecha: string) => {
    const ahora = new Date();
    const fechaSolicitud = new Date(fecha);
    const diffHoras = Math.floor((ahora.getTime() - fechaSolicitud.getTime()) / (1000 * 60 * 60));
    
    if (diffHoras < 1) {
      const diffMinutos = Math.floor((ahora.getTime() - fechaSolicitud.getTime()) / (1000 * 60));
      return `${diffMinutos} min`;
    } else if (diffHoras < 24) {
      return `${diffHoras} hrs`;
    } else {
      const diffDias = Math.floor(diffHoras / 24);
      return `${diffDias} días`;
    }
  };

  const getUrgenciaColor = (fecha: string) => {
    const ahora = new Date();
    const fechaSolicitud = new Date(fecha);
    const diffHoras = Math.floor((ahora.getTime() - fechaSolicitud.getTime()) / (1000 * 60 * 60));
    
    if (diffHoras < 2) return 'bg-green-100 text-green-800';
    if (diffHoras < 8) return 'bg-yellow-100 text-yellow-800';
    if (diffHoras < 24) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <IconClock className="h-8 w-8 text-blue-600" />
            Solicitudes Pendientes de Autorización
          </h1>
          <p className="text-gray-600 mt-2">
            {solicitudes.length} solicitudes esperando tu autorización
          </p>
        </div>

        {solicitudes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <IconCheck className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">¡Todo al día!</h3>
              <p className="text-gray-500">No hay solicitudes pendientes de autorización</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <IconFileText className="h-5 w-5 text-orange-600" />
                Lista de Solicitudes Pendientes
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Haz clic en cualquier solicitud para ver sus detalles
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {solicitudes.map((solicitud) => (
                <div key={solicitud.id} className="bg-white hover:bg-gray-50 transition-colors">
                  {/* Fila Principal */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Expand Button + Folio */}
                      <div className="col-span-12 md:col-span-3 flex items-center space-x-2">
                        <button
                          onClick={() => toggleExpanded(solicitud.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center p-1 rounded hover:bg-blue-50"
                        >
                          {expandedRows.has(solicitud.id) ? (
                            <IconChevronDown className="h-4 w-4" />
                          ) : (
                            <IconChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <span className="font-semibold text-blue-600 text-lg">{solicitud.folio}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(solicitud.tipo)}`}>
                          {solicitud.tipo}
                        </span>
                      </div>

                      {/* Solicitante */}
                      <div className="col-span-12 md:col-span-3 flex items-center space-x-1">
                        <IconUser className="h-4 w-4 text-gray-400" />
                        <span className="text-sm truncate">{solicitud.usuario_solicita_nombre}</span>
                      </div>

                      {/* Items y Fecha */}
                      <div className="col-span-6 md:col-span-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {solicitud.total_items} items
                        </span>
                      </div>
                      <div className="col-span-6 md:col-span-2 text-sm text-gray-600">
                        {new Date(solicitud.fecha).toLocaleDateString()}
                      </div>

                      {/* Tiempo Espera y Acciones */}
                      <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-end space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getUrgenciaColor(solicitud.created_at)}`}>
                          {formatTiempoEspera(solicitud.created_at)}
                        </span>
                        <button
                          onClick={() => verDetalleSolicitud(solicitud.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Autorizar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contenido Expandido */}
                  {expandedRows.has(solicitud.id) && (
                    <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                      <div className="space-y-4">
                        {/* Información General */}
                        {solicitud.observaciones && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <h5 className="text-sm font-semibold text-yellow-800 mb-2">Observaciones:</h5>
                            <p className="text-sm text-yellow-700">{solicitud.observaciones}</p>
                          </div>
                        )}

                        {/* Items de la Solicitud */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <IconFileText className="h-4 w-4 mr-1" />
                            Artículos Solicitados ({solicitud.items?.length || 0} items)
                          </h5>
                          
                          {solicitud.items && solicitud.items.length > 0 ? (
                            <div className="space-y-2">
                              {solicitud.items.map((item, index) => (
                                <div key={index} className="border border-gray-100 rounded p-3 hover:bg-gray-50">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <div>
                                      <span className="font-medium text-gray-700">Código:</span>
                                      <span className="ml-1 font-mono text-blue-600 text-sm">{item.article_code}</span>
                                    </div>
                                    <div className="md:col-span-2">
                                      <span className="font-medium text-gray-700">Artículo:</span>
                                      <span className="ml-1 text-sm">{item.article_name}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700">Cantidad:</span>
                                      <span className="ml-1 font-semibold text-green-600">{item.cantidad}</span>
                                      <span className="ml-1 text-gray-500 text-xs">(Stock: {item.stock_actual})</span>
                                    </div>
                                  </div>
                                  {item.observaciones && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                      <span className="font-medium text-gray-700 text-xs">Observaciones:</span>
                                      <span className="ml-1 text-gray-600 text-xs">{item.observaciones}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No hay detalles de artículos disponibles</p>
                          )}

                          {/* Botones de Acción */}
                          <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => verDetalleSolicitud(solicitud.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              <IconEye className="h-4 w-4" />
                              Ver Detalle Completo
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
    </div>
  );
};

export default AutorizacionSolicitudes;
