import React from 'react';
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
      // No recargar la página, solo restaurar event listeners necesarios
    }, 100);
  };

  // Función para descargar PDF - usando print nativo del navegador
  const handleDownloadPDF = async () => {
    try {
      console.log('Iniciando generación de PDF...');
      
      // Trigger print dialog which allows saving as PDF
      window.print();
      
      console.log('PDF iniciado exitosamente');
      
      // Mostrar mensaje informativo
      setTimeout(() => {
        alert('💡 Para guardar como PDF:\n\n1. En la ventana de impresión, cambia el destino a "Guardar como PDF"\n2. Haz clic en "Guardar"\n3. Elige la ubicación donde guardar el archivo');
      }, 500);

    } catch (error) {
      console.error('Error al iniciar PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert('Error al iniciar el PDF. Detalles: ' + errorMessage);
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
              <strong>Solicitado por:</strong><br/>
              {solicitante || usuario?.nombre || '_______________________'}
            </div>
          </div>
          
          <div className="firma-campo">
            <div className="linea-firma"></div>
            <div className="firma-label">
              <strong>Autorizado por:</strong><br/>
              {autoriza || '_______________________'}
            </div>
          </div>
          
          <div className="firma-campo">
            <div className="linea-firma"></div>
            <div className="firma-label">
              <strong>Recibido por:</strong><br/>
              _______________________
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudAutorizacion;
