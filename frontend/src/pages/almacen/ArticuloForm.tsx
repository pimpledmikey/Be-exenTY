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
  supplier_code?: string;
  supplier_name?: string;
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
  supplier_code: '',
  supplier_name: '',
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
    fetch(`${API_URL}/almacen/catalogos/grupos`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar grupos');
        return res.json();
      })
      .then(setGrupos)
      .catch(err => setError(err.message));

    fetch(`${API_URL}/almacen/catalogos/medidas`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar medidas');
        return res.json();
      })
      .then(setMedidas)
      .catch(err => setError(err.message));

    fetch(`${API_URL}/almacen/catalogos/unidades`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar unidades');
        return res.json();
      })
      .then(setUnidades)
      .catch(err => setError(err.message));
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
        supplier_code: articulo.supplier_code || '',
        supplier_name: articulo.supplier_name || '',
        // Convertir status a minúsculas para la base de datos
        status: articulo.status ? articulo.status.toLowerCase() : 'activo',
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

  // Actualizar código automáticamente cuando cambie grupo o tamaño (solo para artículos nuevos)
  useEffect(() => {
    if (!articulo?.article_id && form.group_code) {
      // Calcula el consecutivo
      let consecutivo = 1;
      if (articulosGrupo.length > 0) {
        const nums = articulosGrupo.map(a => {
          const match = a.code.match(/^[A-Z]+_(\d+)_/);
          return match ? parseInt(match[1], 10) : 0;
        });
        consecutivo = Math.max(...nums) + 1;
      }
      
      // Genera el código
      const newCode = form.group_code && form.size 
        ? `${form.group_code}_${String(consecutivo).padStart(3, '0')}_${form.size}`
        : form.group_code 
        ? `${form.group_code}_${String(consecutivo).padStart(3, '0')}_`
        : '';
      
      if (newCode !== form.code) {
        setForm(prev => ({ ...prev, code: newCode }));
      }
    }
  }, [form.group_code, form.size, articulosGrupo, articulo?.article_id]);

  // Actualiza el form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const method = articulo && articulo.article_id ? 'PUT' : 'POST';
      const url = articulo && articulo.article_id ? `${API_URL}/almacen/articulos/${articulo.article_id}` : `${API_URL}/almacen/articulos`;
      
      const body = {
        ...form,
        min_stock: Number(form.min_stock),
        max_stock: Number(form.max_stock),
        // Asegurar que el status esté en minúsculas
        status: form.status.toLowerCase()
      };

      console.log('📝 Datos del formulario enviados:', body);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar artículo');
      }
      
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
      {!articulo?.article_id && (
        <div className="alert alert-info mb-3">
          <h6 className="alert-heading">📋 Nomenclatura de Códigos</h6>
          <p className="mb-2">
            <span className="badge bg-warning text-dark me-2">GRUPO</span>
            <span className="badge bg-info me-2">CONSECUTIVO</span>
            <span className="badge bg-primary">TAMAÑO</span>
          </p>
          <small className="mb-0">
            Ejemplo: <strong>COM_016_3/4</strong> → Componentes, artículo #16, tamaño 3/4
          </small>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Columna izquierda */}
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Grupo</label>
              <select className="form-select" name="group_code" value={form.group_code} onChange={handleChange} required>
                <option value="">Seleccione grupo</option>
                {grupos.map(g => (
                  <option key={g.group_code} value={g.group_code}>
                    {g.group_code} - {g.group_name}
                  </option>
                ))}
              </select>
              <div className="form-text">
                <small className="text-muted">
                  Selecciona el grupo al que pertenece el artículo (será la parte amarilla del código)
                </small>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Código</label>
              <input 
                className="form-control" 
                name="code" 
                placeholder="El código se generará automáticamente: GRUPO_###_TAMAÑO" 
                value={form.code} 
                readOnly 
              />
              <div className="form-text">
                <small className="text-muted">
                  Formato: <span className="text-warning">GRUPO</span>_<span className="text-info">CONSECUTIVO</span>_<span className="text-primary">TAMAÑO</span>
                  {form.group_code && <span> → Ejemplo: <strong>{form.group_code}_001_{form.size || 'TAMAÑO'}</strong></span>}
                </small>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Tamaño</label>
              <input 
                className="form-control" 
                name="size" 
                placeholder="Ej: 3/4, 10mm, 1.5, etc." 
                value={form.size} 
                onChange={handleChange} 
              />
              <div className="form-text">
                <small className="text-muted">
                  Especifica la medida del producto (será la parte azul del código)
                </small>
              </div>
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
              <label className="form-label">Unidad</label>
              <select className="form-select" name="unit_code" value={form.unit_code} onChange={handleChange}>
                <option value="">Seleccione unidad</option>
                {unidades.map(u => (
                  <option key={u.unit_code} value={u.unit_code}>{u.unit_name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Columna derecha */}
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <input className="form-control" name="description" placeholder="Descripción" value={form.description} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Código del Proveedor</label>
              <input 
                className="form-control" 
                name="supplier_code" 
                placeholder="Código del proveedor" 
                value={form.supplier_code || ''} 
                onChange={handleChange} 
              />
              <div className="form-text">
                <small className="text-muted">
                  Código interno del proveedor para este artículo
                </small>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre del Proveedor</label>
              <input 
                className="form-control" 
                name="supplier_name" 
                placeholder="Nombre del proveedor" 
                value={form.supplier_name || ''} 
                onChange={handleChange} 
              />
              <div className="form-text">
                <small className="text-muted">
                  Nombre de la empresa proveedora
                </small>
              </div>
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
          </div>
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
