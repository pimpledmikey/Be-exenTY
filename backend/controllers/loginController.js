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

export const getUserPermissions = async (req, res) => {
  try {
    const userId = req.user.user.user_id; // Corregir acceso al user_id
    
    // Obtener el role_id del usuario
    const [[user]] = await pool.query(
      'SELECT role_id FROM users WHERE user_id = ?', 
      [userId]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Obtener todos los permisos del rol del usuario
    const [permissions] = await pool.query(`
      SELECT p.module, p.name, rp.can_view, rp.can_create, rp.can_edit, rp.can_delete
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?
    `, [user.role_id]);
    
    // Organizar permisos por módulo
    const userPermissions = {};
    permissions.forEach(perm => {
      if (!userPermissions[perm.module]) {
        userPermissions[perm.module] = {};
      }
      userPermissions[perm.module][perm.name] = {
        can_view: Boolean(perm.can_view),
        can_create: Boolean(perm.can_create),
        can_edit: Boolean(perm.can_edit),
        can_delete: Boolean(perm.can_delete)
      };
    });
    
    res.json(userPermissions);
  } catch (error) {
    console.error('Error obteniendo permisos del usuario:', error);
    res.status(500).json({ error: error.message });
  }
};
