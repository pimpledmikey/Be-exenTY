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
    <div style={{ width: '100%', maxWidth: '100vw', paddingTop: 8 }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4>Catálogo de Medidas</h4>
        <button className="btn btn-success" onClick={() => handleOpen()}>Nuevo</button>
      </div>
      <ul className="list-group">
        {medidas.map(m => (
          <li key={m.measure_code} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{m.measure_code} - {m.measure_name}</span>
            <span>
              <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpen(m)}>Editar</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(m)}>Eliminar</button>
            </span>
          </li>
        ))}
      </ul>
      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', background: '#0008' }} tabIndex={-1}>
          <div className="modal-dialog">
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
