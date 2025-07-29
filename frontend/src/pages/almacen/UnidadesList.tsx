import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface Unidad {
  unit_code: string;
  unit_name: string;
}

export default function UnidadesList() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnidades = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/almacen/catalogos/unidades`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Error al cargar unidades');
        const data = await res.json();
        setUnidades(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUnidades();
  }, []);

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando unidades...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div style={{ width: '100%', maxWidth: '100vw', paddingTop: 8 }}>
      <h4>Catálogo de Unidades</h4>
      <ul className="list-group">
        {unidades.map(u => (
          <li key={u.unit_code} className="list-group-item">{u.unit_code} - {u.unit_name}</li>
        ))}
      </ul>
    </div>
  );
}
