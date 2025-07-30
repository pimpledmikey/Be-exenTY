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
        const res = await fetch(`${API_URL}/almacen/catalogos/grupos`, {
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
    <div className="card" data-bs-theme="dark">
      <div className="card-header">
        <h3 className="card-title">Gestión de Catálogos</h3>
      </div>
      <div className="table-responsive">
        <table className="table card-table table-vcenter text-nowrap datatable table-striped">
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
