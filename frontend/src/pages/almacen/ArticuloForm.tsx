import React, { useState, useEffect } from 'react';

interface Articulo {
  article_id?: string;
  code: string;
  name: string;
  size?: string;
  group_code?: string;
  measure_code?: string;
  description: string;
  unit_code?: string;
  min_stock: number;
  max_stock: number;
  status: string;
}

interface ArticuloFormProps {
  articulo?: Articulo | null;
  onClose: () => void;
}

const initialState: Articulo = {
  article_id: undefined,
  code: '',
  name: '',
  size: '',
  group_code: '',
  measure_code: '',
  description: '',
  unit_code: '',
  min_stock: 0,
  max_stock: 0,
  status: 'activo',
};

const API_URL = import.meta.env.VITE_API_URL;

const ArticuloForm: React.FC<ArticuloFormProps> = ({ articulo, onClose }) => {
  const [form, setForm] = useState<Articulo>(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Catálogos
  const [grupos, setGrupos] = useState<{ group_code: string; group_name: string }[]>([]);
  const [medidas, setMedidas] = useState<{ measure_code: string; measure_name: string }[]>([]);
  const [unidades, setUnidades] = useState<{ unit_code: string; unit_name: string }[]>([]);
  // Artículos existentes para consecutivo
  const [articulosGrupo, setArticulosGrupo] = useState<Articulo[]>([]);

  // Cargar catálogos al montar
  useEffect(() => {
    fetch(`${API_URL}/catalogos/grupos`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json()).then(setGrupos);
    fetch(`${API_URL}/catalogos/medidas`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json()).then(setMedidas);
    fetch(`${API_URL}/catalogos/unidades`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json()).then(setUnidades);
  }, []);

  // Si editando, setea el form con los nuevos campos
  useEffect(() => {
    if (articulo) {
      setForm({
        ...initialState,
        ...articulo,
        article_id: articulo.article_id ? String(articulo.article_id) : undefined,
        group_code: articulo.group_code || '',
        measure_code: articulo.measure_code || '',
        unit_code: articulo.unit_code || '',
      });
    } else {
      setForm(initialState);
    }
  }, [articulo]);

  // Cargar artículos del grupo seleccionado para calcular consecutivo
  useEffect(() => {
    if (form.group_code) {
      fetch(`${API_URL}/almacen/articulos?group_code=${form.group_code}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setArticulosGrupo(data));
    } else {
      setArticulosGrupo([]);
    }
  }, [form.group_code]);

  // Actualiza el form y genera el código automáticamente
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };
    // Si cambia grupo, tamaño o consecutivo, genera el código
    if (name === 'group_code' || name === 'size') {
      // Calcula el consecutivo
      let consecutivo = 1;
      if (name === 'group_code' && value) {
        // Si cambia grupo, busca artículos del grupo
        const articulos = articulosGrupo.filter(a => a.group_code === value);
        if (articulos.length > 0) {
          // Extrae el consecutivo del código (ej: COM_016_3/4)
          const nums = articulos.map(a => {
            const match = a.code.match(/^[A-Z]+_(\d+)_/);
            return match ? parseInt(match[1], 10) : 0;
          });
          consecutivo = Math.max(...nums) + 1;
        }
      } else if (form.group_code && articulosGrupo.length > 0) {
        const nums = articulosGrupo.map(a => {
          const match = a.code.match(/^[A-Z]+_(\d+)_/);
          return match ? parseInt(match[1], 10) : 0;
        });
        consecutivo = Math.max(...nums) + 1;
      }
      // Genera el código
      const grupo = name === 'group_code' ? value : form.group_code;
      const size = name === 'size' ? value : form.size;
      newForm.code = grupo && size ? `${grupo}_${String(consecutivo).padStart(3, '0')}_${size}` : '';
    }
    setForm(newForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const method = articulo && articulo.article_id ? 'PUT' : 'POST';
      const url = articulo && articulo.article_id ? `${API_URL}/almacen/articulos/${articulo.article_id}` : `${API_URL}/almacen/articulos`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          size: form.size,
          group_code: form.group_code,
          measure_code: form.measure_code,
          description: form.description,
          unit_code: form.unit_code,
          min_stock: Number(form.min_stock),
          max_stock: Number(form.max_stock),
          status: form.status
        })
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
          <label className="form-label">Grupo</label>
          <select className="form-select" name="group_code" value={form.group_code} onChange={handleChange} required>
            <option value="">Seleccione grupo</option>
            {grupos.map(g => (
              <option key={g.group_code} value={g.group_code}>{g.group_name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Código</label>
          <input className="form-control" name="code" placeholder="Código" value={form.code} readOnly />
        </div>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input className="form-control" name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Tamaño</label>
          <input className="form-control" name="size" placeholder="Tamaño" value={form.size} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Medida</label>
          <select className="form-select" name="measure_code" value={form.measure_code} onChange={handleChange}>
            <option value="">Seleccione medida</option>
            {medidas.map(m => (
              <option key={m.measure_code} value={m.measure_code}>{m.measure_name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <input className="form-control" name="description" placeholder="Descripción" value={form.description} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Unidad</label>
          <select className="form-select" name="unit_code" value={form.unit_code} onChange={handleChange}>
            <option value="">Seleccione unidad</option>
            {unidades.map(u => (
              <option key={u.unit_code} value={u.unit_code}>{u.unit_name}</option>
            ))}
          </select>
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
