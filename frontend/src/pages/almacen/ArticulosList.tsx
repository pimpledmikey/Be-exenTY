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
    <div className="card" data-bs-theme="dark">
      <div className="card-header">
        <h3 className="card-title">Catálogo de Artículos</h3>
        <div className="card-actions d-flex">
          <input
            type="text"
            className="form-control me-2"
            style={{maxWidth: 300}}
            placeholder="Buscar artículo..."
            value={filtro}
            onChange={e => { setFiltro(e.target.value); setPagina(1); }}
          />
          <button className="btn btn-success" onClick={() => { setEditArticulo(null); setShowForm(true); }}>
            Crear Artículo
          </button>
        </div>
      </div>
      {alerta && (
        <div className={`card-alert alert alert-${alerta.tipo} mb-0`}>
          {alerta.mensaje}
          <button type="button" className="btn-close" onClick={() => setAlerta(null)}></button>
        </div>
      )}
      <div className="table-responsive">
        <table className="table card-table table-vcenter text-nowrap datatable table-striped">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Medida</th>
              <th>Unidad</th>
              <th>Stock Mín.</th>
              <th>Stock Máx.</th>
              <th>Estado</th>
              <th className="w-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articulosPagina.map(a => (
              <tr key={a.article_id}>
                <td>{a.code}</td>
                <td>{a.name}</td>
                <td>{medidas.find(m => m.measure_code === a.measure_code)?.measure_name || a.measure_code}</td>
                <td>{unidades.find(u => u.unit_code === a.unit_code)?.unit_name || a.unit_code}</td>
                <td>{a.min_stock}</td>
                <td>{a.max_stock}</td>
                <td><span className={`badge ${a.status === 'A' ? 'bg-success' : 'bg-danger'}`}>{a.status === 'A' ? 'Activo' : 'Inactivo'}</span></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setEditArticulo(a); setShowForm(true); }}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => { setArticuloAEliminar(a); setShowConfirm(true); }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer d-flex align-items-center">
        <p className="m-0 text-secondary">Mostrando <span>{articulosPagina.length}</span> de <span>{articulosFiltrados.length}</span> artículos</p>
        <ul className="pagination m-0 ms-auto">
          <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setPagina(p => p > 1 ? p - 1 : 1); }}>Anterior</a>
          </li>
          {[...Array(totalPaginas)].map((_, i) => (
            <li key={i} className={`page-item ${pagina === i + 1 ? 'active' : ''}`}>
              <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setPagina(i + 1); }}>{i + 1}</a>
            </li>
          ))}
          <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setPagina(p => p < totalPaginas ? p + 1 : totalPaginas); }}>Siguiente</a>
          </li>
        </ul>
      </div>
      {showForm && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" data-bs-theme="dark">
              <div className="modal-header">
                <h5 className="modal-title">{editArticulo ? 'Editar Artículo' : 'Crear Artículo'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <ArticuloForm
                  articulo={editArticulo}
                  onClose={() => { setShowForm(false); fetchArticulos(); setAlerta({ tipo: 'success', mensaje: `Artículo ${editArticulo ? 'actualizado' : 'creado'} con éxito` }); }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {showConfirm && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content" data-bs-theme="dark">
              <div className="modal-body text-center py-4">
                <h3>¿Estás seguro?</h3>
                <div className="text-secondary">¿Quieres eliminar el artículo "{articuloAEliminar?.name}"? Esta acción no se puede deshacer.</div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={eliminarArticulo}>Sí, eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
