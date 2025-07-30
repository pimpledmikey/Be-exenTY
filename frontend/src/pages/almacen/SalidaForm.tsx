import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface ArticuloSimple {
  article_id: number;
  name: string;
}
interface UsuarioSimple {
  user_id: number;
  username: string;
}

interface Salida {
  exit_id?: number;
  article_id: string;
  quantity: number;
  reason: string; // Nombre del proyecto
  user_id: string;
}

interface SalidaFormProps {
  salida?: Salida | null;
  onClose: () => void;
}

const initialState: Salida = {
  article_id: '',
  quantity: 0,
  reason: '',
  user_id: '',
};

const SalidaForm: React.FC<SalidaFormProps> = ({ salida, onClose }) => {
  const [form, setForm] = useState<Salida>(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articulos, setArticulos] = useState<ArticuloSimple[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioSimple[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/almacen/articulos-simple`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setArticulos(data));
    fetch(`${API_URL}/user/usuarios-simple`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setUsuarios(data));
  }, []);

  useEffect(() => {
    if (salida) {
      setForm({ ...salida });
    } else {
      setForm(initialState);
    }
  }, [salida]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const method = salida && salida.exit_id ? 'PUT' : 'POST';
      const url = salida && salida.exit_id ? `${API_URL}/almacen/salidas/${salida.exit_id}` : `${API_URL}/almacen/salidas`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Error al guardar salida');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Artículo</label>
        <select className="form-select" name="article_id" value={form.article_id} onChange={handleChange} required>
          <option value="">Seleccione un artículo</option>
          {articulos.map(a => (
            <option key={a.article_id} value={a.article_id}>{a.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Cantidad</label>
        <input className="form-control" name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Nombre del Proyecto</label>
        <input 
          className="form-control" 
          name="reason" 
          placeholder="Ingrese el nombre del proyecto"
          value={form.reason} 
          onChange={handleChange} 
          required 
        />
        <div className="form-text">
          <small className="text-muted">
            Especifique el proyecto para el cual se requieren los materiales
          </small>
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">Usuario</label>
        <select className="form-select" name="user_id" value={form.user_id} onChange={handleChange} required>
          <option value="">Seleccione un usuario</option>
          {usuarios.map(u => (
            <option key={u.user_id} value={u.user_id}>{u.username}</option>
          ))}
        </select>
      </div>
      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
      {success && <div className="alert alert-success mt-3">Salida guardada correctamente</div>}
      {error && <div className="alert alert-danger mt-3">Error: {error}</div>}
    </form>
  );
};

export default SalidaForm;
