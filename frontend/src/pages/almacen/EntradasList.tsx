import { useEffect, useState } from 'react';
import EntradaForm from './EntradaForm';

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
  const [editEntrada, setEditEntrada] = useState<Entrada | null>(null);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'danger'; mensaje: string } | null>(null);
  const [entradaAEliminar, setEntradaAEliminar] = useState<Entrada | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Paginación y filtrado
  const [pagina, setPagina] = useState(1);
  const porPagina = 15;
  const [filtro] = useState('');
  const entradasFiltradas = entradas.filter(e =>
    (e.articulo_nombre || String(e.article_id)).toLowerCase().includes(filtro.toLowerCase()) ||
    String(e.entry_id).includes(filtro) ||
    String(e.quantity).includes(filtro) ||
    String(e.unit_cost).includes(filtro) ||
    (e.invoice_number || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (e.supplier || '').toLowerCase().includes(filtro.toLowerCase())
  );
  const totalPaginas = Math.ceil(entradasFiltradas.length / porPagina);
  const entradasPagina = entradasFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  const fetchEntradas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/almacen/entradas', {
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

  const eliminarEntrada = async () => {
    if (!entradaAEliminar) return;
    try {
      const res = await fetch(`/api/almacen/entradas/${entradaAEliminar.entry_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Error al eliminar entrada');
      setAlerta({ tipo: 'success', mensaje: 'Entrada eliminada correctamente' });
      fetchEntradas();
    } catch (err) {
      setAlerta({ tipo: 'danger', mensaje: 'No se pudo eliminar la entrada' });
    } finally {
      setShowConfirm(false);
      setEntradaAEliminar(null);
    }
  };

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
      <button className="btn btn-success mb-0" onClick={() => { setShowForm(true); }}>Crear entrada</button>
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
                <td>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => { setEditEntrada(e); setShowForm(true); }}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => { setEntradaAEliminar(e); setShowConfirm(true); }}>Eliminar</button>
                </td>
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
      {/* Modal para alta/edición */}
      {showForm && (
        <div className="modal fade show d-block modal-dark" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} data-bs-theme="dark">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editEntrada ? 'Editar entrada' : 'Registrar entrada'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <EntradaForm
                  entrada={editEntrada}
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
      {/* Modal de confirmación */}
      {showConfirm && entradaAEliminar && (
        <div className="modal fade show d-block modal-dark" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} data-bs-theme="dark">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Seguro que deseas eliminar la entrada #{entradaAEliminar.entry_id}?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={eliminarEntrada}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
