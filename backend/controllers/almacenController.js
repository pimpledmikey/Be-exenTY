import pool from '../db.js';

export const getArticulos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, 
             g.group_name AS grupo_nombre, 
             m.measure_name AS medida_nombre, 
             u.unit_name AS unidad_nombre,
             CASE WHEN a.status = 'activo' THEN 'Activo' ELSE 'Inactivo' END AS status
      FROM articles a
      LEFT JOIN article_groups g ON a.group_code = g.group_code
      LEFT JOIN article_measures m ON a.measure_code = m.measure_code
      LEFT JOIN article_units u ON a.unit_code = u.unit_code
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createArticulo = async (req, res) => {
  try {
    const { code, name, size, group_code, measure_code, description, unit_code, min_stock, max_stock, status, supplier_code, supplier_name } = req.body;

    console.log('📦 Datos recibidos en createArticulo:', {
      code, name, size, group_code, measure_code, description, unit_code, min_stock, max_stock, status, supplier_code, supplier_name
    });

    // Validar códigos de grupo, medida y unidad
    const [[grupo]] = await pool.query('SELECT * FROM article_groups WHERE group_code = ?', [group_code]);
    const [[medida]] = await pool.query('SELECT * FROM article_measures WHERE measure_code = ?', [measure_code]);
    const [[unidad]] = await pool.query('SELECT * FROM article_units WHERE unit_code = ?', [unit_code]);

    if (!grupo) return res.status(400).json({ error: 'Código de grupo inválido' });
    if (!medida) return res.status(400).json({ error: 'Código de medida inválido' });
    if (!unidad) return res.status(400).json({ error: 'Código de unidad inválido' });

    await pool.query(
      'INSERT INTO articles (code, name, size, group_code, measure_code, description, unit_code, min_stock, max_stock, status, supplier_code, supplier_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [code, name, size, group_code, measure_code, description, unit_code, min_stock, max_stock, status || 'activo', supplier_code || null, supplier_name || null]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEntradas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, a.name as articulo_nombre
      FROM inventory_entries e
      LEFT JOIN articles a ON e.article_id = a.article_id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEntrada = async (req, res) => {
  try {
    const { article_id, quantity, unit_cost, invoice_number, supplier } = req.body;
    await pool.query(
      'INSERT INTO inventory_entries (article_id, quantity, unit_cost, invoice_number, supplier) VALUES (?, ?, ?, ?, ?)',
      [article_id, quantity, unit_cost, invoice_number, supplier]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSalidas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, a.name as articulo_nombre, u.username as usuario_nombre
      FROM inventory_exits s
      LEFT JOIN articles a ON s.article_id = a.article_id
      LEFT JOIN users u ON s.user_id = u.user_id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createSalida = async (req, res) => {
  try {
    const { article_id, quantity, reason, user_id } = req.body;
    await pool.query(
      'INSERT INTO inventory_exits (article_id, quantity, reason, user_id) VALUES (?, ?, ?, ?)',
      [article_id, quantity, reason, user_id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStock = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, a.code, a.name, a.size, a.unit_code as unit
      FROM inventory_stock s
      LEFT JOIN articles a ON s.article_id = a.article_id
      ORDER BY a.name
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getArticulosSimple = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.article_id, a.code, a.name, a.size, a.measure, a.unit_code, s.stock
      FROM articles a
      LEFT JOIN inventory_stock s ON a.article_id = s.article_id
      WHERE a.status = "activo"
      ORDER BY a.name
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Función para obtener solo artículos con stock > 0 para salidas
export const getArticulosConStock = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.article_id, a.code, a.name, a.size, a.measure, a.unit_code, s.stock
      FROM articles a
      LEFT JOIN inventory_stock s ON a.article_id = s.article_id
      WHERE a.status = "activo" AND s.stock > 0
      ORDER BY a.name
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Función para validar stock disponible sin crear la salida
export const validarStockDisponible = async (req, res) => {
  try {
    const { article_id, quantity } = req.body;
    
    if (!article_id || !quantity) {
      return res.status(400).json({ error: 'Faltan datos de artículo o cantidad' });
    }
    
    const [rows] = await pool.query('SELECT stock FROM inventory_stock WHERE article_id = ?', [article_id]);
    const stockActual = rows.length > 0 ? rows[0].stock : 0;
    
    const stockSuficiente = stockActual >= quantity;
    
    res.json({ 
      stockSuficiente,
      stockActual,
      stockSolicitado: quantity,
      stockRestante: stockActual - quantity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Función para validar múltiples items de stock de una vez
export const validarStockMultiple = async (req, res) => {
  try {
    const { items } = req.body; // Array de {article_id, quantity, codigo, descripcion}
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Se requiere un array de items' });
    }
    
    const validaciones = [];
    
    for (const item of items) {
      if (item.article_id && item.quantity) {
        const [rows] = await pool.query('SELECT stock FROM inventory_stock WHERE article_id = ?', [item.article_id]);
        const stockActual = rows.length > 0 ? rows[0].stock : 0;
        
        validaciones.push({
          article_id: item.article_id,
          codigo: item.codigo,
          descripcion: item.descripcion,
          quantity: item.quantity,
          stockActual,
          stockSuficiente: stockActual >= item.quantity,
          stockRestante: stockActual - item.quantity
        });
      }
    }
    
    const todoStockSuficiente = validaciones.every(v => v.stockSuficiente);
    const itemsSinStock = validaciones.filter(v => !v.stockSuficiente);
    
    res.json({ 
      todoStockSuficiente,
      validaciones,
      itemsSinStock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, size, group_code, measure_code, description, unit_code, min_stock, max_stock, status, supplier_code, supplier_name } = req.body;
    
    // Validación de campos requeridos
    if (!code || !name || !group_code || !measure_code || !unit_code || min_stock == null || max_stock == null || !status) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Validar códigos de grupo, medida y unidad
    const [[grupo]] = await pool.query('SELECT * FROM article_groups WHERE group_code = ?', [group_code]);
    const [[medida]] = await pool.query('SELECT * FROM article_measures WHERE measure_code = ?', [measure_code]);
    const [[unidad]] = await pool.query('SELECT * FROM article_units WHERE unit_code = ?', [unit_code]);

    if (!grupo) return res.status(400).json({ error: 'Código de grupo inválido' });
    if (!medida) return res.status(400).json({ error: 'Código de medida inválido' });
    if (!unidad) return res.status(400).json({ error: 'Código de unidad inválido' });

    await pool.query(
      'UPDATE articles SET code=?, name=?, size=?, group_code=?, measure_code=?, description=?, unit_code=?, min_stock=?, max_stock=?, status=?, supplier_code=?, supplier_name=? WHERE article_id=?',
      [code, name, size, group_code, measure_code, description, unit_code, min_stock, max_stock, status, supplier_code || null, supplier_name || null, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM articles WHERE article_id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCatalogoGrupos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT group_code, group_name FROM article_groups');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCatalogoMedidas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT measure_code, measure_name FROM article_measures');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCatalogoUnidades = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT unit_code, unit_name FROM article_units');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
