import React, { useState, useEffect } from 'react';
import Select from 'react-select';

interface ArticuloSimple {
  article_id: number;
  code?: string; // Código del artículo
  name: string;
  size?: string; // Medida del artículo
  unit_code?: string; // Unidad
}

interface Entrada {
  entry_id?: number;
  article_id: string;
  quantity: number;
  unit_cost: number;
  invoice_number: string;
  supplier: string;
}

interface EntradaFormProps {
  entrada?: Entrada | null;
  onClose: () => void;
}

const initialState: Entrada = {
  article_id: '',
  quantity: 0,
  unit_cost: 0,
  invoice_number: '',
  supplier: '',
};

const API_URL = import.meta.env.VITE_API_URL;

const EntradaForm: React.FC<EntradaFormProps> = ({ entrada, onClose }) => {
  const [form, setForm] = useState<Entrada>(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articulos, setArticulos] = useState<ArticuloSimple[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/almacen/articulos-simple`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setArticulos(data));
  }, []);

  useEffect(() => {
    if (entrada) {
      setForm({ ...entrada });
    } else {
      setForm(initialState);
    }
  }, [entrada]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const method = entrada && entrada.entry_id ? 'PUT' : 'POST';
      const url = entrada && entrada.entry_id ? `${API_URL}/almacen/entradas/${entrada.entry_id}` : `${API_URL}/almacen/entradas`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Error al guardar entrada');
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
                                <Select
                          value={articulos.find(art => art.article_id.toString() === form.article_id) ? {
                            value: form.article_id,
                            label: `${articulos.find(art => art.article_id.toString() === form.article_id)?.code || ''} - ${articulos.find(art => art.article_id.toString() === form.article_id)?.name || ''} (${articulos.find(art => art.article_id.toString() === form.article_id)?.size || 'N/A'})`
                          } : null}
                          onChange={(selectedOption: any) => setForm({...form, article_id: selectedOption?.value || ''})}
                          options={articulos.map(articulo => ({
                            value: articulo.article_id.toString(),
                            label: `${articulo.code || ''} - ${articulo.name} (${articulo.size || 'N/A'})`
                          }))}
                          placeholder="Seleccionar artículo..."
                          isClearable
                          isSearchable
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              minHeight: '38px',
                              backgroundColor: '#2b3035',
                              borderColor: state.isFocused ? '#495057' : '#495057',
                              color: '#ffffff',
                              '&:hover': {
                                borderColor: '#6c757d'
                              }
                            }),
                            menu: (provided) => ({
                              ...provided,
                              backgroundColor: '#2b3035',
                              border: '1px solid #495057',
                              zIndex: 1000
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              backgroundColor: state.isSelected 
                                ? '#495057' 
                                : state.isFocused 
                                  ? '#3a3f44' 
                                  : '#2b3035',
                              color: '#ffffff',
                              '&:hover': {
                                backgroundColor: '#3a3f44'
                              }
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              color: '#ffffff'
                            }),
                            placeholder: (provided) => ({
                              ...provided,
                              color: '#adb5bd'
                            }),
                            input: (provided) => ({
                              ...provided,
                              color: '#ffffff'
                            }),
                            indicatorSeparator: () => ({
                              display: 'none'
                            }),
                            dropdownIndicator: (provided) => ({
                              ...provided,
                              color: '#adb5bd',
                              '&:hover': {
                                color: '#ffffff'
                              }
                            }),
                            clearIndicator: (provided) => ({
                              ...provided,
                              color: '#adb5bd',
                              '&:hover': {
                                color: '#ffffff'
                              }
                            }),
                            noOptionsMessage: (provided) => ({
                              ...provided,
                              color: '#adb5bd'
                            })
                          }}
                        />
      </div>
      <div className="mb-3">
        <label className="form-label">Cantidad</label>
        <input className="form-control" name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Costo Unitario</label>
        <input className="form-control" name="unit_cost" type="number" value={form.unit_cost} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Factura</label>
        <input className="form-control" name="invoice_number" value={form.invoice_number} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Proveedor</label>
        <input className="form-control" name="supplier" value={form.supplier} onChange={handleChange} />
      </div>
      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
      {success && <div className="alert alert-success mt-3">Entrada guardada correctamente</div>}
      {error && <div className="alert alert-danger mt-3">Error: {error}</div>}
    </form>
  );
};

export default EntradaForm;
