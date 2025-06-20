import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface Grupo {
  id?: number;
  nombre: string;
  descripcion: string;
}

interface GrupoFormProps {
  grupo?: Grupo | null;
  onClose: (refresh?: boolean) => void;
}

const GrupoForm: React.FC<GrupoFormProps> = ({ grupo, onClose }) => {
  const [nombre, setNombre] = useState(grupo?.nombre || '');
  const [descripcion, setDescripcion] = useState(grupo?.descripcion || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNombre(grupo?.nombre || '');
    setDescripcion(grupo?.descripcion || '');
  }, [grupo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const method = grupo && grupo.id ? 'PUT' : 'POST';
      const url = grupo && grupo.id ? `${API_URL}/user/grupos/${grupo.id}` : `${API_URL}/user/grupos`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ name: nombre }) // solo enviar name
      });
      if (!res.ok) throw new Error('Error al guardar grupo');
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
        <label className="form-label">Nombre del grupo</label>
        <input
          name="nombre"
          className="form-control"
          placeholder="Nombre del grupo"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Descripción</label>
        <input
          name="descripcion"
          className="form-control"
          placeholder="Descripción"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </div>
      {success && (
        <div className="alert alert-success alert-important d-flex align-items-center" role="alert" style={{background: '#0f8158', color: '#fff', fontWeight: 600}}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5l10 -10" /></svg>
          {grupo ? 'Grupo actualizado correctamente' : 'Grupo creado correctamente'}
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-important d-flex align-items-center" role="alert" style={{background: '#d63939', color: '#fff', fontWeight: 600}}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {error}
        </div>
      )}
      <div className="modal-footer">
        <button type="button" className="btn btn-link link-secondary" onClick={() => onClose(false)} disabled={loading}>Cancelar</button>
        <button type="submit" className="btn btn-primary ms-auto" disabled={loading}>
          {grupo ? 'Guardar cambios' : 'Crear grupo'}
        </button>
      </div>
    </form>
  );
};

export default GrupoForm;
