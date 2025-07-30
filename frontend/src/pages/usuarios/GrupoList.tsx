import React, { useEffect, useState } from 'react';
import GrupoForm from './GrupoForm';

const API_URL = import.meta.env.VITE_API_URL;

interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
}

const GrupoList: React.FC = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editGrupo, setEditGrupo] = useState<Grupo | null>(null);
  const [grupoAEliminar, setGrupoAEliminar] = useState<Grupo | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'danger'; mensaje: string } | null>(null);

  const fetchGrupos = () => {
    setLoading(true);
    fetch(`${API_URL}/user/grupos`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener los grupos');
        return res.json();
      })
      .then(data => {
        setGrupos(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const eliminarGrupo = async () => {
    if (!grupoAEliminar) return;
    try {
      const res = await fetch(`${API_URL}/user/grupos/${grupoAEliminar.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Error al eliminar grupo');
      setAlerta({ tipo: 'success', mensaje: 'Grupo eliminado correctamente' });
      fetchGrupos();
    } catch (err) {
      setAlerta({ tipo: 'danger', mensaje: 'No se pudo eliminar el grupo' });
    } finally {
      setShowConfirm(false);
      setGrupoAEliminar(null);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>;

  return (
    <div className="card" data-bs-theme="dark">
      <div className="card-header">
        <h3 className="card-title">Lista de Grupos</h3>
        <div className="card-actions">
          <button className="btn btn-success" onClick={() => { setEditGrupo(null); setShowForm(true); }}>
            Crear grupo
          </button>
        </div>
      </div>
      {alerta && (
        <div className={`card-alert alert alert-${alerta.tipo} mb-0`}>
          {alerta.mensaje}
          <button type="button" className="btn-close" onClick={() => setAlerta(null)}></button>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table card-table table-vcenter text-nowrap datatable table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th className="w-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map(grupo => (
              <tr key={grupo.id}>
                <td>{grupo.id}</td>
                <td>{grupo.nombre}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setEditGrupo(grupo); setShowForm(true); }}>
                    Editar
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => { setGrupoAEliminar(grupo); setShowConfirm(true); }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" data-bs-theme="dark">
              <div className="modal-header">
                <h5 className="modal-title">{editGrupo ? 'Editar Grupo' : 'Crear Grupo'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <GrupoForm grupo={editGrupo} onClose={() => { setShowForm(false); fetchGrupos(); }} />
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
                <div className="text-secondary">¿Quieres eliminar el grupo "{grupoAEliminar?.nombre}"?</div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={eliminarGrupo}>Sí, eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrupoList;
