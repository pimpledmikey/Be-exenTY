import { useEffect, useState } from 'react';
import SalidaForm from './SalidaForm';
import SolicitudAutorizacion from '../../components/SolicitudAutorizacion';
import { useSolicitudAutorizacion } from '../../hooks/useSolicitudAutorizacion';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionAlert, PermissionGuard } from '../../components/PermissionComponents';
import { usePermissionError, fetchWithPermissions } from '../../utils/permissionUtils';

const API_URL = import.meta.env.VITE_API_URL;

interface Salida {
  exit_id: number;
  article_id: string;
  quantity: number;
  date: string;
  reason: string; // Nombre del proyecto
  user_id: string;
  articulo_nombre?: string;
  usuario_nombre?: string;
}

export default function SalidasList() {
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'danger'; mensaje: string } | null>(null);
  
  // Hook para verificar permisos del usuario
  const { canPerform, loading: permissionsLoading } = usePermissions();
  const { permissionError, showPermissionError, clearPermissionError } = usePermissionError();
  
  // Hook para solicitud de autorización
  const { 
    solicitudData, 
    showSolicitud, 
    generarSolicitudSalida, 
    cerrarSolicitud 
  } = useSolicitudAutorizacion();
  
  // Filtro
  const [filtro, setFiltro] = useState('');

  const fetchSalidas = async () => {
    setLoading(true);
    try {
      const res = await fetchWithPermissions(`${API_URL}/almacen/salidas`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }, showPermissionError);
      
      if (!res.ok) throw new Error('Error al cargar salidas');
      const data = await res.json();
      setSalidas(data.map((s: any) => ({ ...s, article_id: String(s.article_id), user_id: String(s.user_id) })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalidas();
  }, []);

  if (loading || permissionsLoading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando salidas...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  
  // Verificar si el usuario tiene permisos para ver salidas
  if (!canPerform('salidas', 'salidas_view', 'view')) {
    return (
      <div className="alert alert-warning">
        <h4>Sin permisos</h4>
        <p>No tienes permisos para ver las salidas de inventario. Contacta al administrador.</p>
      </div>
    );
  }

  // Filtrado
  const salidasFiltradas = salidas.filter(s => {
    const texto = `${s.exit_id} ${s.articulo_nombre || ''} ${s.article_id} ${s.quantity} ${s.date} ${s.reason} ${s.usuario_nombre || ''} ${s.user_id}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  return (
    <div className="card" data-bs-theme="dark">
      <div className="card-header">
        <h3 className="card-title">Listado de Salidas</h3>
        <div className="card-actions d-flex">
          <input
            type="text"
            className="form-control me-2"
            style={{maxWidth: 300}}
            placeholder="Buscar..."
            value={filtro}
            onChange={e => { setFiltro(e.target.value); }}
          />
          {salidasFiltradas.length > 0 && (
            <button 
              className="btn btn-warning me-2" 
              onClick={() => generarSolicitudSalida(salidasFiltradas)}
              title="Generar Solicitud de Autorización con estas salidas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              📋 Generar
            </button>
          )}
          <PermissionGuard
            module="salidas"
            permission="salidas_create"
            action="create"
            canPerform={canPerform}
          >
            <button className="btn btn-success" onClick={() => { setShowForm(true); }}>Crear salida</button>
          </PermissionGuard>
        </div>
      </div>
      {permissionError && (
        <PermissionAlert 
          show={true}
          onClose={clearPermissionError}
          action="realizar esta acción"
          module="salidas"
        />
      )}
      
      {alerta && (
        <div className="card-alert alert alert-success mb-0">
          {alerta.mensaje}
          <button type="button" className="btn-close" onClick={() => setAlerta(null)}></button>
        </div>
      )}
      <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        <table className="table card-table table-vcenter text-nowrap datatable table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Artículo</th>
              <th>Cantidad</th>
              <th>Fecha</th>
              <th>Proyecto</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {salidasFiltradas.map(s => (
              <tr key={s.exit_id}>
                <td>{s.exit_id}</td>
                <td>{s.articulo_nombre || s.article_id}</td>
                <td>{s.quantity}</td>
                <td>{s.date}</td>
                <td>{s.reason}</td>
                <td>{s.usuario_nombre || s.user_id}</td>
                <td>
                  <PermissionGuard 
                    canPerform={canPerform}
                    module="salidas"
                    permission="salidas_edit"
                    action="edit"
                  >
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      title="Editar salida"
                    >
                      Editar
                    </button>
                  </PermissionGuard>
                  
                  <PermissionGuard 
                    canPerform={canPerform}
                    module="salidas"
                    permission="salidas_delete"
                    action="delete"
                  >
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      title="Eliminar salida"
                    >
                      Eliminar
                    </button>
                  </PermissionGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" data-bs-theme="dark">
              <div className="modal-header">
                <h5 className="modal-title">Crear Salida</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <SalidaForm onClose={() => { setShowForm(false); fetchSalidas(); setAlerta({ tipo: 'success', mensaje: 'Salida creada con éxito' }); }} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Solicitud de Autorización */}
      {showSolicitud && solicitudData && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content" data-bs-theme="dark">
              <div className="modal-header">
                <h5 className="modal-title">Solicitud de Autorización de Salida</h5>
                <button type="button" className="btn-close" onClick={cerrarSolicitud}></button>
              </div>
              <div className="modal-body p-0">
                <SolicitudAutorizacion 
                  fecha={solicitudData.fecha}
                  items={solicitudData.items}
                  solicitante={solicitudData.solicitante}
                  autoriza={solicitudData.autoriza}
                  tipo={solicitudData.tipo}
                  folio={solicitudData.folio}
                  onClose={cerrarSolicitud}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
