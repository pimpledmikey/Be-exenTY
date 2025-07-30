import pool from '../db.js';
import bcrypt from 'bcryptjs';

export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    // Obtener hash actual
    const [[user]] = await pool.query('SELECT password FROM users WHERE user_id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    // Validar contraseña actual
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    // Guardar nueva contraseña
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hash, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
