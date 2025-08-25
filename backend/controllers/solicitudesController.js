import pool from '../db.js';

// Obtener todas las solicitudes
export const getSolicitudes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, 
             us.username as usuario_solicita_nombre,
             ua.username as usuario_autoriza_nombre
      FROM solicitudes s
      LEFT JOIN users us ON s.usuario_solicita_id = us.user_id
      LEFT JOIN users ua ON s.usuario_autoriza_id = ua.user_id
      ORDER BY s.created_at DESC 
      LIMIT 100
    `);
    
    // Obtener items para cada solicitud
    for (let solicitud of rows) {
      const [items] = await pool.query(`
        SELECT si.*, a.name as articulo_nombre, a.code as articulo_codigo
        FROM solicitudes_items si
        LEFT JOIN articles a ON si.article_id = a.article_id
        WHERE si.solicitud_id = ?
      `, [solicitud.id]);
      solicitud.items = items;
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Crear nueva solicitud
export const createSolicitud = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { 
      tipo, 
      fecha, 
      usuario_solicita_id, 
      observaciones,
      items 
    } = req.body;

    console.log('📋 Datos recibidos para nueva solicitud:', { 
      tipo, 
      fecha, 
      usuario_solicita_id, 
      observaciones, 
      itemsCount: items?.length 
    });

    // Validar datos requeridos
    if (!tipo || !fecha || !usuario_solicita_id || !items || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos obligatorios: tipo, fecha, usuario_solicita_id, items' 
      });
    }

    // Generar folio automático simple
    const timestamp = Date.now();
    const folio = `${tipo}-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}`;
    console.log(`📄 Folio generado: ${folio}`);

    // Insertar la solicitud
    const [solicitudResult] = await connection.query(
      `INSERT INTO solicitudes (folio, tipo, fecha, usuario_solicita_id, observaciones) 
       VALUES (?, ?, ?, ?, ?)`,
      [folio, tipo, fecha, usuario_solicita_id, observaciones]
    );

    const solicitudId = solicitudResult.insertId;
    console.log(`🆔 Solicitud creada con ID: ${solicitudId}`);

    // Insertar los items
    for (const item of items) {
      if (item.article_id && item.cantidad > 0) {
        await connection.query(
          `INSERT INTO solicitudes_items (solicitud_id, article_id, cantidad, precio_unitario, observaciones) 
           VALUES (?, ?, ?, ?, ?)`,
          [solicitudId, item.article_id, item.cantidad, item.precio_unitario || null, item.observaciones]
        );
        console.log(`📦 Item agregado: Artículo ${item.article_id}, Cantidad: ${item.cantidad}`);
      }
    }

    // Si es solicitud de SALIDA, crear las salidas automáticamente
    if (tipo === 'SALIDA') {
      console.log('🚚 Procesando solicitud de SALIDA - creando salidas automáticas...');
      try {
        // Crear salidas automáticas directamente aquí
        for (const item of items) {
          if (item.article_id && item.cantidad > 0) {
            console.log(`📦 Procesando salida para artículo ${item.article_id}, cantidad: ${item.cantidad}`);
            
            // Verificar que el artículo existe
            const [articleCheck] = await connection.query(
              'SELECT article_id, name FROM articles WHERE article_id = ?',
              [item.article_id]
            );

            if (articleCheck.length === 0) {
              console.log(`⚠️ Artículo con ID ${item.article_id} no encontrado`);
              continue;
            }

            // Crear el registro de salida en inventory_exits
            const razon = `Salida automática por solicitud #${solicitudId} - ${item.observaciones || 'Sin observaciones'}`;
            
            const [exitResult] = await connection.query(
              `INSERT INTO inventory_exits (article_id, quantity, date, reason, user_id) 
               VALUES (?, ?, NOW(), ?, ?)`,
              [
                item.article_id, 
                item.cantidad, 
                razon,
                usuario_solicita_id
              ]
            );

            console.log(`✅ Salida automática creada: Exit ID: ${exitResult.insertId}, Artículo: ${item.article_id}, Cantidad: ${item.cantidad}`);
          }
        }
        console.log('✅ Todas las salidas automáticas creadas exitosamente');
      } catch (salidaError) {
        console.error('❌ Error al crear salidas automáticas:', salidaError);
      }
    }

    await connection.commit();
    console.log(`✅ Transacción completada para solicitud ${solicitudId}`);
    
    res.json({ 
      success: true, 
      solicitud_id: solicitudId,
      folio: folio,
      message: 'Solicitud creada exitosamente' + (tipo === 'SALIDA' ? ' con salidas automáticas' : '')
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error al crear solicitud:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    connection.release();
  }
};

// Obtener solicitud por ID
export const getSolicitudById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(`
      SELECT s.*, 
             us.username as usuario_solicita_nombre,
             ua.username as usuario_autoriza_nombre
      FROM solicitudes s
      LEFT JOIN users us ON s.usuario_solicita_id = us.user_id
      LEFT JOIN users ua ON s.usuario_autoriza_id = ua.user_id
      WHERE s.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Solicitud no encontrada' 
      });
    }
    
    // Obtener items de la solicitud
    const [items] = await pool.query(`
      SELECT si.*, a.name as articulo_nombre, a.code as articulo_codigo
      FROM solicitudes_items si
      LEFT JOIN articles a ON si.article_id = a.article_id
      WHERE si.solicitud_id = ?
    `, [id]);
    
    const solicitud = rows[0];
    solicitud.items = items;
    
    res.json({ success: true, data: solicitud });
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Obtener solicitud por folio
export const getSolicitudByFolio = async (req, res) => {
  try {
    const { folio } = req.params;
    
    const [rows] = await pool.query(`
      SELECT s.*, 
             us.username as usuario_solicita_nombre,
             ua.username as usuario_autoriza_nombre
      FROM solicitudes s
      LEFT JOIN users us ON s.usuario_solicita_id = us.user_id
      LEFT JOIN users ua ON s.usuario_autoriza_id = ua.user_id
      WHERE s.folio = ?
    `, [folio]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Solicitud no encontrada' 
      });
    }
    
    // Obtener items de la solicitud
    const [items] = await pool.query(`
      SELECT si.*, a.name as articulo_nombre, a.code as articulo_codigo
      FROM solicitudes_items si
      LEFT JOIN articles a ON si.article_id = a.article_id
      WHERE si.solicitud_id = ?
    `, [rows[0].id]);
    
    const solicitud = rows[0];
    solicitud.items = items;
    
    res.json({ success: true, data: solicitud });
  } catch (error) {
    console.error('Error al obtener solicitud por folio:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Actualizar estado de solicitud
export const updateSolicitudStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, usuario_autoriza_id } = req.body;
    
    // Validar estado
    const estadosValidos = ['PENDIENTE', 'AUTORIZADA', 'RECHAZADA', 'COMPLETADA'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Estado no válido' 
      });
    }
    
    const [result] = await pool.query(
      `UPDATE solicitudes 
       SET estado = ?, usuario_autoriza_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [estado, usuario_autoriza_id, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Solicitud no encontrada' 
      });
    }

    res.json({ 
      success: true, 
      message: `Solicitud ${estado.toLowerCase()} exitosamente` 
    });
  } catch (error) {
    console.error('Error al actualizar estado de solicitud:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
