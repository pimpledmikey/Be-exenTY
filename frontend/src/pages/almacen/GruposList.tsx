import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface Grupo {
  group_code: string;
  group_name: string;
}

export default function GruposList() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editGrupo, setEditGrupo] = useState<Grupo | null>(null);
  const [form, setForm] = useState<Grupo>({ group_code: '', group_name: '' });
  const [saving, setSaving] = useState(false);

  const fetchGrupos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/catalogos/grupos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Error al cargar grupos');
      const data = await res.json();
      setGrupos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGrupos(); }, []);

  const handleOpen = (grupo?: Grupo) => {
    setEditGrupo(grupo || null);
    setForm(grupo ? { ...grupo } : { group_code: '', group_name: '' });
    setShowModal(true);
  };
  const handleClose = () => { setShowModal(false); setEditGrupo(null); };

  const handleChange = (e: any) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editGrupo ? 'PUT' : 'POST';
      const url = editGrupo ? `${API_URL}/catalogos/grupos/${editGrupo.group_code}` : `${API_URL}/catalogos/grupos`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Error al guardar');
      await fetchGrupos();
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (grupo: Grupo) => {
    if (!window.confirm('¿Eliminar grupo?')) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/catalogos/grupos/${grupo.group_code}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      await fetchGrupos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando grupos...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="card" data-bs-theme="dark">
      <div className="card-header">
        <h3 className="card-title">Catálogo de Grupos</h3>
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
            {grupos.map(g => (
              <tr key={g.group_code}>
                <td>{g.group_code}</td>
                <td>{g.group_name}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpen(g)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(g)}>Eliminar</button>
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
                <h5 className="modal-title">{editGrupo ? 'Editar Grupo' : 'Nuevo Grupo'}</h5>
                <button type="button" className="btn-close" onClick={handleClose}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Código</label>
                  <input name="group_code" className="form-control" value={form.group_code} onChange={handleChange} disabled={!!editGrupo} required maxLength={10} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input name="group_name" className="form-control" value={form.group_name} onChange={handleChange} required maxLength={50} />
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
