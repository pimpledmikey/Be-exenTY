import { jsPDF } from 'jspdf';

const generarPdfSolicitudSimple = async (req, res) => {
  try {
    const { 
      folio,
      fecha,
      tipo,
      sucursal,
      items,
      observaciones,
      usuarioSolicita,
      usuarioAutoriza,
      logoBase64 // Logo en base64 desde el frontend
    } = req.body;

    // Crear nuevo documento PDF optimizado
    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Pre-configurar colores y fuentes para optimizar rendimiento
    const colors = {
      verde: [76, 175, 80],
      negro: [0, 0, 0],
      blanco: [255, 255, 255],
      grisFondo: [245, 245, 245],
      grisBorde: [200, 200, 200]
    };
    
    doc.setFont('helvetica');
    
    // HEADER PROFESIONAL - Optimizado
    const headerHeight = 55; // Aumentamos el espacio para más separación
    
    // Logo (si está disponible)
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', 15, 8, 25, 25);
      } catch (error) {
        console.log('Error al agregar logo:', error);
      }
    }
    
    // Títulos del documento - Lado derecho como en la vista previa
    doc.setTextColor(...colors.verde);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SOLICITUD DE AUTORIZACIÓN', 200, 18, { align: 'right' });
    
    doc.setFontSize(14);
    doc.text('ENTRADA DE MATERIALES', 200, 26, { align: 'right' });
    
    // Información del header en recuadros
    doc.setTextColor(...colors.negro);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Fecha en recuadro
    doc.rect(155, 30, 40, 6);
    doc.text('Fecha:', 157, 34);
    doc.setFont('helvetica', 'bold');
    doc.text(fecha || new Date().toLocaleDateString('es-ES'), 170, 34);
    
    // Folio
    doc.setFont('helvetica', 'normal');
    doc.text(`Folio: ${folio || 'ENTRADA-' + Date.now().toString().slice(-6)}`, 155, 42);
    
    // Información de usuarios - con más separación de la línea verde
    doc.text(`Solicitante: ${usuarioSolicita || 'N/A'}`, 15, 52);
    doc.text(`Autoriza: ${usuarioAutoriza || 'N/A'}`, 15, 58);
    
    // Línea separadora del header
    doc.setLineWidth(0.8);
    doc.setDrawColor(...colors.verde);
    doc.line(15, headerHeight, 195, headerHeight);
    
    // TABLA DE ITEMS - Optimizada y profesional
    let currentY = headerHeight + 20; // Más espacio después de la línea verde
    
    if (items && items.length > 0) {
      // Headers de la tabla con configuración optimizada
      const tableHeaders = ['NO.', 'CÓDIGO', 'DESCRIPCIÓN', 'UNIDAD', 'CANTIDAD', 'PRECIO U', 'PRECIO T'];
      const colPositions = [15, 27, 47, 107, 125, 145, 170];
      
      // Función auxiliar para dibujar header de tabla
      const drawTableHeader = (y) => {
        doc.setFillColor(...colors.verde);
        doc.rect(15, y, 180, 8, 'F');
        doc.setTextColor(...colors.blanco);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        tableHeaders.forEach((header, index) => {
          doc.text(header, colPositions[index] + 2, y + 5.5);
        });
        doc.setTextColor(...colors.negro);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
      };
      
      // Dibujar header inicial
      drawTableHeader(currentY);
      currentY += 8;
      
      // Optimizar dibujo de filas
      items.forEach((item, index) => {
        // Verificar nueva página
        if (currentY > 250) {
          doc.addPage();
          drawTableHeader(15);
          currentY = 25;
        }
        
        // Fondo alternativo optimizado
        if (index % 2 === 0) {
          doc.setFillColor(...colors.grisFondo);
          doc.rect(15, currentY, 180, 7, 'F');
        }
        
        // Bordes de tabla optimizados
        doc.setDrawColor(...colors.grisBorde);
        doc.setLineWidth(0.1);
        doc.rect(15, currentY, 180, 7);
        
        // Líneas verticales de separación
        colPositions.slice(1).forEach(pos => {
          doc.line(pos, currentY, pos, currentY + 7);
        });
        
        // Datos de la fila optimizados
        const rowData = [
          (index + 1).toString(),
          item.codigo || '',
          item.descripcion?.length > 25 ? item.descripcion.substring(0, 22) + '...' : item.descripcion || '',
          item.unidad || 'PZA',
          (item.cantidad || 1).toString(),
          item.precioUnitario || '',
          item.precioTotal || ''
        ];
        
        rowData.forEach((data, idx) => {
          doc.text(data, colPositions[idx] + 2, currentY + 4.5);
        });
        
        currentY += 7;
      });
    }
    
    // FIRMAS EN COLUMNAS - En la misma fila después de la tabla
    currentY += 15; // Espacio pequeño después de la tabla
    
    // NO crear nueva página - siempre continuar después de la tabla
    // Solo verificar si hay espacio mínimo (60px para las 3 firmas)
    if (currentY > 780) { // Solo si realmente no cabe
      doc.addPage();
      currentY = 30;
    }
    
    // Tres firmas en columnas horizontales (misma fila)
    const firmas = [
      { titulo: 'SOLICITADO POR:', nombre: usuarioSolicita || 'Juan Jesús Ortega Simbrón', x: 70 },
      { titulo: 'AUTORIZADO POR:', nombre: usuarioAutoriza || 'Lic. Elisa Avila Requena', x: 165 },
      { titulo: 'RECIBIDO POR:', nombre: 'Nombre y Firma', x: 260 }
    ];
    
    firmas.forEach((firma) => {
      // Línea individual para cada firma
      doc.setLineWidth(0.5);
      doc.setDrawColor(...colors.negro);
      doc.line(firma.x - 35, currentY + 15, firma.x + 35, currentY + 15);
      
      // Título de la sección
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(firma.titulo, firma.x, currentY + 22, { align: 'center' });
      
      // Nombre del usuario
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(firma.nombre.toUpperCase(), firma.x, currentY + 30, { align: 'center' });
    });
    
    // Generar el PDF optimizado
    const pdfBuffer = doc.output('arraybuffer');
    
    // Configurar headers para descarga
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="solicitud_${folio || 'documento'}.pdf"`,
      'Content-Length': pdfBuffer.byteLength
    });
    
    // Enviar el PDF
    res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ 
      error: 'Error al generar el PDF',
      details: error.message 
    });
  }
};

export { generarPdfSolicitudSimple };
