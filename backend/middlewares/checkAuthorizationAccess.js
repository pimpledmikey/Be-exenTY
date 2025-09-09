import pool from '../db.js';

/**
 * Middleware para verificar acceso a funciones de autorización de solicitudes
 * Solo usuarios con roles específicos pueden autorizar solicitudes
 */
export default async function checkAuthorizationAccess(req, res, next) {
  try {
    const userId = req.user?.user_id;
    const username = req.user?.username;
    
    if (!userId || !username) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado',
        message: 'Se requiere autenticación para acceder a esta función'
      });
    }

    // Obtener información del usuario y su rol
    const [userRows] = await pool.query(`
      SELECT u.user_id, u.username, u.name, u.role_id,
             g.group_id, g.name as group_name,
             r.name as role_name
      FROM users u 
      LEFT JOIN groups g ON u.group_id = g.group_id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.user_id = ?
    `, [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        message: 'El usuario no existe en el sistema'
      });
    }

    const user = userRows[0];

    // Verificar si es administrador (acceso total)
    if (user.group_name === 'admin' || user.role_name === 'admin') {
      console.log(`✅ Acceso de autorización concedido a admin: ${username}`);
      return next();
    }

    // Roles permitidos para autorización de solicitudes
    const rolesPermitidos = ['administracion', 'compras', 'direccion'];
    const gruposPermitidos = ['admin', 'compras', 'supervisor'];

    // Verificar por rol
    if (user.role_name && rolesPermitidos.includes(user.role_name.toLowerCase())) {
      console.log(`✅ Acceso de autorización concedido por rol: ${user.role_name} - ${username}`);
      return next();
    }

    // Verificar por grupo
    if (user.group_name && gruposPermitidos.includes(user.group_name.toLowerCase())) {
      console.log(`✅ Acceso de autorización concedido por grupo: ${user.group_name} - ${username}`);
      return next();
    }

    // Verificar permisos específicos en la tabla de permisos
    const [permissionRows] = await pool.query(`
      SELECT rp.can_edit, rp.can_view
      FROM role_permissions rp
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.module = 'solicitudes' AND p.name LIKE '%autorizar%'
    `, [user.role_id]);

    if (permissionRows.length > 0 && permissionRows[0].can_edit === 1) {
      console.log(`✅ Acceso de autorización concedido por permiso específico: ${username}`);
      return next();
    }

    // Acceso denegado
    console.log(`❌ Acceso de autorización denegado para: ${username} - Rol: ${user.role_name || 'N/A'} - Grupo: ${user.group_name || 'N/A'}`);
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'No tienes permisos para autorizar solicitudes. Solo usuarios con roles de administración, compras o dirección pueden realizar esta acción.',
      userRole: user.role_name,
      userGroup: user.group_name
    });

  } catch (error) {
    console.error('Error en middleware de autorización:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error al verificar permisos de autorización'
    });
  }
}

/**
 * Middleware más permisivo para solo ver solicitudes pendientes
 * Permite acceso de lectura a más roles
 */
export async function checkAuthorizationViewAccess(req, res, next) {
  try {
    const userId = req.user?.user_id;
    const username = req.user?.username;
    
    if (!userId || !username) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado'
      });
    }

    // Obtener información del usuario
    const [userRows] = await pool.query(`
      SELECT u.user_id, u.username, u.name,
             g.group_id, g.name as group_name,
             r.name as role_name
      FROM users u 
      LEFT JOIN groups g ON u.group_id = g.group_id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.user_id = ?
    `, [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado'
      });
    }

    const user = userRows[0];

    // Roles que pueden ver solicitudes pendientes (más permisivo)
    const rolesPermitidos = ['administracion', 'compras', 'direccion', 'supervisor', 'almacen'];
    const gruposPermitidos = ['admin', 'compras', 'supervisor'];

    // Verificar acceso
    if (user.group_name === 'admin' || 
        (user.role_name && rolesPermitidos.includes(user.role_name.toLowerCase())) ||
        (user.group_name && gruposPermitidos.includes(user.group_name.toLowerCase()))) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'No tienes permisos para ver las solicitudes de autorización'
    });

  } catch (error) {
    console.error('Error en middleware de vista de autorización:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor'
    });
  }
}
