import pool from '../db.js';

export default async function checkModuleAccess(req, res, next) {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: 'Usuario requerido' });
    const [[user]] = await pool.query('SELECT u.user_id, u.username, g.group_id, g.name as group_name FROM users u JOIN groups g ON u.group_id = g.group_id WHERE u.username = ?', [username]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.group_name === 'admin') return next();
    const [rows] = await pool.query(
      'SELECT 1 FROM module_permissions WHERE module = ? AND (group_id = ? OR user_id = ?)',
      ['almacen', user.group_id, user.user_id]
    );
    if (rows.length > 0) return next();
    return res.status(403).json({ error: 'Acceso denegado al módulo almacén' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
