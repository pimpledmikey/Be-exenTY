import pool from '../db.js';

// Endpoint temporal para debuggear stock
export const debugStockArticle24 = async (req, res) => {
  try {
    console.log('🔍 Iniciando debug del stock del artículo 24...');

            // 3. Obtener TODAS las entradas (sin LIMIT)
        const [entradas] = await pool.execute(`
            SELECT 'ENTRADAS' as tipo, entry_id, quantity, date, supplier, invoice_number
            FROM inventory_entries 
            WHERE article_id = 24 
            ORDER BY date
        `);

        // 4. Obtener TODAS las salidas (sin LIMIT)
        const [salidas] = await pool.execute(`
            SELECT 'SALIDAS' as tipo, exit_id, quantity, date, reason, user_id
            FROM inventory_exits 
            WHERE article_id = 24 
            ORDER BY date
        `);

        // 5. Obtener TODOS los ajustes (sin LIMIT)
        const [ajustes] = await pool.execute(`
            SELECT 'AJUSTES' as tipo, adjustment_id, quantity, date, reason, user_id
            FROM inventory_adjustments 
            WHERE article_id = 24 
            ORDER BY date
        `);

        // 6. Calcular totales manualmente
        const totalEntradas = entradas.reduce((sum, entrada) => sum + parseInt(entrada.quantity), 0);
        const totalSalidas = salidas.reduce((sum, salida) => sum + parseInt(salida.quantity), 0);
        const totalAjustes = ajustes.reduce((sum, ajuste) => sum + parseInt(ajuste.quantity), 0);
        const stockCalculado = totalEntradas - totalSalidas + totalAjustes;

        console.log('=== DEBUG DETALLADO ARTÍCULO 24 ===');
        console.log('Total entradas encontradas:', entradas.length);
        console.log('Total salidas encontradas:', salidas.length);
        console.log('Total ajustes encontrados:', ajustes.length);
        console.log('Suma entradas:', totalEntradas);
        console.log('Suma salidas:', totalSalidas);
        console.log('Suma ajustes:', totalAjustes);
        console.log('Stock calculado:', stockCalculado);

        // 7. Consulta de cálculo manual desde la base
        const [calculo] = await pool.execute(`
            SELECT 
                'CÁLCULO MANUAL' as info,
                (SELECT COALESCE(SUM(quantity), 0) FROM inventory_entries WHERE article_id = 24) as total_entradas,
                (SELECT COALESCE(SUM(quantity), 0) FROM inventory_exits WHERE article_id = 24) as total_salidas,
                (SELECT COALESCE(SUM(quantity), 0) FROM inventory_adjustments WHERE article_id = 24) as total_ajustes,
                (
                    (SELECT COALESCE(SUM(quantity), 0) FROM inventory_entries WHERE article_id = 24) -
                    (SELECT COALESCE(SUM(quantity), 0) FROM inventory_exits WHERE article_id = 24) +
                    (SELECT COALESCE(SUM(quantity), 0) FROM inventory_adjustments WHERE article_id = 24)
                ) as stock_calculado
        `);

        // 8. Vista actual
        const [vista] = await pool.query(`
            SELECT 'VISTA ACTUAL' as tipo, article_id, code, name, stock, last_unit_cost, total_cost
            FROM inventory_stock 
            WHERE article_id = 24
        `);

    const debug_info = {
      artículo_id: 24,
      entradas: {
        registros: entradas.length,
        datos: entradas,
        total: entradas.reduce((sum, e) => sum + e.quantity, 0)
      },
      salidas: {
        registros: salidas.length, 
        datos: salidas,
        total: salidas.reduce((sum, s) => sum + s.quantity, 0)
      },
      ajustes: {
        registros: ajustes.length,
        datos: ajustes,
        total: ajustes.reduce((sum, a) => sum + a.quantity, 0)
      },
      cálculo_manual: calculo[0],
      vista_actual: vista[0],
      fórmula: "ENTRADAS - SALIDAS + AJUSTES"
    };

    console.log('🔍 Debug Stock Artículo 24:', JSON.stringify(debug_info, null, 2));
    res.json(debug_info);

  } catch (error) {
    console.error('❌ Error en debug stock:', error);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint para verificar la definición de la vista
export const verificarVistaStock = async (req, res) => {
  try {
    console.log('🔍 Verificando definición de la vista inventory_stock...');

    // Contar registros directamente en cada tabla
    const [count_entradas] = await pool.query(`SELECT COUNT(*) as total FROM inventory_entries WHERE article_id = 24`);
    const [count_salidas] = await pool.query(`SELECT COUNT(*) as total FROM inventory_exits WHERE article_id = 24`);
    const [count_ajustes] = await pool.query(`SELECT COUNT(*) as total FROM inventory_adjustments WHERE article_id = 24`);

    // Sumar cantidades directamente de cada tabla
    const [sum_entradas] = await pool.query(`SELECT COALESCE(SUM(quantity), 0) as suma FROM inventory_entries WHERE article_id = 24`);
    const [sum_salidas] = await pool.query(`SELECT COALESCE(SUM(quantity), 0) as suma FROM inventory_exits WHERE article_id = 24`);
    const [sum_ajustes] = await pool.query(`SELECT COALESCE(SUM(quantity), 0) as suma FROM inventory_adjustments WHERE article_id = 24`);

    // Verificar la definición de la vista
    const [vista_def] = await pool.query(`SHOW CREATE VIEW inventory_stock`);
    
    res.json({
      conteos_directos: {
        entradas: count_entradas[0],
        salidas: count_salidas[0], 
        ajustes: count_ajustes[0]
      },
      sumas_directas: {
        entradas: sum_entradas[0],
        salidas: sum_salidas[0],
        ajustes: sum_ajustes[0]
      },
      vista_definicion: vista_def[0]
    });

  } catch (error) {
    console.error('❌ Error verificando vista:', error);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint para corregir la vista inventory_stock
export const corregirVistaStock = async (req, res) => {
  try {
    console.log('🔧 Corrigiendo la vista inventory_stock...');

    // Primero eliminar la vista existente
    await pool.query(`DROP VIEW IF EXISTS inventory_stock`);
    
    // Crear la vista corregida usando subconsultas en lugar de JOINs múltiples
    await pool.query(`
      CREATE VIEW inventory_stock AS
      SELECT 
        a.article_id,
        a.code,
        a.name,
        (
          COALESCE((SELECT SUM(quantity) FROM inventory_entries WHERE article_id = a.article_id), 0) -
          COALESCE((SELECT SUM(quantity) FROM inventory_exits WHERE article_id = a.article_id), 0) +
          COALESCE((SELECT SUM(quantity) FROM inventory_adjustments WHERE article_id = a.article_id), 0)
        ) AS stock,
        (
          SELECT unit_cost 
          FROM inventory_entries 
          WHERE article_id = a.article_id 
          ORDER BY date DESC 
          LIMIT 1
        ) AS last_unit_cost,
        (
          (
            COALESCE((SELECT SUM(quantity) FROM inventory_entries WHERE article_id = a.article_id), 0) -
            COALESCE((SELECT SUM(quantity) FROM inventory_exits WHERE article_id = a.article_id), 0) +
            COALESCE((SELECT SUM(quantity) FROM inventory_adjustments WHERE article_id = a.article_id), 0)
          ) * 
          (
            SELECT unit_cost 
            FROM inventory_entries 
            WHERE article_id = a.article_id 
            ORDER BY date DESC 
            LIMIT 1
          )
        ) AS total_cost
      FROM articles a
    `);

    // Verificar que la corrección funcionó
    const [stock_corregido] = await pool.query(`
      SELECT * FROM inventory_stock WHERE article_id = 24
    `);

    console.log('✅ Vista inventory_stock corregida exitosamente');
    
    res.json({
      success: true,
      mensaje: 'Vista inventory_stock corregida',
      stock_anterior: '4614',
      stock_corregido: stock_corregido[0].stock,
      datos_completos: stock_corregido[0]
    });

  } catch (error) {
    console.error('❌ Error corrigiendo vista:', error);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint para limpiar datos problemáticos si es necesario
export const limpiarStockArticle24 = async (req, res) => {
  try {
    console.log('🧹 Iniciando limpieza de datos problemáticos...');

    // Verificar si hay ajustes masivos que causen el problema
    const [ajustesGrandes] = await pool.query(`
      SELECT * FROM inventory_adjustments 
      WHERE article_id = 24 AND ABS(quantity) > 1000
      ORDER BY date DESC
    `);

    if (ajustesGrandes.length > 0) {
      console.log('⚠️ Encontrados ajustes masivos:', ajustesGrandes);
      
      // Preguntar si eliminar (en producción esto debería ser más cuidadoso)
      const { confirmar } = req.body;
      
      if (confirmar === 'SI_ELIMINAR_AJUSTES_MASIVOS') {
        await pool.query(`
          DELETE FROM inventory_adjustments 
          WHERE article_id = 24 AND ABS(quantity) > 1000
        `);
        
        console.log('✅ Ajustes masivos eliminados');
        return res.json({ 
          success: true, 
          message: 'Ajustes masivos eliminados', 
          eliminados: ajustesGrandes.length 
        });
      }
    }

    res.json({ 
      ajustes_encontrados: ajustesGrandes.length,
      datos: ajustesGrandes,
      mensaje: "Envía POST con {confirmar: 'SI_ELIMINAR_AJUSTES_MASIVOS'} para limpiar"
    });

  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    res.status(500).json({ error: error.message });
  }
};
