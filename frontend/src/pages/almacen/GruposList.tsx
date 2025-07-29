import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface Grupo {
  group_code: string;
  group_name: string;
}

export default function GruposList() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrupos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/almacen/catalogos/grupos`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Error al cargar grupos');
        const data = await res.json();
        setGrupos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGrupos();
  }, []);

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando grupos...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div style={{ width: '100%', maxWidth: '100vw', paddingTop: 8 }}>
      <h4>Catálogo de Grupos</h4>
      <ul className="list-group">
        {grupos.map(g => (
          <li key={g.group_code} className="list-group-item">{g.group_code} - {g.group_name}</li>
        ))}
      </ul>
    </div>
  );
}
