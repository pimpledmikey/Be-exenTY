import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  codigo?: string;
  descripcion?: string;
  justificacion?: string;
  unidad?: string;
  cantidad?: number;
  precioU?: number;
  precioT?: number;
  tipo?: 'salida' | 'entrada';
  observaciones?: string;
  dirigido?: string;
  departamento?: string;
  usuario?: { nombre: string };
  onClose: () => void;
}

const SolicitudAutorizacion: React.FC<SolicitudAutorizacionProps> = ({
  fecha = new Date().toLocaleDateString('es-ES'),
  proveedor,
  items = [],
  codigo,
  descripcion,
  justificacion,
  unidad,
  cantidad,
  precioU,
  precioT,
  tipo = 'salida',
  observaciones,
  dirigido,
  departamento,
  usuario,
  onClose
}) => {
  // Crear filas completas con el item individual y los items de la lista
  const filasCompletas: SolicitudItem[] = [];
  
  if (codigo && descripcion && unidad && cantidad) {
    filasCompletas.push({
      codigo,
      descripcion,
      unidad,
      cantidad,
      precioU,
      precioT
    });
  }
  
  items.forEach(item => {
    filasCompletas.push(item);
  });

  // Asegurar que tengamos al menos 10 filas para el formato
  while (filasCompletas.length < 10) {
    filasCompletas.push({
      codigo: '',
      descripcion: '',
      unidad: '',
      cantidad: 0,
      precioU: 0,
      precioT: 0
    });
  }

  // Función para imprimir
  const handlePrint = () => {
    const printContents = document.querySelector('.solicitud-documento')?.outerHTML;
    
    if (!printContents) {
      console.error('No se encontró el contenido para imprimir');
      return;
    }

    const originalContents = document.body.innerHTML;
    
    // Crear un documento temporal para imprimir
    document.body.innerHTML = `
      <html>
        <head>
          <title>Solicitud de Autorización - ${fecha}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 14px;
              line-height: 1.4;
              color: black;
              background: white;
              padding: 1cm;
            }
            
            .solicitud-documento {
              width: 100%;
              max-width: none;
              background: white;
              margin: 0;
              padding: 0;
              box-shadow: none;
              border: none;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            
            th {
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: center;
            }
            
            h1 {
              font-size: 18px;
              margin: 10px 0;
              text-align: center;
            }
            
            h2 {
              font-size: 14px;
              margin: 10px 0;
            }
            
            img {
              max-width: 100px;
              height: auto;
            }
            
            .header-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
            }
            
            .signatures {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            
            .signature-box {
              text-align: center;
              width: 200px;
            }
            
            .signature-line {
              border-top: 1px solid black;
              margin-top: 30px;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `;

    // Imprimir y restaurar contenido
    setTimeout(() => {
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Recargar para restaurar todos los event listeners
    }, 100);
  };

  // Función para descargar PDF
  const handleDownloadPDF = async () => {
    try {
      const elemento = document.querySelector('.solicitud-documento') as HTMLElement;
      
      if (!elemento) {
        alert('Error: No se encontró el documento para generar el PDF');
        return;
      }

      console.log('Generando PDF...');
      
      // Configurar opciones para html2canvas
      const canvas = await html2canvas(elemento, {
        scale: 2, // Mejor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: elemento.scrollWidth,
        height: elemento.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Crear PDF con jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Ancho A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Descargar
      const nombreArchivo = `solicitud_autorizacion_${fecha.replace(/\//g, '-')}.pdf`;
      pdf.save(nombreArchivo);
      
      console.log('PDF generado exitosamente');

    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="solicitud-container">
      {/* Botones de acción - solo visible en pantalla */}
      <div className="d-print-none mb-3">
        <button 
          className="btn btn-primary me-2" 
          onClick={handlePrint}
        >
          🖨️ Imprimir
        </button>
        <button 
          className="btn btn-success me-2" 
          onClick={handleDownloadPDF}
        >
          📄 Descargar PDF
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={onClose}
        >
          ❌ Cerrar
        </button>
      </div>

      {/* Documento principal */}
      <div className="solicitud-documento" style={{
        backgroundColor: 'white',
        padding: '2rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        lineHeight: '1.4',
        color: 'black'
      }}>
        {/* Encabezado */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          borderBottom: '2px solid #0d6efd',
          paddingBottom: '1rem'
        }}>
          <div>
            <img 
              src={logoBeExEn} 
              alt="Logo BE-EX-EN" 
              style={{ 
                height: '60px',
                objectFit: 'contain'
              }}
            />
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#0d6efd',
              margin: '0 0 10px 0'
            }}>
              SOLICITUD DE AUTORIZACIÓN
            </h1>
            <h2 style={{ 
              fontSize: '18px',
              color: '#666',
              margin: 0,
              textTransform: 'uppercase'
            }}>
              {tipo === 'entrada' ? 'ENTRADA DE MATERIALES' : 'SALIDA DE MATERIALES'}
            </h2>
          </div>
          <div style={{ textAlign: 'right', minWidth: '150px' }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold',
              color: '#0d6efd'
            }}>
              Fecha: {fecha}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {dirigido && (
          <div style={{ marginBottom: '1rem', fontSize: '14px' }}>
            <strong>Dirigido a:</strong> 
            <span style={{ 
              marginLeft: '10px',
              borderBottom: '1px solid #666',
              minWidth: '300px',
              display: 'inline-block',
              paddingBottom: '2px'
            }}>
              {dirigido}
            </span>
          </div>
        )}

        {departamento && (
          <div style={{ marginBottom: '1rem', fontSize: '14px' }}>
            <strong>Departamento:</strong> 
            <span style={{ 
              marginLeft: '10px',
              borderBottom: '1px solid #666',
              minWidth: '300px',
              display: 'inline-block',
              paddingBottom: '2px'
            }}>
              {departamento}
            </span>
          </div>
        )}

        {proveedor && (
          <div style={{ marginBottom: '1rem', fontSize: '14px' }}>
            <strong>Proveedor:</strong> 
            <span style={{ 
              marginLeft: '10px',
              borderBottom: '1px solid #666',
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
          fontSize: '12px'
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
                  {item.descripcion || item.codigo ? index + 1 : ''}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#0d6efd' }}>
                  {item.codigo}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {item.descripcion}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  {item.unidad}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                  {item.cantidad || ''}
                </td>
                {tipo === 'entrada' && (
                  <>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                      {item.precioU ? `$${item.precioU.toFixed(2)}` : ''}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                      {item.precioT ? `$${item.precioT.toFixed(2)}` : ''}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Justificación */}
        {justificacion && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#0d6efd' }}>Justificación:</h3>
            <div style={{ 
              border: '1px solid #ddd',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              minHeight: '80px'
            }}>
              {justificacion}
            </div>
          </div>
        )}

        {/* Observaciones */}
        {observaciones && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#0d6efd' }}>Observaciones:</h3>
            <div style={{ 
              border: '1px solid #ddd',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              minHeight: '60px'
            }}>
              {observaciones}
            </div>
          </div>
        )}

        {/* Firmas */}
        <div style={{ 
          marginTop: '4rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ 
              borderTop: '1px solid black',
              marginTop: '50px',
              paddingTop: '8px',
              fontSize: '12px'
            }}>
              <strong>Solicitado por:</strong><br/>
              {usuario?.nombre || '_______________________'}
            </div>
          </div>
          
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ 
              borderTop: '1px solid black',
              marginTop: '50px',
              paddingTop: '8px',
              fontSize: '12px'
            }}>
              <strong>Autorizado por:</strong><br/>
              _______________________
            </div>
          </div>
          
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ 
              borderTop: '1px solid black',
              marginTop: '50px',
              paddingTop: '8px',
              fontSize: '12px'
            }}>
              <strong>Recibido por:</strong><br/>
              _______________________
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para impresión - simplificados */}
      <style>{`
        @media print {
          body {
            font-family: Arial, sans-serif !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            color: black !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .solicitud-container {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .solicitud-documento {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 1cm !important;
            width: 100% !important;
            background: white !important;
          }
          
          .d-print-none {
            display: none !important;
          }
          
          table, th, td {
            border: 1px solid black !important;
            border-collapse: collapse !important;
            color: black !important;
            background: white !important;
          }
          
          th {
            background-color: #f0f0f0 !important;
            color: black !important;
          }
          
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default SolicitudAutorizacion;
