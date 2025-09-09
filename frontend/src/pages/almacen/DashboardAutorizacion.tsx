import React, { useState, useEffect } from 'react';
import { IconClock, IconCheck, IconX, IconFileText, IconTrendingUp, IconUser, IconCalendar } from '@tabler/icons-react';
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

  const getTipoColor = (tipo: string) => {
    return tipo === 'ENTRADA' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
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

  const getUrgenciaColor = (horas: number) => {
    if (horas < 2) return 'text-green-600';
    if (horas < 8) return 'text-yellow-600';
    if (horas < 24) return 'text-orange-600';
    return 'text-red-600';
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Autorización</h1>
              <p className="text-gray-600 mt-2">Resumen de solicitudes pendientes y actividad reciente</p>
            </div>
            <button
              onClick={() => window.location.href = '/almacen/autorizacion-solicitudes'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <IconFileText className="h-5 w-5" />
              Ver Todas las Solicitudes
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-md border border-orange-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-orange-500 rounded-full">
                    <IconClock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-800">Pendientes</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.pendientes}</p>
                  <p className="text-xs text-orange-600 mt-1">Esperando autorización</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-md border border-green-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-green-500 rounded-full">
                    <IconCheck className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-800">Autorizadas Hoy</p>
                  <p className="text-3xl font-bold text-green-900">{stats.autorizadas_hoy}</p>
                  <p className="text-xs text-green-600 mt-1">Completadas hoy</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-md border border-red-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-red-500 rounded-full">
                    <IconX className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-800">Rechazadas Hoy</p>
                  <p className="text-3xl font-bold text-red-900">{stats.rechazadas_hoy}</p>
                  <p className="text-xs text-red-600 mt-1">No aprobadas</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <IconTrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-800">Total Este Mes</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total_mes}</p>
                  <p className="text-xs text-blue-600 mt-1">Solicitudes procesadas</p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Solicitudes Recientes */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <IconClock className="h-5 w-5 text-blue-600" />
            Solicitudes Recientes (Urgentes)
          </h3>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600">
              Solicitudes ordenadas por tiempo de espera
            </p>
            <button 
              onClick={fetchDashboardData}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {solicitudesRecientes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <IconCheck className="h-8 w-8 text-green-500" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">¡Todo al día!</h4>
              <p className="text-gray-500">No hay solicitudes pendientes de autorización</p>
            </div>
          ) : (
            solicitudesRecientes.map((solicitud) => (
              <div key={solicitud.id} className="px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTipoColor(solicitud.tipo)}`}>
                        {solicitud.tipo}
                      </span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {solicitud.folio}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                          <IconUser className="h-3 w-3" />
                          {solicitud.usuario_solicita_nombre}
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                          {solicitud.total_items} artículos
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <IconCalendar className="h-3 w-3" />
                          {new Date(solicitud.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getUrgenciaColor(solicitud.tiempo_espera_horas)}`}>
                      {formatTiempoEspera(solicitud.tiempo_espera_horas)} esperando
                    </span>
                    
                    <button
                      onClick={() => window.location.href = `/almacen/autorizacion-solicitudes?solicitud=${solicitud.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors shadow-sm"
                    >
                      Revisar
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Métricas Adicionales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <IconClock className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-blue-900">Tiempo de Respuesta</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Promedio actual:</span>
                <span className="text-xl font-bold text-blue-900">{stats.tiempo_promedio_respuesta} hrs</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((stats.tiempo_promedio_respuesta / 24) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-600 font-medium">Meta: 8 hrs</span>
                <span className="text-blue-600 font-medium">Máximo: 24 hrs</span>
              </div>
              {stats.tiempo_promedio_respuesta <= 8 ? (
                <div className="flex items-center text-green-700 text-sm font-medium">
                  <IconCheck className="h-4 w-4 mr-1" />
                  ¡Dentro de la meta!
                </div>
              ) : (
                <div className="flex items-center text-orange-700 text-sm font-medium">
                  <IconClock className="h-4 w-4 mr-1" />
                  Requiere atención
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md border border-green-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-500 rounded-lg mr-3">
                <IconTrendingUp className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-green-900">Resumen de Actividad</h4>
            </div>
            <div className="space-y-4">
              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-800">Tasa de Aprobación:</span>
                  <span className="text-2xl font-bold text-green-900">
                    {stats.total_mes > 0 ? Math.round((stats.autorizadas_hoy / stats.total_mes) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${stats.total_mes > 0 ? Math.round((stats.autorizadas_hoy / stats.total_mes) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-800">Eficiencia Diaria:</span>
                  <span className="text-xl font-bold text-green-900">
                    {stats.autorizadas_hoy + stats.rechazadas_hoy}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">solicitudes procesadas hoy</p>
              </div>
              
              <div className="flex items-center justify-center text-green-700 text-sm font-medium">
                <IconCheck className="h-4 w-4 mr-1" />
                Sistema funcionando correctamente
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
