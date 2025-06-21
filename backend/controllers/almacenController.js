import pool from '../db.js';

export const getArticulos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM articles');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createArticulo = async (req, res) => {
  try {
    const { code, name, description, unit, min_stock, max_stock, status } = req.body;
    await pool.query(
      'INSERT INTO articles (code, name, description, unit, min_stock, max_stock, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [code, name, description, unit, min_stock, max_stock, status || 'activo']
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
    const [rows] = await pool.query('SELECT * FROM inventory_stock');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getArticulosSimple = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT article_id, name FROM articles WHERE status = "activo"');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, unit, min_stock, max_stock, status } = req.body;
    // Validación de campos requeridos
    if (!code || !name || !unit || min_stock == null || max_stock == null || !status) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    await pool.query(
      'UPDATE articles SET code=?, name=?, description=?, unit=?, min_stock=?, max_stock=?, status=? WHERE article_id=?',
      [code, name, description, unit, min_stock, max_stock, status, id]
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
