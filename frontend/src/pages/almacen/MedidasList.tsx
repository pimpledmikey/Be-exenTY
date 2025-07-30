import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface Medida {
  measure_code: string;
  measure_name: string;
}

export default function MedidasList() {
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMedida, setEditMedida] = useState<Medida | null>(null);
  const [form, setForm] = useState<Medida>({ measure_code: '', measure_name: '' });
  const [saving, setSaving] = useState(false);

  const fetchMedidas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/catalogos/medidas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Error al cargar medidas');
      const data = await res.json();
      setMedidas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedidas(); }, []);

  const handleOpen = (medida?: Medida) => {
    setEditMedida(medida || null);
    setForm(medida ? { ...medida } : { measure_code: '', measure_name: '' });
    setShowModal(true);
  };
  const handleClose = () => { setShowModal(false); setEditMedida(null); };

  const handleChange = (e: any) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editMedida ? 'PUT' : 'POST';
      const url = editMedida ? `${API_URL}/catalogos/medidas/${editMedida.measure_code}` : `${API_URL}/catalogos/medidas`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Error al guardar');
      await fetchMedidas();
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medida: Medida) => {
    if (!window.confirm('¿Eliminar medida?')) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/catalogos/medidas/${medida.measure_code}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      await fetchMedidas();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando medidas...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="card" data-bs-theme="dark">
      <div className="card-header">
        <h3 className="card-title">Catálogo de Medidas</h3>
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
            {medidas.map(m => (
              <tr key={m.measure_code}>
                <td>{m.measure_code}</td>
                <td>{m.measure_name}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpen(m)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(m)}>Eliminar</button>
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
                <h5 className="modal-title">{editMedida ? 'Editar Medida' : 'Nueva Medida'}</h5>
                <button type="button" className="btn-close" onClick={handleClose}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Código</label>
                  <input name="measure_code" className="form-control" value={form.measure_code} onChange={handleChange} disabled={!!editMedida} required maxLength={10} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input name="measure_name" className="form-control" value={form.measure_name} onChange={handleChange} required maxLength={50} />
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
