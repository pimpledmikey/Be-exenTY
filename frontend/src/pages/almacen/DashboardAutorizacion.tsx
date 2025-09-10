import React, { useState, useEffect } from 'react';
import { IconClock, IconCheck, IconX, IconFileText, IconTrendingUp, IconUser, IconCalendar, IconChevronDown, IconChevronRight, IconList } from '@tabler/icons-react';
import { createApiUrl } from '../../config/api';

interface ResumenStats {
  pendientes: number;
  autorizadas_hoy: number;
  rechazadas_hoy: number;
  total_mes: number;
  tiempo_promedio_respuesta: number;
}

interface SolicitudReciente {
  id: number;
  folio: string;
  tipo: 'ENTRADA' | 'SALIDA';
  usuario_solicita_nombre: string;
  total_items: number;
  created_at: string;
  tiempo_espera_horas: number;
}

const DashboardAutorizacion: React.FC = () => {
  const [stats, setStats] = useState<ResumenStats | null>(null);
  const [solicitudesRecientes, setSolicitudesRecientes] = useState<SolicitudReciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [solicitudItems, setSolicitudItems] = useState<{[key: number]: any[]}>({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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

          // Obtener estadísticas
          const statsResponse = await fetch(createApiUrl('solicitudes/dashboard/stats'), {
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json'
            }
          });

          // Obtener solicitudes recientes
          const recentesResponse = await fetch(createApiUrl('solicitudes/dashboard/recientes'), {
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (statsResponse.ok && recentesResponse.ok) {
            const statsData = await statsResponse.json();
            const recentesData = await recentesResponse.json();
            
            setStats(statsData.stats);
            setSolicitudesRecientes(recentesData.solicitudes);
            return; // Salir del bucle si fue exitoso
          } else {
            console.warn(`Intento ${attempt + 1} fallido. Stats Status: ${statsResponse.status}, Recientes Status: ${recentesResponse.status}`);
            if (statsResponse.status === 401 || recentesResponse.status === 401) {
              // Si es error de autenticación, limpiar token y terminar
              localStorage.removeItem('token');
              currentToken = null;
              console.error('Token de autenticación inválido. Por favor, inicie sesión nuevamente.');
              break;
            }
          }
          
          // Esperar antes del siguiente intento
          if (attempt < 2) { // No esperar en el último intento
            const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial: 1s, 2s, 4s
            console.log(`Esperando ${delay}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (fetchError) {
          console.error(`Error en intento ${attempt + 1}:`, fetchError);
          // Esperar antes del siguiente intento
          if (attempt < 2) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      console.error('No se pudo obtener datos del dashboard después de múltiples intentos');
    } finally {
      setLoading(false);
    }
  };

  const formatTiempoEspera = (horas: number) => {
    if (horas < 1) {
      return `${Math.round(horas * 60)} min`;
    } else if (horas < 24) {
      return `${Math.round(horas)} hrs`;
    } else {
      return `${Math.round(horas / 24)} días`;
    }
  };

  const getUrgenciaColorClass = (horas: number) => {
    if (horas < 2) return 'bg-success text-white';
    if (horas < 8) return 'bg-warning text-dark';
    if (horas < 24) return 'bg-orange text-white';
    return 'bg-danger text-white';
  };

  const toggleExpanded = (solicitudId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(solicitudId)) {
      newExpanded.delete(solicitudId);
    } else {
      newExpanded.add(solicitudId);
      // Cargar items si no están cargados
      if (!solicitudItems[solicitudId]) {
        fetchSolicitudDetalle(solicitudId);
      }
    }
    setExpandedRows(newExpanded);
  };

  const fetchSolicitudDetalle = async (solicitudId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(createApiUrl(`solicitudes/${solicitudId}/detalle`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Usar los items de la respuesta de detalle
        setSolicitudItems(prev => ({
          ...prev,
          [solicitudId]: data.solicitud?.items || []
        }));
      }
    } catch (error) {
      console.error('Error fetching solicitud detalle:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="container-xl">
        {/* Header */}
        <div className="row row-deck row-cards mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <IconClock className="me-2" />
                  Dashboard de Autorización
                </h3>
                <div className="card-actions">
                  <button
                    onClick={() => window.location.href = '/almacen/autorizacion-solicitudes'}
                    className="btn btn-primary"
                  >
                    <IconFileText className="me-2" />
                    Ver Todas las Solicitudes
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p className="text-muted">Resumen de solicitudes pendientes y actividad reciente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="row row-cards mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="card card-sm">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <span className="bg-orange text-white avatar">
                        <IconClock />
                      </span>
                    </div>
                    <div className="col">
                      <div className="font-weight-medium">
                        Pendientes
                      </div>
                      <div className="text-h1 mb-0">{stats.pendientes}</div>
                      <div className="text-muted">Esperando autorización</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card card-sm">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <span className="bg-success text-white avatar">
                        <IconCheck />
                      </span>
                    </div>
                    <div className="col">
                      <div className="font-weight-medium">
                        Autorizadas Hoy
                      </div>
                      <div className="text-h1 mb-0">{stats.autorizadas_hoy}</div>
                      <div className="text-muted">Completadas hoy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card card-sm">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <span className="bg-danger text-white avatar">
                        <IconX />
                      </span>
                    </div>
                    <div className="col">
                      <div className="font-weight-medium">
                        Rechazadas Hoy
                      </div>
                      <div className="text-h1 mb-0">{stats.rechazadas_hoy}</div>
                      <div className="text-muted">No aprobadas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card card-sm">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <span className="bg-primary text-white avatar">
                        <IconTrendingUp />
                      </span>
                    </div>
                    <div className="col">
                      <div className="font-weight-medium">
                        Total Este Mes
                      </div>
                      <div className="text-h1 mb-0">{stats.total_mes}</div>
                      <div className="text-muted">Solicitudes procesadas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Solicitudes Recientes */}
        <div className="row row-cards">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <IconList className="me-2" />
                  Solicitudes Recientes (Urgentes)
                </h3>
                <div className="card-actions">
                  <button 
                    onClick={fetchDashboardData}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-refresh me-1" width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p className="text-muted mb-4">Solicitudes ordenadas por tiempo de espera</p>
                
                {solicitudesRecientes.length === 0 ? (
                  <div className="empty">
                    <div className="empty-img">
                      <IconCheck size={48} className="text-success" />
                    </div>
                    <p className="empty-title">¡Todo al día!</p>
                    <p className="empty-subtitle text-muted">
                      No hay solicitudes pendientes de autorización
                    </p>
                  </div>
                ) : (
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
                        {solicitudesRecientes.map((solicitud) => (
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
                                <span className="text-primary font-weight-medium">{solicitud.folio}</span>
                              </td>
                              <td>
                                <span className={`badge ${solicitud.tipo === 'ENTRADA' ? 'bg-success text-dark' : 'bg-secondary text-white'}`}>
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
                                <span className="badge bg-azure text-dark">{solicitud.total_items} items</span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center text-muted">
                                  <IconCalendar size={16} className="me-1" />
                                  {new Date(solicitud.created_at).toLocaleDateString()}
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${getUrgenciaColorClass(solicitud.tiempo_espera_horas)}`}>
                                  {formatTiempoEspera(solicitud.tiempo_espera_horas)}
                                </span>
                              </td>
                              <td>
                                <button
                                  onClick={() => window.location.href = `/almacen/autorizacion-solicitudes?highlight=${solicitud.id}`}
                                  className="btn btn-primary btn-sm"
                                >
                                  Revisar
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
                                      
                                      {solicitudItems[solicitud.id] ? (
                                        <div className="table-responsive">
                                          <table className="table table-sm">
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
                                              {solicitudItems[solicitud.id].map((item: any, index: number) => (
                                                <tr key={index}>
                                                  <td><code className="bg-light text-dark px-2 py-1 rounded">{item.article_code || 'N/A'}</code></td>
                                                  <td>{item.article_name || 'N/A'}</td>
                                                  <td>
                                                    <span className="badge bg-success text-dark">{item.cantidad}</span>
                                                  </td>
                                                  <td>
                                                    <span className="text-muted">{item.stock_actual || 0}</span>
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
                                        <div className="d-flex align-items-center">
                                          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                          <span className="text-muted">Cargando detalles...</span>
                                        </div>
                                      )}
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Adicionales */}
        {stats && (
          <div className="row row-cards mt-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <IconClock className="me-2" />
                    Tiempo de Respuesta
                  </h3>
                </div>
                <div className="card-body">
                  <div className="row align-items-center mb-3">
                    <div className="col-auto">
                      <span className="text-muted">Promedio actual:</span>
                    </div>
                    <div className="col">
                      <div className="text-h3 mb-0">{stats.tiempo_promedio_respuesta} hrs</div>
                    </div>
                  </div>
                  <div className="progress mb-3">
                    <div 
                      className="progress-bar bg-primary" 
                      style={{ width: `${Math.min((stats.tiempo_promedio_respuesta / 24) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="row text-muted">
                    <div className="col">Meta: 8 hrs</div>
                    <div className="col-auto">Máximo: 24 hrs</div>
                  </div>
                  {stats.tiempo_promedio_respuesta <= 8 ? (
                    <div className="mt-2">
                      <span className="badge bg-success">
                        <IconCheck size={16} className="me-1" />
                        ¡Dentro de la meta!
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <span className="badge bg-warning">
                        <IconClock size={16} className="me-1" />
                        Requiere atención
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <IconTrendingUp className="me-2" />
                    Resumen de Actividad
                  </h3>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="row align-items-center mb-2">
                      <div className="col">Tasa de Aprobación:</div>
                      <div className="col-auto">
                        <span className="text-h4 text-success">
                          {stats.total_mes > 0 ? Math.round((stats.autorizadas_hoy / stats.total_mes) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${stats.total_mes > 0 ? Math.round((stats.autorizadas_hoy / stats.total_mes) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="row align-items-center">
                      <div className="col">Eficiencia Diaria:</div>
                      <div className="col-auto">
                        <span className="text-h4 text-primary">
                          {stats.autorizadas_hoy + stats.rechazadas_hoy}
                        </span>
                      </div>
                    </div>
                    <div className="text-muted small">solicitudes procesadas hoy</div>
                  </div>
                  
                  <div className="mt-2">
                    <span className="badge bg-success">
                      <IconCheck size={16} className="me-1" />
                      Sistema funcionando correctamente
                    </span>
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

export default DashboardAutorizacion;
