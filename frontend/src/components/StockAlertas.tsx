import { useEffect, useState } from 'react';
import { useUserInfo } from '../hooks/useUserInfo';

const API_URL = import.meta.env.VITE_API_URL;

interface StockBajo {
  article_id: number;
  code: string;
  name: string;
  stock: number;
  unit: string;
}

interface StockAlertasProps {
  onClose?: () => void;
}

export default function StockAlertas({ onClose }: StockAlertasProps) {
  const [stockBajo, setStockBajo] = useState<StockBajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarAlertas, setMostrarAlertas] = useState(false);
  
  const { userInfo, loading: userLoading } = useUserInfo();

  useEffect(() => {
    // Solo mostrar alertas para Administrador y Dirección
    if (!userLoading && userInfo && (userInfo.role_name === 'Administrador' || userInfo.role_name === 'Dirección')) {
      verificarStockBajo();
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [userInfo, userLoading]);

  const detectarUnidad = (nombre: string): string => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('cable') || nombreLower.includes('manguera') || nombreLower.includes('alambre') || nombreLower.includes('tubo')) {
      return 'metro';
    }
    if (nombreLower.includes('aceite') || nombreLower.includes('líquido') || nombreLower.includes('combustible') || nombreLower.includes('litro')) {
      return 'litro';
    }
    if (nombreLower.includes('cemento') || nombreLower.includes('arena') || nombreLower.includes('gravilla') || nombreLower.includes('bolsa')) {
      return 'bolsa';
    }
    return 'pieza';
  };

  const verificarStockBajo = async () => {
    try {
      const res = await fetch(`${API_URL}/almacen/stock`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) throw new Error('Error al verificar stock');
      
      const data = await res.json();
      
      // Filtrar artículos con stock menor a 20 (asumiendo que son piezas, metros, bolsas o litros)
      const articulosBajos = data.filter((item: any) => item.stock < 20).map((item: any) => ({
        article_id: item.article_id,
        code: item.code,
        name: item.name,
        stock: item.stock,
        unit: item.unit || detectarUnidad(item.name) // Detectar unidad basándose en el nombre
      }));

      setStockBajo(articulosBajos);
      setMostrarAlertas(articulosBajos.length > 0);
    } catch (error) {
      console.error('Error al verificar stock bajo:', error);
    } finally {
      setLoading(false);
    }
  };

  const cerrarAlertas = () => {
    setMostrarAlertas(false);
    if (onClose) onClose();
  };

  // No mostrar nada si no hay permisos o no hay stock bajo
  if (!mostrarAlertas || loading || userLoading || !userInfo || (userInfo.role_name !== 'Administrador' && userInfo.role_name !== 'Dirección')) {
    return null;
  }

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content" data-bs-theme="dark">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">
              <i className="fas fa-exclamation-triangle me-2"></i>
              ⚠️ Alerta de Stock Bajo
            </h5>
            <button type="button" className="btn-close btn-close-dark" onClick={cerrarAlertas}></button>
          </div>
          
          <div className="modal-body">
            <div className="alert alert-warning mb-3">
              <strong>Atención:</strong> Se han detectado {stockBajo.length} artículo(s) con stock menor a 20 unidades.
            </div>
            
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Artículo</th>
                    <th>Stock Actual</th>
                    <th>Unidad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stockBajo.map(item => (
                    <tr key={item.article_id}>
                      <td><code>{item.code}</code></td>
                      <td>{item.name}</td>
                      <td>
                        <span className={`badge ${item.stock < 5 ? 'bg-danger text-dark' : item.stock < 10 ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td>{item.unit}</td>
                      <td>
                        {item.stock < 5 && <span className="badge bg-danger text-dark">Crítico</span>}
                        {item.stock >= 5 && item.stock < 10 && <span className="badge bg-warning text-dark">Muy Bajo</span>}
                        {item.stock >= 10 && item.stock < 20 && <span className="badge bg-info text-dark">Bajo</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={cerrarAlertas}>
              Entendido
            </button>
            <button 
              type="button" 
              className="btn btn-warning"
              onClick={() => {
                // Redirigir al módulo de stock
                window.location.href = '#/almacen/stock';
                cerrarAlertas();
              }}
            >
              <i className="fas fa-boxes me-1"></i>
              Ver Stock Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
