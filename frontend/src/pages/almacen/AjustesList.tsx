import { useEffect, useState } from 'react';
import AjusteForm from './AjusteForm';

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

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando ajustes...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div style={{width: '100%', maxWidth: '100vw', paddingTop: 8}}>
      <h2 className="mb-0">Ajustes de Inventario</h2>
      <button className="btn btn-success mb-2" onClick={() => setShowForm(true)}>Registrar ajuste</button>
      <div style={{width: '100%'}}>
        <table className="table table-dark dataTable" data-bs-theme="dark" style={{width: '100%'}}>
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
        <div className="modal fade show d-block modal-dark" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} data-bs-theme="dark">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar ajuste</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
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
