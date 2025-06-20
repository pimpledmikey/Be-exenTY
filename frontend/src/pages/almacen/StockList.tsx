import React, { useEffect, useState } from 'react';

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

  // Filtrado
  const [filtro, setFiltro] = useState('');
  const [pagina, setPagina] = useState(1);
  const porPagina = 15;
  const stockFiltrado = stock.filter(s =>
    s.code.toLowerCase().includes(filtro.toLowerCase()) ||
    s.name.toLowerCase().includes(filtro.toLowerCase()) ||
    String(s.article_id).includes(filtro)
  );
  const totalPaginas = Math.ceil(stockFiltrado.length / porPagina);
  const stockPagina = stockFiltrado.slice((pagina - 1) * porPagina, pagina * porPagina);

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/almacen/stock', {
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

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando stock...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div style={{width: '100%', maxWidth: '100vw', paddingTop: 8}}>
      <h2 className="mb-0">Stock de Artículos</h2>
      {alerta && (
        <div className={`alert alert-${alerta.tipo} alert-dismissible`} role="alert">
          {alerta.mensaje}
          <button type="button" className="btn-close" onClick={() => setAlerta(null)}></button>
        </div>
      )}
      <div style={{width: '100%'}}>
        <table className="table table-dark dataTable" data-bs-theme="dark" style={{width: '100%'}}>
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
    </div>
  );
}
