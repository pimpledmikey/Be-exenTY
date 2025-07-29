import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

interface Catalogo {
  code: string;
  name: string;
}

export default function CatalogosList() {
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalogos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/catalogos/grupos`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Error al cargar catálogos');
        const data = await res.json();
        setCatalogos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogos();
  }, []);

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando catálogos...</span></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div style={{ width: '100%', maxWidth: '100vw', paddingTop: 8 }}>
      <h2 className="mb-0">Gestión de Catálogos</h2>
      <div style={{ width: '100%' }}>
        <table className="table table-dark dataTable" data-bs-theme="dark" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {catalogos.map(c => (
              <tr key={c.code}>
                <td>{c.code}</td>
                <td>{c.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
