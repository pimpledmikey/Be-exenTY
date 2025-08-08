import { jsPDF } from 'jspdf';
import pool from '../db.js';

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

    // Validar stock para salidas antes de generar el PDF
    if (tipo === 'SALIDA' && items && items.length > 0) {
      const itemsConCodigo = items.filter(item => item.codigo && item.cantidad > 0);
      
      if (itemsConCodigo.length > 0) {
        // Preparar datos para validación múltiple
        const itemsParaValidar = await Promise.all(itemsConCodigo.map(async (item) => {
          // Buscar article_id por código
          const [rows] = await pool.query('SELECT article_id FROM articles WHERE code = ?', [item.codigo]);
          const article_id = rows.length > 0 ? rows[0].article_id : null;
          
          return {
            article_id,
            codigo: item.codigo,
            descripcion: item.descripcion,
            cantidad: item.cantidad
          };
        }));
        
        // Validar stock para cada item
        const itemsSinStock = [];
        for (const itemValidar of itemsParaValidar) {
          if (itemValidar.article_id) {
            const [stockRows] = await pool.query('SELECT stock FROM inventory_stock WHERE article_id = ?', [itemValidar.article_id]);
            const stockActual = stockRows.length > 0 ? stockRows[0].stock : 0;
            
            if (stockActual < itemValidar.cantidad) {
              itemsSinStock.push({
                codigo: itemValidar.codigo,
                descripcion: itemValidar.descripcion,
                stockSolicitado: itemValidar.cantidad,
                stockDisponible: stockActual
              });
            }
          }
        }
        
        // Si hay items sin stock suficiente, retornar error
        if (itemsSinStock.length > 0) {
          return res.status(400).json({
            error: 'Stock insuficiente para generar la solicitud de salida',
            itemsSinStock
          });
        }
      }
    }

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
    doc.text(`${tipo} DE MATERIALES`, 200, 26, { align: 'right' });
    
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
      // Headers de la tabla según el tipo de solicitud
      let tableHeaders = [];
      let colPositions = [];
      
      if (tipo === 'SALIDA') {
        // Para SALIDAS: sin columnas de precios
        tableHeaders = ['NO.', 'CÓDIGO', 'DESCRIPCIÓN', 'UNIDAD', 'CANTIDAD'];
        colPositions = [15, 35, 70, 140, 165];
      } else {
        // Para ENTRADAS: con columnas de precios (como está actualmente)
        tableHeaders = ['NO.', 'CÓDIGO', 'DESCRIPCIÓN', 'UNIDAD', 'CANTIDAD', 'PRECIO U', 'PRECIO T'];
        colPositions = [15, 27, 47, 107, 125, 145, 170];
      }
      
      // Función auxiliar para dibujar header de tabla
      const drawTableHeader = (y) => {
        const tableWidth = tipo === 'SALIDA' ? 165 : 180; // Ancho según tipo
        doc.setFillColor(...colors.verde);
        doc.rect(15, y, tableWidth, 8, 'F');
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
        
        const tableWidth = tipo === 'SALIDA' ? 165 : 180; // Ancho según tipo
        
        // Fondo alternativo optimizado
        if (index % 2 === 0) {
          doc.setFillColor(...colors.grisFondo);
          doc.rect(15, currentY, tableWidth, 7, 'F');
        }
        
        // Bordes de tabla optimizados
        doc.setDrawColor(...colors.grisBorde);
        doc.setLineWidth(0.1);
        doc.rect(15, currentY, tableWidth, 7);
        
        // Líneas verticales de separación
        colPositions.slice(1).forEach(pos => {
          doc.line(pos, currentY, pos, currentY + 7);
        });
        
        // Datos de la fila según el tipo
        let rowData = [];
        
        if (tipo === 'SALIDA') {
          // Para SALIDAS: sin precios
          rowData = [
            (index + 1).toString(),
            item.codigo || '',
            item.descripcion?.length > 35 ? item.descripcion.substring(0, 32) + '...' : item.descripcion || '',
            item.unidad || 'PZA',
            (item.cantidad || 1).toString()
          ];
        } else {
          // Para ENTRADAS: con precios
          rowData = [
            (index + 1).toString(),
            item.codigo || '',
            item.descripcion?.length > 25 ? item.descripcion.substring(0, 22) + '...' : item.descripcion || '',
            item.unidad || 'PZA',
            (item.cantidad || 1).toString(),
            item.precioUnitario || '',
            item.precioTotal || ''
          ];
        }
        
        rowData.forEach((data, idx) => {
          doc.text(data, colPositions[idx] + 2, currentY + 4.5);
        });
        
        currentY += 7;
      });
    }
    
    // FIRMAS EN COLUMNAS - Ajustadas más a la izquierda, a la altura de la tabla
    currentY += 15; // Espacio pequeño después de la tabla
    
    // NO crear nueva página - siempre continuar después de la tabla
    // Solo verificar si hay espacio mínimo (60px para las 3 firmas)
    if (currentY > 780) { // Solo si realmente no cabe
      doc.addPage();
      currentY = 30;
    }
    
    // Verificar si las 3 firmas caben en una fila o si necesitamos 2 filas
    const espacioDisponible = 195 - 15; // Ancho de página menos márgenes
    const anchoFirma = 60; // Ancho de cada firma
    const separacion = 10; // Separación entre firmas
    
    let firmas = [];
    
    if (currentY > 740) { // Si estamos muy abajo, usar 2 filas
      firmas = [
        // Primera fila - 2 firmas
        { titulo: 'SOLICITADO POR:', nombre: usuarioSolicita || 'Juan Jesús Ortega Simbrón', x: 40, y: currentY },
        { titulo: 'AUTORIZADO POR:', nombre: usuarioAutoriza || 'Lic. Elisa Avila Requena', x: 110, y: currentY },
        // Segunda fila - 1 firma
        { titulo: 'RECIBIDO POR:', nombre: 'Nombre y Firma', x: 40, y: currentY + 35 }
      ];
    } else { // Si hay espacio, usar 1 fila - MÁS A LA IZQUIERDA
      firmas = [
        { titulo: 'SOLICITADO POR:', nombre: usuarioSolicita || 'Juan Jesús Ortega Simbrón', x: 35, y: currentY },
        { titulo: 'AUTORIZADO POR:', nombre: usuarioAutoriza || 'Lic. Elisa Avila Requena', x: 100, y: currentY },
        { titulo: 'RECIBIDO POR:', nombre: 'Nombre y Firma', x: 165, y: currentY } // Movida hacia la izquierda
      ];
    }
    
    firmas.forEach((firma) => {
      // Línea individual para cada firma - más pequeñas para que no se salgan
      doc.setLineWidth(0.5);
      doc.setDrawColor(...colors.negro);
      doc.line(firma.x - 22, firma.y + 15, firma.x + 22, firma.y + 15); // Reducido de 25 a 22
      
      // Título de la sección
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(firma.titulo, firma.x, firma.y + 22, { align: 'center' });
      
      // Nombre del usuario
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(firma.nombre.toUpperCase(), firma.x, firma.y + 30, { align: 'center' });
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
