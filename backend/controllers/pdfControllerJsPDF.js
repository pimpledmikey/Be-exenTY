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

    // Crear nuevo documento PDF
    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Configurar fuentes
    doc.setFont('helvetica');
    
    // HEADER FIJO - Logo y datos principales
    const headerHeight = 40;
    
    // Logo (si está disponible)
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', 15, 10, 30, 20);
      } catch (error) {
        console.log('Error al agregar logo:', error);
      }
    }
    
    // Título del documento
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCUMENTO DE SOLICITUD DE AUTORIZACIÓN', 105, 15, { align: 'center' });
    
    // Información del header (lado derecho)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`FOLIO: ${folio || 'N/A'}`, 150, 25);
    doc.text(`FECHA: ${fecha || new Date().toLocaleDateString()}`, 150, 30);
    doc.text(`TIPO: ${tipo || 'N/A'}`, 150, 35);
    
    // Línea separadora del header
    doc.setLineWidth(0.5);
    doc.line(15, headerHeight, 195, headerHeight);
    
    // Información adicional
    let currentY = headerHeight + 15;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN GENERAL', 15, currentY);
    
    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Sucursal: ${sucursal || 'N/A'}`, 15, currentY);
    doc.text(`Usuario Solicita: ${usuarioSolicita || 'N/A'}`, 105, currentY);
    
    currentY += 10;
    
    // TABLA DE ITEMS
    if (items && items.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('DETALLE DE ITEMS', 15, currentY);
      
      currentY += 8;
      
      // Headers de la tabla
      const tableHeaders = ['#', 'Código', 'Descripción', 'Unidad', 'Cantidad'];
      const colWidths = [10, 25, 80, 20, 25];
      const colPositions = [15, 25, 50, 130, 150];
      
      // Fondo del header de la tabla
      doc.setFillColor(76, 175, 80); // Verde de la marca
      doc.rect(15, currentY, 165, 6, 'F');
      
      // Texto del header
      doc.setTextColor(255, 255, 255); // Blanco
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      
      tableHeaders.forEach((header, index) => {
        doc.text(header, colPositions[index], currentY + 4);
      });
      
      currentY += 8;
      doc.setTextColor(0, 0, 0); // Negro
      doc.setFont('helvetica', 'normal');
      
      // Filas de la tabla
      items.forEach((item, index) => {
        // Verificar si necesitamos nueva página
        if (currentY > 250) {
          doc.addPage();
          
          // Repetir header en nueva página
          doc.setFillColor(76, 175, 80);
          doc.rect(15, 15, 165, 6, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          
          tableHeaders.forEach((header, idx) => {
            doc.text(header, colPositions[idx], 19);
          });
          
          currentY = 25;
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
        }
        
        // Alternar color de filas
        if (index % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(15, currentY - 2, 165, 6, 'F');
        }
        
        // Datos de la fila
        doc.text((index + 1).toString(), colPositions[0], currentY + 2);
        doc.text(item.codigo || '', colPositions[1], currentY + 2);
        
        // Descripción con manejo de texto largo
        const descripcion = item.descripcion || '';
        if (descripcion.length > 35) {
          doc.text(descripcion.substring(0, 32) + '...', colPositions[2], currentY + 2);
        } else {
          doc.text(descripcion, colPositions[2], currentY + 2);
        }
        
        doc.text(item.unidad || '', colPositions[3], currentY + 2);
        doc.text((item.cantidad || 0).toString(), colPositions[4], currentY + 2);
        
        currentY += 6;
      });
    }
    
    // OBSERVACIONES
    currentY += 10;
    if (observaciones) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('OBSERVACIONES', 15, currentY);
      
      currentY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      // Dividir observaciones en líneas
      const obsLines = doc.splitTextToSize(observaciones, 165);
      obsLines.forEach((line) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, 15, currentY);
        currentY += 5;
      });
    }
    
    // FIRMAS
    // Verificar si necesitamos espacio para las firmas
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY = Math.max(currentY + 20, 230); // Posición mínima para firmas
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('FIRMAS', 15, currentY);
    
    currentY += 15;
    
    // Cuadros de firmas
    doc.setLineWidth(0.3);
    doc.rect(15, currentY, 80, 25); // Firma izquierda
    doc.rect(105, currentY, 80, 25); // Firma derecha
    
    // Labels de firmas
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('USUARIO SOLICITA', 20, currentY + 30);
    doc.text('USUARIO AUTORIZA', 110, currentY + 30);
    
    // Nombres de usuarios
    if (usuarioSolicita) {
      doc.text(usuarioSolicita, 20, currentY + 35);
    }
    if (usuarioAutoriza) {
      doc.text(usuarioAutoriza, 110, currentY + 35);
    }
    
    // Generar el PDF
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
