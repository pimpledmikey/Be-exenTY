import { useEffect, useState } from 'react';
import SalidaForm from './SalidaForm';
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
    if (!canPerform('salidas', 'salidas_view', 'view')) {
      showPermissionError('No tienes permisos para ver las salidas');
      return;
    }
    fetchSalidas();
  }, [canPerform, showPermissionError]);

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
      <div className="table-responsive">
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
    </div>
  );
}
