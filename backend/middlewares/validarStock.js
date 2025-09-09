import pool from '../db.js';

// Middleware para validar que la salida no deje el stock en negativo
async function validarStock(req, res, next) {
  try {
    const { article_id, quantity } = req.body;
    if (!article_id || !quantity) {
      return res.status(400).json({ error: 'Faltan datos de artículo o cantidad' });
    }

    // Convertir valores a números para comparación correcta
    const articleId = parseInt(article_id);
    const requestedQuantity = parseInt(quantity);

    if (isNaN(articleId) || isNaN(requestedQuantity) || requestedQuantity <= 0) {
      return res.status(400).json({ error: 'Los valores de artículo y cantidad deben ser números válidos' });
    }

    // Consultar el stock actual desde la vista inventory_stock
    const [rows] = await pool.query('SELECT stock FROM inventory_stock WHERE article_id = ?', [articleId]);
    const stockActual = rows.length > 0 ? parseInt(rows[0].stock) : 0;
    
    console.log(`📊 Validación de stock - Artículo: ${articleId}, Stock actual: ${stockActual}, Cantidad solicitada: ${requestedQuantity}`);
    
    if (stockActual < requestedQuantity) {
      return res.status(400).json({ 
        error: `Stock insuficiente. Stock actual: ${stockActual}, solicitado: ${requestedQuantity}`,
        stockActual,
        cantidadSolicitada: requestedQuantity
      });
    }
    
    console.log(`✅ Stock suficiente - Continuando con la salida`);
    next();
  } catch (error) {
    console.error('❌ Error en validación de stock:', error);
    res.status(500).json({ error: error.message });
  }
}

export default validarStock;
