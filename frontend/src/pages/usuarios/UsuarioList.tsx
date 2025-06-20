import React, { useEffect, useState } from 'react';
import UsuarioForm from './UsuarioForm';

const API_URL = import.meta.env.VITE_API_URL;

interface Usuario {
  id: number;
  username: string;
  name: string;
  email: string;
  group: string;
  group_id: string;
}

const UsuarioList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editUsuario, setEditUsuario] = useState<Usuario | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'danger'; mensaje: string } | null>(null);

  const fetchUsuarios = () => {
    setLoading(true);
    fetch(`${API_URL}/user/usuarios`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener los usuarios');
        return res.json();
      })
      .then(data => {
        setUsuarios(data.map((u: any) => ({ ...u, group_id: u.group_id || '' })));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const eliminarUsuario = async () => {
    if (!usuarioAEliminar) return;
    try {
      const res = await fetch(`${API_URL}/user/usuarios/${usuarioAEliminar.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      setAlerta({ tipo: 'success', mensaje: 'Usuario eliminado correctamente' });
      fetchUsuarios();
    } catch (err) {
      setAlerta({ tipo: 'danger', mensaje: 'No se pudo eliminar el usuario' });
    } finally {
      setShowConfirm(false);
      setUsuarioAEliminar(null);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div>
      <h3 className="mb-4">Lista de Usuarios</h3>
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
          setEditUsuario(null);
          setShowForm(true);
        }}
      >
        Crear usuario
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
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Grupo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.username}</td>
                <td>{usuario.name}</td>
                <td>{usuario.email}</td>
                <td>{usuario.group}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => {
                      setEditUsuario(usuario);
                      setShowForm(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setUsuarioAEliminar(usuario);
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
                <h5 className="modal-title">{editUsuario ? 'Editar usuario' : 'Crear usuario'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <UsuarioForm
                  usuario={editUsuario}
                  onClose={() => {
                    setShowForm(false);
                    fetchUsuarios();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmación Tabler */}
      {showConfirm && usuarioAEliminar && (
        <div className="modal fade show d-block modal-dark" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} data-bs-theme="dark">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Seguro que deseas eliminar el usuario <b>{usuarioAEliminar.username}</b>?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={eliminarUsuario}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuarioList;
