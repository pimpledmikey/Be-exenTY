import pool from '../db.js';
import bcrypt from 'bcryptjs';

export const updateUserTheme = async (req, res) => {
  const { username, theme } = req.body;
  if (!username || !theme) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  try {
    await pool.query('UPDATE users SET theme = ? WHERE username = ?', [theme, username]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { adminUsername, username, password, group_id, name, email } = req.body;
    // Verificar que el usuario que hace la petición es admin
    const [[admin]] = await pool.query(
      'SELECT u.user_id, u.username, g.name as group_name FROM users u JOIN groups g ON u.group_id = g.group_id WHERE u.username = ?',
      [adminUsername]
    );
    if (!admin || admin.group_name !== 'admin') {
      return res.status(403).json({ error: 'Solo el admin puede crear usuarios' });
    }
    // Validaciones básicas
    if (!username || !password || !group_id || !name || !email) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insertar usuario
    await pool.query(
      'INSERT INTO users (username, password, group_id, name, email) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, group_id, name, email]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });
    await pool.query('INSERT INTO groups (name) VALUES (?)', [name]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT u.user_id as id, u.username, u.name, u.email, g.name as `group` FROM users u JOIN groups g ON u.group_id = g.group_id'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGrupos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT group_id as id, name as nombre FROM groups'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre requerido' });
    await pool.query('UPDATE groups SET name = ? WHERE group_id = ?', [name, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM groups WHERE group_id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, group_id, password } = req.body;
    if (!name || !email || !group_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET name = ?, email = ?, group_id = ?, password = ? WHERE user_id = ?', [name, email, group_id, hashedPassword, id]);
    } else {
      await pool.query('UPDATE users SET name = ?, email = ?, group_id = ? WHERE user_id = ?', [name, email, group_id, id]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE user_id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsuariosSimple = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, username FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
