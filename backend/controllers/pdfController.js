// import { chromium } from 'playwright'; // Temporalmente deshabilitado para producción

// Genera un PDF desde una URL pública o HTML enviado por POST
// Body soportado:
// { url?: string, html?: string, fileName?: string, emulate?: 'print'|'screen', margin?: {top,right,bottom,left} }
export async function generarPdfSolicitud(req, res) {
  // Temporalmente deshabilitado - usar generarPdfSolicitudEspecifico en su lugar
  return res.status(503).json({ 
    error: 'Función temporalmente deshabilitada. Use generarPdfSolicitudEspecifico.' 
  });
  
  /* 
  const { url, html, fileName = 'Solicitud_Autorizacion.pdf', emulate = 'print', margin } = req.body || {};

  if (!url && !html) {
    return res.status(400).json({ error: 'Falta url o html en el cuerpo de la solicitud.' });
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 960 });

    // Emular media para aplicar estilos correctos
    await page.emulateMedia({ media: emulate === 'screen' ? 'screen' : 'print' });

    if (url) {
      await page.goto(url, { waitUntil: 'networkidle' });
    } else if (html) {
      await page.setContent(html, { waitUntil: 'networkidle' });
    }

    // Esperar a que las fuentes estén listas
    try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch {}

    // Generar PDF con Playwright
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      margin: margin || { top: '10mm', right: '10mm', bottom: '12mm', left: '10mm' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFileName(fileName)}"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generando PDF:', err);
    return res.status(500).json({ error: 'No se pudo generar el PDF', details: String(err) });
  } finally {
    if (browser) {
      try { await browser.close(); } catch {}
    }
  }
  */
}

export function pingPdf(req, res) {
  res.json({ ok: true });
}

function sanitizeFileName(name) {
  return String(name || 'document.pdf').replace(/[^a-zA-Z0-9_\-.]/g, '_');
}

// Generar PDF específico para solicitudes usando jsPDF
export async function generarPdfSolicitudEspecifico(req, res) {
  try {
    // Por ahora, redireccionar al generador de PDF que ya funcionaba
    const { generarPdfSolicitudSimple } = await import('./pdfControllerJsPDF.js');
    
    // Obtener datos de la solicitud para el PDF
    const { id } = req.params;
    
    // Usar el sistema existente que ya funcionaba
    return generarPdfSolicitudSimple(req, res);
  } catch (error) {
    console.error('Error generando PDF de solicitud:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al generar PDF de solicitud',
      message: error.message 
    });
  }
}

/*
function generateSolicitudHTML(solicitud) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const getTipoColor = (tipo) => {
    return tipo === 'ENTRADA' ? '#10B981' : '#EF4444';
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'PENDIENTE': '#F59E0B',
      'AUTORIZADA': '#10B981',
      'RECHAZADA': '#EF4444',
      'COMPLETADA': '#6B7280'
    };
    return colors[estado] || '#6B7280';
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Solicitud ${solicitud.folio}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          font-size: 12px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 24px;
          color: #333;
          margin-bottom: 10px;
        }
        
        .header .company-info {
          font-size: 14px;
          color: #666;
        }
        
        .solicitud-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        
        .solicitud-info .left,
        .solicitud-info .right {
          flex: 1;
        }
        
        .solicitud-info .right {
          text-align: right;
        }
        
        .info-row {
          margin-bottom: 8px;
        }
        
        .info-label {
          font-weight: bold;
          color: #555;
        }
        
        .estado-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-weight: bold;
          font-size: 11px;
        }
        
        .tipo-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-weight: bold;
          font-size: 11px;
        }
        
        .items-section {
          margin-bottom: 30px;
        }
        
        .items-section h3 {
          font-size: 18px;
          margin-bottom: 15px;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #555;
        }
        
        .items-table tbody tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .stock-ok {
          color: #10B981;
          font-weight: bold;
        }
        
        .stock-insuficiente {
          color: #EF4444;
          font-weight: bold;
        }
        
        .observaciones {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
          margin-bottom: 20px;
        }
        
        .observaciones h4 {
          margin-bottom: 10px;
          color: #555;
        }
        
        .firma-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        
        .firma-box {
          width: 200px;
          text-align: center;
        }
        
        .firma-line {
          border-top: 1px solid #333;
          margin-bottom: 5px;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
        
        @media print {
          body {
            font-size: 11px;
          }
          
          .container {
            padding: 15px;
          }
          
          .header h1 {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>SOLICITUD DE AUTORIZACIÓN</h1>
          <div class="company-info">
            <strong>Be-exenTY</strong><br>
            Sistema de Gestión de Inventario
          </div>
        </div>
        
        <!-- Información de la Solicitud -->
        <div class="solicitud-info">
          <div class="left">
            <div class="info-row">
              <span class="info-label">Folio:</span> ${solicitud.folio}
            </div>
            <div class="info-row">
              <span class="info-label">Tipo:</span> 
              <span class="tipo-badge" style="background-color: ${getTipoColor(solicitud.tipo)};">
                ${solicitud.tipo}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha:</span> ${formatDate(solicitud.fecha)}
            </div>
            <div class="info-row">
              <span class="info-label">Solicitante:</span> ${solicitud.usuario_solicita_nombre_completo || solicitud.usuario_solicita_nombre}
            </div>
          </div>
          <div class="right">
            <div class="info-row">
              <span class="info-label">Estado:</span> 
              <span class="estado-badge" style="background-color: ${getEstadoColor(solicitud.estado)};">
                ${solicitud.estado}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha de Creación:</span> ${formatDate(solicitud.created_at)}
            </div>
            ${solicitud.usuario_autoriza_nombre ? `
            <div class="info-row">
              <span class="info-label">Autorizado por:</span> ${solicitud.usuario_autoriza_nombre}
            </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Items -->
        <div class="items-section">
          <h3>Artículos ${solicitud.tipo === 'ENTRADA' ? 'a Ingresar' : 'Solicitados'}</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                ${solicitud.tipo === 'SALIDA' ? '<th>Stock Actual</th><th>Estado</th>' : ''}
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              ${solicitud.items.map(item => `
                <tr>
                  <td>${item.article_code}</td>
                  <td>${item.article_name}</td>
                  <td>${item.cantidad}</td>
                  ${solicitud.tipo === 'SALIDA' ? `
                    <td>${item.stock_actual}</td>
                    <td class="${item.stock_actual >= item.cantidad ? 'stock-ok' : 'stock-insuficiente'}">
                      ${item.stock_actual >= item.cantidad ? '✓ Disponible' : '⚠ Insuficiente'}
                    </td>
                  ` : ''}
                  <td>${item.observaciones || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Observaciones -->
        ${solicitud.observaciones ? `
        <div class="observaciones">
          <h4>Observaciones:</h4>
          <p>${solicitud.observaciones.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}
        
        <!-- Firmas -->
        <div class="firma-section">
          <div class="firma-box">
            <div class="firma-line"></div>
            <p><strong>Solicitante</strong></p>
            <p>${solicitud.usuario_solicita_nombre_completo || solicitud.usuario_solicita_nombre}</p>
            <p>Fecha: ${formatDate(solicitud.created_at)}</p>
          </div>
          
          <div class="firma-box">
            <div class="firma-line"></div>
            <p><strong>Autorizado por</strong></p>
            <p>${solicitud.usuario_autoriza_nombre || '_________________'}</p>
            <p>Fecha: ${solicitud.usuario_autoriza_nombre ? formatDate(solicitud.updated_at) : '_________________'}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>Documento generado automáticamente por el Sistema Be-exenTY</p>
          <p>Fecha de impresión: ${new Date().toLocaleString('es-MX')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
*/
