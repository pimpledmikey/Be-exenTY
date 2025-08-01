import { useEffect, useState } from 'react';
import ArticuloForm from './ArticuloForm';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionAlert, PermissionGuard } from '../../components/PermissionComponents';
import { usePermissionError, fetchWithPermissions } from '../../utils/permissionUtils';
import ResponsiveTable from '../../components/ResponsiveTable';
import ResponsiveLayout from '../../components/ResponsiveLayout';

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
  supplier_code?: string;
  supplier_name?: string;
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
  
  // Hook para verificar permisos del usuario
  const { canPerform, loading: permissionsLoading } = usePermissions();
  const { permissionError, showPermissionError, clearPermissionError } = usePermissionError();
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
      (a.description || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (a.supplier_code || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (a.supplier_name || '').toLowerCase().includes(filtro.toLowerCase())
    );
  });
  const totalPaginas = Math.ceil(articulosFiltrados.length / porPagina);
  const articulosPagina = articulosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  const fetchArticulos = async () => {
    setLoading(true);
    try {
      const res = await fetchWithPermissions(`${API_URL}/almacen/articulos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }, showPermissionError);
      
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
      const res = await fetchWithPermissions(`${API_URL}/almacen/articulos/${articuloAEliminar.article_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }, showPermissionError);
      
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

  if (loading || permissionsLoading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando artículos...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  
  // Verificar si el usuario tiene permisos para ver artículos
  if (!canPerform('almacen', 'almacen_view', 'view')) {
    return (
      <div className="alert alert-warning">
        <h4>Sin permisos</h4>
        <p>No tienes permisos para ver el catálogo de artículos. Contacta al administrador.</p>
      </div>
    );
  }

  // Preparar columnas para la tabla responsive
  const columns = [
    { key: 'code', label: 'Código', hideOnMobile: false },
    { key: 'name', label: 'Nombre', hideOnMobile: false },
    { 
      key: 'measure_code', 
      label: 'Medida', 
      hideOnMobile: true,
      render: (value: string) => medidas.find(m => m.measure_code === value)?.measure_name || value
    },
    { 
      key: 'unit_code', 
      label: 'Unidad', 
      hideOnMobile: true,
      render: (value: string) => unidades.find(u => u.unit_code === value)?.unit_name || value
    },
    { key: 'min_stock', label: 'Stock Mín.', hideOnMobile: true },
    { key: 'max_stock', label: 'Stock Máx.', hideOnMobile: true },
    { 
      key: 'status', 
      label: 'Estado', 
      hideOnMobile: false,
      render: (value: string) => (
        <span className={`badge ${value === 'Activo' ? 'bg-success' : 'bg-danger'} text-black`}>
          {value}
        </span>
      )
    },
    { key: 'supplier_code', label: 'Cód. Proveedor', hideOnMobile: true },
    { key: 'supplier_name', label: 'Proveedor', hideOnMobile: true },
    { 
      key: 'actions', 
      label: 'Acciones', 
      hideOnMobile: false,
      className: 'w-1',
      render: (_: any, row: Articulo) => (
        <div className="d-flex gap-1 justify-content-end flex-wrap">
          <PermissionGuard
            module="almacen"
            permission="almacen_edit"
            action="edit"
            canPerform={canPerform}
          >
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => { setEditArticulo(row); setShowForm(true); }}
            >
              Editar
            </button>
          </PermissionGuard>
          
          <PermissionGuard
            module="almacen"
            permission="almacen_delete"
            action="delete"
            canPerform={canPerform}
          >
            <button 
              className="btn btn-danger btn-sm" 
              onClick={() => { setArticuloAEliminar(row); setShowConfirm(true); }}
            >
              Eliminar
            </button>
          </PermissionGuard>
          
          {!canPerform('almacen', 'almacen_edit', 'edit') && 
           !canPerform('almacen', 'almacen_delete', 'delete') && (
            <small className="text-muted">Solo lectura</small>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <ResponsiveLayout
        title="Catálogo de Artículos"
        actions={
          <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
            <input
              type="text"
              className="form-control flex-grow-1"
              style={{ minWidth: 200, maxWidth: 300 }}
              placeholder="Buscar artículo..."
              value={filtro}
              onChange={e => { setFiltro(e.target.value); setPagina(1); }}
            />
            <PermissionGuard
              module="almacen"
              permission="almacen_create"
              action="create"
              canPerform={canPerform}
            >
              <button 
                className="btn btn-success" 
                onClick={() => { setEditArticulo(null); setShowForm(true); }}
              >
                Crear Artículo
              </button>
            </PermissionGuard>
          </div>
        }
      >
        {permissionError && (
          <PermissionAlert 
            show={true}
            onClose={clearPermissionError}
            action="realizar esta acción"
            module="artículos"
          />
        )}
        
        {alerta && (
          <div className={`alert alert-${alerta.tipo} mb-3`}>
            {alerta.mensaje}
            <button type="button" className="btn-close" onClick={() => setAlerta(null)}></button>
          </div>
        )}

        <ResponsiveTable
          columns={columns}
          data={articulosPagina}
          loading={loading || permissionsLoading}
          emptyMessage="No se encontraron artículos"
          pagination={{
            currentPage: pagina,
            totalPages: totalPaginas,
            onPageChange: setPagina
          }}
        />
      </ResponsiveLayout>
      
      {showForm && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }} data-bs-theme="dark">
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content bg-dark">
              <div className="modal-header">
                <h5 className="modal-title">{editArticulo ? 'Editar Artículo' : 'Crear Artículo'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <ArticuloForm articulo={editArticulo} onClose={() => { setShowForm(false); fetchArticulos(); }} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showConfirm && (
        <div className="modal modal-blur fade show" style={{ display: 'block' }} data-bs-theme="dark">
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content bg-dark">
              <div className="modal-body text-center py-4">
                <h3>¿Estás seguro?</h3>
                <p>¿Realmente quieres eliminar el artículo "{articuloAEliminar?.name}"?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={eliminarArticulo}>Sí, eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
