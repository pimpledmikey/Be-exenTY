import { useEffect, useState } from 'react';
import ArticuloForm from './ArticuloForm';

const API_URL = import.meta.env.VITE_API_URL;

interface Articulo {
  article_id: string;
  code: string;
  name: string;
  size?: string;
  group_code?: string;
  measure_code?: string;
  description: string;
  unit_code?: string;
  min_stock: number;
  max_stock: number;
  status: string;
}

export default function ArticulosList() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editArticulo, setEditArticulo] = useState<Articulo | null>(null);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'danger'; mensaje: string } | null>(null);
  const [articuloAEliminar, setArticuloAEliminar] = useState<Articulo | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  // Catálogos para mostrar nombres
  const [medidas, setMedidas] = useState<{ measure_code: string; measure_name: string }[]>([]);
  const [unidades, setUnidades] = useState<{ unit_code: string; unit_name: string }[]>([]);
  // Filtro de búsqueda
  const [filtro, setFiltro] = useState('');

  // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 15;
  // Filtrado
  const articulosFiltrados = articulos.filter(a => {
    const medida = medidas.find(m => m.measure_code === a.measure_code)?.measure_name || '';
    const unidad = unidades.find(u => u.unit_code === a.unit_code)?.unit_name || '';
    return (
      (a.code || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (a.name || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (a.size || '').toLowerCase().includes(filtro.toLowerCase()) ||
      medida.toLowerCase().includes(filtro.toLowerCase()) ||
      unidad.toLowerCase().includes(filtro.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(filtro.toLowerCase())
    );
  });
  const totalPaginas = Math.ceil(articulosFiltrados.length / porPagina);
  const articulosPagina = articulosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  const fetchArticulos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/almacen/articulos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Error al cargar artículos');
      const data = await res.json();
      setArticulos(data.map((a: any) => ({ ...a, article_id: String(a.article_id) })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar catálogos para mostrar nombres
  useEffect(() => {
    fetch(`${API_URL}/almacen/catalogos/medidas`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json()).then(setMedidas);
    fetch(`${API_URL}/almacen/catalogos/unidades`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json()).then(setUnidades);
  }, []);

  useEffect(() => {
    fetchArticulos();
  }, []);

  const eliminarArticulo = async () => {
    if (!articuloAEliminar) return;
    try {
      const res = await fetch(`${API_URL}/almacen/articulos/${articuloAEliminar.article_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Error al eliminar artículo');
      setAlerta({ tipo: 'success', mensaje: 'Artículo eliminado correctamente' });
      fetchArticulos();
    } catch (err) {
      setAlerta({ tipo: 'danger', mensaje: 'No se pudo eliminar el artículo' });
    } finally {
      setShowConfirm(false);
      setArticuloAEliminar(null);
    }
  };

  // Helpers para mostrar nombres de catálogo
  const getMedidaNombre = (code?: string) => medidas.find(m => m.measure_code === code)?.measure_name || '';
  const getUnidadNombre = (code?: string) => unidades.find(u => u.unit_code === code)?.unit_name || '';

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando artículos...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div style={{width: '100%', maxWidth: '100vw', paddingTop: 8}}>
      <h2 className="mb-0">Listado de Artículos</h2>
      {alerta && (
        <div className={`alert alert-${alerta.tipo} alert-dismissible`} role="alert">
          {alerta.mensaje}
          <button type="button" className="btn-close" onClick={() => setAlerta(null)}></button>
        </div>
      )}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <button className="btn btn-success mb-0" onClick={() => { setEditArticulo(null); setShowForm(true); }}>Crear artículo</button>
        <input
          className="form-control ms-auto"
          style={{maxWidth: 300}}
          type="text"
          placeholder="Buscar artículo, código, medida, unidad..."
          value={filtro}
          onChange={e => { setFiltro(e.target.value); setPagina(1); }}
        />
      </div>
      <div style={{width: '100%'}}>
        <table className="table table-dark dataTable" data-bs-theme="dark" style={{width: '100%'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tamaño</th>
              <th>Medida</th>
              <th>Descripción</th>
              <th>Unidad</th>
              <th>Stock Mín</th>
              <th>Stock Máx</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articulosPagina.map(a => (
              <tr key={a.article_id}>
                <td>{a.article_id}</td>
                <td>{a.code}</td>
                <td>{a.name}</td>
                <td>{a.size || ''}</td>
                <td>{getMedidaNombre(a.measure_code)}</td>
                <td>{a.description}</td>
                <td>{getUnidadNombre(a.unit_code)}</td>
                <td>{a.min_stock}</td>
                <td>{a.max_stock}</td>
                <td>{a.status}</td>
                <td>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => { setEditArticulo(a); setShowForm(true); }}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => { setArticuloAEliminar(a); setShowConfirm(true); }}>Eliminar</button>
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
                <h5 className="modal-title">{editArticulo ? 'Editar artículo' : 'Crear artículo'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <ArticuloForm
                  articulo={editArticulo}
                  onClose={() => {
                    setShowForm(false);
                    fetchArticulos();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmación */}
      {showConfirm && articuloAEliminar && (
        <div className="modal fade show d-block modal-dark" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} data-bs-theme="dark">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Seguro que deseas eliminar el artículo <b>{articuloAEliminar.name}</b>?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={eliminarArticulo}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
