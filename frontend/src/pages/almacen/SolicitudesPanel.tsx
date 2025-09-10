import React, { useState, useEffect } from 'react';
import { useSolicitudes } from '../../hooks/useSolicitudes';
import FormSolicitud from '../../components/FormSolicitud';
import ResponsiveTable from '../../components/ResponsiveTable';
import PageHeader from '../../components/PageHeader';
import { createApiUrl } from '../../config/api';

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

  const [activeTab, setActiveTab] = useState<'todas' | 'pendientes' | 'aprobadas'>('todas');
  const [showFormSolicitud, setShowFormSolicitud] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<any[]>([]);

  useEffect(() => {
    loadSolicitudes();
  }, [activeTab]);

  useEffect(() => {
    filterSolicitudes();
  }, [solicitudes, activeTab]);

  const loadSolicitudes = async () => {
    try {
      switch (activeTab) {
        case 'pendientes':
          const pendientes = await fetchSolicitudesPendientes();
          setFilteredSolicitudes(pendientes);
          break;
        case 'aprobadas':
          const aprobadas = await fetchSolicitudesAprobadas();
          setFilteredSolicitudes(aprobadas);
          break;
        default:
          await fetchSolicitudes();
          break;
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    }
  };

  const filterSolicitudes = () => {
    if (!solicitudes) return;

    switch (activeTab) {
      case 'pendientes':
        setFilteredSolicitudes(solicitudes.filter((s: any) => s.estado === 'PENDIENTE'));
        break;
      case 'aprobadas':
        setFilteredSolicitudes(solicitudes.filter((s: any) => s.estado === 'AUTORIZADA'));
        break;
      default:
        setFilteredSolicitudes(solicitudes);
        break;
    }
  };

  const handleAutorizar = async (solicitud: any) => {
    try {
      const result = await autorizarSolicitud(solicitud.id);
      if (result.success) {
        alert('Solicitud autorizada exitosamente');
        await loadSolicitudes();
      } else {
        alert('Error al autorizar solicitud: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al autorizar solicitud');
    }
  };

  const handleProcesar = async (solicitud: any) => {
    try {
      const result = await procesarSolicitud(solicitud.id);
      if (result.success) {
        alert('Solicitud procesada exitosamente');
        await loadSolicitudes();
      } else {
        alert('Error al procesar solicitud: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar solicitud');
    }
  };

  const handleFormSuccess = (folio: string) => {
    alert(`Solicitud creada exitosamente con folio: ${folio}`);
    setShowFormSolicitud(false);
    loadSolicitudes();
  };

  const generarPDF = async (solicitudId: number, folio: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl(`pdf/solicitud/${solicitudId}`), {
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
        a.download = `solicitud-${folio}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        alert(`Error al generar PDF: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar PDF');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getStatusBadge = (estado: string) => {
    const statusClasses = {
      'PENDIENTE': 'bg-warning text-dark',
      'AUTORIZADA': 'bg-success text-dark',
      'RECHAZADA': 'bg-danger text-white',
      'COMPLETADA': 'bg-info text-dark'
    };
    
    return (
      <span className={`badge ${statusClasses[estado as keyof typeof statusClasses] || 'bg-secondary'}`}>
        {estado}
      </span>
    );
  };

  const columns = [
    {
      key: 'folio',
      label: 'Folio',
      render: (value: string) => <span className="font-monospace">{value}</span>
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (value: string) => (
        <span className={`badge ${value === 'ENTRADA' ? 'bg-primary' : 'bg-secondary'}`}>
          {value}
        </span>
      )
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'usuario_solicita_nombre',
      label: 'Solicitante',
      hideOnMobile: true
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value: string) => getStatusBadge(value)
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_: any, solicitud: any) => (
        <div className="btn-group btn-group-sm">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setSelectedSolicitud(solicitud)}
            title="Ver detalles"
          >
            <i className="ti ti-eye"></i>
          </button>
          
          {solicitud.estado === 'PENDIENTE' && (
            <button
              className="btn btn-outline-success btn-sm"
              onClick={() => handleAutorizar(solicitud)}
              title="Autorizar"
            >
              <i className="ti ti-check"></i>
            </button>
          )}
          
          {solicitud.estado === 'AUTORIZADA' && (
            <button
              className="btn btn-outline-info btn-sm"
              onClick={() => handleProcesar(solicitud)}
              title="Procesar"
            >
              <i className="ti ti-truck"></i>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Gestión de Solicitudes"
        subtitle="Administra las solicitudes de entrada y salida de inventario"
        actions={
          <button
            className="btn btn-primary"
            onClick={() => setShowFormSolicitud(true)}
          >
            <i className="ti ti-plus me-2"></i>
            Nueva Solicitud
          </button>
        }
      />

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'todas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('todas')}
                  >
                    Todas
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'pendientes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pendientes')}
                  >
                    Pendientes
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'aprobadas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('aprobadas')}
                  >
                    Aprobadas
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <ResponsiveTable
                columns={columns}
                data={filteredSolicitudes}
                loading={loading}
                emptyMessage="No hay solicitudes disponibles"
                stackOnMobile={true}
                striped={true}
                hover={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal para nueva solicitud */}
      {showFormSolicitud && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nueva Solicitud</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowFormSolicitud(false)}
                ></button>
              </div>
              <div className="modal-body">
                <FormSolicitud
                  onClose={() => setShowFormSolicitud(false)}
                  onSuccess={handleFormSuccess}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles */}
      {selectedSolicitud && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles de Solicitud</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSolicitud(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Folio:</strong> {selectedSolicitud.folio}
                  </div>
                  <div className="col-md-6">
                    <strong>Tipo:</strong> {selectedSolicitud.tipo}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Fecha:</strong> {formatDate(selectedSolicitud.fecha)}
                  </div>
                  <div className="col-md-6">
                    <strong>Estado:</strong> {getStatusBadge(selectedSolicitud.estado)}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <strong>Solicitante:</strong> {selectedSolicitud.usuario_solicita_nombre}
                  </div>
                </div>
                {selectedSolicitud.observaciones && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>Observaciones:</strong>
                      <p className="mt-1">{selectedSolicitud.observaciones}</p>
                    </div>
                  </div>
                )}
                
                {selectedSolicitud.items && selectedSolicitud.items.length > 0 && (
                  <div className="row">
                    <div className="col-12">
                      <strong>Artículos:</strong>
                      <div className="table-responsive mt-2">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Artículo</th>
                              <th>Cantidad</th>
                              {selectedSolicitud.tipo === 'ENTRADA' && <th>Precio Unit.</th>}
                              <th>Observaciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedSolicitud.items.map((item: any, index: number) => (
                              <tr key={index}>
                                <td>{item.articulo_nombre || item.observaciones}</td>
                                <td>{item.cantidad}</td>
                                {selectedSolicitud.tipo === 'ENTRADA' && (
                                  <td>
                                    {item.precio_unitario ? `$${item.precio_unitario}` : '-'}
                                  </td>
                                )}
                                <td>{item.observaciones}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => generarPDF(selectedSolicitud.id, selectedSolicitud.folio)}
                >
                  <i className="ti ti-file-text me-2"></i>
                  Generar PDF
                </button>
                
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedSolicitud(null)}
                >
                  Cerrar
                </button>
                
                {selectedSolicitud.estado === 'PENDIENTE' && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      handleAutorizar(selectedSolicitud);
                      setSelectedSolicitud(null);
                    }}
                  >
                    Autorizar
                  </button>
                )}
                
                {selectedSolicitud.estado === 'AUTORIZADA' && (
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={() => {
                      handleProcesar(selectedSolicitud);
                      setSelectedSolicitud(null);
                    }}
                  >
                    Procesar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SolicitudesPanel;
