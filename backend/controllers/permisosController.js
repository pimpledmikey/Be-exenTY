import pool from '../db.js';

export const checkPermisoModulo = async (req, res) => {
  try {
    const { username, module } = req.body;
    if (!username || !module) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    // Obtener grupo del usuario
    const [[user]] = await pool.query('SELECT u.user_id, u.username, g.group_id, g.name as group_name FROM users u JOIN groups g ON u.group_id = g.group_id WHERE u.username = ?', [username]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.group_name === 'admin') return res.json({ acceso: true });
    // Verificar permisos
    const [rows] = await pool.query(
      'SELECT 1 FROM module_permissions WHERE module = ? AND (group_id = ? OR user_id = ?)',
      [module, user.group_id, user.user_id]
    );
    res.json({ acceso: rows.length > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
