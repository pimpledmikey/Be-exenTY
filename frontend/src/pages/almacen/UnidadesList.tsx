import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface Unidad {
  unit_code: string;
  unit_name: string;
}

export default function UnidadesList() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editUnidad, setEditUnidad] = useState<Unidad | null>(null);
  const [form, setForm] = useState<Unidad>({ unit_code: '', unit_name: '' });
  const [saving, setSaving] = useState(false);

  const fetchUnidades = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/catalogos/unidades`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Error al cargar unidades');
      const data = await res.json();
      setUnidades(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUnidades(); }, []);

  const handleOpen = (unidad?: Unidad) => {
    setEditUnidad(unidad || null);
    setForm(unidad ? { ...unidad } : { unit_code: '', unit_name: '' });
    setShowModal(true);
  };
  const handleClose = () => { setShowModal(false); setEditUnidad(null); };

  const handleChange = (e: any) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editUnidad ? 'PUT' : 'POST';
      const url = editUnidad ? `${API_URL}/catalogos/unidades/${editUnidad.unit_code}` : `${API_URL}/catalogos/unidades`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Error al guardar');
      await fetchUnidades();
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unidad: Unidad) => {
    if (!window.confirm('¿Eliminar unidad?')) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/catalogos/unidades/${unidad.unit_code}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      await fetchUnidades();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando unidades...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="card" data-bs-theme="dark">
      <div className="card-header">
        <h3 className="card-title">Catálogo de Unidades</h3>
        <div className="card-actions">
          <button className="btn btn-success" onClick={() => handleOpen()}>Nuevo</button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table card-table table-vcenter text-nowrap datatable table-striped">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th className="w-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {unidades.map(u => (
              <tr key={u.unit_code}>
                <td>{u.unit_code}</td>
                <td>{u.unit_name}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpen(u)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', background: '#0008' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content" onSubmit={handleSave}>
              <div className="modal-header">
                <h5 className="modal-title">{editUnidad ? 'Editar Unidad' : 'Nueva Unidad'}</h5>
                <button type="button" className="btn-close" onClick={handleClose}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Código</label>
                  <input name="unit_code" className="form-control" value={form.unit_code} onChange={handleChange} disabled={!!editUnidad} required maxLength={10} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input name="unit_name" className="form-control" value={form.unit_name} onChange={handleChange} required maxLength={50} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
