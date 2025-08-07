import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logoBeExEn from '../assets/logoBeExEn.png';
import '../styles/SolicitudAutorizacion.css';

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
  solicitante?: string;
  autoriza?: string;
  folio?: string;
  onClose?: () => void;
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
  solicitante,
  autoriza,
  folio,
  onClose = () => {}
}) => {
  // Estado para manejar la carga del PDF
  const [generandoPDF, setGenerandoPDF] = useState(false);
  
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

  // Función para imprimir - SIMPLIFICADA
  const handlePrint = () => {
    const printContainer = document.querySelector('.solicitud-container');
    if (printContainer) {
      // Añadimos una clase al contenedor que queremos imprimir
      printContainer.classList.add('solicitud-container-print');
      window.print();
      // Eliminamos la clase después de imprimir
      printContainer.classList.remove('solicitud-container-print');
    }
  };

  // Función para generar PDF con jsPDF y html2canvas - SIMPLIFICADA
  const handleDownloadPDF = async () => {
    const documentElement = document.querySelector('.solicitud-documento') as HTMLElement;
    if (!documentElement) {
      console.error("Elemento .solicitud-documento no encontrado");
      return;
    }

    setGenerandoPDF(true);

    try {
      const canvas = await html2canvas(documentElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const ahora = new Date();
      const fechaArchivo = ahora.toLocaleDateString('es-ES').replace(/\//g, '-');
      const horaArchivo = ahora.toLocaleTimeString('es-ES', { hour12: false }).replace(/:/g, '-');
      const tipoDoc = tipo === 'entrada' ? 'ENTRADA' : 'SALIDA';
      const nombreArchivo = `Solicitud_${tipoDoc}_${fechaArchivo}_${horaArchivo}.pdf`;

      pdf.save(nombreArchivo);

    } catch (error) {
      console.error("Error al generar PDF:", error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="solicitud-container">
      {/* Botones de acción */}
      <div className="botones-accion d-print-none">
        <button 
          className="btn-accion btn-imprimir" 
          onClick={handlePrint}
          disabled={generandoPDF}
        >
          🖨️ Imprimir
        </button>
        <button 
          className={`btn-accion btn-pdf ${generandoPDF ? 'loading' : ''}`} 
          onClick={handleDownloadPDF}
          disabled={generandoPDF}
        >
          {generandoPDF ? '⏳ Generando...' : '📄 Descargar PDF'}
        </button>
        {onClose && (
          <button 
            className="btn-accion btn-volver" 
            onClick={onClose}
            disabled={generandoPDF}
          >
            ↩️ Volver
          </button>
        )}
      </div>

      {/* Documento principal */}
      <div className="solicitud-documento">
        {/* Encabezado */}
        <div className="documento-header">
          <div className="logo-container">
            <img 
              src={logoBeExEn} 
              alt="Logo BE-EX-EN" 
              className="logo-beexen"
            />
          </div>
          <div className="header-info">
            <h1 className="titulo-principal">
              SOLICITUD DE AUTORIZACIÓN
            </h1>
            <h2 className="info-documento">
              {tipo === 'entrada' ? 'ENTRADA DE MATERIALES' : 'SALIDA DE MATERIALES'}
            </h2>
            <div className="info-documento">
              Fecha: {fecha}
            </div>
            {folio && (
              <div className="info-documento">
                Folio: {folio}
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="info-general">
          {dirigido && (
            <div className="campo-grupo">
              <label className="campo-label">Dirigido a:</label>
              <div className="campo-valor">{dirigido}</div>
            </div>
          )}

          {departamento && (
            <div className="campo-grupo">
              <label className="campo-label">Departamento:</label>
              <div className="campo-valor">{departamento}</div>
            </div>
          )}

          {proveedor && (
            <div className="campo-grupo">
              <label className="campo-label">Proveedor:</label>
              <div className="campo-valor">{proveedor}</div>
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="tabla-container">
          <table className="tabla-articulos">
            <thead>
              <tr>
                <th>No.</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Medida</th>
                <th>Cantidad</th>
                {tipo === 'entrada' && (
                  <>
                    <th>Precio U</th>
                    <th>Precio T</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filasCompletas.map((item, index) => (
                <tr key={index}>
                  <td>
                    {item.descripcion || item.codigo ? index + 1 : ''}
                  </td>
                  <td>
                    <strong>{item.codigo}</strong>
                  </td>
                  <td>
                    {item.descripcion}
                  </td>
                  <td>
                    {item.unidad}
                  </td>
                  <td>
                    {item.medida || ''}
                  </td>
                  <td>
                    <strong>{item.cantidad || ''}</strong>
                  </td>
                  {tipo === 'entrada' && (
                    <>
                      <td>
                        {item.precioU ? `$${item.precioU.toFixed(2)}` : ''}
                      </td>
                      <td>
                        <strong>{item.precioT ? `$${item.precioT.toFixed(2)}` : ''}</strong>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Justificación */}
        {justificacion && (
          <div className="observaciones-section">
            <label className="observaciones-label">Justificación:</label>
            <div className="observaciones-texto">
              {justificacion}
            </div>
          </div>
        )}

        {/* Observaciones */}
        {observaciones && (
          <div className="observaciones-section">
            <label className="observaciones-label">Observaciones:</label>
            <div className="observaciones-texto">
              {observaciones}
            </div>
          </div>
        )}

        {/* Firmas */}
        <div className="firmas-section">
          <div className="firma-campo">
            <div className="linea-firma"></div>
            <div className="firma-label">
              <strong>Solicitante</strong><br/>
              {solicitante || usuario?.nombre || 'Juan Jesús Ortega Simbrón'}
            </div>
          </div>
          
          <div className="firma-campo">
            <div className="linea-firma"></div>
            <div className="firma-label">
              <strong>Autoriza</strong><br/>
              {autoriza || 'Lic. Elisa Avila Requena'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudAutorizacion;
