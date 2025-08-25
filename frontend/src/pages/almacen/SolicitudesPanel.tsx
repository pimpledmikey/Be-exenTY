import React, { useState, useEffect } from 'react';
import { useSolicitudes } from '../../hooks/useSolicitudes';
import { useUserInfo } from '../../hooks/useUserInfo';
import FormSolicitud from '../../components/FormSolicitud';

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

const SolicitudesPanel: React.FC = () => {
  const { 
    solicitudes, 
    loading, 
    error, 
    fetchSolicitudes, 
    fetchSolicitudesPendientes, 
    fetchSolicitudesAprobadas,
    autorizarSolicitud,
    procesarSolicitud
  } = useSolicitudes();
  
  const { userInfo } = useUserInfo();
  const [showForm, setShowForm] = useState(false);
  const [tipoSolicitud, setTipoSolicitud] = useState<'entrada' | 'salida'>('entrada');
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'PROCESADA'>('TODAS');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [showModalAutorizacion, setShowModalAutorizacion] = useState(false);
  const [observacionesAutorizacion, setObservacionesAutorizacion] = useState('');

  useEffect(() => {
    if (filtroEstado === 'TODAS') {
      fetchSolicitudes();
    } else if (filtroEstado === 'PENDIENTE') {
      fetchSolicitudesPendientes();
    } else if (filtroEstado === 'APROBADA') {
      fetchSolicitudesAprobadas();
    }
  }, [filtroEstado]);

  const handleCrearSolicitud = (tipo: 'entrada' | 'salida') => {
    setTipoSolicitud(tipo);
    setShowForm(true);
  };

  const handleAutorizar = async (solicitud: Solicitud, accion: 'APROBAR' | 'RECHAZAR') => {
    if (!userInfo) {
      alert('Usuario no identificado');
      return;
    }

    const result = await autorizarSolicitud(
      solicitud.solicitud_id,
      accion,
      userInfo.user_id,
      observacionesAutorizacion
    );

    if (result.success) {
      alert(`Solicitud ${accion === 'APROBAR' ? 'aprobada' : 'rechazada'} exitosamente`);
      setShowModalAutorizacion(false);
      setSolicitudSeleccionada(null);
      setObservacionesAutorizacion('');
      fetchSolicitudes();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleProcesar = async (solicitud: Solicitud) => {
    if (!userInfo) {
      alert('Usuario no identificado');
      return;
    }

    if (!confirm(`¿Está seguro que desea procesar la solicitud ${solicitud.folio}?\n\nEsto registrará las ${solicitud.tipo.toLowerCase()}s en el inventario automáticamente.`)) {
      return;
    }

    const result = await procesarSolicitud(solicitud.solicitud_id, userInfo.user_id);

    if (result.success) {
      alert(`Solicitud procesada exitosamente. Las ${solicitud.tipo.toLowerCase()}s han sido registradas en el inventario.`);
      fetchSolicitudes();
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const abrirModalAutorizacion = (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setShowModalAutorizacion(true);
    setObservacionesAutorizacion('');
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      'PENDIENTE': 'bg-warning text-dark',
      'APROBADA': 'bg-success',
      'RECHAZADA': 'bg-danger',
      'PROCESADA': 'bg-primary'
    };
    return badges[estado as keyof typeof badges] || 'bg-secondary';
  };

  const getTipoBadge = (tipo: string) => {
    return tipo === 'ENTRADA' ? 'bg-info text-dark' : 'bg-warning text-dark';
  };

  if (showForm) {
    return (
      <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <FormSolicitud 
              initialData={{ tipo: tipoSolicitud }}
              onClose={() => setShowForm(false)}
              onSuccess={(folio) => {
                console.log(`Solicitud creada: ${folio}`);
                fetchSolicitudes();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Solicitudes</h2>
        <div className="btn-group">
          <button 
            className="btn btn-success"
            onClick={() => handleCrearSolicitud('entrada')}
          >
            + Nueva Entrada
          </button>
          <button 
            className="btn btn-warning"
            onClick={() => handleCrearSolicitud('salida')}
          >
            + Nueva Salida
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Filtrar por Estado</label>
              <select 
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as any)}
              >
                <option value="TODAS">Todas las solicitudes</option>
                <option value="PENDIENTE">Pendientes de autorización</option>
                <option value="APROBADA">Aprobadas (pendientes de procesar)</option>
                <option value="PROCESADA">Procesadas</option>
                <option value="RECHAZADA">Rechazadas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Lista de solicitudes */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">
            Solicitudes {filtroEstado !== 'TODAS' && `- ${filtroEstado}`}
          </h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Solicitante</th>
                    <th>Fecha</th>
                    <th>Items</th>
                    <th>Autoriza</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.length > 0 ? (
                    solicitudes.map((solicitud) => (
                      <tr key={solicitud.solicitud_id}>
                        <td><strong>{solicitud.folio}</strong></td>
                        <td>
                          <span className={`badge ${getTipoBadge(solicitud.tipo)}`}>
                            {solicitud.tipo}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getEstadoBadge(solicitud.estado)}`}>
                            {solicitud.estado}
                          </span>
                        </td>
                        <td>{solicitud.usuario_solicita_nombre}</td>
                        <td>{new Date(solicitud.fecha).toLocaleDateString('es-ES')}</td>
                        <td>
                          <span className="badge bg-secondary">{solicitud.total_items}</span>
                        </td>
                        <td>{solicitud.usuario_autoriza_nombre || '-'}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            {solicitud.estado === 'PENDIENTE' && (
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => abrirModalAutorizacion(solicitud)}
                                title="Autorizar/Rechazar"
                              >
                                ⚖️
                              </button>
                            )}
                            {solicitud.estado === 'APROBADA' && (
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleProcesar(solicitud)}
                                title="Procesar (ejecutar entrada/salida)"
                              >
                                ✅
                              </button>
                            )}
                            <button
                              className="btn btn-outline-info"
                              onClick={() => alert('Función de detalle próximamente')}
                              title="Ver detalles"
                            >
                              👁️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center text-muted">
                        No hay solicitudes para mostrar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de autorización */}
      {showModalAutorizacion && solicitudSeleccionada && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Autorizar Solicitud</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModalAutorizacion(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <h6>📋 Solicitud: {solicitudSeleccionada.folio}</h6>
                  <ul className="mb-0">
                    <li><strong>Tipo:</strong> {solicitudSeleccionada.tipo}</li>
                    <li><strong>Solicitante:</strong> {solicitudSeleccionada.usuario_solicita_nombre}</li>
                    <li><strong>Fecha:</strong> {new Date(solicitudSeleccionada.fecha).toLocaleDateString('es-ES')}</li>
                    <li><strong>Items:</strong> {solicitudSeleccionada.total_items}</li>
                  </ul>
                </div>

                <div className="mb-3">
                  <label className="form-label">Observaciones de autorización</label>
                  <textarea
                    className="form-control"
                    value={observacionesAutorizacion}
                    onChange={(e) => setObservacionesAutorizacion(e.target.value)}
                    rows={3}
                    placeholder="Observaciones opcionales..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModalAutorizacion(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleAutorizar(solicitudSeleccionada, 'RECHAZAR')}
                >
                  ❌ Rechazar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleAutorizar(solicitudSeleccionada, 'APROBAR')}
                >
                  ✅ Aprobar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudesPanel;
