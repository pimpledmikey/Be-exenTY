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
    <div className="card" data-bs-theme="dark">
      <div className="card-header">
        <h3 className="card-title">Listado de Entradas</h3>
        <div className="card-actions d-flex">
          <input
            type="text"
            className="form-control me-2"
            style={{maxWidth: 300}}
            placeholder="Buscar..."
            value={filtro}
            onChange={e => { setFiltro(e.target.value); setPagina(1); }}
          />
          <button className="btn btn-success" onClick={() => { setShowForm(true); }}>Crear entrada</button>
        </div>
      </div>
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
                <td>
                  {/* <button className="btn btn-sm btn-outline-primary">Editar</button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer d-flex align-items-center">
        <p className="m-0 text-secondary">Mostrando <span>{entradasPagina.length}</span> de <span>{entradasFiltradas.length}</span> entradas</p>
        <ul className="pagination m-0 ms-auto">
          <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setPagina(p => p - 1); }}>Anterior</a>
          </li>
          {[...Array(totalPaginas)].map((_, i) => (
            <li key={i} className={`page-item ${pagina === i + 1 ? 'active' : ''}`}>
              <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setPagina(i + 1); }}>{i + 1}</a>
            </li>
          ))}
          <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setPagina(p => p + 1); }}>Siguiente</a>
          </li>
        </ul>
      </div>
      {showForm && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" data-bs-theme="dark">
              <div className="modal-header">
                <h5 className="modal-title">Crear Entrada</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <EntradaForm onClose={() => { setShowForm(false); fetchEntradas(); setAlerta({ tipo: 'success', mensaje: 'Entrada creada con éxito' }); }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
