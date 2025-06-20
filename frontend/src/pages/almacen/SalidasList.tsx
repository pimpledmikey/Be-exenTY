import React, { useEffect, useState } from 'react';
import SalidaForm from './SalidaForm';

interface Salida {
  exit_id: number;
  article_id: number;
  quantity: number;
  date: string;
  reason: string;
  user_id: number;
  articulo_nombre?: string;
  usuario_nombre?: string;
}

export default function SalidasList() {
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editSalida, setEditSalida] = useState<Salida | null>(null);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'danger'; mensaje: string } | null>(null);
  const [salidaAEliminar, setSalidaAEliminar] = useState<Salida | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchSalidas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/almacen/salidas', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Error al cargar salidas');
      const data = await res.json();
      setSalidas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalidas();
  }, []);

  const eliminarSalida = async () => {
    if (!salidaAEliminar) return;
    try {
      const res = await fetch(`/api/almacen/salidas/${salidaAEliminar.exit_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Error al eliminar salida');
      setAlerta({ tipo: 'success', mensaje: 'Salida eliminada correctamente' });
      fetchSalidas();
    } catch (err) {
      setAlerta({ tipo: 'danger', mensaje: 'No se pudo eliminar la salida' });
    } finally {
      setShowConfirm(false);
      setSalidaAEliminar(null);
    }
  };

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando salidas...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div style={{width: '100%', maxWidth: '100vw', paddingTop: 8}}>
      <h2 className="mb-0">Listado de Salidas</h2>
      {alerta && (
        <div className={`alert alert-${alerta.tipo} alert-dismissible`} role="alert">
          {alerta.mensaje}
          <button type="button" className="btn-close" onClick={() => setAlerta(null)}></button>
        </div>
      )}
      <button className="btn btn-success mb-0" onClick={() => { setShowForm(true); }}>Crear salida</button>
      <div style={{width: '100%'}}>
        <table className="table table-dark dataTable" data-bs-theme="dark" style={{width: '100%'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Artículo</th>
              <th>Cantidad</th>
              <th>Fecha</th>
              <th>Motivo</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {salidas.map(s => (
              <tr key={s.exit_id}>
                <td>{s.exit_id}</td>
                <td>{s.articulo_nombre || s.article_id}</td>
                <td>{s.quantity}</td>
                <td>{s.date}</td>
                <td>{s.reason}</td>
                <td>{s.usuario_nombre || s.user_id}</td>
                <td>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => { setEditSalida(s); setShowForm(true); }}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => { setSalidaAEliminar(s); setShowConfirm(true); }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal Tabler para alta/edición */}
      {showForm && (
        <div className="modal fade show d-block modal-dark" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} data-bs-theme="dark">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editSalida ? 'Editar salida' : 'Registrar salida'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body">
                <SalidaForm
                  salida={editSalida}
                  onClose={() => {
                    setShowForm(false);
                    fetchSalidas();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmación Tabler */}
      {showConfirm && salidaAEliminar && (
        <div className="modal fade show d-block modal-dark" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }} data-bs-theme="dark">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Seguro que deseas eliminar la salida #{salidaAEliminar.exit_id}?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={eliminarSalida}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
