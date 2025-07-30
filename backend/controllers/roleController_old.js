import pool from '../db.js';

// Obtener todos los roles con sus permisos
export const getRolesWithPermissions = async (req, res) => {
  try {
    const [roles] = await pool.query(`
      SELECT r.role_id, r.role_name, r.description,
             rp.module_name, rp.can_view, rp.can_create, rp.can_edit, rp.can_delete
      FROM roles r
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      ORDER BY r.role_name, rp.module_name
    `);
    
    // Agrupar permisos por rol
    const rolesMap = {};
    roles.forEach(row => {
      if (!rolesMap[row.role_id]) {
        rolesMap[row.role_id] = {
          role_id: row.role_id,
          role_name: row.role_name,
          description: row.description,
          permissions: {}
        };
      }
      
      if (row.module_name) {
        rolesMap[row.role_id].permissions[row.module_name] = {
          can_view: row.can_view,
          can_create: row.can_create,
          can_edit: row.can_edit,
          can_delete: row.can_delete
        };
      }
    });
    
    res.json(Object.values(rolesMap));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener módulos disponibles
export const getAvailableModules = async (req, res) => {
  try {
    const modules = [
      'articulos', 'entradas', 'salidas', 'ajustes', 'stock', 
      'usuarios', 'grupos', 'catalogos'
    ];
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar permisos de un rol
export const updateRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;
    
    // Eliminar permisos existentes del rol
    await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
    
    // Insertar nuevos permisos
    for (const [module, perms] of Object.entries(permissions)) {
      await pool.query(`
        INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        roleId, 
        module, 
        perms.can_view || false,
        perms.can_create || false,
        perms.can_edit || false,
        perms.can_delete || false
      ]);
    }
    
    res.json({ success: true, message: 'Permisos actualizados correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear nuevo rol
export const createRole = async (req, res) => {
  try {
    const { role_name, description } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO roles (role_name, description) VALUES (?, ?)',
      [role_name, description]
    );
    
    res.json({ success: true, role_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener permisos del usuario actual
export const getUserPermissions = async (req, res) => {
  try {
    const userId = req.user.userId; // Del middleware de auth
    
    const [permissions] = await pool.query(`
      SELECT rp.module_name, rp.can_view, rp.can_create, rp.can_edit, rp.can_delete
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      JOIN role_permissions rp ON r.role_id = rp.role_id
      WHERE u.user_id = ?
    `, [userId]);
    
    const userPermissions = {};
    permissions.forEach(perm => {
      userPermissions[perm.module_name] = {
        can_view: perm.can_view,
        can_create: perm.can_create,
        can_edit: perm.can_edit,
        can_delete: perm.can_delete
      };
    });
    
    res.json(userPermissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
