import pool from '../db.js';

// Obtener todos los usuarios con sus roles (compatible con sistema antiguo y nuevo)
export const getUsersWithRoles = async (req, res) => {
  try {
    console.log('🔍 getUsersWithRoles - Iniciando...');
    
    // Usar el mismo patrón que el controller de grupos que SÍ funciona
    const [rows] = await pool.query(`
      SELECT 
        user_id as id,
        username,
        name,
        email,
        group_id,
        role_id
      FROM users 
      ORDER BY username
    `);
    
    console.log('✅ Usuarios obtenidos:', rows.length);
    
    // Formatear igual que el patrón que funciona
    const formattedUsers = rows.map(user => ({
      id: user.id,
      username: user.username || 'sin_username',
      name: user.name || 'Sin nombre', 
      email: user.email || '',
      group_id: user.group_id,
      role_id: user.role_id,
      group_name: user.group_id ? `Grupo ${user.group_id}` : 'Sin grupo',
      role_name: user.role_id ? `Rol ${user.role_id}` : 'Sin rol',
      system_type: user.role_id ? 'rbac' : 'legacy'
    }));

    // Respuesta simple como el patrón que funciona
    res.json(formattedUsers);
    
  } catch (error) {
    console.error('❌ Error getUsersWithRoles:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los roles disponibles
export const getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query(`
      SELECT id, name, description, created_at, updated_at
      FROM roles
      ORDER BY name
    `);

    res.json(roles);
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los permisos disponibles
export const getPermissions = async (req, res) => {
  try {
    const [permissions] = await pool.query(`
      SELECT id, name, description, module, created_at
      FROM permissions
      ORDER BY module, name
    `);

    res.json(permissions);
  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener permisos de un rol específico
export const getRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const [permissions] = await pool.execute(`
      SELECT 
        rp.role_id,
        rp.permission_id,
        rp.can_view,
        rp.can_create,
        rp.can_edit,
        rp.can_delete,
        p.name as permission_name,
        p.description as permission_description,
        p.module
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?
      ORDER BY p.module, p.name
    `, [roleId]);

    res.json({
      success: true,
      data: permissions,
      message: 'Permisos del rol obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo permisos del rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar permisos de un rol
export const updateRolePermissions = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { role_id, permission_id, can_view, can_create, can_edit, can_delete } = req.body;
    
    // Validar que los datos sean correctos
    if (!role_id || !permission_id) {
      return res.status(400).json({
        success: false,
        message: 'role_id y permission_id son requeridos'
      });
    }

    await connection.beginTransaction();

    // Verificar si ya existe el permiso para este rol
    const [existing] = await connection.execute(`
      SELECT id FROM role_permissions 
      WHERE role_id = ? AND permission_id = ?
    `, [role_id, permission_id]);

    if (existing.length > 0) {
      // Actualizar permiso existente
      await connection.execute(`
        UPDATE role_permissions 
        SET can_view = ?, can_create = ?, can_edit = ?, can_delete = ?, updated_at = CURRENT_TIMESTAMP
        WHERE role_id = ? AND permission_id = ?
      `, [can_view, can_create, can_edit, can_delete, role_id, permission_id]);
    } else {
      // Crear nuevo permiso
      await connection.execute(`
        INSERT INTO role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [role_id, permission_id, can_view, can_create, can_edit, can_delete]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Permisos actualizados exitosamente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error actualizando permisos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    connection.release();
  }
};

// Obtener permisos de un usuario específico (compatible con ambos sistemas)
export const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Primero verificar si el usuario existe y qué sistema usa
    const [userInfo] = await pool.execute(`
      SELECT 
        u.user_id,
        u.username,
        u.group_id,
        u.role_id,
        g.name as group_name,
        r.name as role_name
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.group_id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.user_id = ?
    `, [userId]);

    if (userInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userInfo[0];
    let permissions = [];

    if (user.role_id) {
      // Usuario con sistema RBAC
      const [rbacPermissions] = await pool.execute(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.module,
          rp.can_view,
          rp.can_create,
          rp.can_edit,
          rp.can_delete,
          'rbac' as system_type
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
        ORDER BY p.module, p.name
      `, [user.role_id]);
      
      permissions = rbacPermissions;
    } else {
      // Usuario con sistema legacy - asignar permisos básicos según grupo
      const groupPermissions = getLegacyPermissions(user.group_name);
      permissions = groupPermissions;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.user_id,
          username: user.username,
          group_name: user.group_name,
          role_name: user.role_name,
          system_type: user.role_id ? 'rbac' : 'legacy'
        },
        permissions: permissions
      },
      message: 'Permisos del usuario obtenidos exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo permisos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función auxiliar para permisos legacy
function getLegacyPermissions(groupName) {
  const basePermissions = [
    { name: 'almacen_view', module: 'almacen', description: 'Ver almacén' },
    { name: 'entradas_view', module: 'entradas', description: 'Ver entradas' },
    { name: 'salidas_view', module: 'salidas', description: 'Ver salidas' }
  ];

  switch (groupName) {
    case 'admin':
      return basePermissions.map(p => ({
        ...p,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        system_type: 'legacy'
      }));
    
    case 'compras':
      return basePermissions.map(p => ({
        ...p,
        can_view: true,
        can_create: p.module === 'entradas' || p.module === 'salidas',
        can_edit: p.module === 'entradas' || p.module === 'salidas',
        can_delete: false,
        system_type: 'legacy'
      }));
    
    case 'supervisor':
      return basePermissions.map(p => ({
        ...p,
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        system_type: 'legacy'
      }));
    
    default:
      return basePermissions.map(p => ({
        ...p,
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        system_type: 'legacy'
      }));
  }
}

// Migrar usuario del sistema legacy al RBAC
export const migrateUserToRBAC = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { userId } = req.params;
    
    await connection.beginTransaction();

    // Obtener información del usuario
    const [userInfo] = await connection.execute(`
      SELECT u.user_id, u.username, u.group_id, g.name as group_name
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.group_id
      WHERE u.user_id = ? AND u.role_id IS NULL
    `, [userId]);

    if (userInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado o ya migrado'
      });
    }

    const user = userInfo[0];
    
    // Buscar el rol correspondiente al grupo
    const roleMapping = {
      'admin': 'Administrador',
      'compras': 'Compras',
      'supervisor': 'Supervisor'
    };

    const roleName = roleMapping[user.group_name] || 'Supervisor';
    
    const [role] = await connection.execute(`
      SELECT id FROM roles WHERE name = ?
    `, [roleName]);

    if (role.length === 0) {
      throw new Error(`Rol ${roleName} no encontrado`);
    }

    // Actualizar usuario con el rol
    await connection.execute(`
      UPDATE users SET role_id = ? WHERE user_id = ?
    `, [role[0].id, userId]);

    await connection.commit();

    res.json({
      success: true,
      message: `Usuario ${user.username} migrado exitosamente al rol ${roleName}`
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error migrando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    connection.release();
  }
};

// Actualizar rol de un usuario
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    
    console.log('🔄 Actualizando rol del usuario:', userId, 'al rol:', roleId);
    
    // Validar datos
    if (!roleId) {
      return res.status(400).json({ error: 'roleId es requerido' });
    }

    // Verificar que el usuario existe
    const [userExists] = await pool.query(`
      SELECT user_id FROM users WHERE user_id = ?
    `, [userId]);

    if (userExists.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que el rol existe (usando columna 'id' no 'role_id')
    const [roleExists] = await pool.query(`
      SELECT id FROM roles WHERE id = ?
    `, [roleId]);

    if (roleExists.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Actualizar el rol del usuario
    await pool.query(`
      UPDATE users 
      SET role_id = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ?
    `, [roleId, userId]);

    console.log('✅ Rol actualizado exitosamente');
    res.json({ success: true, message: 'Rol del usuario actualizado exitosamente' });
    
  } catch (error) {
    console.error('❌ Error actualizando rol del usuario:', error);
    res.status(500).json({ error: error.message });
  }
};
