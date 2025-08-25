import React, { useState, useEffect } from 'react';
import { fetchWithPermissions } from '../../utils/permissionUtils';

interface SalidaAutomatica {
  exit_id: number;
  article_id: number;
  article_code: string;
  article_name: string;
  quantity: number;
  reason: string;
  exit_date: string;
  created_at: string;
  tipo_salida: string;
}

const HistorialSalidasAutomaticas: React.FC = () => {
  const [salidas, setSalidas] = useState<SalidaAutomatica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      const response = await fetchWithPermissions(`${API_URL}/almacen/historial-salidas-automaticas`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }
      
      const data = await response.json();
      setSalidas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const extraerFolio = (reason: string) => {
    const match = reason.match(/Solicitud ([A-Z]+-\d+)/);
    return match ? match[1] : 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando historial...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
        <button 
          onClick={cargarHistorial}
          className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          📦 Historial de Salidas Automáticas
        </h1>
        <p className="text-gray-600">
          Registro de salidas generadas automáticamente al crear solicitudes PDF
        </p>
        <button 
          onClick={cargarHistorial}
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          🔄 Actualizar
        </button>
      </div>

      {salidas.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg">No hay salidas automáticas registradas</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Folio
                </th>
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artículo
                </th>
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Salida
                </th>
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-4 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salidas.map((salida) => (
                <tr key={salida.exit_id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {extraerFolio(salida.reason)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {salida.article_code}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                    {salida.article_name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      -{salida.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFecha(salida.exit_date)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearFecha(salida.created_at)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 max-w-md">
                    <div className="truncate" title={salida.reason}>
                      {salida.reason}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <strong>Total de salidas automáticas:</strong> {salidas.length}
      </div>
    </div>
  );
};

export default HistorialSalidasAutomaticas;
