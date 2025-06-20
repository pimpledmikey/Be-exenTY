import pool from '../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'beexenty_secret';

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    console.log(`[LOGIN] Intento fallido: datos incompletos (${username})`);
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  try {
    const [[user]] = await pool.query(
      "SELECT u.user_id, u.username, u.password, g.name as `group`, u.theme FROM users u JOIN groups g ON u.group_id = g.group_id WHERE u.username = ?",
      [username]
    );
    if (!user) {
      console.log(`[LOGIN] Usuario no encontrado: ${username}`);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    // Comparar contraseña hasheada
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log(`[LOGIN] Contraseña incorrecta para usuario: ${username}`);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    // No enviar la contraseña al frontend
    delete user.password;
    // Generar token JWT
    const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: '8h' });
    console.log(`[LOGIN] Usuario autenticado: ${username} (${user.group})`);
    res.json({ user, token });
  } catch (error) {
    console.error(`[LOGIN] Error en login para usuario ${username}:`, error.message);
    res.status(500).json({ error: error.message });
  }
};
