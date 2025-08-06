import React from 'react';
import logoBeExEn from '../assets/logoBeExEn.png';

interface SolicitudItem {
  codigo?: string;
  descripcion: string;
  unidad: string;
  medida?: string;
  cantidad: number;
  precioU?: number;
  precioT?: number;
}

interface SolicitudAutorizacionProps {
  fecha?: string;
  proveedor?: string;
  items: SolicitudItem[];
  solicitante?: string;
  autoriza?: string;
  tipo?: 'entrada' | 'salida';
  folio?: string;
}

const SolicitudAutorizacion: React.FC<SolicitudAutorizacionProps> = ({
  fecha = new Date().toLocaleDateString('es-ES'),
  proveedor = '',
  items = [],
  solicitante = 'Juan Jesús Ortega Simbrón',
  autoriza = 'Lic. Elisa Avila Requena',
  tipo = 'entrada',
  folio = ''
}) => {
  
  // Generar filas vacías para completar hasta 10
  const filasCompletas = [...items];
  while (filasCompletas.length < 10) {
    filasCompletas.push({
      codigo: '',
      descripcion: '',
      unidad: '',
      medida: '',
      cantidad: 0,
      precioU: 0,
      precioT: 0
    });
  }

  const titulo = tipo === 'entrada' 
    ? 'Solicitud Autorización de Compra'
    : 'Solicitud Autorización de Salida';

  const subtitulo = tipo === 'entrada'
    ? 'Requerimiento para compra de herramienta, materia prima o cualquier insumo.'
    : 'Requerimiento para salida de herramienta, materia prima o cualquier insumo.';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="solicitud-container">
      {/* Botón de imprimir - solo visible en pantalla */}
      <div className="d-print-none mb-3">
        <button 
          className="btn btn-primary me-2" 
          onClick={handlePrint}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
            <polyline points="6,9 6,2 18,2 18,9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Imprimir
        </button>
      </div>

      {/* Contenido del documento */}
      <div className="solicitud-documento" style={{ 
        backgroundColor: 'white', 
        color: 'black', 
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        minHeight: '297mm', // A4 height
        width: '210mm', // A4 width
        margin: '0 auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '2rem',
          borderBottom: '2px solid #0d6efd',
          paddingBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={logoBeExEn} 
              alt="Be-Exen Logo" 
              style={{ height: '60px', width: '60px', objectFit: 'contain' }}
            />
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#0d6efd'
              }}>
                Be-Exen
              </h1>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                Tecnología y Eficiencia
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Fecha: </strong>{fecha}
            {folio && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Folio: </strong>{folio}
              </div>
            )}
          </div>
        </div>

        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.8rem', 
            fontWeight: 'bold',
            color: '#28a745'
          }}>
            {titulo}
          </h2>
          <p style={{ 
            margin: '1rem 0', 
            fontSize: '1rem',
            fontStyle: 'italic',
            color: '#666'
          }}>
            {subtitulo}
          </p>
        </div>

        {/* Proveedor */}
        {tipo === 'entrada' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <strong>Proveedor: </strong>
            <span style={{ 
              borderBottom: '1px solid #ccc', 
              minWidth: '300px',
              display: 'inline-block',
              paddingBottom: '2px'
            }}>
              {proveedor}
            </span>
          </div>
        )}

        {/* Tabla */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          marginBottom: '3rem',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#0d6efd', color: 'white' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '5%' }}>No.</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '12%' }}>Código</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '35%' }}>Descripción</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '12%' }}>Unidad</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '12%' }}>Cantidad</th>
              {tipo === 'entrada' && (
                <>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '12%' }}>Precio U</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '12%' }}>Precio T</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filasCompletas.map((item, index) => (
              <tr key={index} style={{ 
                backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                minHeight: '40px'
              }}>
                <td style={{ 
                  border: '1px solid #ddd', 
                  padding: '8px', 
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  {item.codigo}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {item.descripcion}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  {item.unidad}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  {item.cantidad > 0 ? item.cantidad : ''}
                </td>
                {tipo === 'entrada' && (
                  <>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                      {item.precioU && item.precioU > 0 ? `$${item.precioU.toFixed(2)}` : ''}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                      {item.precioT && item.precioT > 0 ? `$${item.precioT.toFixed(2)}` : ''}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total (solo para entradas) */}
        {tipo === 'entrada' && items.length > 0 && (
          <div style={{ 
            textAlign: 'right', 
            marginBottom: '3rem',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}>
            <div style={{ 
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#f8f9fa',
              border: '2px solid #0d6efd',
              borderRadius: '5px'
            }}>
              TOTAL: ${items.reduce((sum, item) => sum + (item.precioT || 0), 0).toFixed(2)}
            </div>
          </div>
        )}

        {/* Firmas */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: '4rem',
          paddingTop: '2rem'
        }}>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ 
              borderTop: '2px solid #333', 
              marginBottom: '0.5rem',
              paddingTop: '0.5rem'
            }}>
              <strong>Solicitante</strong>
            </div>
            <div>{solicitante}</div>
          </div>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ 
              borderTop: '2px solid #333', 
              marginBottom: '0.5rem',
              paddingTop: '0.5rem'
            }}>
              <strong>Autoriza</strong>
            </div>
            <div>{autoriza}</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '3rem', 
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#666',
          borderTop: '1px solid #eee',
          paddingTop: '1rem'
        }}>
          <p style={{ margin: 0 }}>
            Be-Exen - Sistema de Gestión de Almacén | {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          .solicitud-container {
            margin: 0 !important;
            padding: 0 !important;
          }
          .solicitud-documento {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 1rem !important;
            width: 100% !important;
            min-height: auto !important;
          }
          body {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .d-print-none {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SolicitudAutorizacion;
