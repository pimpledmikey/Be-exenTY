import { useEffect, useState } from 'react';
import AjusteForm from './AjusteForm';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionAlert, PermissionGuard } from '../../components/PermissionComponents';
import { usePermissionError } from '../../utils/permissionUtils';

const API_URL = import.meta.env.VITE_API_URL;

interface Ajuste {
  adjustment_id: number;
  article_id: string;
  quantity: number;
  reason: string;
  user_id: string;
  date: string;
  articulo_nombre?: string;
  usuario_nombre?: string;
}

export default function AjustesList() {
  const [ajustes, setAjustes] = useState<Ajuste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Hook para verificar permisos del usuario
  const { canPerform, loading: permissionsLoading } = usePermissions();
  const { permissionError, showPermissionError, clearPermissionError } = usePermissionError();

  const fetchAjustes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ajustes`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Error al cargar ajustes');
      const data = await res.json();
      setAjustes(data.map((a: any) => ({ ...a, article_id: String(a.article_id), user_id: String(a.user_id) })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAjustes();
  }, []);

  if (loading || permissionsLoading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando ajustes...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  // Verificar si el usuario tiene permisos para ver ajustes
  if (!canPerform('ajustes', 'ajustes_view', 'view')) {
    return (
      <div className="alert alert-warning">
        <h4>Sin permisos</h4>
        <p>No tienes permisos para ver los ajustes de inventario. Contacta al administrador.</p>
      </div>
    );
  }

  return (
    <div className="card" data-bs-theme="dark">
      {permissionError && (
        <PermissionAlert 
          show={true}
          onClose={clearPermissionError}
          action="realizar esta acción"
          module="ajustes"
        />
      )}
      
      <div className="card-header">
        <h3 className="card-title">Ajustes de Inventario</h3>
        <div className="card-actions">
          <PermissionGuard 
            canPerform={canPerform}
            module="ajustes"
            permission="ajustes_create"
            action="create"
          >
            <button className="btn btn-success" onClick={() => setShowForm(true)}>Registrar ajuste</button>
          </PermissionGuard>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table card-table table-vcenter text-nowrap datatable table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Artículo</th>
              <th>Cantidad</th>
              <th>Motivo</th>
              <th>Usuario</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ajustes.map(a => (
              <tr key={a.adjustment_id}>
                <td>{a.adjustment_id}</td>
                <td>{a.articulo_nombre || a.article_id}</td>
                <td>{a.quantity}</td>
                <td>{a.reason}</td>
                <td>{a.usuario_nombre || a.user_id}</td>
                <td>{a.date}</td>
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
                <h5 className="modal-title">Registrar ajuste</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <AjusteForm onClose={() => { setShowForm(false); fetchAjustes(); }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
