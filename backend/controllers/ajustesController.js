import pool from '../db.js';

// Crear un ajuste de inventario (positivo o negativo)
export const createAjuste = async (req, res) => {
  try {
    const { article_id, quantity, reason, user_id } = req.body;
    if (!article_id || !quantity || !user_id) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    await pool.query(
      'INSERT INTO inventory_adjustments (article_id, quantity, reason, user_id) VALUES (?, ?, ?, ?)',
      [article_id, quantity, reason, user_id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener ajustes de inventario
export const getAjustes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT adj.*, a.name as articulo_nombre, u.username as usuario_nombre
      FROM inventory_adjustments adj
      LEFT JOIN articles a ON adj.article_id = a.article_id
      LEFT JOIN users u ON adj.user_id = u.user_id
      ORDER BY adj.date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
