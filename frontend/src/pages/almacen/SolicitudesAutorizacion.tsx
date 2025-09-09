import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import './SolicitudesAutorizacion.css';

interface SolicitudItem {
  id: number;
  article_id: number;
  articulo_codigo: string;
  articulo_nombre: string;
  cantidad: number;
  precio_unitario?: number;
  observaciones?: string;
}

interface Solicitud {
  id: number;
  folio: string;
  tipo: 'ENTRADA' | 'SALIDA';
  fecha: string;
  usuario_solicita_id: number;
  usuario_solicita_nombre: string;
  usuario_autoriza_id?: number;
  usuario_autoriza_nombre?: string;
  estado: 'PENDIENTE' | 'AUTORIZADA' | 'RECHAZADA' | 'COMPLETADA';
  observaciones?: string;
  created_at: string;
  updated_at: string;
  items: SolicitudItem[];
}

const SolicitudesAutorizacion: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'autorizar' | 'rechazar' | null>(null);
  const [observacionesAutorizacion, setObservacionesAutorizacion] = useState('');

  // Cargar solicitudes pendientes
  useEffect(() => {
    cargarSolicitudesPendientes();
  }, []);

  const cargarSolicitudesPendientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/solicitudes?estado=PENDIENTE', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSolicitudes(data);
      } else {
        console.error('Error al cargar solicitudes');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalAutorizacion = (solicitud: Solicitud, tipo: 'autorizar' | 'rechazar') => {
    setSelectedSolicitud(solicitud);
    setActionType(tipo);
    setShowModal(true);
    setObservacionesAutorizacion('');
  };

  const procesarAutorizacion = async () => {
    if (!selectedSolicitud || !actionType) return;

    try {
      const token = localStorage.getItem('token');
      const nuevoEstado = actionType === 'autorizar' ? 'AUTORIZADA' : 'RECHAZADA';
      
      const response = await fetch(`/api/solicitudes/${selectedSolicitud.id}/autorizar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: nuevoEstado,
          observaciones_autorizacion: observacionesAutorizacion
        })
      });

      if (response.ok) {
        // Recargar solicitudes
        await cargarSolicitudesPendientes();
        setShowModal(false);
        
        // Mostrar mensaje de éxito
        alert(`Solicitud ${nuevoEstado.toLowerCase()} exitosamente`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la autorización');
    }
  };

  const generarPDF = async (solicitud: Solicitud) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pdf/solicitud/${solicitud.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Solicitud_${solicitud.folio}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error al generar PDF');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar PDF');
    }
  };

  const columns = [
    {
      key: 'folio',
      label: 'Folio',
      render: (value: string) => (
        <span className="font-medium text-blue-600">{value}</span>
      )
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'ENTRADA' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'usuario_solicita_nombre',
      label: 'Solicitante'
    },
    {
      key: 'items',
      label: 'Artículos',
      render: (items: SolicitudItem[]) => (
        <div>
          <span className="font-medium">{items.length} artículo(s)</span>
          <div className="text-xs text-gray-500 mt-1">
            {items.slice(0, 2).map(item => item.articulo_nombre).join(', ')}
            {items.length > 2 && '...'}
          </div>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Solicitado',
      render: (value: string) => (
        <div className="text-xs">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-gray-500">{new Date(value).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, solicitud: Solicitud) => (
        <div className="flex gap-2">
          <button
            onClick={() => abrirModalAutorizacion(solicitud, 'autorizar')}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
          >
            ✓ Autorizar
          </button>
          <button
            onClick={() => abrirModalAutorizacion(solicitud, 'rechazar')}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
          >
            ✗ Rechazar
          </button>
          <button
            onClick={() => setSelectedSolicitud(solicitud)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
          >
            👁️ Ver
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Autorización de Solicitudes"
        subtitle="Revisar y aprobar solicitudes pendientes"
      />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Solicitudes Pendientes ({solicitudes.length})
          </h3>
          <button
            onClick={cargarSolicitudesPendientes}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Actualizar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando solicitudes...</div>
        ) : solicitudes.length > 0 ? (
          <ResponsiveTable
            data={solicitudes}
            columns={columns}
            keyField="id"
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay solicitudes pendientes
          </div>
        )}
      </div>

      {/* Modal de Autorización */}
      {showModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {actionType === 'autorizar' ? '✓ Autorizar' : '✗ Rechazar'} Solicitud
            </h3>
            
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Folio:</label>
                  <p className="font-semibold">{selectedSolicitud.folio}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo:</label>
                  <p className="font-semibold">{selectedSolicitud.tipo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha:</label>
                  <p>{new Date(selectedSolicitud.fecha).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Solicitante:</label>
                  <p>{selectedSolicitud.usuario_solicita_nombre}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artículos ({selectedSolicitud.items.length}):
                </label>
                <div className="max-h-32 overflow-y-auto border rounded p-2">
                  {selectedSolicitud.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-1 border-b last:border-b-0">
                      <span className="text-sm">
                        {item.articulo_codigo} - {item.articulo_nombre}
                      </span>
                      <span className="text-sm font-medium">
                        Cant: {item.cantidad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSolicitud.observaciones && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Observaciones:</label>
                  <p className="text-sm text-gray-600">{selectedSolicitud.observaciones}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones de {actionType === 'autorizar' ? 'Autorización' : 'Rechazo'}:
                </label>
                <textarea
                  value={observacionesAutorizacion}
                  onChange={(e) => setObservacionesAutorizacion(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder={`Ingrese las observaciones de ${actionType === 'autorizar' ? 'autorización' : 'rechazo'}...`}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={procesarAutorizacion}
                className={`px-4 py-2 text-white rounded ${
                  actionType === 'autorizar'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionType === 'autorizar' ? '✓ Autorizar' : '✗ Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Solicitud */}
      {selectedSolicitud && !showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">
                Detalle de Solicitud - {selectedSolicitud.folio}
              </h3>
              <button
                onClick={() => setSelectedSolicitud(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo:</label>
                <p className="font-semibold">{selectedSolicitud.tipo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha:</label>
                <p>{new Date(selectedSolicitud.fecha).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado:</label>
                <p className="font-semibold">{selectedSolicitud.estado}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Artículos:</h4>
              <div className="border rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Código</th>
                      <th className="px-4 py-2 text-left">Artículo</th>
                      <th className="px-4 py-2 text-right">Cantidad</th>
                      <th className="px-4 py-2 text-right">Precio Unit.</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSolicitud.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.articulo_codigo}</td>
                        <td className="px-4 py-2">{item.articulo_nombre}</td>
                        <td className="px-4 py-2 text-right">{item.cantidad}</td>
                        <td className="px-4 py-2 text-right">
                          {item.precio_unitario ? `$${item.precio_unitario.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {item.precio_unitario 
                            ? `$${(item.cantidad * item.precio_unitario).toFixed(2)}` 
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => generarPDF(selectedSolicitud)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                📄 Generar PDF
              </button>
              <button
                onClick={() => setSelectedSolicitud(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudesAutorizacion;
