import pool from '../db.js';

// Middleware para validar que la salida no deje el stock en negativo
async function validarStock(req, res, next) {
  try {
    const { article_id, quantity } = req.body;
    if (!article_id || !quantity) {
      return res.status(400).json({ error: 'Faltan datos de artículo o cantidad' });
    }
    // Consultar el stock actual desde la vista inventory_stock
    const [rows] = await pool.query('SELECT stock_actual FROM inventory_stock WHERE article_id = ?', [article_id]);
    const stockActual = rows.length > 0 ? rows[0].stock_actual : 0;
    if (stockActual < quantity) {
      return res.status(400).json({ error: `Stock insuficiente. Stock actual: ${stockActual}` });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default validarStock;
