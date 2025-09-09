import React, { useState, useEffect } from 'react';
import { IconCheck, IconX, IconEye, IconFileText, IconClock, IconUser, IconChevronDown, IconChevronRight, IconCalendar } from '@tabler/icons-react';
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

  // Función para obtener el color de urgencia basado en tiempo de espera (Tabler)
  const getUrgenciaColorClass = (fechaCreacion: string) => {
    const horasEspera = Math.floor((new Date().getTime() - new Date(fechaCreacion).getTime()) / (1000 * 60 * 60));
    
    if (horasEspera > 48) {
      return 'bg-danger text-white'; // Crítico - más de 48 horas
    } else if (horasEspera > 24) {
      return 'bg-warning text-dark'; // Urgente - más de 24 horas
    } else if (horasEspera > 8) {
      return 'bg-yellow text-dark'; // Moderado - más de 8 horas
    } else {
      return 'bg-success text-white'; // Normal - menos de 8 horas
    }
  };

  if (loading) {
    return (
      <div className="page-body">
        <div className="container-xl">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="container-xl">
        {/* Header */}
        <div className="page-header d-print-none">
          <div className="row align-items-center">
            <div className="col">
              <h2 className="page-title">
                <IconClock className="me-2" />
                Solicitudes Pendientes de Autorización
              </h2>
              <div className="text-muted mt-1">
                {solicitudes.length} solicitudes esperando tu autorización
              </div>
            </div>
          </div>
        </div>

        {solicitudes.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty">
                <div className="empty-img">
                  <IconCheck size={48} className="text-success" />
                </div>
                <p className="empty-title">¡Todo al día!</p>
                <p className="empty-subtitle text-muted">
                  No hay solicitudes pendientes de autorización
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <IconFileText className="me-2" />
                Lista de Solicitudes Pendientes
              </h3>
              <div className="card-actions">
                <small className="text-muted">
                  Haz clic en cualquier solicitud para ver sus detalles
                </small>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table card-table table-vcenter">
                <thead>
                  <tr>
                    <th></th>
                    <th>Folio</th>
                    <th>Tipo</th>
                    <th>Solicitante</th>
                    <th>Items</th>
                    <th>Fecha</th>
                    <th>Tiempo Espera</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((solicitud) => (
                    <>
                      <tr key={solicitud.id} className="table-row-hover">
                        <td>
                          <button
                            onClick={() => toggleExpanded(solicitud.id)}
                            className="btn btn-icon btn-sm"
                            type="button"
                          >
                            {expandedRows.has(solicitud.id) ? (
                              <IconChevronDown size={16} />
                            ) : (
                              <IconChevronRight size={16} />
                            )}
                          </button>
                        </td>
                        <td>
                          <span className="text-primary font-weight-medium text-h4">{solicitud.folio}</span>
                        </td>
                        <td>
                          <span className={`badge ${solicitud.tipo === 'ENTRADA' ? 'bg-success' : 'bg-secondary'}`}>
                            {solicitud.tipo}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <IconUser size={16} className="me-2 text-muted" />
                            {solicitud.usuario_solicita_nombre}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-azure">{solicitud.total_items} items</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center text-muted">
                            <IconCalendar size={16} className="me-1" />
                            {new Date(solicitud.fecha).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getUrgenciaColorClass(solicitud.created_at)}`}>
                            {formatTiempoEspera(solicitud.created_at)}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => verDetalleSolicitud(solicitud.id)}
                            className="btn btn-primary btn-sm"
                          >
                            <IconEye size={16} className="me-1" />
                            Autorizar
                          </button>
                        </td>
                      </tr>
                      
                      {/* Fila expandida */}
                      {expandedRows.has(solicitud.id) && (
                        <tr>
                          <td colSpan={8}>
                            <div className="card card-sm">
                              <div className="card-body">
                                <h4 className="card-title mb-3">
                                  <IconFileText size={20} className="me-2" />
                                  Detalles de la Solicitud
                                </h4>
                                
                                {/* Información General */}
                                {solicitud.observaciones && (
                                  <div className="alert alert-warning mb-3">
                                    <h5 className="alert-title">Observaciones:</h5>
                                    <div className="text-muted">{solicitud.observaciones}</div>
                                  </div>
                                )}

                                {/* Items de la Solicitud */}
                                <div className="mb-3">
                                  <h5 className="mb-3">
                                    Artículos Solicitados ({solicitud.items?.length || 0} items)
                                  </h5>
                                  
                                  {solicitud.items && solicitud.items.length > 0 ? (
                                    <div className="table-responsive">
                                      <table className="table table-sm table-bordered">
                                        <thead>
                                          <tr>
                                            <th>Código</th>
                                            <th>Artículo</th>
                                            <th>Cantidad</th>
                                            <th>Stock</th>
                                            <th>Observaciones</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {solicitud.items.map((item, index) => (
                                            <tr key={index}>
                                              <td><code className="bg-light text-dark px-2 py-1 rounded">{item.article_code}</code></td>
                                              <td>{item.article_name}</td>
                                              <td>
                                                <span className="badge bg-success text-white">{item.cantidad}</span>
                                              </td>
                                              <td>
                                                <span className="text-muted">{item.stock_actual}</span>
                                                {item.cantidad > item.stock_actual && (
                                                  <span className="badge bg-danger text-white ms-1">Stock insuficiente</span>
                                                )}
                                              </td>
                                              <td>
                                                <span className="text-muted">{item.observaciones || '-'}</span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="text-muted fst-italic">No hay detalles de artículos disponibles</div>
                                  )}
                                </div>

                                {/* Botones de Acción */}
                                <div className="d-flex justify-content-end gap-2">
                                  <button
                                    onClick={() => verDetalleSolicitud(solicitud.id)}
                                    className="btn btn-primary"
                                  >
                                    <IconEye size={16} className="me-1" />
                                    Ver Detalle Completo
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Modal de Detalle */}
      {showModal && solicitudDetalle && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <IconFileText className="me-2" />
                  Detalle de Solicitud - {solicitudDetalle.folio}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Información General */}
                <div className="row mb-3">
                  <div className="col-md-3">
                    <span className={`badge ${solicitudDetalle.tipo === 'ENTRADA' ? 'bg-success' : 'bg-secondary'}`}>
                      {solicitudDetalle.tipo}
                    </span>
                  </div>
                  <div className="col-md-4">
                    <small className="text-muted">Solicitante:</small><br />
                    {solicitudDetalle.usuario_solicita_nombre}
                  </div>
                  <div className="col-md-3">
                    <small className="text-muted">Fecha:</small><br />
                    {new Date(solicitudDetalle.fecha).toLocaleDateString()}
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                  <h5 className="mb-3">Artículos Solicitados</h5>
                  <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Artículo</th>
                          <th>Cantidad</th>
                          <th>Stock Actual</th>
                          {solicitudDetalle.tipo === 'SALIDA' && (
                            <th>Estado Stock</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {solicitudDetalle.items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <code className="bg-light text-dark px-2 py-1 rounded">{item.article_code}</code>
                            </td>
                            <td>{item.article_name}</td>
                            <td>
                              <span className="badge bg-success text-white">{item.cantidad}</span>
                            </td>
                            <td>
                              <span className="text-muted">{item.stock_actual}</span>
                            </td>
                            {solicitudDetalle.tipo === 'SALIDA' && (
                              <td>
                                {item.stock_actual >= item.cantidad ? (
                                  <span className="badge bg-success text-white">✓ Disponible</span>
                                ) : (
                                  <span className="badge bg-danger text-white">⚠ Insuficiente</span>
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
                <div className="mb-3">
                  <label className="form-label">
                    Observaciones de Autorización (Opcional)
                  </label>
                  <textarea
                    value={observacionesAutorizacion}
                    onChange={(e) => setObservacionesAutorizacion(e.target.value)}
                    rows={3}
                    className="form-control"
                    placeholder="Agregar comentarios sobre la autorización..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <div className="w-100 d-flex justify-content-between">
                  <button
                    onClick={() => generarPDF(solicitudDetalle.id)}
                    className="btn btn-secondary"
                  >
                    <IconFileText size={16} className="me-1" />
                    Generar PDF
                  </button>
                  
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => procesarAutorizacion(solicitudDetalle.id, 'RECHAZADA')}
                      disabled={procesando}
                      className="btn btn-danger"
                    >
                      <IconX size={16} className="me-1" />
                      {procesando ? 'Procesando...' : 'Rechazar'}
                    </button>
                    
                    <button
                      onClick={() => procesarAutorizacion(solicitudDetalle.id, 'AUTORIZADA')}
                      disabled={procesando}
                      className="btn btn-success"
                    >
                      <IconCheck size={16} className="me-1" />
                      {procesando ? 'Procesando...' : 'Autorizar'}
                    </button>
                  </div>
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
