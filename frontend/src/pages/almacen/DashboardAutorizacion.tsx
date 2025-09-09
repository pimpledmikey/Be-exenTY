import React, { useState, useEffect } from 'react';
import { IconClock, IconCheck, IconX, IconFileText, IconTrendingUp, IconUser, IconCalendar } from '@tabler/icons-react';

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
      const token = localStorage.getItem('token');
      
      // Si no hay token, intentar obtener uno nuevo
      if (!token) {
        console.warn('No hay token en localStorage, intentando autenticar...');
        try {
          const loginResponse = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              username: 'mavila',  // Usuario por defecto para desarrollo
              password: 'Soldier10-'  // Contraseña de desarrollo
            })
          });
          
          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            localStorage.setItem('token', loginData.token);
            console.log('Nuevo token obtenido y guardado en localStorage');
          }
        } catch (loginError) {
          console.error('Error al autenticar:', loginError);
        }
      }

      // Intentar hasta 3 veces con un retraso entre intentos
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const currentToken = localStorage.getItem('token');
          if (!currentToken) {
            console.warn('No hay token disponible después de intentar autenticar');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }

          // Obtener estadísticas
          const statsResponse = await fetch('/api/solicitudes/dashboard/stats', {
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json'
            }
          });

          // Obtener solicitudes recientes
          const recentesResponse = await fetch('/api/solicitudes/dashboard/recientes', {
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
              // Si es error de autenticación, intentar renovar token
              localStorage.removeItem('token');
              // Intentar autenticar de nuevo
              try {
                const loginResponse = await fetch('/api/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    username: 'mavila',
                    password: 'Soldier10-'
                  })
                });
                
                if (loginResponse.ok) {
                  const loginData = await loginResponse.json();
                  localStorage.setItem('token', loginData.token);
                  console.log('Token renovado después de error 401');
                }
              } catch (loginError) {
                console.error('Error al renovar token:', loginError);
              }
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Autorización</h1>
          <p className="text-gray-600">Resumen de solicitudes pendientes y actividad reciente</p>
        </div>
        <button
          onClick={() => window.location.href = '/almacen/autorizacion-solicitudes'}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <IconFileText className="h-4 w-4" />
          Ver Todas las Solicitudes
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IconClock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IconCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Autorizadas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.autorizadas_hoy}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IconX className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rechazadas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rechazadas_hoy}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IconTrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_mes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Solicitudes Recientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <IconClock className="h-5 w-5" />
            Solicitudes Recientes (Urgentes)
          </h3>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600">
              Solicitudes ordenadas por tiempo de espera
            </p>
            <button 
              onClick={fetchDashboardData}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {solicitudesRecientes.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <IconCheck className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p>No hay solicitudes pendientes</p>
            </div>
          ) : (
            solicitudesRecientes.map((solicitud) => (
              <div key={solicitud.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(solicitud.tipo)}`}>
                        {solicitud.tipo}
                      </span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {solicitud.folio}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <IconUser className="h-3 w-3" />
                          {solicitud.usuario_solicita_nombre}
                        </span>
                        <span>{solicitud.total_items} artículos</span>
                        <span className="flex items-center gap-1">
                          <IconCalendar className="h-3 w-3" />
                          {new Date(solicitud.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${getUrgenciaColor(solicitud.tiempo_espera_horas)}`}>
                      {formatTiempoEspera(solicitud.tiempo_espera_horas)} esperando
                    </span>
                    
                    <button
                      onClick={() => window.location.href = `/almacen/autorizacion-solicitudes?solicitud=${solicitud.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Revisar →
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Tiempo de Respuesta</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Promedio:</span>
                <span className="text-sm font-medium">{stats.tiempo_promedio_respuesta} hrs</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((stats.tiempo_promedio_respuesta / 24) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                Meta: Menos de 8 horas
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Resumen de Actividad</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa de Aprobación:</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.total_mes > 0 ? Math.round((stats.autorizadas_hoy / stats.total_mes) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Eficiencia Diaria:</span>
                <span className="text-sm font-medium text-blue-600">
                  {stats.autorizadas_hoy + stats.rechazadas_hoy} procesadas
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAutorizacion;
