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

  return (
    <div>
      <h3 className="mb-4">Lista de Grupos</h3>
      {alerta && (
        <div className={`alert alert-${alerta.tipo} alert-dismissible`} role="alert">
          {alerta.mensaje}
          <button type="button" className="btn-close" onClick={() => setAlerta(null)}></button>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}
      <button
        className="btn btn-success mb-3"
        onClick={() => {
          setEditGrupo(null);
          setShowForm(true);
        }}
      >
        Crear grupo
      </button>
      {loading ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      ) : (
        <table className="table table-dark dataTable" data-bs-theme="dark">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map(grupo => (
              <tr key={grupo.id}>
                <td>{grupo.id}</td>
                <td>{grupo.nombre}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => {
                      setEditGrupo(grupo);
                      setShowForm(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setGrupoAEliminar(grupo);
                      setShowConfirm(true);
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal Tabler */}
      {showForm && (
        <div className="modal fade show d-block modal-dark" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} data-bs-theme="dark">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editGrupo ? 'Editar grupo' : 'Crear grupo'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <GrupoForm
                  grupo={editGrupo}
                  onClose={() => {
                    setShowForm(false);
                    fetchGrupos();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmación Tabler */}
      {showConfirm && grupoAEliminar && (
        <div className="modal fade show d-block modal-dark" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} data-bs-theme="dark">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Seguro que deseas eliminar el grupo <b>{grupoAEliminar.nombre}</b>?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={eliminarGrupo}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrupoList;
