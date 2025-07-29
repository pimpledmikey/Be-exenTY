import { useEffect, useState } from 'react';
import SalidaForm from './SalidaForm';

const API_URL = import.meta.env.VITE_API_URL;

interface Salida {
  exit_id: number;
  article_id: string;
  quantity: number;
  date: string;
  reason: string;
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
  // Filtro
  const [filtro, setFiltro] = useState('');

  const fetchSalidas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/almacen/salidas`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
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

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando salidas...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  // Filtrado
  const salidasFiltradas = salidas.filter(s => {
    const texto = `${s.exit_id} ${s.articulo_nombre || ''} ${s.article_id} ${s.quantity} ${s.date} ${s.reason} ${s.usuario_nombre || ''} ${s.user_id}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  return (
    <div style={{width: '100%', maxWidth: '100vw', paddingTop: 8}}>
      <h2 className="mb-0">Listado de Salidas</h2>
      {alerta && (
        <div className={`alert alert-${alerta.tipo} alert-dismissible`} role="alert">
          {alerta.mensaje}
          <button type="button" className="btn-close" onClick={() => setAlerta(null)}></button>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button className="btn btn-success mb-0" onClick={() => { setShowForm(true); }}>Crear salida</button>
        <input
          type="text"
          className="form-control ms-2"
          style={{maxWidth: 300}}
          placeholder="Buscar..."
          value={filtro}
          onChange={e => { setFiltro(e.target.value); }}
        />
      </div>
      <div style={{width: '100%'}}>
        <table className="table table-dark dataTable" data-bs-theme="dark" style={{width: '100%'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Artículo</th>
              <th>Cantidad</th>
              <th>Fecha</th>
              <th>Motivo</th>
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
                {/* Acciones deshabilitadas por política */}
                <td><span className="text-muted">No permitido</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal para alta */}
      {showForm && (
        <div className="modal fade show d-block modal-dark" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} data-bs-theme="dark">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar salida</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <SalidaForm
                  onClose={() => {
                    setShowForm(false);
                    fetchSalidas();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
