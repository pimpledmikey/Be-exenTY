import { useEffect, useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionAlert } from '../../components/PermissionComponents';
import { usePermissionError } from '../../utils/permissionUtils';

const API_URL = import.meta.env.VITE_API_URL;

interface Stock {
  article_id: number;
  code: string;
  name: string;
  stock: number;
  last_unit_cost: number;
  total_cost: number;
}

export default function StockList() {
  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'danger'; mensaje: string } | null>(null);

  // Hook para verificar permisos del usuario
  const { canPerform, loading: permissionsLoading } = usePermissions();
  const { permissionError, showPermissionError, clearPermissionError } = usePermissionError();

  // Filtrado
  const [filtro, setFiltro] = useState('');
  const [pagina, setPagina] = useState(1);
  const porPagina = 15;
  const stockFiltrado = stock.filter(s => {
    const texto = `${s.article_id} ${s.code} ${s.name} ${s.stock} ${s.last_unit_cost} ${s.total_cost}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });
  const totalPaginas = Math.ceil(stockFiltrado.length / porPagina);
  const stockPagina = stockFiltrado.slice((pagina - 1) * porPagina, pagina * porPagina);

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/almacen/stock`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Error al cargar stock');
        const data = await res.json();
        setStock(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStock();
  }, []);

  if (loading || permissionsLoading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando stock...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  
  // Verificar si el usuario tiene permisos para ver stock
  if (!canPerform('stock', 'stock_view', 'view')) {
    return (
      <div className="alert alert-warning">
        <h4>Sin permisos</h4>
        <p>No tienes permisos para ver el stock de artículos. Contacta al administrador.</p>
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
          module="stock"
        />
      )}
      
      <div className="card-header">
        <h3 className="card-title">Stock de Artículos</h3>
        <div className="card-actions">
          <input
            type="text"
            className="form-control"
            style={{maxWidth: 300}}
            placeholder="Buscar..."
            value={filtro}
            onChange={e => { setFiltro(e.target.value); setPagina(1); }}
          />
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
              <th>Código</th>
              <th>Nombre</th>
              <th>Stock</th>
              <th>Último Costo</th>
              <th>Costo Total</th>
            </tr>
          </thead>
          <tbody>
            {stockPagina.map(s => (
              <tr key={s.article_id}>
                <td>{s.article_id}</td>
                <td>{s.code}</td>
                <td>{s.name}</td>
                <td>{s.stock}</td>
                <td>{s.last_unit_cost}</td>
                <td>{s.total_cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer d-flex align-items-center">
        <p className="m-0 text-secondary">Mostrando <span>{stockPagina.length}</span> de <span>{stockFiltrado.length}</span> artículos</p>
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
    </div>
  );
}
