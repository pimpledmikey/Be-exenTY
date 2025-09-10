import { jsPDF } from 'jspdf';
import pool from '../db.js';

// Función para validar y confirmar solicitud antes de generar PDF
const validarSolicitudParaPdf = async (req, res) => {
  try {
    const { 
      folio,
      fecha,
      tipo,
      sucursal,
      items,
      observaciones,
      usuarioSolicita,
      usuarioAutoriza
    } = req.body;

    // Validaciones básicas
    const errores = [];
    
    if (!folio || folio.trim() === '') {
      errores.push('El folio es requerido');
    }
    
    if (!fecha) {
      errores.push('La fecha es requerida');
    }
    
    if (!tipo || !['ENTRADA', 'SALIDA'].includes(tipo)) {
      errores.push('El tipo debe ser ENTRADA o SALIDA');
    }
    
    if (!items || items.length === 0) {
      errores.push('Debe incluir al menos un artículo');
    }
    
    if (!usuarioSolicita || usuarioSolicita.trim() === '') {
      errores.push('El usuario que solicita es requerido');
    }

    // Validar items específicos
    const itemsValidos = [];
    const itemsConErrores = [];
    
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const erroresItem = [];
        
        if (!item.codigo || item.codigo.trim() === '') {
          erroresItem.push('Código requerido');
        }
        
        if (!item.cantidad || item.cantidad <= 0) {
          erroresItem.push('Cantidad debe ser mayor a 0');
        }
        
        if (!item.descripcion || item.descripcion.trim() === '') {
          erroresItem.push('Descripción requerida');
        }
        
        // Si es salida, validar stock
        if (tipo === 'SALIDA' && item.codigo && item.cantidad > 0) {
          try {
            const [articleRows] = await pool.query('SELECT article_id FROM articles WHERE code = ?', [item.codigo]);
            if (articleRows.length > 0) {
              const [stockRows] = await pool.query('SELECT stock FROM inventory_stock WHERE article_id = ?', [articleRows[0].article_id]);
              const stockActual = stockRows.length > 0 ? stockRows[0].stock : 0;
              
              if (stockActual < item.cantidad) {
                erroresItem.push(`Stock insuficiente (Disponible: ${stockActual}, Solicitado: ${item.cantidad})`);
              }
            } else {
              erroresItem.push('Artículo no encontrado en el sistema');
            }
          } catch (stockError) {
            erroresItem.push('Error verificando stock');
          }
        }
        
        if (erroresItem.length > 0) {
          itemsConErrores.push({
            indice: i + 1,
            codigo: item.codigo,
            descripcion: item.descripcion,
            errores: erroresItem
          });
        } else {
          itemsValidos.push(item);
        }
      }
    }
    
    // Si hay errores, retornarlos
    if (errores.length > 0 || itemsConErrores.length > 0) {
      return res.status(400).json({
        esValido: false,
        erroresGenerales: errores,
        itemsConErrores: itemsConErrores,
        mensaje: 'La solicitud tiene errores que deben corregirse antes de generar el PDF'
      });
    }
    
    // Si todo está bien, retornar confirmación
    res.json({
      esValido: true,
      mensaje: 'La solicitud es válida y está lista para generar el PDF',
      resumen: {
        folio,
        fecha,
        tipo,
        totalItems: itemsValidos.length,
        usuarioSolicita,
        usuarioAutoriza: usuarioAutoriza || 'Por asignar'
      }
    });
    
  } catch (error) {
    console.error('Error validando solicitud:', error);
    res.status(500).json({ 
      error: 'Error al validar la solicitud',
      details: error.message 
    });
  }
};

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
    
    // Si es una salida, registrar las salidas en la base de datos
    if (tipo === 'SALIDA' && items && items.length > 0) {
      try {
        await registrarSalidasInventario(items, {
          folio,
          fecha,
          usuarioSolicita,
          usuarioAutoriza,
          observaciones
        });
        console.log(`✅ Salidas registradas exitosamente para solicitud ${folio}`);
      } catch (salidasError) {
        console.error('❌ Error registrando salidas:', salidasError);
        // El PDF se genera aunque falle el registro de salidas
        // Podrías cambiar este comportamiento si prefieres que falle todo
      }
    }
    
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

// Nueva función para generar PDF de solicitud existente
const generarPdfSolicitudFromId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Generando PDF para solicitud ID:', id);

    // Obtener datos básicos de la solicitud
    const [solicitudRows] = await pool.query(`
      SELECT 
        s.*,
        u_solicita.name as usuario_solicita_nombre,
        u_autoriza.name as usuario_autoriza_nombre
      FROM solicitudes s
      LEFT JOIN users u_solicita ON s.usuario_solicita_id = u_solicita.user_id
      LEFT JOIN users u_autoriza ON s.usuario_autoriza_id = u_autoriza.user_id
      WHERE s.id = ?
    `, [id]);

    if (solicitudRows.length === 0) {
      console.log('❌ Solicitud no encontrada para ID:', id);
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const solicitud = solicitudRows[0];
    console.log('📄 Solicitud encontrada:', {
      folio: solicitud.folio,
      tipo: solicitud.tipo,
      fecha: solicitud.fecha,
      estado: solicitud.estado,
      solicitante: solicitud.usuario_solicita_nombre,
      autoriza: solicitud.usuario_autoriza_nombre
    });

    // Obtener items de la solicitud
    const [itemsRows] = await pool.query(`
      SELECT 
        si.*,
        a.code as article_code,
        a.name as article_name,
        COALESCE(stock.stock, 0) as stock_actual
      FROM solicitudes_items si
      JOIN articles a ON si.article_id = a.article_id
      LEFT JOIN inventory_stock stock ON si.article_id = stock.article_id
      WHERE si.solicitud_id = ?
      ORDER BY si.id
    `, [id]);
    
    console.log(`📋 Items encontrados: ${itemsRows.length}`);
    if (itemsRows.length > 0) {
      console.log('Primeros 3 items:', itemsRows.slice(0, 3).map(item => ({
        codigo: item.article_code,
        nombre: item.article_name,
        cantidad: item.cantidad,
        stock: item.stock_actual
      })));
    }

    // Crear el PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('SOLICITUD DE AUTORIZACIÓN', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`${solicitud.tipo} DE MATERIALES`, 105, 30, { align: 'center' });
    
    // Información básica
    doc.setFontSize(12);
    let y = 50;
    doc.text(`Folio: ${solicitud.folio}`, 20, y);
    doc.text(`Fecha: ${new Date(solicitud.fecha).toLocaleDateString('es-ES')}`, 120, y);
    y += 10;
    doc.text(`Solicitante: ${solicitud.usuario_solicita_nombre || 'N/A'}`, 20, y);
    y += 10;
    doc.text(`Autoriza: ${solicitud.usuario_autoriza_nombre || 'N/A'}`, 20, y);
    y += 10;
    doc.text(`Estado: ${solicitud.estado}`, 20, y);
    y += 20;
    
    // Tabla de items
    if (itemsRows.length > 0) {
      doc.text('ARTÍCULOS SOLICITADOS:', 20, y);
      y += 10;
      
      // Headers
      doc.setFontSize(10);
      doc.text('CÓDIGO', 20, y);
      doc.text('ARTÍCULO', 60, y);
      doc.text('CANTIDAD', 120, y);
      doc.text('STOCK', 150, y);
      y += 5;
      
      // Línea separadora
      doc.line(20, y, 180, y);
      y += 5;
      
      // Items
      itemsRows.forEach((item, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(item.article_code || '', 20, y);
        doc.text((item.article_name || '').substring(0, 30), 60, y);
        doc.text(item.cantidad.toString(), 120, y);
        doc.text((item.stock_actual || 0).toString(), 150, y);
        y += 5;
      });
    } else {
      doc.text('No hay artículos en esta solicitud', 20, y);
    }
    
    // Footer
    y = Math.max(y + 20, 250);
    doc.text('___________________', 30, y);
    doc.text('___________________', 120, y);
    doc.setFontSize(8);
    doc.text('SOLICITADO POR', 30, y + 5);
    doc.text('AUTORIZADO POR', 120, y + 5);
    
    // Generar el PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="solicitud-${solicitud.tipo}-${solicitud.folio}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    console.log('✅ PDF generado exitosamente');
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    res.status(500).json({ 
      error: 'Error al generar PDF',
      details: error.message 
    });
  }
};

// Función auxiliar para registrar las salidas en el inventario
const registrarSalidasInventario = async (items, solicitudInfo) => {
  try {
    console.log('📤 Registrando salidas automáticas para:', solicitudInfo.folio);
    
    // Filtrar solo items con código y cantidad válidos
    const itemsParaRegistrar = items.filter(item => 
      item.codigo && 
      item.cantidad > 0 && 
      typeof item.cantidad === 'number'
    );
    
    if (itemsParaRegistrar.length === 0) {
      console.log('⚠️ No hay items válidos para registrar salidas');
      return;
    }
    
    // Procesar cada item
    for (const item of itemsParaRegistrar) {
      try {
        // Buscar el article_id por código
        const [articleRows] = await pool.query(
          'SELECT article_id, name FROM articles WHERE code = ?', 
          [item.codigo]
        );
        
        if (articleRows.length === 0) {
          console.log(`⚠️ Artículo no encontrado para código: ${item.codigo}`);
          continue;
        }
        
        const article_id = articleRows[0].article_id;
        const articleName = articleRows[0].name;
        
        // Crear el registro de salida
        const razon = `Solicitud ${solicitudInfo.folio} - ${item.descripcion || articleName} - Autorizado por: ${solicitudInfo.usuarioAutoriza || 'Sistema'}`;
        
        await pool.query(
          'INSERT INTO inventory_exits (article_id, quantity, reason, user_id, exit_date) VALUES (?, ?, ?, ?, ?)',
          [
            article_id,
            item.cantidad,
            razon,
            1, // ID del usuario del sistema, podrías cambiarlo por el ID real del usuario
            solicitudInfo.fecha || new Date().toISOString().split('T')[0]
          ]
        );
        
        // Actualizar el stock en inventory_stock
        await pool.query(`
          UPDATE inventory_stock 
          SET stock = stock - ?, 
              last_updated = CURRENT_TIMESTAMP 
          WHERE article_id = ?
        `, [item.cantidad, article_id]);
        
        console.log(`✅ Salida registrada: ${item.codigo} - Cantidad: ${item.cantidad}`);
        
      } catch (itemError) {
        console.error(`❌ Error registrando salida para ${item.codigo}:`, itemError);
        // Continuar con el siguiente item en caso de error
        continue;
      }
    }
    
    console.log('✅ Proceso de registro de salidas completado');
    
  } catch (error) {
    console.error('❌ Error general en registrarSalidasInventario:', error);
    throw error;
  }
};

export { generarPdfSolicitudSimple, validarSolicitudParaPdf, generarPdfSolicitudFromId };
