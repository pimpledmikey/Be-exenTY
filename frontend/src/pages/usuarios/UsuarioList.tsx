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

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>;

  return (
    <div className="card" data-bs-theme="dark">
      <div className="card-header">
        <h3 className="card-title">Lista de Usuarios</h3>
        <div className="card-actions">
          <button className="btn btn-success" onClick={() => { setEditUsuario(null); setShowForm(true); }}>
            Crear usuario
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
      <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        <table className="table card-table table-vcenter text-nowrap datatable table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Grupo</th>
              <th className="w-1">Acciones</th>
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
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setEditUsuario(usuario); setShowForm(true); }}>
                    Editar
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => { setUsuarioAEliminar(usuario); setShowConfirm(true); }}>
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
                <h5 className="modal-title">{editUsuario ? 'Editar Usuario' : 'Crear Usuario'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <UsuarioForm usuario={editUsuario} onClose={() => { setShowForm(false); fetchUsuarios(); }} />
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
                <div className="text-secondary">¿Quieres eliminar al usuario "{usuarioAEliminar?.username}"?</div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={eliminarUsuario}>Sí, eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuarioList;
