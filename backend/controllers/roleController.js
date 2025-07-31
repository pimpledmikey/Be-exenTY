import pool from '../db.js';

// Obtener todos los usuarios con sus roles (siguiendo el patrón de getUsuarios)
export const getUsersWithRoles = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.user_id as id,
        u.username,
        u.name,
        u.email,
        g.name as group_name,
        g.group_id,
        r.id as role_id,
        r.name as role_name,
        r.description as role_description,
        CASE 
          WHEN u.role_id IS NOT NULL THEN 'rbac'
          ELSE 'legacy'
        END as system_type
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.group_id
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.username
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los roles (siguiendo el patrón de getGrupos)
export const getRoles = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description FROM roles ORDER BY name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los permisos
export const getPermissions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description, module FROM permissions ORDER BY module, name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar rol de un usuario (siguiendo el patrón de updateGroup)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    
    if (!roleId) {
      return res.status(400).json({ error: 'roleId es requerido' });
    }

    await pool.query('UPDATE users SET role_id = ? WHERE user_id = ?', [roleId, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar permisos de un rol
export const updateRolePermissions = async (req, res) => {
  try {
    const { role_id, permission_id, can_view, can_create, can_edit, can_delete } = req.body;
    
    if (!role_id || !permission_id) {
      return res.status(400).json({ error: 'role_id y permission_id son requeridos' });
    }

    // Verificar si ya existe el permiso
    const [existing] = await pool.query(
      'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [role_id, permission_id]
    );

    if (existing.length > 0) {
      // Actualizar permiso existente
      await pool.query(
        'UPDATE role_permissions SET can_view = ?, can_create = ?, can_edit = ?, can_delete = ? WHERE role_id = ? AND permission_id = ?',
        [can_view, can_create, can_edit, can_delete, role_id, permission_id]
      );
    } else {
      // Crear nuevo permiso
      await pool.query(
        'INSERT INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)',
        [role_id, permission_id, can_view, can_create, can_edit, can_delete]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
