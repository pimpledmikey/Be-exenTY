import { useEffect, useState } from 'react';
import EntradaForm from './EntradaForm';

const API_URL = import.meta.env.VITE_API_URL;

interface Entrada {
  entry_id: number;
  article_id: string;
  quantity: number;
  unit_cost: number;
  invoice_number: string;
  date: string;
  supplier: string;
  articulo_nombre?: string;
}

export default function EntradasList() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'danger'; mensaje: string } | null>(null);

  // Paginación y filtrado
  const [pagina, setPagina] = useState(1);
  const porPagina = 15;
  const [filtro, setFiltro] = useState('');
  const entradasFiltradas = entradas.filter(e => {
    const texto = `${e.articulo_nombre || ''} ${e.article_id} ${e.entry_id} ${e.quantity} ${e.unit_cost} ${e.invoice_number || ''} ${e.supplier || ''}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });
  const totalPaginas = Math.ceil(entradasFiltradas.length / porPagina);
  const entradasPagina = entradasFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  const fetchEntradas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/almacen/entradas`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Error al cargar entradas');
      const data = await res.json();
      setEntradas(data.map((e: any) => ({ ...e, article_id: String(e.article_id) })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntradas();
  }, []);

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando entradas...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div style={{width: '100%', maxWidth: '100vw', paddingTop: 8}}>
      <h2 className="mb-0">Listado de Entradas</h2>
      {alerta && (
        <div className={`alert alert-${alerta.tipo} alert-dismissible`} role="alert">
          {alerta.mensaje}
          <button type="button" className="btn-close" onClick={() => setAlerta(null)}></button>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button className="btn btn-success mb-0" onClick={() => { setShowForm(true); }}>Crear entrada</button>
        <input
          type="text"
          className="form-control ms-2"
          style={{maxWidth: 300}}
          placeholder="Buscar..."
          value={filtro}
          onChange={e => { setFiltro(e.target.value); setPagina(1); }}
        />
      </div>
      <div style={{width: '100%'}}>
        <table className="table table-dark dataTable" data-bs-theme="dark" style={{width: '100%'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Artículo</th>
              <th>Cantidad</th>
              <th>Costo Unitario</th>
              <th>Factura</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              {/* Acciones deshabilitadas por política */}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entradasPagina.map(e => (
              <tr key={e.entry_id}>
                <td>{e.entry_id}</td>
                <td>{e.articulo_nombre || e.article_id}</td>
                <td>{e.quantity}</td>
                <td>{e.unit_cost}</td>
                <td>{e.invoice_number}</td>
                <td>{e.date}</td>
                <td>{e.supplier}</td>
                <td><span className="text-muted">No permitido</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginación */}
      <nav className="d-flex justify-content-center align-items-center my-3">
        <ul className="pagination mb-0">
          <li className={`page-item${pagina === 1 ? ' disabled' : ''}`}>
            <button className="page-link" onClick={() => setPagina(p => Math.max(1, p - 1))}>&laquo;</button>
          </li>
          {[...Array(totalPaginas)].map((_, i) => (
            <li key={i} className={`page-item${pagina === i + 1 ? ' active' : ''}`}>
              <button className="page-link" onClick={() => setPagina(i + 1)}>{i + 1}</button>
            </li>
          ))}
          <li className={`page-item${pagina === totalPaginas ? ' disabled' : ''}`}>
            <button className="page-link" onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}>&raquo;</button>
          </li>
        </ul>
      </nav>
      {/* Modal para alta */}
      {showForm && (
        <div className="modal fade show d-block modal-dark" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} data-bs-theme="dark">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar entrada</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <EntradaForm
                  entrada={null}
                  onClose={() => {
                    setShowForm(false);
                    fetchEntradas();
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
