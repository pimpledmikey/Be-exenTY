import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface Grupo {
  group_id: number;
  name: string;
}

interface Usuario {
  id?: number;
  username: string;
  name: string;
  email: string;
  group_id: string;
  password?: string;
  confirmPassword?: string;
}

interface UsuarioFormProps {
  usuario?: Usuario | null;
  onClose?: (refresh?: boolean) => void;
}

export default function UsuarioForm({ usuario, onClose }: UsuarioFormProps) {
  const [form, setForm] = useState<Usuario>({
    username: usuario?.username || '',
    name: usuario?.name || '',
    email: usuario?.email || '',
    group_id: usuario?.group_id || '',
    password: '',
    confirmPassword: '',
  });
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/user/grupos`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        // Adaptar los nombres de propiedades para el select
        const adaptados = data.map((g: any) => ({
          group_id: g.group_id || g.id,
          name: g.name || g.nombre
        }));
        setGrupos(adaptados);
      })
      .catch(() => setGrupos([]));
  }, []);

  useEffect(() => {
    if (usuario) {
      setForm({
        username: usuario.username,
        name: usuario.name,
        email: usuario.email,
        group_id: usuario.group_id,
        password: '',
        confirmPassword: '',
      });
    }
  }, [usuario]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const method = usuario && usuario.id ? 'PUT' : 'POST';
      const url = usuario && usuario.id 
        ? `${API_URL}/user/usuarios/${usuario.id}` 
        : `${API_URL}/user/create`; // Cambiado de /user/usuarios a /user/create
      const body: any = {
        name: form.name,
        email: form.email,
        group_id: form.group_id,
      };
      if (!usuario) {
        body.username = form.username;
        body.password = form.password;
      } else if (form.password) {
        body.password = form.password;
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error al guardar usuario');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
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
        <label className="form-label">Usuario</label>
        <input
          name="username"
          className="form-control"
          value={form.username}
          onChange={handleChange}
          required
          autoFocus
          autoComplete="off"
          disabled={!!usuario}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Nombre completo</label>
        <input
          name="name"
          className="form-control"
          value={form.name}
          onChange={handleChange}
          required
          autoComplete="off"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          name="email"
          type="email"
          className="form-control"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="off"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Grupo</label>
        <select
          name="group_id"
          className="form-select"
          value={form.group_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona grupo</option>
          {grupos.map(g => <option key={g.group_id} value={g.group_id}>{g.name}</option>)}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Contraseña (dejar vacío para no cambiar)</label>
        <input
          name="password"
          type="password"
          className="form-control"
          value={form.password}
          onChange={handleChange}
          required={!usuario}
          autoComplete="new-password"
          placeholder={usuario ? "••••••••" : ""}
        />
      </div>
      <div className="mb-4">
        <label className="form-label">Confirmar contraseña</label>
        <input
          name="confirmPassword"
          type="password"
          className="form-control"
          value={form.confirmPassword}
          onChange={handleChange}
          required={!usuario}
          autoComplete="new-password"
          placeholder={usuario ? "••••••••" : ""}
        />
      </div>
      {success && (
        <div className="alert alert-success alert-important d-flex align-items-center" role="alert" style={{background: '#0f8158', color: '#fff', fontWeight: 600}}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5l10 -10" /></svg>
          {usuario ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente'}
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-important d-flex align-items-center" role="alert" style={{background: '#d63939', color: '#fff', fontWeight: 600}}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon me-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {error}
        </div>
      )}
      <div className="modal-footer">
        <button type="button" className="btn btn-link link-secondary" onClick={() => onClose && onClose(false)} disabled={loading}>Cancelar</button>
        <button type="submit" className="btn btn-primary ms-auto" disabled={loading}>
          {usuario ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </div>
    </form>
  );
}
