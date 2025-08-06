import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoBeExEn from '../assets/logoBeExEn.png';
import { PDF_CONFIG, optimizeElementForPDF, cleanupAfterPDF } from '../utils/pdfUtils';

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

  const handleDownloadPDF = async () => {
    const elemento = document.querySelector('.solicitud-documento') as HTMLElement;
    if (!elemento) return;

    try {
      // Mostrar indicador de carga
      const loadingToast = document.createElement('div');
      loadingToast.innerHTML = '🔄 Generando PDF...';
      loadingToast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #007bff; color: white; padding: 10px 20px;
        border-radius: 5px; font-family: Arial, sans-serif;
      `;
      document.body.appendChild(loadingToast);

      // Optimizar elemento para PDF
      optimizeElementForPDF(elemento);

      // Configurar opciones mejoradas para html2canvas
      const canvas = await html2canvas(elemento, {
        ...PDF_CONFIG.html2canvasOptions,
        width: elemento.offsetWidth,
        height: elemento.offsetHeight
      });

      const imgData = canvas.toDataURL('image/png', 1.0); // Máxima calidad
      
      // Crear PDF en formato A4
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calcular dimensiones con márgenes
      const margins = PDF_CONFIG.pdfOptions.margins;
      const imgWidth = pdfWidth - (margins.left + margins.right);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = margins.top;
      
      // Agregar imagen al PDF
      pdf.addImage(imgData, 'PNG', margins.left, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= (pdfHeight - margins.top - margins.bottom);
      
      // Si el contenido es más alto que una página, agregar páginas adicionales
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + margins.top;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margins.left, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= (pdfHeight - margins.top - margins.bottom);
      }
      
      // Generar nombre de archivo y descargar
      const fileName = PDF_CONFIG.generateFileName(tipo, folio || '');
      pdf.save(fileName);
      
      // Limpiar optimizaciones
      cleanupAfterPDF(elemento);
      
      // Remover indicador de carga
      document.body.removeChild(loadingToast);
      
      // Mostrar mensaje de éxito
      const successToast = document.createElement('div');
      successToast.innerHTML = '✅ PDF generado exitosamente';
      successToast.style.cssText = loadingToast.style.cssText.replace('#007bff', '#28a745');
      document.body.appendChild(successToast);
      setTimeout(() => document.body.removeChild(successToast), 3000);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      
      // Mostrar mensaje de error
      const errorToast = document.createElement('div');
      errorToast.innerHTML = '❌ Error al generar PDF';
      errorToast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #dc3545; color: white; padding: 10px 20px;
        border-radius: 5px; font-family: Arial, sans-serif;
      `;
      document.body.appendChild(errorToast);
      setTimeout(() => document.body.removeChild(errorToast), 5000);
    }
  };

  return (
    <div className="solicitud-container">
      {/* Estilos específicos para impresión y PDF */}
      <style>
        {`
          @media print {
            /* Reiniciar todos los estilos para impresión */
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            /* Ocultar elementos de navegación */
            .navbar, .sidebar, .page-wrapper, .container-xl, 
            .modal-backdrop, .d-print-none, .btn, .modal, .modal-dialog,
            .modal-content, .modal-header, .modal-body {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* Mostrar solo el documento */
            .solicitud-documento {
              display: block !important;
              visibility: visible !important;
              position: relative !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 15mm !important;
              box-shadow: none !important;
              background: white !important;
              color: black !important;
              font-size: 12px !important;
              font-family: Arial, sans-serif !important;
              page-break-inside: avoid;
            }
            
            .solicitud-documento * {
              visibility: visible !important;
              color: black !important;
            }
            
            /* Optimizar tablas para impresión */
            .solicitud-documento table {
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: avoid;
            }
            
            .solicitud-documento td, 
            .solicitud-documento th {
              border: 1px solid #000 !important;
              padding: 4px !important;
              font-size: 10px !important;
            }
            
            /* Ajustar títulos */
            .solicitud-documento h1 {
              font-size: 16px !important;
              color: black !important;
            }
            
            .solicitud-documento h2 {
              font-size: 14px !important;
              color: black !important;
            }
            
            /* Evitar saltos de página en secciones importantes */
            .header-section, .titulo-section, .firmas-section {
              page-break-inside: avoid;
            }
            
            /* Configuración de página */
            @page {
              size: A4;
              margin: 15mm;
            }
          }
          
          /* Estilos para PDF y pantalla */
          .solicitud-documento {
            /* Asegurar que se vea bien en alta resolución */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }
          
          .solicitud-documento table {
            border-collapse: collapse !important;
          }
          
          .solicitud-documento td, 
          .solicitud-documento th {
            border: 1px solid #000 !important;
            padding: 8px !important;
          }
        `}
      </style>

      {/* Botones de acción - solo visible en pantalla */}
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
        <button 
          className="btn btn-success me-2" 
          onClick={handleDownloadPDF}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Descargar PDF
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
        <div className="header-section" style={{ 
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
        <div className="titulo-section" style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
        <table className="tabla-items" style={{ 
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
        <div className="firmas-section" style={{ 
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
