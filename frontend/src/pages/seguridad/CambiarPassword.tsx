import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function CambiarPassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña y la confirmación no coinciden');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/seguridad/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al cambiar contraseña');
      }
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 400 }}>
      <h4 className="mb-3">Cambiar contraseña</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Contraseña actual</label>
          <input type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Nueva contraseña</label>
          <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirmar nueva contraseña</label>
          <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">Contraseña cambiada correctamente</div>}
        <button className="btn btn-primary w-100" type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Cambiar contraseña'}</button>
      </form>
    </div>
  );
}
