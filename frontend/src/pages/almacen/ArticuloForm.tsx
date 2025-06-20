import React, { useState, useEffect } from 'react';

interface Articulo {
  article_id?: number;
  code: string;
  name: string;
  description: string;
  unit: string;
  min_stock: number;
  max_stock: number;
  status: string;
}

interface ArticuloFormProps {
  articulo?: Articulo | null;
  onClose: () => void;
}

const initialState: Articulo = {
  code: '',
  name: '',
  description: '',
  unit: '',
  min_stock: 0,
  max_stock: 0,
  status: 'activo',
};

const ArticuloForm: React.FC<ArticuloFormProps> = ({ articulo, onClose }) => {
  const [form, setForm] = useState<Articulo>(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articulo) {
      setForm({ ...articulo });
    } else {
      setForm(initialState);
    }
  }, [articulo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const method = articulo && articulo.article_id ? 'PUT' : 'POST';
      const url = articulo && articulo.article_id ? `/api/almacen/articulos/${articulo.article_id}` : '/api/almacen/articulos';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Error al guardar artículo');
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
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Código</label>
          <input className="form-control" name="code" placeholder="Código" value={form.code} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input className="form-control" name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <input className="form-control" name="description" placeholder="Descripción" value={form.description} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Unidad</label>
          <input className="form-control" name="unit" placeholder="Unidad" value={form.unit} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Stock Mínimo</label>
          <input className="form-control" name="min_stock" type="number" placeholder="Stock Mínimo" value={form.min_stock} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Stock Máximo</label>
          <input className="form-control" name="max_stock" type="number" placeholder="Stock Máximo" value={form.max_stock} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Estado</label>
          <select className="form-select" name="status" value={form.status} onChange={handleChange}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
      {success && <div className="alert alert-success mt-3">Artículo guardado correctamente</div>}
      {error && <div className="alert alert-danger mt-3">Error: {error}</div>}
    </div>
  );
};

export default ArticuloForm;
