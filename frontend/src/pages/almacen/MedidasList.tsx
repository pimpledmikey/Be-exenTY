import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface Medida {
  measure_code: string;
  measure_name: string;
}

export default function MedidasList() {
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedidas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/almacen/catalogos/medidas`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Error al cargar medidas');
        const data = await res.json();
        setMedidas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMedidas();
  }, []);

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando medidas...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div style={{ width: '100%', maxWidth: '100vw', paddingTop: 8 }}>
      <h4>Catálogo de Medidas</h4>
      <ul className="list-group">
        {medidas.map(m => (
          <li key={m.measure_code} className="list-group-item">{m.measure_code} - {m.measure_name}</li>
        ))}
      </ul>
    </div>
  );
}
